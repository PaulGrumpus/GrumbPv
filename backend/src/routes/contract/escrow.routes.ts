import { Router } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { escrowController } from '../../controllers/contract/escrow.controller.js';
import { validate } from '../../middlewares/validateRequest.js';

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

const router = Router();

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}:
 *   get:
 *     summary: Get escrow information
 *     description: Returns detailed information about an escrow contract including state, amounts, participants, and deadlines
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
 *         example: "b9e3b0d0-4d4a-4b7d-8e5a-0c9a0d5e1a2b"
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
  '/:job_milestone_id',
  [param('job_milestone_id').isString().notEmpty().withMessage('Invalid job milestone ID')],
  validate([param('job_milestone_id')]),
  escrowController.getInfo.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/fund:
 *   post:
 *     summary: Fund escrow
 *     description: Buyer funds the escrow with BNB (project amount + buyer fee)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
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
  '/:job_milestone_id/fund',
  [
    param('job_milestone_id').isString().notEmpty(),
    body('userId').isString().notEmpty(),
    body('chainId').isInt().notEmpty(),
  ],
  validate([param('job_milestone_id'), body('userId'), body('chainId')]),
  escrowController.fund.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/deliver:
 *   post:
 *     summary: Deliver work
 *     description: |
 *       Vendor submits the completed work. You can either:
 *       1. Upload a file (multipart/form-data) - file will be uploaded to Pinata IPFS automatically
 *       2. Provide a CID directly (multipart/form-data or application/json)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - privateKey
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (will be uploaded to Pinata IPFS). Either file or cid must be provided.
 *               privateKey:
 *                 type: string
 *                 description: Vendor's private key
 *                 example: "0x1234567890abcdef..."
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
 *               allOf:
 *                 - $ref: '#/components/schemas/TransactionResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         transactionHash:
 *                           type: string
 *                         cid:
 *                           type: string
 *                           description: IPFS CID (from file upload or provided CID)
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
  '/:job_milestone_id/deliver',
  upload.single('file'), // Handle single file upload with field name 'file'
  [
    param('job_milestone_id').isString().notEmpty(),
    body('privateKey').isString().notEmpty(),
    body('cid').optional().isString(),
    body('contentHash').optional().isString(),
  ],
  validate([param('job_milestone_id'), body('privateKey')]),
  escrowController.deliver.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/approve:
 *   post:
 *     summary: Approve work
 *     description: Buyer approves the delivered work (CID must match vendor's delivery)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
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
  '/:job_milestone_id/approve',
  [
    param('job_milestone_id').isString().notEmpty(),
    body('privateKey').isString().notEmpty(),
    body('cid').isString().notEmpty(),
  ],
  validate([param('job_milestone_id'), body('privateKey'), body('cid')]),
  escrowController.approve.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/withdraw:
 *   post:
 *     summary: Withdraw funds
 *     description: Vendor withdraws funds after buyer approval (state must be Releasable). Distributes GRMPS rewards if configured.
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
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
  '/:job_milestone_id/withdraw',
  [param('job_milestone_id').isString().notEmpty(), body('privateKey').isString().notEmpty()],
  validate([param('job_milestone_id'), body('privateKey')]),
  escrowController.withdraw.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/dispute/initiate:
 *   post:
 *     summary: Initiate dispute
 *     description: Either party can initiate a dispute by paying the dispute fee. Counterparty has 48-72h to pay their fee.
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
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
  '/:job_milestone_id/dispute/initiate',
  [param('job_milestone_id').isString().notEmpty(), body('privateKey').isString().notEmpty()],
  validate([param('job_milestone_id'), body('privateKey')]),
  escrowController.initiateDispute.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/dispute/vender-pay-fee:
 *   post:
 *     summary: Vender pay dispute fee
 *     description: Counterparty pays their dispute fee (must be done within 48-72h of dispute initiation)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
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
  '/:job_milestone_id/dispute/vender-pay-fee',
  [param('job_milestone_id').isString().notEmpty(), body('privateKey').isString().notEmpty()],
  validate([param('job_milestone_id'), body('privateKey')]),
  escrowController.venderPayDisputeFee.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/dispute/buyer-join:
 *   post:
 *     summary: Buyer join the dispute
 *     description: Buyer joins the dispute
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
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
  '/:job_milestone_id/dispute/buyer-join',
  [param('job_milestone_id').isString().notEmpty(), body('privateKey').isString().notEmpty()],
  validate([param('job_milestone_id'), body('privateKey')]),
  escrowController.buyerJoinDispute.bind(escrowController)
);

/**
 * @swagger
 * /api/v1/contract/escrow/{job_milestone_id}/dispute/resolve:
 *   post:
 *     summary: Resolve dispute
 *     description: Arbiter resolves the dispute in favor of buyer or vendor (both parties must have paid dispute fees)
 *     tags: [Escrow]
 *     parameters:
 *       - in: path
 *         name: job_milestone_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job milestone ID
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
  '/:job_milestone_id/dispute/resolve',
  [param('job_milestone_id').isString().notEmpty(), body('favorBuyer').isBoolean()],
  validate([param('job_milestone_id'), body('favorBuyer')]),
  escrowController.resolveDispute.bind(escrowController)
);

export default router;
