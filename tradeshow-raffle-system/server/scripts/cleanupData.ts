import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from '../src/database/connection.js';
import { PrizeTier } from '../src/models/PrizeTeir.ts';
import { Prize } from '../src/models/Prize.ts';
import { Session } from '../src/models/Session.ts';
import { EmailEntry } from '../src/models/EmailEntry.ts';

dotenv.config();

async function cleanupAllData() {
  console.log('🧹 Starting database cleanup...');

  try {
    // Connect to database
    await connectDatabase();

    // Clear all collections
    console.log('🗑️ Clearing EmailEntry collection...');
    const emailResult = await EmailEntry.deleteMany({});
    console.log(`✅ Deleted ${emailResult.deletedCount} email entries`);

    console.log('🗑️ Clearing Prize collection...');
    const prizeResult = await Prize.deleteMany({});
    console.log(`✅ Deleted ${prizeResult.deletedCount} prizes`);

    console.log('🗑️ Clearing PrizeTier collection...');
    const prizeTierResult = await PrizeTier.deleteMany({});
    console.log(`✅ Deleted ${prizeTierResult.deletedCount} prize tiers`);

    console.log('🗑️ Clearing Session collection...');
    const sessionResult = await Session.deleteMany({});
    console.log(`✅ Deleted ${sessionResult.deletedCount} sessions`);

    console.log('✅ Database cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDatabase();
  }
}

async function cleanupTestData() {
  console.log('🧹 Starting test data cleanup (keeping prize structure)...');

  try {
    // Connect to database
    await connectDatabase();

    // Clear only test data, keep prize structure
    console.log('🗑️ Clearing test email entries...');
    const emailResult = await EmailEntry.deleteMany({});
    console.log(`✅ Deleted ${emailResult.deletedCount} email entries`);

    console.log('🗑️ Clearing test sessions...');
    const sessionResult = await Session.deleteMany({});
    console.log(`✅ Deleted ${sessionResult.deletedCount} sessions`);

    // Reset prize quantities to original values
    console.log('🔄 Resetting prize quantities...');
    await Prize.updateMany({}, [
      {
        $set: {
          remainingQuantity: '$totalQuantity'
        }
      }
    ]);

    await PrizeTier.updateMany({}, [
      {
        $set: {
          remainingPrizes: '$totalPrizes'
        }
      }
    ]);

    console.log('✅ Test data cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during test cleanup:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDatabase();
  }
}

async function showDatabaseStats() {
  console.log('📊 Database Statistics:');

  try {
    // Connect to database
    await connectDatabase();

    // Get counts
    const emailCount = await EmailEntry.countDocuments();
    const prizeCount = await Prize.countDocuments();
    const prizeTierCount = await PrizeTier.countDocuments();
    const sessionCount = await Session.countDocuments();

    console.log(`📧 Email entries: ${emailCount}`);
    console.log(`🎁 Prizes: ${prizeCount}`);
    console.log(`🏆 Prize tiers: ${prizeTierCount}`);
    console.log(`📱 Sessions: ${sessionCount}`);

    // Get prize distribution
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

    console.log('\n📊 Prize distribution by tier:');
    prizeStats.forEach(stat => {
      console.log(`  Tier ${stat._id}: ${stat.remainingQuantity}/${stat.totalQuantity} remaining`);
    });

  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDatabase();
  }
}

// Command line interface
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'all':
      await cleanupAllData();
      break;
    case 'test':
      await cleanupTestData();
      break;
    case 'stats':
      await showDatabaseStats();
      break;
    default:
      console.log('Usage: npm run cleanup [all|test|stats]');
      console.log('  all   - Remove all data including prize structure');
      console.log('  test  - Remove only test data, keep prize structure');
      console.log('  stats - Show database statistics');
      process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('🎉 Cleanup process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup process failed:', error);
      process.exit(1);
    });
}

export { cleanupAllData, cleanupTestData, showDatabaseStats };
