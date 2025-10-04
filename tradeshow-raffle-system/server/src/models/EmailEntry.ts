/**
 * INCLUDES:
 * Email validation with regex pattern
 * Duplicate prevention per session
 * Prize assignment tracking
 * Performance indexes for fast queries
 * Statistics methods for analytics
 * Session-based organization
 * @module models/EmailEntry
 * @typedef {import('../types/prize').IEmailEntry} IEmailEntry
 * @typedef {import('../types/prize').IEmailEntryDocument} IEmailEntryDocument
 */

import mongoose, { Schema } from 'mongoose';
import type { IEmailEntry, IEmailEntryDocument } from '../types/prize';

const EmailEntrySchema = new Schema<IEmailEntryDocument>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isValid: {
    type: Boolean,
    default: true
  },
  prizeTier: {
    type: Number,
    min: 1,
    max: 5
  },
  prizeWon: {
    type: String,
    trim: true
  },
  prizeId: {
    type: Schema.Types.ObjectId,
    ref: 'Prize'
  },
  sessionId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'emailEntries'
});

// Indexes for performance
EmailEntrySchema.index({ email: 1 });
EmailEntrySchema.index({ timestamp: -1 });
EmailEntrySchema.index({ isValid: 1 });
EmailEntrySchema.index({ sessionId: 1 });
EmailEntrySchema.index({ prizeTier: 1 });

// Compound index for duplicate prevention
EmailEntrySchema.index({ email: 1, sessionId: 1 }, { unique: true });

// Virtual for prize won status
EmailEntrySchema.virtual('hasWonPrize').get(function() {
  return !!(this.prizeWon && this.prizeId);
});

// Method to mark as invalid
EmailEntrySchema.methods.markAsInvalid = function() {
  this.isValid = false;
  return this.save();
};

// Method to assign prize
EmailEntrySchema.methods.assignPrize = function(prizeId: string, prizeName: string, tier: number) {
  this.prizeId = prizeId;
  this.prizeWon = prizeName;
  this.prizeTier = tier;
  return this.save();
};

// Static method to get email statistics
EmailEntrySchema.statics.getStats = function() {
  return this.aggregate([
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
};

// Static method to get entries by session
EmailEntrySchema.statics.getBySession = function(sessionId: string) {
  return this.find({ sessionId }).sort({ timestamp: -1 });
};

// Static method to check for duplicates
EmailEntrySchema.statics.isDuplicate = function(email: string, sessionId: string) {
  return this.findOne({ email, sessionId });
};

export const EmailEntry = mongoose.model<IEmailEntryDocument>('EmailEntry', EmailEntrySchema);