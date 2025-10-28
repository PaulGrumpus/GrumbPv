import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load ABIs from the contract compilation output
const loadABI = (contractName: string) => {
  const abiPath = join(__dirname, '../../abi', `${contractName}.json`);
  return JSON.parse(readFileSync(abiPath, 'utf8')).abi;
};

export const CONTRACT_ABIS = {
  Escrow: loadABI('Escrow'),
  EscrowFactory: loadABI('EscrowFactory'),
  RewardDistributor: loadABI('RewardDistributor'),
  ERC20: [
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
  ],
};

export const CONTRACT_ADDRESSES = {
  factory: process.env.FACTORY_ADDRESS || '',
  implementation: process.env.ESCROW_IMPLEMENTATION_ADDRESS || '',
  rewardDistributor: process.env.REWARD_DISTRIBUTOR_ADDRESS || '',
  grmpsToken: process.env.GRMPS_TOKEN_ADDRESS || '',
};

// Validate critical addresses on startup (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  const missingAddresses: string[] = [];
  
  if (!CONTRACT_ADDRESSES.factory) {
    missingAddresses.push('FACTORY_ADDRESS');
  }
  if (!CONTRACT_ADDRESSES.implementation) {
    missingAddresses.push('ESCROW_IMPLEMENTATION_ADDRESS');
  }
  if (!CONTRACT_ADDRESSES.rewardDistributor) {
    missingAddresses.push('REWARD_DISTRIBUTOR_ADDRESS');
  }
  
  if (missingAddresses.length > 0) {
    console.warn('⚠️  Warning: Missing contract addresses in .env:');
    missingAddresses.forEach(addr => console.warn(`   - ${addr}`));
    console.warn('   Some API endpoints will not work until these are configured.');
  }
}

export const BLOCKCHAIN_CONFIG = {
  rpcUrl: process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com/',
  chainId: parseInt(process.env.CHAIN_ID || '97'),
};

export const ESCROW_STATES = {
  0: 'Unfunded',
  1: 'Funded',
  2: 'Delivered',
  3: 'Disputed',
  4: 'Releasable',
  5: 'Paid',
  6: 'Refunded',
} as const;

export const DEFAULT_CONFIG = {
  feeBps: parseInt(process.env.DEFAULT_FEE_BPS || '100'),
  buyerFeeBps: parseInt(process.env.DEFAULT_BUYER_FEE_BPS || '50'),
  vendorFeeBps: parseInt(process.env.DEFAULT_VENDOR_FEE_BPS || '50'),
  disputeFeeBps: parseInt(process.env.DEFAULT_DISPUTE_FEE_BPS || '50'),
  rewardRateBps: parseInt(process.env.DEFAULT_REWARD_RATE_BPS || '25'),
  feeRecipient: process.env.FEE_RECIPIENT_ADDRESS || '',
};

