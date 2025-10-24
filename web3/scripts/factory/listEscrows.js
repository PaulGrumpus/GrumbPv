import { ethers } from 'ethers';
import { getCreatedEscrows } from '../../utils/escrowUtils.js';
import { CONFIG } from '../../config.js';

/**
 * List all escrows created by the factory
 */
async function listEscrows() {
  console.log('📜 Fetching created escrows...\n');

  try {
    // Default to factory deployment block to avoid scanning millions of blocks
    // Factory deployed around block: 69920000 (BSC Testnet) - use earlier block to catch all escrows
    const FACTORY_DEPLOY_BLOCK = 69920000;
    
    const fromBlock = parseInt(process.env.FROM_BLOCK || FACTORY_DEPLOY_BLOCK);
    const toBlock = process.env.TO_BLOCK || 'latest';

    console.log(`Scanning from block ${fromBlock} to ${toBlock}...\n`);

    const escrows = await getCreatedEscrows(fromBlock, toBlock);

    if (escrows.length === 0) {
      console.log('❌ No escrows found');
      return;
    }

    console.log(`✅ Found ${escrows.length} escrow(s):\n`);
    console.log('='.repeat(100));

    // Fetch state for each escrow
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    
    for (let i = 0; i < escrows.length; i++) {
      const escrow = escrows[i];
      console.log(`\n${i + 1}. Escrow: ${escrow.escrow}`);
      console.log(`   Job ID: ${escrow.jobId}`);
      console.log(`   Buyer: ${escrow.buyer}`);
      console.log(`   Seller: ${escrow.seller}`);
      console.log(`   Amount: ${escrow.amountFormatted} BNB`);
      console.log(`   Fee: ${escrow.feeBps / 100}%`);
      console.log(`   Deterministic: ${escrow.deterministic ? 'Yes' : 'No'}`);
      
      // Fetch current state
      try {
        const escrowContract = new ethers.Contract(
          escrow.escrow,
          CONFIG.escrowABI,
          provider
        );
        const state = await escrowContract.getState();
        const stateNames = ['Unfunded', 'Funded', 'Delivered', 'Disputed', 'Releasable', 'Paid', 'Refunded'];
        console.log(`   State: ${stateNames[Number(state)]} (${state})`);
        
        // Show if releasable
        if (Number(state) === 4) {
          console.log(`   🎯 Ready to withdraw!`);
        } else if (Number(state) === 5 || Number(state) === 6) {
          console.log(`   ✅ Completed`);
        }
      } catch (error) {
        console.log(`   State: Unable to fetch (${error.message.substring(0, 50)}...)`);
      }
      
      console.log(`   Block: ${escrow.blockNumber}`);
      console.log(`   TX: ${escrow.transactionHash}`);
    }

    console.log('\n' + '='.repeat(100));
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  listEscrows()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { listEscrows };

