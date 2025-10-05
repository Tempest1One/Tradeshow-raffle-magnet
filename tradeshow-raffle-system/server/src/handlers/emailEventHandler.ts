import { Socket } from 'socket.io';
import { EmailEntry } from '../models/EmailEntry.ts';
import { Session } from '../models/Session.ts';
import type { EmailSubmissionData, EmailSubmissionResponse, EmailAddedEvent } from '../types/socketEvents.ts';

export class EmailEventHandler {
  static async handleEmailSubmission(
    socket: Socket | null,
    data: EmailSubmissionData,
    sessionId: string
  ): Promise<EmailSubmissionResponse> {
    try {
      // Check for duplicates
      const existingEntry = await EmailEntry.findOne({
        email: data.email,
        sessionId: sessionId
      });

      if (existingEntry) {
        return {
          success: false,
          message: 'Email already exists in this session'
        };
      }

      // Create email entry
      const emailEntry = new EmailEntry({
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: sessionId,
        timestamp: new Date()
      });

      await emailEntry.save();

      // Update session
      await Session.findOneAndUpdate(
        { sessionId: sessionId },
        { $inc: { totalEntries: 1 } }
      );

      console.log(`📧 Email submitted: ${data.email} (Session: ${sessionId})`);

      return {
        success: true,
        message: 'Email submitted successfully',
        data: {
          id: (emailEntry._id as any).toString(),
          email: emailEntry.email,
          timestamp: emailEntry.timestamp
        }
      };

    } catch (error) {
      console.error('Error submitting email:', error);
      return {
        success: false,
        message: 'Failed to submit email',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static createEmailAddedEvent(email: string, timestamp: Date, sessionId: string): EmailAddedEvent {
    return {
      email,
      timestamp,
      sessionId
    };
  }
}