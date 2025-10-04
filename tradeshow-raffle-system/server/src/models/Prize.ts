import mongoose, { Schema } from 'mongoose';
import type{ IPrizeDocument } from '../types/prize';

const PrizeSchema = new Schema<IPrizeDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  tier: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'prizes'
});

// Indexes for performance
PrizeSchema.index({ tier: 1 });
PrizeSchema.index({ isActive: 1 });
PrizeSchema.index({ remainingQuantity: 1 });
PrizeSchema.index({ tier: 1, isActive: 1 });

// Virtual for prize depletion status
PrizeSchema.virtual('isDepleted').get(function() {
  return this.remainingQuantity === 0;
});

// Method to check if prize is available
PrizeSchema.methods.isAvailable = function(): boolean {
  return this.remainingQuantity > 0 && this.isActive;
};

// Method to decrement quantity
PrizeSchema.methods.decrementQuantity = function(amount: number = 1): boolean {
  if (this.remainingQuantity >= amount) {
    this.remainingQuantity -= amount;
    return true;
  }
  return false;
};

// Static method to find available prizes by tier
PrizeSchema.statics.findAvailableByTier = function(tier: number) {
  return this.find({ 
    tier, 
    isActive: true, 
    remainingQuantity: { $gt: 0 } 
  });
};

// Static method to get prize statistics
PrizeSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$tier',
        totalPrizes: { $sum: '$totalQuantity' },
        remainingPrizes: { $sum: '$remainingQuantity' },
        awardedPrizes: { $sum: { $subtract: ['$totalQuantity', '$remainingQuantity'] } }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

export const Prize = mongoose.model<IPrizeDocument>('Prize', PrizeSchema);