import { Router } from 'express';
import { body, param } from 'express-validator';
import { escrowController } from '../../controllers/contract/escrow.controller.js';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

/**
 * @swagger
 * /api/v1/escrow/{address}:
 *   get:
 *     summary: Get escrow information
 *     description: Returns detailed information about an escrow contract including state, amounts, participants, and deadlines
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
 *         example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Escrow information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EscrowInfo'
 *       400:
 *         description: Invalid escrow address
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
router.get(
  '/:address',
  [param('address').isEthereumAddress().withMessage('Invalid escrow address')],
  validate([param('address')]),
  escrowController.getInfo.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/escrow/{address}/fund:
 *   post:
 *     summary: Fund escrow
 *     description: Buyer funds the escrow with BNB (project amount + buyer fee)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *               - value
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Buyer's private key
 *                 example: "0x1234567890abcdef..."
 *               value:
 *                 type: string
 *                 description: Amount in BNB to fund (project amount + buyer fee)
 *                 example: "1.005"
 *     responses:
 *       200:
 *         description: Escrow funded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Validation error or bad state
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
 * @swagger
 * /api/v1/escrow/{address}/deliver:
 *   post:
 *     summary: Deliver work
 *     description: Vendor submits the completed work with IPFS CID
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *               - cid
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Vendor's private key
 *                 example: "0x1234567890abcdef..."
 *               cid:
 *                 type: string
 *                 description: IPFS Content ID
 *                 example: "QmTestCID123abc"
 *               contentHash:
 *                 type: string
 *                 description: Content hash (optional)
 *                 example: "0x1234..."
 *     responses:
 *       200:
 *         description: Work delivered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Validation error or bad state
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
 * @swagger
 * /api/v1/escrow/{address}/approve:
 *   post:
 *     summary: Approve work
 *     description: Buyer approves the delivered work (CID must match vendor's delivery)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *               - cid
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Buyer's private key
 *                 example: "0x1234567890abcdef..."
 *               cid:
 *                 type: string
 *                 description: IPFS CID to approve (must match vendor's delivery)
 *                 example: "QmTestCID123abc"
 *     responses:
 *       200:
 *         description: Work approved successfully (escrow becomes Releasable)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: CID mismatch or bad state
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
 * @swagger
 * /api/v1/escrow/{address}/withdraw:
 *   post:
 *     summary: Withdraw funds
 *     description: Vendor withdraws funds after buyer approval (state must be Releasable). Distributes GRMPS rewards if configured.
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
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
 *                 description: Vendor's private key
 *                 example: "0x1234567890abcdef..."
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *     responses:
 *       200:
 *         description: Funds withdrawn successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Bad state (not Releasable)
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
  '/:address/withdraw',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.withdraw.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/escrow/{address}/cancel:
 *   post:
 *     summary: Cancel escrow
 *     description: Buyer cancels escrow and gets full refund (only within first 20% of time window from funding to deadline, or after deadline if vendor never delivered)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
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
 *                 description: Buyer's private key
 *                 example: "0x1234567890abcdef..."
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *     responses:
 *       200:
 *         description: Escrow cancelled successfully, full refund sent to buyer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Cancel window passed or vendor already delivered
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
  '/:address/cancel',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.cancel.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/escrow/{address}/dispute/initiate:
 *   post:
 *     summary: Initiate dispute
 *     description: Either party can initiate a dispute by paying the dispute fee. Counterparty has 48-72h to pay their fee.
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
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
 *                 description: Private key of the party initiating dispute (buyer or vendor)
 *                 example: "0x1234567890abcdef..."
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *     responses:
 *       200:
 *         description: Dispute initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Bad state or dispute already initiated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Transaction failed or insufficient dispute fee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:address/dispute/initiate',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.initiateDispute.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/escrow/{address}/dispute/vender-pay-fee:
 *   post:
 *     summary: Vender pay dispute fee
 *     description: Counterparty pays their dispute fee (must be done within 48-72h of dispute initiation)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
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
 *                 description: Private key of the counterparty
 *                 example: "0x1234567890abcdef..."
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *     responses:
 *       200:
 *         description: Dispute fee paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Dispute fee deadline passed or already paid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Transaction failed or insufficient fee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:address/dispute/vender-pay-fee',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.venderPayDisputeFee.bind(escrowController)
);


/**
 * @swagger
 * /api/v1/escrow/{address}/dispute/buyer-join:
 *   post:
 *     summary: Buyer join the dispute
 *     description: Buyer joins the dispute
 *     tags: [Escrow]
 *     parameters:
 *       - in: path 
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
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
 *                 description: Buyer's private key
 *                 example: "0x1234567890abcdef..."
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *     responses:
 *       200:
 *         description: Buyer joined the dispute successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Bad state or dispute already initiated
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
  '/:address/dispute/buyer-join',
  [param('address').isEthereumAddress(), body('privateKey').isString().notEmpty()],
  validate([param('address'), body('privateKey')]),
  escrowController.buyerJoinDispute.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/escrow/{address}/dispute/resolve:
 *   post:
 *     summary: Resolve dispute
 *     description: Arbiter resolves the dispute in favor of buyer or vendor (both parties must have paid dispute fees)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Escrow contract address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *               - favorBuyer
 *             properties:
 *               privateKey:
 *                 type: string
 *                 description: Arbiter's private key
 *                 example: "0x1234567890abcdef..."
 *               favorBuyer:
 *                 type: boolean
 *                 description: true to favor buyer, false to favor vendor
 *                 example: true
 *           example:
 *             privateKey: "0x1234567890abcdef..."
 *             favorBuyer: true
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
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
 *                     transactionHash:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Dispute resolved in favor of buyer"
 *       400:
 *         description: Both parties haven't paid fees yet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Only arbiter can resolve
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
  '/:address/dispute/resolve',
  [
    param('address').isEthereumAddress(),    
    body('favorBuyer').isBoolean(),
  ],
  validate([param('address'), body('favorBuyer')]),
  escrowController.resolveDispute.bind(escrowController)
);

export default router;

