// server/src/services/prizeService.ts
import { Prize } from '../models/Prize.ts';
import { PrizeTier } from '../models/PrizeTeir.ts';
import type { PrizeSelectionResult, IPrize, IPrizeTier } from '../types/prize.ts';

export class PrizeService {

  /**
   * Select a prize using weighted random selection from database
   */
  static async selectPrize(): Promise<PrizeSelectionResult> {
    try {
      // Get all active prize tiers with available prizes
      const availableTiers = await PrizeTier.find({
        isActive: true,
        remainingPrizes: { $gt: 0 }
      }).sort({ tier: 1 });

      if (availableTiers.length === 0) {
        return {
          success: false,
          error: 'No prize tiers available'
        };
      }

      // Calculate total weight
      const totalWeight = availableTiers.reduce((sum, tier) => sum + tier.weight, 0);

      // Generate random number
      const random = Math.random() * totalWeight;

      // Find selected tier
      let currentWeight = 0;
      for (const tier of availableTiers) {
        currentWeight += tier.weight;
        if (random <= currentWeight) {
          // Find available prizes in this tier
          const availablePrizes = await Prize.find({
            tier: tier.tier,
            isActive: true,
            remainingQuantity: { $gt: 0 }
          });

          if (availablePrizes.length === 0) continue;

          // Select random prize from available prizes
          const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

          if (selectedPrize) {
            // Update quantities atomically
            await Prize.findByIdAndUpdate(selectedPrize._id, {
              $inc: { remainingQuantity: -1 }
            });

            await PrizeTier.findByIdAndUpdate(tier._id, {
              $inc: { remainingPrizes: -1 }
            });

            return {
              success: true,
              prize: selectedPrize,
              tier: tier
            };
          }
        }
      }

      return {
        success: false,
        error: 'No prizes available'
      };
    } catch (error) {
      console.error('Error selecting prize:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all available prize tiers
   */
  static async getAvailablePrizes(): Promise<IPrizeTier[]> {
    try {
      return await PrizeTier.find({
        isActive: true,
        remainingPrizes: { $gt: 0 }
      }).sort({ tier: 1 });
    } catch (error) {
      console.error('Error getting available prizes:', error);
      return [];
    }
  }

  /**
   * Get prize statistics
   */
  static async getPrizeStats() {
    try {
      return await PrizeTier.aggregate([
        {
          $group: {
            _id: '$tier',
            totalPrizes: { $sum: '$totalPrizes' },
            remainingPrizes: { $sum: '$remainingPrizes' },
            awardedPrizes: { $sum: { $subtract: ['$totalPrizes', '$remainingPrizes'] } }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
    } catch (error) {
      console.error('Error getting prize stats:', error);
      return [];
    }
  }
}
