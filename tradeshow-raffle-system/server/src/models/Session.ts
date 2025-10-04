import mongoose, { Schema } from 'mongoose';

export interface ISession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  totalEntries: number;
  prizesAwarded: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalEntries: {
    type: Number,
    default: 0,
    min: 0
  },
  prizesAwarded: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'sessions'
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);