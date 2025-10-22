import { ethers } from 'ethers';
import { CONFIG } from '../../config.js';

/**
 * Deploy the EscrowFactory contract
 * This factory will create minimal proxy clones of the implementation
 */
async function deployFactory() {
  console.log('🚀 Deploying Escrow Factory...\n');

  // Get implementation address
  const implementationAddress = process.env.ESCROW_IMPLEMENTATION_ADDRESS || CONFIG.implementationAddress;
  
  if (!implementationAddress) {
    console.error('❌ ESCROW_IMPLEMENTATION_ADDRESS not set!');
    console.log('\n💡 Deploy the implementation first:');
    console.log('   npm run deploy:implementation');
    process.exit(1);
  }

  console.log('Implementation address:', implementationAddress);

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

  // Load factory artifact
  const contractPath = '../../contract/out/EscrowFactory.sol/EscrowFactory.json';
  let Factory;
  
  try {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const artifact = JSON.parse(
      readFileSync(join(__dirname, contractPath), 'utf8')
    );
    
    Factory = new ethers.ContractFactory(
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
    console.log('⏳ Deploying factory contract...');
    const factory = await Factory.deploy(implementationAddress);
    await factory.waitForDeployment();

    const address = await factory.getAddress();
    const owner = await factory.owner();

    console.log('\n✅ Factory deployed successfully!');
    console.log('='.repeat(60));
    console.log('📍 Factory Address:', address);
    console.log('👤 Factory Owner:', owner);
    console.log('🔗 Implementation:', implementationAddress);
    console.log('='.repeat(60));
    console.log('\n📝 Save this address:');
    console.log(`export FACTORY_ADDRESS=${address}`);
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
  deployFactory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { deployFactory };

