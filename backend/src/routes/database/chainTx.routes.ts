import { Router } from 'express';
import { chainTxsController } from '../../controllers/database/chainTxs.controller.js';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ChainTx:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         purpose:
 *           type: string
 *           example: escrow_funding
 *         chain_id:
 *           type: integer
 *           example: 97
 *         from_address:
 *           type: string
 *           example: 0x1234...abcd
 *         to_address:
 *           type: string
 *           nullable: true
 *           example: 0xabcd...1234
 *         tx_hash:
 *           type: string
 *           example: 0xdeadbeef...
 *         status:
 *           type: string
 *           example: success
 *         user_id:
 *           type: string
 *           format: uuid
 *     CreateChainTxRequest:
 *       type: object
 *       required: [purpose, chain_id, from_address, to_address, tx_hash, status, user_id]
 *       properties:
 *         purpose:
 *           type: string
 *           example: escrow_funding
 *         chain_id:
 *           type: integer
 *           example: 97
 *         from_address:
 *           type: string
 *           example: 0x1234...abcd
 *         to_address:
 *           type: string
 *           example: 0xabcd...1234
 *         tx_hash:
 *           type: string
 *           example: 0xdeadbeef...
 *         status:
 *           type: string
 *           example: success
 *         user_id:
 *           type: string
 *           format: uuid
 */

/**
 * @openapi
 * /api/v1/database/chain-txs/create:
 *   post:
 *     tags: [ChainTxs]
 *     summary: Create a chain transaction record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChainTxRequest'
 *     responses:
 *       200:
 *         description: Chain tx created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChainTx'
 */
router.post('/create', 
    [body('purpose').isString().notEmpty(), body('chain_id').isInt().notEmpty(), body('from_address').isString().notEmpty(), body('to_address').isString().notEmpty(), body('tx_hash').isString().notEmpty(), body('status').isString().notEmpty(), body('user_id').isString().notEmpty()], 
    validate([body('purpose'), body('chain_id'), body('from_address'), body('to_address'), body('tx_hash'), body('status'), body('user_id')]), 
    chainTxsController.createChainTx.bind(chainTxsController));

/**
 * @openapi
 * /api/v1/database/chain-txs/get-by-tx-hash/{tx_hash}:
 *   get:
 *     tags: [ChainTxs]
 *     summary: Get a chain transaction by tx hash
 *     parameters:
 *       - in: path
 *         name: tx_hash
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chain tx found successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChainTx'
 */
router.get('/get-by-tx-hash/:tx_hash', 
    [param('tx_hash').isString().notEmpty().withMessage('Invalid tx hash')], validate([param('tx_hash')]), 
chainTxsController.getChainTxByTxHash.bind(chainTxsController));

/**
 * @openapi
 * /api/v1/database/chain-txs/get-by-id/{id}:
 *   get:
 *     tags: [ChainTxs]
 *     summary: Get a chain transaction by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chain tx found successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ChainTx'
 */
router.get('/get-by-id/:id', 
    [param('id').isString().notEmpty().withMessage('Invalid id')], validate([param('id')]), 
    chainTxsController.getChainTxById.bind(chainTxsController));

/**
 * @openapi
 * /api/v1/database/chain-txs/get-by-user-id/{user_id}:
 *   get:
 *     tags: [ChainTxs]
 *     summary: Get chain transactions for a user
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chain txs found successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChainTx'
 */
router.get('/get-by-user-id/:user_id', 
    [param('user_id').isString().notEmpty().withMessage('Invalid user id')], validate([param('user_id')]), 
    chainTxsController.getChainTxsByUserId.bind(chainTxsController));

/**
 * @openapi
 * /api/v1/database/chain-txs/delete/{id}:
 *   delete:
 *     tags: [ChainTxs]
 *     summary: Delete a chain transaction by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Chain tx deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete('/delete/:id', 
    [param('id').isString().notEmpty().withMessage('Invalid id')], validate([param('id')]), 
    chainTxsController.deleteChainTx.bind(chainTxsController));

/**
 * @openapi
 * /api/v1/database/chain-txs:
 *   get:
 *     tags: [ChainTxs]
 *     summary: Get all chain transactions
 *     responses:
 *       200:
 *         description: Chain txs found successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChainTx'
 */
router.get('/', 
    chainTxsController.getChainTxs.bind(chainTxsController));
export default router;