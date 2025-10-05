// Client Registration Events
export interface ClientRegistrationData {
  clientType: 'ipad' | 'tv';
  sessionId?: string;
}

export interface ClientRegistrationResponse {
  success: boolean;
  sessionId?: string;
  clientType?: 'ipad' | 'tv';
  timestamp?: string;
  message?: string;
  error?: string;
}

// Email Submission Events
export interface EmailSubmissionData {
  email: string;
  ipAddress: string;
  userAgent: string;
}

export interface EmailSubmissionResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    email: string;
    timestamp: Date;
  };
  error?: string;
}

// Raffle Events
export interface RaffleStartResponse {
  success: boolean;
  sessionId?: string;
  totalEntries?: number;
  timestamp?: string;
  message?: string;
  error?: string;
}

export interface PrizeSelectionResponse {
  success: boolean;
  prize?: {
    id: string;
    name: string;
    description: string;
    tier: number;
    imageUrl?: string;
  };
  tier?: {
    tier: number;
    name: string;
    weight: number;
  };
  sessionId?: string;
  timestamp?: string;
  message?: string;
  error?: string;
}

// Session Events
export interface SessionInfoResponse {
  success: boolean;
  data?: {
    sessionId: string;
    totalEntries: number;
    prizesAwarded: number;
    isActive: boolean;
    startTime?: Date;
    emailStats: {
      totalEmails: number;
      validEmails: number;
      prizesAwarded: number;
    };
  };
  message?: string;
  error?: string;
}

// Broadcast Events
export interface EmailAddedEvent {
  email: string;
  timestamp: Date;
  sessionId: string;
}

export interface ClientConnectedEvent {
  clientType: 'ipad' | 'tv';
  sessionId: string;
  timestamp: string;
}

export interface ClientDisconnectedEvent {
  clientType?: 'ipad' | 'tv';
  sessionId?: string;
  timestamp: string;
}

export interface RaffleStartedEvent {
  sessionId: string;
  totalEntries: number;
  timestamp: string;
}

export interface PrizeSelectedEvent {
  prize: {
    id: string;
    name: string;
    description: string;
    tier: number;
    imageUrl?: string;
  };
  tier: {
    tier: number;
    name: string;
    weight: number;
  };
  sessionId: string;
  timestamp: string;
}

// Connection Health Events
export interface PingEvent {
  timestamp: number;
}

export interface PongEvent {
  timestamp: number;
}