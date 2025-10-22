import { ethers } from 'ethers';
import { predictEscrowAddress, generateSalt } from '../../utils/escrowUtils.js';
import { CONFIG } from '../../config.js';

/**
 * Predict escrow address for deterministic deployment
 */
async function predictAddress() {
  console.log('🔮 Predicting Escrow Address...\n');

  // Get parameters
  const jobId = process.env.JOB_ID || ethers.id(`JOB-${Date.now()}`);
  const buyer = process.env.BUYER_ADDRESS || CONFIG.buyer;
  const seller = process.env.VENDOR_ADDRESS || CONFIG.vendor;

  if (!buyer || !seller) {
    console.error('❌ BUYER_ADDRESS and VENDOR_ADDRESS must be set');
    process.exit(1);
  }

  console.log('Parameters:');
  console.log('  Job ID:', jobId);
  console.log('  Buyer:', buyer);
  console.log('  Seller:', seller);
  console.log();

  try {
    // Generate salt
    const salt = generateSalt(jobId, buyer, seller);
    console.log('🔑 Salt:', salt);

    // Predict address
    const predicted = await predictEscrowAddress(salt);

    console.log('\n✅ Predicted Address:', predicted);
    console.log('\n💡 Use this salt when creating the escrow:');
    console.log(`   npm run create:escrow -- --deterministic true --salt ${salt}`);
    console.log('\n🔗 Pre-fund this address if needed before creation');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  predictAddress()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { predictAddress };

