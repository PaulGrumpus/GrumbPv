import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';

/**
 * Deploy the Escrow implementation contract
 * This is the master contract that all clones will delegate to
 */
async function deployImplementation() {
  console.log('🚀 Deploying Escrow Implementation...\n');

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
  const deployer = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY || CONFIG.arbiterPrivateKey,
    provider
  );

  console.log('Deployer address:', deployer.address);
  console.log('Network:', CONFIG.chainId === 97 ? 'BSC Testnet' : 'BSC Mainnet');

  // Check balance
  const balance = await provider.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'BNB\n');

  if (balance === 0n) {
    throw new Error('❌ Deployer has no balance!');
  }

  // Get contract bytecode from compiled artifacts
  // Note: You need to have the bytecode from forge build
  const contractPath = '../../contract/out/Escrow.sol/Escrow.json';
  let Escrow;
  
  try {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const artifact = JSON.parse(
      readFileSync(join(__dirname, contractPath), 'utf8')
    );
    
    Escrow = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode.object,
      deployer
    );
  } catch (error) {
    console.error('❌ Error loading contract artifact:', error.message);
    console.log('\n💡 Make sure to run "forge build" in the contract directory first');
    process.exit(1);
  }

  try {
    console.log('⏳ Deploying implementation contract...');
    const implementation = await Escrow.deploy();
    await implementation.waitForDeployment();

    const address = await implementation.getAddress();

    console.log('\n✅ Implementation deployed successfully!');
    console.log('='.repeat(60));
    console.log('📍 Implementation Address:', address);
    console.log('='.repeat(60));
    console.log('\n📝 Save this address:');
    console.log(`export ESCROW_IMPLEMENTATION_ADDRESS=${address}`);
    console.log('\n🔗 View on BscScan:');
    console.log(`https://${CONFIG.chainId === 97 ? 'testnet.' : ''}bscscan.com/address/${address}`);
    
    return address;
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployImplementation()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { deployImplementation };

