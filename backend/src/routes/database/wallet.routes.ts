import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { walletController } from '../../controllers/database/wallet.controller.js';

const router = Router();

/**
 * @openapi
 * /api/v1/database/wallets:
 *   post:
 *     tags: [Wallets]
 *     summary: Create a user wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserWalletRequest'
 *     responses:
 *       200:
 *         description: User wallet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserWallet'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/',
    [body('chain_id').isInt().notEmpty(), body('address').isString().notEmpty(), body('user_id').isString().notEmpty()],
    validate([body('chain'), body('chain_id'), body('address'), body('user_id')]),
    walletController.createUserWallet.bind(walletController)
);

/**
 * @openapi
 * /api/v1/database/wallets/{id}:
 *   post:
 *     tags: [Wallets]
 *     summary: Update a user wallet by ID
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
 *             $ref: '#/components/schemas/UpdateUserWalletRequest'
 *     responses:
 *       200:
 *         description: User wallet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserWallet'
 */
router.post(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    walletController.updateUserWallet.bind(walletController)
);

/**
 * @openapi
 * /api/v1/database/wallets/by-id/{id}:
 *   get:
 *     tags: [Wallets]
 *     summary: Get wallet by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserWallet'
 */
router.get(
    '/by-id/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    walletController.getUserWalletById.bind(walletController)
);

/**
 * @openapi
 * /api/v1/database/wallets/by-chain-id-and-address/{chainId}/{address}:
 *   get:
 *     tags: [Wallets]
 *     summary: Get wallet by chain ID and address
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserWallet'
 */
router.get(
    '/by-chain-id-and-address/:chainId/:address',
    [param('chainId').isInt().notEmpty(), param('address').isString().notEmpty()],
    validate([param('chainId'), param('address')]),
    walletController.getUserWalletByChainIdAndAddress.bind(walletController)
);

/**
 * @openapi
 * /api/v1/database/wallets/by-user-id/{userId}:
 *   get:
 *     tags: [Wallets]
 *     summary: List wallets by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User wallets retrieved successfully
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
 *                         $ref: '#/components/schemas/UserWallet'
 */
router.get(
    '/by-user-id/:userId',
    [param('userId').isString().notEmpty()],
    validate([param('userId')]),
    walletController.getUserWalletsByUserId.bind(walletController)
);

/**
 * @openapi
 * /api/v1/database/wallets/{id}:
 *   delete:
 *     tags: [Wallets]
 *     summary: Delete wallet by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User wallet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    walletController.deleteUserWallet.bind(walletController)
);

/**
 * @openapi
 * /api/v1/database/wallets/by-user-id/{userId}:
 *   delete:
 *     tags: [Wallets]
 *     summary: Delete all wallets for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User wallet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete(
    '/by-user-id/:userId',
    [param('userId').isString().notEmpty()],
    validate([param('userId')]),
    walletController.deleteUserWalletByUserId.bind(walletController)
);

/**
 * @openapi
 * /api/v1/database/wallets:
 *   get:
 *     tags: [Wallets]
 *     summary: Get all wallets
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get(
    '/',
    walletController.getWallets.bind(walletController)
);

export default router;