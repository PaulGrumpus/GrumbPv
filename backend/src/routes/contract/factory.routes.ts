import { Router } from 'express';
import { body, param } from 'express-validator';
import { factoryController } from '../../controllers/contract/factory.controller.js';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

/**
 * @swagger
 * /api/v1/contract/factory/escrow:
 *   post:
 *     summary: Create a new escrow
 *     description: |
 *       Deploy a new escrow contract using the factory pattern.
 *       All parameters (buyer, seller, amount, deadline) are automatically fetched from the job milestone.
 *       Uses DEPLOYER_PRIVATE_KEY from environment for deployment.
 *     tags: [Factory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEscrowRequest'
 *           example:
 *             job_milestone_id: "b9e3b0d0-4d4a-4b7d-8e5a-0c9a0d5e1a2b"
 *     responses:
 *       201:
 *         description: Escrow created successfully
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
 *                     escrowAddress:
 *                       type: string
 *                       example: "0x1234567890abcdef1234567890abcdef12345678"
 *                       description: Deployed escrow contract address
 *                     transactionHash:
 *                       type: string
 *                       example: "0xabcdef1234567890abcdef1234567890abcdef12"
 *                       description: Blockchain transaction hash
 *                 message:
 *                   type: string
 *                   example: "Escrow created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job milestone, job, or wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error or contract deployment failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/escrow',
  [body('job_milestone_id').isString().notEmpty()],
  validate([body('job_milestone_id')]),
  factoryController.createEscrow.bind(factoryController)
);

/**
 * @route   POST /api/v1/contract/factory/escrow/deterministic
 * @desc    Create deterministic escrow
 * @access  Private
 */
router.post(
  '/escrow/deterministic',
  [body('salt').isString().notEmpty(), body('job_milestone_id').isString().notEmpty()],
  validate([body('salt'), body('job_milestone_id')]),
  factoryController.createDeterministicEscrow.bind(factoryController)
);

/**
 * @route   GET /api/v1/contract/factory/predict/:salt
 * @desc    Predict escrow address
 * @access  Public
 */
router.get(
  '/predict/:salt',
  [param('salt').isString().notEmpty()],
  validate([param('salt')]),
  factoryController.predictAddress.bind(factoryController)
);

/**
 * @route   GET /api/v1/contract/factory/verify/:address
 * @desc    Check if escrow was created by factory
 * @access  Public
 */
router.get(
  '/verify/:address',
  [param('address').isEthereumAddress()],
  validate([param('address')]),
  factoryController.isEscrowCreated.bind(factoryController)
);

/**
 * @swagger
 * /api/v1/contract/factory/owner:
 *   get:
 *     summary: Get factory owner address
 *     description: Returns the current owner of the factory contract
 *     tags: [Factory]
 *     responses:
 *       200:
 *         description: Factory owner address
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
 *                     owner:
 *                       type: string
 *                       example: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 */
router.get('/owner', factoryController.getOwner.bind(factoryController));

/**
 * @swagger
 * /api/v1/contract/factory/escrow/{address}/setup-rewards:
 *   post:
 *     summary: Setup GRMPS rewards for an escrow
 *     description: Configure reward token and rate for an escrow contract. Uses DEPLOYER_PRIVATE_KEY (arbiter) and REWARD_DISTRIBUTOR_ADDRESS from .env. Only arbiter can configure.
 *     tags: [Factory]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
 *         example: "0x1234567890abcdef1234567890abcdef12345678"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewardTokenAddress
 *               - rewardRate
 *             properties:
 *               rewardTokenAddress:
 *                 type: string
 *                 description: GRMPS token address
 *                 example: "0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016"
 *               rewardRate:
 *                 type: string
 *                 description: GRMPS tokens per 1e18 wei of project amount (e.g., 30000 GRMPS per BNB = 30000 * 1e18)
 *                 example: "30000000000000000000000"
 *           example:
 *             rewardTokenAddress: "0xB908a4d3534D3e63b30b856e33Bf1B5d1dEd0016"
 *             rewardRate: "30000000000000000000000"
 *     responses:
 *       200:
 *         description: Rewards configured successfully
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
 *                     setTokenTxHash:
 *                       type: string
 *                       description: Transaction hash for setting reward token
 *                       example: "0x1234567890abcdef..."
 *                     setRateTxHash:
 *                       type: string
 *                       description: Transaction hash for setting reward rate
 *                       example: "0x5678901234abcdef..."
 *                     setDistributorTxHash:
 *                       type: string
 *                       description: Transaction hash for setting distributor (if REWARD_DISTRIBUTOR_ADDRESS in .env)
 *                       example: "0x9abcdef012345678..."
 *                 message:
 *                   type: string
 *                   example: "Rewards configured successfully for escrow"
 *       400:
 *         description: Validation error or invalid address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Only arbiter can configure rewards
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Transaction failed or configuration error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/escrow/:address/setup-rewards',
  [
    param('address').isEthereumAddress(),
    body('rewardTokenAddress').isEthereumAddress(),
    body('rewardRate').isString().notEmpty(),
  ],
  validate([param('address'), body('rewardTokenAddress'), body('rewardRate')]),
  factoryController.setupEscrowRewards.bind(factoryController)
);

router.post(
  '/factory/setup-rewards',
  [
    body('rewardTokenAddress').isEthereumAddress(),
    body('rewardRatePer1e18').isString().notEmpty(),
  ],
  validate([body('rewardTokenAddress'), body('rewardRatePer1e18')]),
  factoryController.setupFactoryRewards.bind(factoryController)
);

export default router;
