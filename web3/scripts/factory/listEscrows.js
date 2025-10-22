import { getCreatedEscrows } from '../../utils/escrowUtils.js';

/**
 * List all escrows created by the factory
 */
async function listEscrows() {
  console.log('📜 Fetching created escrows...\n');

  try {
    // Get from block (default to 0, or from env)
    const fromBlock = parseInt(process.env.FROM_BLOCK || '0');
    const toBlock = process.env.TO_BLOCK || 'latest';

    console.log(`Scanning from block ${fromBlock} to ${toBlock}...\n`);

    const escrows = await getCreatedEscrows(fromBlock, toBlock);

    if (escrows.length === 0) {
      console.log('❌ No escrows found');
      return;
    }

    console.log(`✅ Found ${escrows.length} escrow(s):\n`);
    console.log('='.repeat(100));

    escrows.forEach((escrow, index) => {
      console.log(`\n${index + 1}. Escrow: ${escrow.escrow}`);
      console.log(`   Job ID: ${escrow.jobId}`);
      console.log(`   Buyer: ${escrow.buyer}`);
      console.log(`   Seller: ${escrow.seller}`);
      console.log(`   Amount: ${escrow.amountFormatted} BNB`);
      console.log(`   Fee: ${escrow.feeBps / 100}%`);
      console.log(`   Deterministic: ${escrow.deterministic ? 'Yes' : 'No'}`);
      console.log(`   Block: ${escrow.blockNumber}`);
      console.log(`   TX: ${escrow.transactionHash}`);
    });

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

