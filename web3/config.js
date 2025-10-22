import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

// Load ABIs
const escrowABI = JSON.parse(
  readFileSync(join(__dirname, 'abi', 'Escrow.json'), 'utf8')
);

const factoryABI = JSON.parse(
  readFileSync(join(__dirname, 'abi', 'EscrowFactory.json'), 'utf8')
);

const erc20ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export const CONFIG = {
  // Network
  rpcUrl: process.env.BSC_TESTNET_RPC_URL || 'https://bsc-testnet-rpc.publicnode.com/',
  chainId: parseInt(process.env.CHAIN_ID || '97'),
  
  // Contracts
  escrowAddress: process.env.ESCROW_ADDRESS || '0x4035920Dee6bb6DF73e68ED06b5666ca28BD247B',
  factoryAddress: process.env.FACTORY_ADDRESS,
  implementationAddress: process.env.ESCROW_IMPLEMENTATION_ADDRESS,
  
  // ABIs
  escrowABI,
  factoryABI,
  erc20ABI,
  
  // Addresses
  buyer: process.env.BUYER_ADDRESS,
  vendor: process.env.VENDOR_ADDRESS,
  arbiter: process.env.ARBITER_ADDRESS,
  feeRecipient: process.env.FEE_RECIPIENT_ADDRESS,
  grmpsToken: process.env.GRMPS_TOKEN_ADDRESS,
  
  // Private Keys (use carefully!)
  buyerPrivateKey: process.env.BUYER_PRIVATE_KEY,
  vendorPrivateKey: process.env.VENDOR_PRIVATE_KEY,
  arbiterPrivateKey: process.env.ARBITER_PRIVATE_KEY,
  
  // Parameters
  fundAmount: process.env.FUND_AMOUNT || '1.005',
  rewardRate: process.env.REWARD_RATE || '60000000000000000000000',
};

export const STATES = {
  0: 'Unfunded',
  1: 'Funded',
  2: 'Delivered',
  3: 'Disputed',
  4: 'Releasable',
  5: 'Paid',
  6: 'Refunded'
};

