import { Router } from 'express';
import { body, param } from 'express-validator';
import { rewardController } from '../../controllers/contract/reward.controller.js';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

/**
 * @swagger
 * /api/v1/contract/rewards/approve:
 *   post:
 *     summary: Approve reward distributor
 *     description: Reward source approves the distributor contract to spend GRMPS tokens for reward distribution
 *     tags: [Rewards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *               - amount
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Reward source's private key (who holds GRMPS tokens)
 *                 example: "0x1234567890abcdef..."
 *               amount:
 *                 type: string
 *                 description: Amount of GRMPS tokens to approve (in GRMPS, not wei)
 *                 example: "1000000"
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *             amount: "1000000"
 *     responses:
 *       200:
 *         description: Approval successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Transaction failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/approve',
  [body('privateKey').isString().notEmpty(), body('amount').isString().notEmpty()],
  validate([body('privateKey'), body('amount')]),
  rewardController.approveDistributor.bind(rewardController)
);

/**
 * @swagger
 * /api/v1/contract/rewards/allowance:
 *   get:
 *     summary: Get current allowance
 *     description: Returns how much GRMPS the reward distributor is allowed to spend from reward source
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: Current allowance in GRMPS
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     allowance:
 *                       type: string
 *                       example: "500000.0"
 *       500:
 *         description: Failed to get allowance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/allowance', rewardController.getAllowance.bind(rewardController));

/**
 * @swagger
 * /api/v1/contract/rewards/balance:
 *   get:
 *     summary: Get reward source balance
 *     description: Returns the GRMPS token balance of the reward source wallet
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: Reward source balance in GRMPS
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: string
 *                       example: "1000000.0"
 *       500:
 *         description: Failed to get balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/balance', rewardController.getSourceBalance.bind(rewardController));

/**
 * @swagger
 * /api/v1/contract/rewards/authorize-factory:
 *   post:
 *     summary: Authorize factory
 *     description: Owner authorizes the escrow factory so all escrows created by it can distribute rewards
 *     tags: [Rewards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Reward distributor owner's private key
 *                 example: "0x1234567890abcdef..."
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *     responses:
 *       200:
 *         description: Factory authorized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Transaction failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/authorize-factory',
  [body('privateKey').isString().notEmpty()],
  validate([body('privateKey')]),
  rewardController.authorizeFactory.bind(rewardController)
);

/**
 * @swagger
 * /api/v1/contract/rewards/check-auth/{address}:
 *   get:
 *     summary: Check authorization
 *     description: Check if a caller (escrow contract) is authorized to distribute rewards
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Address to check (usually escrow contract address)
 *         example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Authorization status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isAuthorized:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/check-auth/:address',
  [param('address').isEthereumAddress()],
  validate([param('address')]),
  rewardController.checkAuthorization.bind(rewardController)
);

/**
 * @swagger
 * /api/v1/contract/rewards/info:
 *   get:
 *     summary: Get reward distributor information
 *     description: Returns configuration details of the reward distributor contract
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: Reward distributor information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     rewardToken:
 *                       type: string
 *                       description: GRMPS token address
 *                       example: "0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016"
 *                     rewardSource:
 *                       type: string
 *                       description: Address holding the GRMPS tokens
 *                       example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *                     owner:
 *                       type: string
 *                       description: Distributor contract owner
 *                       example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *                     openMode:
 *                       type: boolean
 *                       description: Whether anyone can request rewards (dangerous!)
 *                       example: false
 *       500:
 *         description: Failed to get info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/info', rewardController.getInfo.bind(rewardController));

export default router;

