import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { userController } from '../../controllers/database/user.controller.js';

const router = Router();

/**
 * @openapi
 * /api/v1/database/users/with-address:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user with address and role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserWithAddressRequest'
 *     responses:
 *       200:
 *         description: User created with address successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/with-address',
    [body('address').isString().notEmpty(), body('role').isString().notEmpty()],
    validate([body('address'), body('role')]), 
    userController.createUserWithAddress.bind(userController)
);

/**
 * @openapi
 * /api/v1/database/users/with-email:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user with email and role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserWithEmailRequest'
 *     responses:
 *       200:
 *         description: User created with email successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/with-address',
    [body('email').isEmail().notEmpty(), body('role').isString().notEmpty()],
    validate([body('email'), body('role')]),
    userController.createUserWithEmail.bind(userController)
);

/**
 * @openapi
 * /api/v1/database/users/{id}:
 *   post:
 *     tags: [Users]
 *     summary: Update a user by ID
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
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 */
router.post(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    userController.updateUser.bind(userController)
);

/**
 * @openapi
 * /api/v1/database/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    userController.deleteUser.bind(userController)
);

/**
 * @openapi
 * /api/v1/database/users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/',
    userController.getUsers.bind(userController)
);

/**
 * @openapi
 * /api/v1/database/users/by-id/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/by-id/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    userController.getUserById.bind(userController)
);

/**
 * @openapi
 * /api/v1/database/users/by-email/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/by-email/:email',
    [param('email').isEmail().notEmpty()],
    validate([param('email')]),
    userController.getUserByEmail.bind(userController)
);

/**
 * @openapi
 * /api/v1/database/users/by-address/{address}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by address
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/by-address/:address',
    [param('address').isString().notEmpty()],
    validate([param('address')]),
    userController.getUserByAddress.bind(userController)
);

export default router;