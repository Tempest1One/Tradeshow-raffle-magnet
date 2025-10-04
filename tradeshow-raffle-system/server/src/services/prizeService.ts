// server/src/services/prizeService.ts
import type { PrizeTier, Prize } from "../types/prize.js";
export class PrizeService {
    private prizeTiers: PrizeTier[];
  
    constructor(prizeTiers: PrizeTier[]) {
      this.prizeTiers = prizeTiers;
    }
  
    selectPrize(): { prize: Prize; tier: PrizeTier } | null {
      // Calculate total weight
      const totalWeight = this.prizeTiers.reduce((sum, tier) => sum + tier.weight, 0);
      
      // Generate random number
      const random = Math.random() * totalWeight;
      
      // Find selected tier
      let currentWeight = 0;
      for (const tier of this.prizeTiers) {
        currentWeight += tier.weight;
        if (random <= currentWeight && tier.remainingPrizes > 0) {
          // Select random prize from tier
          const availablePrizes = tier.prizes.filter(p => p.remainingQuantity > 0);
          if (availablePrizes.length === 0) continue;
          
          const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

          // Update quantities
          if (selectedPrize) {
            selectedPrize.remainingQuantity--;
            tier.remainingPrizes--;
            
            return { prize: selectedPrize, tier };
          }
        }
      }
      
      return null; // No prizes available
    }
  
    getAvailablePrizes(): PrizeTier[] {
      return this.prizeTiers.filter(tier => tier.remainingPrizes > 0);
    }
  }
