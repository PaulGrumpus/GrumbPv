import { Router, Request, Response } from 'express';
import { web3Provider } from '../utils/web3Provider.js';
import { CONTRACT_ADDRESSES, BLOCKCHAIN_CONFIG } from '../config/contracts.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns API health status and blockchain connection info
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     blockchain:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                         blockNumber:
 *                           type: number
 *                         chainId:
 *                           type: number
 *                     contracts:
 *                       type: object
 *                       properties:
 *                         factory:
 *                           type: string
 *                         implementation:
 *                           type: string
 *                         rewardDistributor:
 *                           type: string
 *       503:
 *         description: API is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

