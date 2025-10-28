import { Router } from 'express';
import { body, param } from 'express-validator';
import { factoryController } from '../controllers/factory.controller.js';
import { validate } from '../middlewares/validateRequest.js';

const router = Router();

/**
 * @route   POST /api/v1/factory/escrow
 * @desc    Create new escrow
 * @access  Private
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
 * @route   GET /api/v1/factory/owner
 * @desc    Get factory owner
 * @access  Public
 */
router.get('/owner', factoryController.getOwner.bind(factoryController));

export default router;

