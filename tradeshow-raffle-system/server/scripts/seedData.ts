import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../src/database/connection.js';
import { PrizeTier } from '../src/models/PrizeTeir.ts';
import { Prize } from '../src/models/Prize.js';
import { Session } from '../src/models/Session.ts';

dotenv.config();

// Prize tier configuration
const PRIZE_TIERS = [
  {
    tier: 1,
    name: "Grand Prize",
    weight: 0.01, // 1% chance
    totalPrizes: 1,
    remainingPrizes: 1,
    description: "Ultimate grand prize - highest value item"
  },
  {
    tier: 2,
    name: "Premium Prizes",
    weight: 0.05, // 5% chance
    totalPrizes: 10,
    remainingPrizes: 10,
    description: "High-value premium prizes"
  },
  {
    tier: 3,
    name: "High-Value Prizes",
    weight: 0.15, // 15% chance
    totalPrizes: 50,
    remainingPrizes: 50,
    description: "High-value standard prizes"
  },
  {
    tier: 4,
    name: "Standard Prizes",
    weight: 0.30, // 30% chance
    totalPrizes: 100,
    remainingPrizes: 100,
    description: "Standard value prizes"
  },
  {
    tier: 5,
    name: "Consolation Prizes",
    weight: 0.49, // 49% chance
    totalPrizes: 189,
    remainingPrizes: 189,
    description: "Consolation prizes for participation"
  }
];

// Sample prizes for each tier
const SAMPLE_PRIZES = {
  1: [ // Grand Prize
    {
      name: "Grand Prize",
      description: "6 months zero commission with still good and Bottle of Whiskey",
      weight: 1.0,
      totalQuantity: 1,
      remainingQuantity: 1,
      imageUrl: "/images/prizes/grand-prize.jpg"
    }
  ],
  2: [ // Premium Prizes
    {
      name: "Premium Prizes",
      description: "bottle of Irish Whiskey and 3 months Zero Commission",
      weight: 0.3,
      totalQuantity: 3,
      remainingQuantity: 3,
      imageUrl: "/images/prizes/premium-tech.jpg"
    },
    {
      name: "Luxury Watch Collection",
      description: "High-end timepiece from premium brand",
      weight: 0.3,
      totalQuantity: 3,
      remainingQuantity: 3,
      imageUrl: "/images/prizes/luxury-watch.jpg"
    },
    {
      name: "Gaming Setup Pro",
      description: "Complete gaming station with high-end components",
      weight: 0.4,
      totalQuantity: 4,
      remainingQuantity: 4,
      imageUrl: "/images/prizes/gaming-setup.jpg"
    }
  ],
  3: [ // High-Value Prizes
    {
      name: "Smart Home Bundle",
      description: "Complete smart home automation package",
      weight: 0.2,
      totalQuantity: 10,
      remainingQuantity: 10,
      imageUrl: "/images/prizes/smart-home.jpg"
    },
    {
      name: "Fitness Equipment Set",
      description: "Professional-grade fitness equipment for home gym",
      weight: 0.2,
      totalQuantity: 10,
      remainingQuantity: 10,
      imageUrl: "/images/prizes/fitness-equipment.jpg"
    },
    {
      name: "Kitchen Appliance Suite",
      description: "High-end kitchen appliances and gadgets",
      weight: 0.2,
      totalQuantity: 10,
      remainingQuantity: 10,
      imageUrl: "/images/prizes/kitchen-appliances.jpg"
    },
    {
      name: "Outdoor Adventure Kit",
      description: "Complete outdoor gear and adventure equipment",
      weight: 0.2,
      totalQuantity: 10,
      remainingQuantity: 10,
      imageUrl: "/images/prizes/outdoor-kit.jpg"
    },
    {
      name: "Entertainment Package",
      description: "Home entertainment system with premium audio/video",
      weight: 0.2,
      totalQuantity: 10,
      remainingQuantity: 10,
      imageUrl: "/images/prizes/entertainment.jpg"
    }
  ],
  4: [ // Standard Prizes
    {
      name: "Electronics Gift Set",
      description: "Collection of useful electronic gadgets and accessories",
      weight: 0.15,
      totalQuantity: 15,
      remainingQuantity: 15,
      imageUrl: "/images/prizes/electronics-set.jpg"
    },
    {
      name: "Home Decor Collection",
      description: "Premium home decoration and interior design items",
      weight: 0.15,
      totalQuantity: 15,
      remainingQuantity: 15,
      imageUrl: "/images/prizes/home-decor.jpg"
    },
    {
      name: "Wellness Package",
      description: "Health and wellness products and accessories",
      weight: 0.15,
      totalQuantity: 15,
      remainingQuantity: 15,
      imageUrl: "/images/prizes/wellness.jpg"
    },
    {
      name: "Lifestyle Accessories",
      description: "Premium lifestyle and personal accessories",
      weight: 0.15,
      totalQuantity: 15,
      remainingQuantity: 15,
      imageUrl: "/images/prizes/lifestyle.jpg"
    },
    {
      name: "Tech Accessories Bundle",
      description: "Essential tech accessories and peripherals",
      weight: 0.2,
      totalQuantity: 20,
      remainingQuantity: 20,
      imageUrl: "/images/prizes/tech-accessories.jpg"
    },
    {
      name: "Gourmet Gift Basket",
      description: "Premium food and beverage gift collection",
      weight: 0.2,
      totalQuantity: 20,
      remainingQuantity: 20,
      imageUrl: "/images/prizes/gourmet-basket.jpg"
    }
  ],
  5: [ // Consolation Prizes
    {
      name: "Brand Merchandise Pack",
      description: "Company branded merchandise and promotional items",
      weight: 0.3,
      totalQuantity: 57,
      remainingQuantity: 57,
      imageUrl: "/images/prizes/merchandise.jpg"
    },
    {
      name: "Digital Gift Card",
      description: "Digital gift card for popular retailers",
      weight: 0.3,
      totalQuantity: 57,
      remainingQuantity: 57,
      imageUrl: "/images/prizes/gift-card.jpg"
    },
    {
      name: "Experience Voucher",
      description: "Voucher for local experiences and activities",
      weight: 0.2,
      totalQuantity: 38,
      remainingQuantity: 38,
      imageUrl: "/images/prizes/experience-voucher.jpg"
    },
    {
      name: "Small Electronics",
      description: "Useful small electronic devices and gadgets",
      weight: 0.2,
      totalQuantity: 37,
      remainingQuantity: 37,
      imageUrl: "/images/prizes/small-electronics.jpg"
    }
  ]
};

async function seedPrizeTiers() {
  console.log('🌱 Seeding prize tiers...');
  
  // Clear existing prize tiers
  await PrizeTier.deleteMany({});
  
  // Insert new prize tiers
  const prizeTiers = await PrizeTier.insertMany(PRIZE_TIERS);
  console.log(`✅ Created ${prizeTiers.length} prize tiers`);
  
  return prizeTiers;
}

async function seedPrizes() {
  console.log('🌱 Seeding prizes...');
  
  // Clear existing prizes
  await Prize.deleteMany({});
  
  const allPrizes = [];
  
  // Create prizes for each tier
  for (const [tierStr, prizes] of Object.entries(SAMPLE_PRIZES)) {
    const tier = parseInt(tierStr);
    
    for (const prizeData of prizes) {
      const prize = {
        ...prizeData,
        tier,
        isActive: true
      };
      allPrizes.push(prize);
    }
  }
  
  const createdPrizes = await Prize.insertMany(allPrizes);
  console.log(`✅ Created ${createdPrizes.length} prizes`);
  
  return createdPrizes;
}

async function createInitialSession() {
  console.log('🌱 Creating initial session...');
  
  // Clear existing sessions
  await Session.deleteMany({});
  
  // Create new session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session = await Session.create({
    sessionId,
    startTime: new Date(),
    isActive: true
  });
  console.log(`✅ Created initial session: ${session.sessionId}`);
  
  return session;
}

async function validateData() {
  console.log('🔍 Validating seeded data...');
  
  // Check prize tiers
  const prizeTierCount = await PrizeTier.countDocuments();
  console.log(`📊 Prize tiers: ${prizeTierCount}`);
  
  // Check prizes
  const prizeCount = await Prize.countDocuments();
  console.log(`📊 Prizes: ${prizeCount}`);
  
  // Check sessions
  const sessionCount = await Session.countDocuments();
  console.log(`📊 Sessions: ${sessionCount}`);
  
  // Validate prize distribution
  const prizeStats = await Prize.aggregate([
    {
      $group: {
        _id: '$tier',
        totalQuantity: { $sum: '$totalQuantity' },
        remainingQuantity: { $sum: '$remainingQuantity' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  console.log('📊 Prize distribution by tier:');
  prizeStats.forEach(stat => {
    console.log(`  Tier ${stat._id}: ${stat.remainingQuantity}/${stat.totalQuantity} remaining`);
  });
  
  // Validate total prizes = 350
  const totalPrizes = prizeStats.reduce((sum, stat) => sum + stat.totalQuantity, 0);
  console.log(`📊 Total prizes: ${totalPrizes} (target: 350)`);
  
  if (totalPrizes !== 350) {
    console.warn(`⚠️ Warning: Total prizes (${totalPrizes}) does not match target (350)`);
  }
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Seed data
    await seedPrizeTiers();
    await seedPrizes();
    await createInitialSession();
    
    // Validate data
    await validateData();
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDatabase();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedDatabase, seedPrizeTiers, seedPrizes, createInitialSession, validateData };