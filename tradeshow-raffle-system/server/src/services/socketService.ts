import { Server, Socket } from 'socket.io';
import { EmailEntry } from '../models/EmailEntry.ts';
import { Prize } from '../models/Prize.ts';
import { Session } from '../models/Session.ts';
import { EmailEventHandler } from '../handlers/emailEventHandler.ts';
import { PrizeService } from './prizeService.ts';
import type { PrizeSelectionResult } from '../types/prize.ts';

interface SocketData {
  sessionId?: string | null;
  clientType?: 'ipad' | 'tv';
  lastActivity?: Date;
}

export class SocketService {
  private io: Server;
  private connectedClients: Map<string, SocketData> = new Map();
  private currentSession: string | null = null;

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Store client data
      this.connectedClients.set(socket.id, {
        lastActivity: new Date()
      });

      // Handle client registration
      socket.on('register-client', (data: { clientType: 'ipad' | 'tv', sessionId?: string }) => {
        this.handleClientRegistration(socket, data);
      });

      // Handle email submission
      socket.on('submit-email', async (data: { email: string, ipAddress: string, userAgent: string }) => {
        await this.handleEmailSubmission(socket, data);
      });

      // Handle raffle start
      socket.on('start-raffle', async () => {
        await this.handleRaffleStart(socket);
      });

      // Handle prize selection
      socket.on('select-prize', async () => {
        await this.handlePrizeSelection(socket);
      });

      // Handle session management
      socket.on('get-session-info', async () => {
        await this.handleSessionInfo(socket);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });
    });
  }

  private async handleClientRegistration(socket: Socket, data: { clientType: 'ipad' | 'tv', sessionId?: string }) {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (clientData) {
        clientData.clientType = data.clientType;
        clientData.sessionId = data.sessionId || this.currentSession;
      }

      // Get or create session
      let sessionId = data.sessionId || this.currentSession;
      if (!sessionId) {
        const session = await this.createNewSession();
        sessionId = session.sessionId;
        this.currentSession = sessionId;
      }

      socket.emit('client-registered', {
        success: true,
        sessionId,
        clientType: data.clientType,
        timestamp: new Date().toISOString()
      });

      // Broadcast to other clients
      socket.broadcast.emit('client-connected', {
        clientType: data.clientType,
        sessionId,
        timestamp: new Date().toISOString()
      });

      console.log(`📱 ${data.clientType.toUpperCase()} client registered: ${socket.id}`);
    } catch (error) {
      console.error('Error registering client:', error);
      socket.emit('client-registration-error', {
        success: false,
        message: 'Failed to register client',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleEmailSubmission(socket: Socket, data: { email: string, ipAddress: string, userAgent: string }) {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData?.sessionId) {
        socket.emit('email-submission-error', {
          success: false,
          message: 'Client not registered with session'
        });
        return;
      }

      // Use centralized EmailEventHandler
      const result = await EmailEventHandler.handleEmailSubmission(socket, data, clientData.sessionId);

      if (result.success) {
        // Emit success to sender
        socket.emit('email-submitted', result);

        // Broadcast to all clients using the handler's event creation method
        this.io.emit('email-added', EmailEventHandler.createEmailAddedEvent(
          data.email,
          new Date(),
          clientData.sessionId
        ));
      } else {
        socket.emit('email-submission-error', result);
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      socket.emit('email-submission-error', {
        success: false,
        message: 'Failed to submit email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleRaffleStart(socket: Socket) {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData?.sessionId) {
        socket.emit('raffle-start-error', {
          success: false,
          message: 'Client not registered with session'
        });
        return;
      }

      // Get session statistics
      const session = await Session.findOne({ sessionId: clientData.sessionId });
      if (!session) {
        socket.emit('raffle-start-error', {
          success: false,
          message: 'Session not found'
        });
        return;
      }

      // Broadcast raffle start to all clients
      this.io.emit('raffle-started', {
        sessionId: clientData.sessionId,
        totalEntries: session.totalEntries,
        timestamp: new Date().toISOString()
      });

      console.log(`🎲 Raffle started (Session: ${clientData.sessionId})`);
    } catch (error) {
      console.error('Error starting raffle:', error);
      socket.emit('raffle-start-error', {
        success: false,
        message: 'Failed to start raffle',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handlePrizeSelection(socket: Socket) {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData?.sessionId) {
        socket.emit('prize-selection-error', {
          success: false,
          message: 'Client not registered with session'
        });
        return;
      }

      // Implement prize selection logic here
      // This will be expanded in the next task
      const prizeResult = await this.selectPrize();

      if (prizeResult.success) {
        // Broadcast prize selection to all clients
        this.io.emit('prize-selected', {
          prize: prizeResult.prize,
          tier: prizeResult.tier,
          sessionId: clientData.sessionId,
          timestamp: new Date().toISOString()
        });

        console.log(`🎁 Prize selected: ${prizeResult.prize?.name} (Tier ${prizeResult.tier?.tier})`);
      } else {
        socket.emit('prize-selection-error', {
          success: false,
          message: prizeResult.error || 'Failed to select prize'
        });
      }
    } catch (error) {
      console.error('Error selecting prize:', error);
      socket.emit('prize-selection-error', {
        success: false,
        message: 'Failed to select prize',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async handleSessionInfo(socket: Socket) {
    try {
      const clientData = this.connectedClients.get(socket.id);
      if (!clientData?.sessionId) {
        socket.emit('session-info-error', {
          success: false,
          message: 'Client not registered with session'
        });
        return;
      }

      const session = await Session.findOne({ sessionId: clientData.sessionId });
      const emailStats = await EmailEntry.aggregate([
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            validEmails: { $sum: { $cond: ['$isValid', 1, 0] } },
            invalidEmails: { $sum: { $cond: ['$isValid', 0, 1] } },
            prizesAwarded: { $sum: { $cond: ['$prizeWon', 1, 0] } }
          }
        }
      ]);

      socket.emit('session-info', {
        success: true,
        data: {
          sessionId: clientData.sessionId,
          totalEntries: session?.totalEntries || 0,
          prizesAwarded: session?.prizesAwarded || 0,
          isActive: session?.isActive || false,
          startTime: session?.startTime,
          emailStats: emailStats[0] || {
            totalEmails: 0,
            validEmails: 0,
            prizesAwarded: 0
          }
        }
      });
    } catch (error) {
      console.error('Error getting session info:', error);
      socket.emit('session-info-error', {
        success: false,
        message: 'Failed to get session info',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private handleDisconnect(socket: Socket) {
    const clientData = this.connectedClients.get(socket.id);
    if (clientData) {
      console.log(`🔌 Client disconnected: ${socket.id} (${clientData.clientType})`);

      // Broadcast disconnect to other clients
      socket.broadcast.emit('client-disconnected', {
        clientType: clientData.clientType,
        sessionId: clientData.sessionId,
        timestamp: new Date().toISOString()
      });
    }

    this.connectedClients.delete(socket.id);
  }

  private async createNewSession() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = await Session.create({
      sessionId,
      startTime: new Date(),
      isActive: true
    });
    return session;
  }

  private async selectPrize(): Promise<PrizeSelectionResult> {
    return await PrizeService.selectPrize();
  }

  // Public methods for external use
  public getConnectedClients() {
    return Array.from(this.connectedClients.entries()).map(([socketId, data]) => ({
      socketId,
      ...data
    }));
  }

  public getCurrentSession() {
    return this.currentSession;
  }

  public broadcastToClients(event: string, data: any) {
    this.io.emit(event, data);
  }
}

export default SocketService;