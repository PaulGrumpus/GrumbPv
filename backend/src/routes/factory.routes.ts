import { Router } from 'express';
import { body, param } from 'express-validator';
import { factoryController } from '../controllers/factory.controller.js';
import { validate } from '../middlewares/validateRequest.js';

const router = Router();

/**
 * @swagger
 * /api/v1/factory/escrow:
 *   post:
 *     summary: Create a new escrow
 *     description: Deploy a new escrow contract using the factory
 *     tags: [Factory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEscrowRequest'
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *             jobId: "JOB-001"
 *             buyer: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 *             seller: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed"
 *             arbiter: "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359"
 *             amount: "1.0"
 *             deadline: 1735689600
 *             buyerFeeBps: 50
 *             vendorFeeBps: 50
 *             disputeFeeBps: 50
 *             rewardRateBps: 25
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     escrowAddress:
 *                       type: string
 *                     transactionHash:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/escrow',
  [
    body('privateKey').isString().notEmpty(),
    body('jobId').isString().notEmpty(),
    body('buyer').isEthereumAddress(),
    body('seller').isEthereumAddress(),
    body('arbiter').isEthereumAddress(),
    body('amount').isString().notEmpty(),
    body('deadline').isInt({ min: 1 }),
    body('buyerFeeBps').optional().isInt({ min: 0, max: 1000 }),
    body('vendorFeeBps').optional().isInt({ min: 0, max: 1000 }),
    body('disputeFeeBps').optional().isInt({ min: 0, max: 1000 }),
    body('rewardRateBps').optional().isInt({ min: 0, max: 1000 }),
  ],
  validate([
    body('privateKey'),
    body('jobId'),
    body('buyer'),
    body('seller'),
    body('arbiter'),
    body('amount'),
    body('deadline'),
  ]),
  factoryController.createEscrow.bind(factoryController)
);

/**
 * @route   POST /api/v1/factory/escrow/deterministic
 * @desc    Create deterministic escrow
 * @access  Private
 */
router.post(
  '/escrow/deterministic',
  [
    body('privateKey').isString().notEmpty(),
    body('salt').isString().notEmpty(),
    body('jobId').isString().notEmpty(),
    body('buyer').isEthereumAddress(),
    body('seller').isEthereumAddress(),
    body('arbiter').isEthereumAddress(),
    body('amount').isString().notEmpty(),
    body('deadline').isInt({ min: 1 }),
  ],
  validate([
    body('privateKey'),
    body('salt'),
    body('jobId'),
    body('buyer'),
    body('seller'),
    body('arbiter'),
    body('amount'),
    body('deadline'),
  ]),
  factoryController.createDeterministicEscrow.bind(factoryController)
);

/**
 * @route   GET /api/v1/factory/predict/:salt
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
 * @route   GET /api/v1/factory/verify/:address
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
 * /api/v1/factory/owner:
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

export default router;

