/**
 * BEP-20 token addresses and decimals for BSC Testnet and Mainnet.
 * Use PAYMENT_TOKEN=USDT or PAYMENT_TOKEN=USDC in .env, or pass token address directly.
 */

export const TOKENS = {
  // BSC Testnet
  testnet: {
    USDT: {
      address: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
      decimals: 6,
      symbol: 'USDT',
    },
    USDC: {
      address: '0x64544969ed7EBf5f083679233325356EbE738930',
      decimals: 6,
      symbol: 'USDC',
    },
  },
  // BSC Mainnet
  mainnet: {
    USDT: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 6,
      symbol: 'USDT',
    },
    USDC: {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      decimals: 6,
      symbol: 'USDC',
    },
  },
};

/**
 * Resolve payment token address and decimals from env or name.
 * @param {string} [tokenNameOrAddress] - "USDT", "USDC", or contract address (0x...)
 * @param {number} [chainId] - 97 = testnet, 56 = mainnet
 * @returns {{ address: string, decimals: number, symbol: string }}
 */
export function getTokenConfig(tokenNameOrAddress, chainId = 97) {
  const net = chainId === 56 ? 'mainnet' : 'testnet';
  const tokens = TOKENS[net];

  const raw = tokenNameOrAddress || process.env.PAYMENT_TOKEN || 'USDT';
  const s = String(raw).trim();
  const upper = s.toUpperCase();

  if (upper === 'USDT') return tokens.USDT;
  if (upper === 'USDC') return tokens.USDC;
  if (s.startsWith('0x') && s.length === 42) {
    return { address: s, decimals: 6, symbol: 'BEP20' };
  }

  return tokens.USDT;
}

/**
 * Get token config by contract address (e.g. from escrow.paymentToken).
 * @param {string} address - Token contract address
 * @param {number} [chainId] - 97 or 56
 * @returns {{ address: string, decimals: number, symbol: string }}
 */
export function getTokenConfigByAddress(address, chainId = 97) {
  const net = chainId === 56 ? 'mainnet' : 'testnet';
  const tokens = TOKENS[net];
  const addr = address.toLowerCase();
  for (const t of Object.values(tokens)) {
    if (t.address.toLowerCase() === addr) return t;
  }
  return { address: address, decimals: 6, symbol: 'BEP20' };
}

export default { TOKENS, getTokenConfig, getTokenConfigByAddress };
