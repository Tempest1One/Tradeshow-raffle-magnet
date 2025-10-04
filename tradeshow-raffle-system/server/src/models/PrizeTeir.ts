import mongoose, { Schema } from 'mongoose';
import type { IPrizeTierDocument } from '../types/prize';

const PrizeTierSchema = new Schema<IPrizeTierDocument>({
  tier: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 5
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  totalPrizes: {
    type: Number,
    required: true,
    min: 0
  },
  remainingPrizes: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'prizeTiers'
});

// Indexes for performance
PrizeTierSchema.index({ tier: 1 });
PrizeTierSchema.index({ isActive: 1 });
PrizeTierSchema.index({ remainingPrizes: 1 });

// Virtual for prize depletion status
PrizeTierSchema.virtual('isDepleted').get(function() {
  return this.remainingPrizes === 0;
});

// Method to check if tier has available prizes
PrizeTierSchema.methods.hasAvailablePrizes = function(): boolean {
  return this.remainingPrizes > 0 && this.isActive;
};

// Method to decrement remaining prizes
PrizeTierSchema.methods.decrementPrizes = function(amount: number = 1): boolean {
  if (this.remainingPrizes >= amount) {
    this.remainingPrizes -= amount;
    return true;
  }
  return false;
};

export const PrizeTier = mongoose.model<IPrizeTierDocument>('PrizeTier', PrizeTierSchema);