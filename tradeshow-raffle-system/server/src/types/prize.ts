export interface PrizeTier {
    tier: number;
    name: string;
    weight: number; // Selection probability
    totalPrizes: number;
    remainingPrizes: number;
    prizes: Prize[];
  }
  
  export interface Prize {
    id: string;
    name: string;
    description: string;
    tier: number;
    weight: number;
    totalQuantity: number;
    remainingQuantity: number;
    imageUrl?: string;
  }

export const PRIZE_TIERS: PrizeTier[] = [
    {
      tier: 1,
      name: "Grand Prize",
      weight: 0.01, // 1% chance
      totalPrizes: 1,
      remainingPrizes: 1,
      prizes: []
    },
    {
      tier: 2,
      name: "Premium Prizes",
      weight: 0.05, // 5% chance
      totalPrizes: 10,
      remainingPrizes: 10,
      prizes: []
    },
    {
      tier: 3,
      name: "High-Value Prizes",
      weight: 0.15, // 15% chance
      totalPrizes: 50,
      remainingPrizes: 50,
      prizes: []
    },
    {
      tier: 4,
      name: "Standard Prizes",
      weight: 0.30, // 30% chance
      totalPrizes: 100,
      remainingPrizes: 100,
      prizes: []
    },
    {
      tier: 5,
      name: "Consolation Prizes",
      weight: 0.49, // 49% chance
      totalPrizes: 189,
      remainingPrizes: 189,
      prizes: []
    }
  ];