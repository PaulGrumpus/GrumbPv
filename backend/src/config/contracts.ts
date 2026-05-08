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
  privateKey: process.env.DEPLOYER_PRIVATE_KEY || '',
  ArbiterPrivateKey: process.env.DEPLOYER_PRIVATE_KEY || '',
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
  if (!CONTRACT_ADDRESSES.privateKey) {
    missingAddresses.push('PRIVATE_KEY');
  }
  if (missingAddresses.length > 0) {
    console.warn('⚠️  Warning: Missing contract addresses in .env:');
    missingAddresses.forEach((addr) => console.warn(`   - ${addr}`));
    console.warn('   Some API endpoints will not work until these are configured.');
  }
}

export const BLOCKCHAIN_CONFIG = {
  rpcUrl:
    process.env.BSC_RPC_URL ||
    (parseInt(process.env.CHAIN_ID || '97', 10) === 56
      ? process.env.BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.binance.org'
      : process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com/'),
  chainId: parseInt(process.env.CHAIN_ID || '97'),
};

type SupportedPaymentToken = {
  symbol: string;
  address: string;
  decimals: number;
};

const MAINNET_USDT = process.env.USDT_MAINNET_ADDRESS || '0x55d398326f99059fF775485246999027B3197955';
const MAINNET_USDC = process.env.USDC_MAINNET_ADDRESS || '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
const TESTNET_USDT = process.env.USDT_TESTNET_ADDRESS || '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
const TESTNET_USDC = process.env.USDC_TESTNET_ADDRESS || '0x64544969ed7EBf5f083679233325356EbE738930';

export const PAYMENT_TOKEN_CONFIG: Record<number, Record<string, SupportedPaymentToken>> = {
  56: {
    BNB: { symbol: 'BNB', address: 'native', decimals: 18 },
    USDT: { symbol: 'USDT', address: MAINNET_USDT, decimals: 18 },
    USDC: { symbol: 'USDC', address: MAINNET_USDC, decimals: 18 },
  },
  97: {
    BNB: { symbol: 'BNB', address: 'native', decimals: 18 },
    USDT: { symbol: 'USDT', address: TESTNET_USDT, decimals: 18 },
    USDC: { symbol: 'USDC', address: TESTNET_USDC, decimals: 18 },
  },
};

export function resolvePaymentTokenConfig(symbol?: string): SupportedPaymentToken {
  const chainTokens = PAYMENT_TOKEN_CONFIG[BLOCKCHAIN_CONFIG.chainId] || PAYMENT_TOKEN_CONFIG[97];
  const normalized = (symbol || 'BNB').toUpperCase();
  return chainTokens[normalized] || chainTokens.BNB;
}

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
  rewardRatePer1E18: process.env.DEFAULT_REWARD_RATE_PER_1_E_18 || '30000000000000000000000',
  feeRecipient: process.env.FEE_RECIPIENT_ADDRESS || '',
  arbiter: process.env.ARBITER_ADDRESS || '',
};

export const MEDIATOR_ID = process.env.MEDIATOR_ID || '';
