import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';

/**
 * Create a new escrow via the factory
 * This creates a minimal proxy clone (~100k gas vs ~3M gas)
 */
async function createEscrow(params = {}) {
  console.log('🏭 Creating Escrow via Factory...\n');

  // Get factory address
  const factoryAddress = process.env.FACTORY_ADDRESS || CONFIG.factoryAddress;
  
  if (!factoryAddress) {
    console.error('❌ FACTORY_ADDRESS not set!');
    console.log('\n💡 Deploy the factory first:');
    console.log('   npm run deploy:factory');
    process.exit(1);
  }

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const deployer = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY || CONFIG.arbiterPrivateKey,
    provider
  );

  console.log('Factory address:', factoryAddress);
  console.log('Deployer address:', deployer.address);
  console.log('Network:', CONFIG.chainId === 97 ? 'BSC Testnet' : 'BSC Mainnet\n');

  // Load factory contract
  const factory = new ethers.Contract(factoryAddress, CONFIG.factoryABI, deployer);

  // Prepare parameters
  const jobId = params.jobId || ethers.id(`JOB-${Date.now()}`);
  const buyer = params.buyer || process.env.BUYER_ADDRESS || CONFIG.buyer;
  const seller = params.seller || process.env.VENDOR_ADDRESS || CONFIG.vendor;
  const arbiter = params.arbiter || process.env.ARBITER_ADDRESS || CONFIG.arbiter || ethers.ZeroAddress;
  const feeRecipient = params.feeRecipient || process.env.FEE_RECIPIENT_ADDRESS || CONFIG.feeRecipient;
  const feeBps = params.feeBps || 100; // 1%
  const paymentToken = params.paymentToken || ethers.ZeroAddress; // Native BNB
  const amountWei = params.amountWei || ethers.parseEther(params.amount || '1.0');
  const deterministic = params.deterministic || false;

  if (!buyer || !seller || !feeRecipient) {
    console.error('❌ Missing required parameters: buyer, seller, feeRecipient');
    process.exit(1);
  }

  console.log('📋 Escrow Parameters:');
  console.log('  Job ID:', jobId);
  console.log('  Buyer:', buyer);
  console.log('  Seller:', seller);
  console.log('  Arbiter:', arbiter === ethers.ZeroAddress ? 'None' : arbiter);
  console.log('  Fee Recipient:', feeRecipient);
  console.log('  Fee:', feeBps / 100, '%');
  console.log('  Payment Token:', paymentToken === ethers.ZeroAddress ? 'Native BNB' : paymentToken);
  console.log('  Amount:', ethers.formatEther(amountWei), 'BNB\n');

  try {
    let tx, receipt, escrowAddress;

    if (deterministic) {
      // Deterministic deployment with CREATE2
      const salt = params.salt || ethers.solidityPackedKeccak256(
        ['bytes32', 'address', 'address'],
        [jobId, buyer, seller]
      );

      // Predict address
      const predicted = await factory.predictEscrow(salt);
      console.log('🔮 Predicted address:', predicted);

      console.log('⏳ Creating deterministic escrow...');
      tx = await factory.createEscrowDeterministic(
        jobId,
        buyer,
        seller,
        arbiter,
        feeRecipient,
        feeBps,
        paymentToken,
        amountWei,
        salt
      );

      receipt = await tx.wait();
      
      // Find the EscrowCreated event
      const event = receipt.logs
        .map(log => {
          try {
            return factory.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(event => event && event.name === 'EscrowCreated');

      escrowAddress = event.args.escrow;

      console.log('✅ Address matches prediction:', escrowAddress === predicted);
    } else {
      // Non-deterministic deployment
      console.log('⏳ Creating escrow...');
      tx = await factory.createEscrow(
        jobId,
        buyer,
        seller,
        arbiter,
        feeRecipient,
        feeBps,
        paymentToken,
        amountWei
      );

      receipt = await tx.wait();
      
      // Find the EscrowCreated event
      const event = receipt.logs
        .map(log => {
          try {
            return factory.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(event => event && event.name === 'EscrowCreated');

      escrowAddress = event.args.escrow;
    }

    console.log('\n✅ Escrow created successfully!');
    console.log('='.repeat(60));
    console.log('📍 Escrow Address:', escrowAddress);
    console.log('🔗 Transaction:', receipt.hash);
    console.log('⛽ Gas Used:', receipt.gasUsed.toString());
    console.log('💰 Gas Cost:', ethers.formatEther(receipt.gasUsed * receipt.gasPrice), 'BNB');
    console.log('='.repeat(60));
    console.log('\n🔗 View on BscScan:');
    console.log(`https://${CONFIG.chainId === 97 ? 'testnet.' : ''}bscscan.com/address/${escrowAddress}`);
    console.log('\n💡 Next steps:');
    console.log('  1. Buyer funds the escrow: npm run fund');
    console.log('  2. Set ESCROW_ADDRESS in .env:', escrowAddress);

    return escrowAddress;
  } catch (error) {
    console.error('\n❌ Creation failed:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const params = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    params[key] = value;
  }

  // Convert deterministic flag
  if (params.deterministic === 'true') {
    params.deterministic = true;
  }

  createEscrow(params)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createEscrow };

