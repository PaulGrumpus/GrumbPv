import { Router } from 'express';
import { body, param } from 'express-validator';
import { escrowController } from '../../controllers/database/escrow.controller.js';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

/**
 * @openapi
 * /api/v1/database/escrows:
 *   post:
 *     tags: [Escrow]
 *     summary: Create a database escrow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDatabaseEscrowRequest'
 *     responses:
 *       201:
 *         description: Escrow created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseEscrow'
 *       400:
 *         description: Bad request (validation or missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Escrow already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.post('/',
    [body('job_id').isString().notEmpty(), body('buyer_id').isString().notEmpty(), body('seller_id').isString().notEmpty(), body('arbiter_id').isString().notEmpty(), body('proxy_address').isString().notEmpty()],
    validate([body('job_id'), body('buyer_id'), body('seller_id'), body('arbiter_id'), body('proxy_address')]),
    escrowController.createEscrow.bind(escrowController));

/**
 * @openapi
 * /api/v1/database/escrows/{id}:
 *   put:
 *     tags: [Escrow]
 *     summary: Update current state of an escrow
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEscrowStateRequest'
 *     responses:
 *       200:
 *         description: Escrow updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseEscrow'
 *       400:
 *         description: Bad request (invalid id or state)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Escrow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.put('/:id', 
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    [body('current_state').isString().notEmpty()],
    validate([body('current_state')]),
    escrowController.updateEscrowCurrentState.bind(escrowController));


/**
 * @openapi
 * /api/v1/database/escrows/by-id/{id}:
 *   get:
 *     tags: [Escrow]
 *     summary: Get an escrow by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Escrow fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseEscrow'
 *       400:
 *         description: Bad request (invalid id)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Escrow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.get('/by-id/:id', 
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    escrowController.getEscrowById.bind(escrowController));

/**
 * @openapi
 * /api/v1/database/escrows/by-job-id/{job_id}:
 *   get:
 *     tags: [Escrow]
 *     summary: Get escrows by job ID
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Escrows fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DatabaseEscrow'
 *       400:
 *         description: Bad request (invalid job_id)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.get('/by-job-id/:job_id', 
    [param('job_id').isString().notEmpty()],
    validate([param('job_id')]),
    escrowController.getEscrowsByJobId.bind(escrowController));

/**
 * @openapi
 * /api/v1/database/escrows/by-milestone-id/{milestone_id}:
 *   get:
 *     tags: [Escrow]
 *     summary: Get escrow by milestone ID
 *     parameters:
 *       - in: path
 *         name: milestone_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Escrow fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatabaseEscrow'
 *       400:
 *         description: Bad request (invalid milestone_id)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Milestone or escrow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.get('/by-milestone-id/:milestone_id', 
    [param('milestone_id').isString().notEmpty()],
    validate([param('milestone_id')]),
    escrowController.getEscrowsByMilestoneId.bind(escrowController));

/**
 * @openapi
 * /api/v1/database/escrows/by-factory-address/{factory_address}:
 *   get:
 *     tags: [Escrow]
 *     summary: Get escrows by factory address
 *     parameters:
 *       - in: path
 *         name: factory_address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Escrows fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DatabaseEscrow'
 *       400:
 *         description: Bad request (invalid factory address)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.get('/by-factory-address/:factory_address', 
    [param('factory_address').isString().notEmpty()],
    validate([param('factory_address')]),
    escrowController.getEscrowsByFactoryAddress.bind(escrowController));

/**
 * @openapi
 * /api/v1/database/escrows:
 *   get:
 *     tags: [Escrow]
 *     summary: List all escrows
 *     responses:
 *       200:
 *         description: Escrow list fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DatabaseEscrow'
 *       500:
 *         description: Server error
 */
router.get('/', escrowController.getAllEscrows.bind(escrowController));

export default router;