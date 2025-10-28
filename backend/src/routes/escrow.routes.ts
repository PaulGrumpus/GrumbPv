import { Router } from 'express';
import { body, param } from 'express-validator';
import { escrowController } from '../controllers/escrow.controller.js';
import { validate } from '../middlewares/validateRequest.js';

const router = Router();

/**
 * @route   GET /api/v1/escrow/:address
 * @desc    Get escrow information
 * @access  Public
 */
router.get(
  '/:address',
  [param('address').isEthereumAddress().withMessage('Invalid escrow address')],
  validate([param('address')]),
  escrowController.getInfo.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/fund
 * @desc    Fund escrow (buyer)
 * @access  Private
 */
router.post(
  '/:address/fund',
  [
    param('address').isEthereumAddress(),
    body('privateKey').isString().notEmpty(),
    body('value').isString().notEmpty(),
  ],
  validate([param('address'), body('privateKey'), body('value')]),
  escrowController.fund.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/deliver
 * @desc    Deliver work (vendor)
 * @access  Private
 */
router.post(
  '/:address/deliver',
  [
    param('address').isEthereumAddress(),
    body('privateKey').isString().notEmpty(),
    body('cid').isString().notEmpty(),
    body('contentHash').optional().isString(),
  ],
  validate([param('address'), body('privateKey'), body('cid')]),
  escrowController.deliver.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/approve
 * @desc    Approve work (buyer)
 * @access  Private
 */
router.post(
  '/:address/approve',
  [
    param('address').isEthereumAddress(),
    body('privateKey').isString().notEmpty(),
    body('cid').isString().notEmpty(),
  ],
  validate([param('address'), body('privateKey'), body('cid')]),
  escrowController.approve.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/withdraw
 * @desc    Withdraw funds (vendor)
 * @access  Private
 */
router.post(
  '/:address/withdraw',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.withdraw.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/cancel
 * @desc    Cancel escrow (buyer)
 * @access  Private
 */
router.post(
  '/:address/cancel',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.cancel.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/dispute/initiate
 * @desc    Initiate dispute
 * @access  Private
 */
router.post(
  '/:address/dispute/initiate',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.initiateDispute.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/dispute/pay
 * @desc    Pay dispute fee
 * @access  Private
 */
router.post(
  '/:address/dispute/pay',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.payDisputeFee.bind(escrowController)
);

/**
 * @route   POST /api/v1/escrow/:address/dispute/resolve
 * @desc    Resolve dispute (arbiter)
 * @access  Private
 */
router.post(
  '/:address/dispute/resolve',
  [
    param('address').isEthereumAddress(),
    body('privateKey').isString().notEmpty(),
    body('favorBuyer').isBoolean(),
  ],
  validate([param('address'), body('privateKey'), body('favorBuyer')]),
  escrowController.resolveDispute.bind(escrowController)
);

export default router;

