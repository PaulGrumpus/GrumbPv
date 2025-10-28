import { Router, Request, Response } from 'express';
import { web3Provider } from '../utils/web3Provider.js';
import { CONTRACT_ADDRESSES, BLOCKCHAIN_CONFIG } from '../config/contracts.js';

const router = Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const blockNumber = await web3Provider.getBlockNumber();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        blockchain: {
          connected: true,
          blockNumber,
          chainId: BLOCKCHAIN_CONFIG.chainId,
          rpcUrl: BLOCKCHAIN_CONFIG.rpcUrl,
        },
        contracts: {
          factory: CONTRACT_ADDRESSES.factory,
          implementation: CONTRACT_ADDRESSES.implementation,
          rewardDistributor: CONTRACT_ADDRESSES.rewardDistributor,
        },
      },
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        error: error.message,
      },
    });
  }
});

export default router;

