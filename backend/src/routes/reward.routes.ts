import { Router } from 'express';
import { body, param } from 'express-validator';
import { rewardController } from '../controllers/reward.controller.js';
import { validate } from '../middlewares/validateRequest.js';

const router = Router();

/**
 * @route   POST /api/v1/rewards/approve
 * @desc    Approve distributor to spend tokens
 * @access  Private
 */
router.post(
  '/approve',
  [body('privateKey').isString().notEmpty(), body('amount').isString().notEmpty()],
  validate([body('privateKey'), body('amount')]),
  rewardController.approveDistributor.bind(rewardController)
);

/**
 * @route   GET /api/v1/rewards/allowance
 * @desc    Get current allowance
 * @access  Public
 */
router.get('/allowance', rewardController.getAllowance.bind(rewardController));

/**
 * @route   GET /api/v1/rewards/balance
 * @desc    Get source balance
 * @access  Public
 */
router.get('/balance', rewardController.getSourceBalance.bind(rewardController));

/**
 * @route   POST /api/v1/rewards/authorize-factory
 * @desc    Authorize factory
 * @access  Private
 */
router.post(
  '/authorize-factory',
  [body('privateKey').isString().notEmpty()],
  validate([body('privateKey')]),
  rewardController.authorizeFactory.bind(rewardController)
);

/**
 * @route   GET /api/v1/rewards/check-auth/:address
 * @desc    Check if caller is authorized
 * @access  Public
 */
router.get(
  '/check-auth/:address',
  [param('address').isEthereumAddress()],
  validate([param('address')]),
  rewardController.checkAuthorization.bind(rewardController)
);

/**
 * @route   GET /api/v1/rewards/info
 * @desc    Get distributor info
 * @access  Public
 */
router.get('/info', rewardController.getInfo.bind(rewardController));

export default router;

