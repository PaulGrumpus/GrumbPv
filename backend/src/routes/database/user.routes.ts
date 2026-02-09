import { Router, type Request, type Response, type NextFunction } from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { validate } from '../../middlewares/validateRequest.js';
import { userController } from '../../controllers/database/user.controller.js';
import { AppError } from '../../middlewares/errorHandler.js';

const router = Router();
const IMAGE_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'images');
mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGE_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || '.jpg';
    cb(null, `${randomUUID()}${extension}`);
  },
});

const MAX_IMAGE_SIZE_BYTES = Number(process.env.IMAGE_UPLOAD_MAX_SIZE_BYTES || 5 * 1024 * 1024);

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new AppError('Only image uploads are allowed', 400, 'INVALID_IMAGE_TYPE'));
  },
});

const optionalImageUpload = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');

  if (!isMultipart) {
    return next();
  }

  imageUpload.single('image')(req, res, next);
};

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
  '/with-email',
  [body('email').isEmail().notEmpty(), body('role').isString().notEmpty()],
  validate([body('email'), body('role')]),
  userController.createUserWithEmail.bind(userController)
);

router.post(
  '/reset-password',
  [body('email').isEmail().notEmpty()],
  validate([body('email')]),
  userController.resetPassword.bind(userController)
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
  optionalImageUpload,
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
router.get('/', userController.getUsers.bind(userController));

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

router.post(
  '/by-id/:id/password',
  [param('id').isString().notEmpty(), body('password').isString().notEmpty()],
  validate([param('id'), body('password')]),
  userController.updateUserPassword.bind(userController)
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

/**
 * @openapi
 * /api/v1/database/users/by-email-and-password:
 *   get:
 *     tags: [Users]
 *     summary: Get user by email and password
 *     description: Get user by email and password and return a token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetUserByEmailAndPasswordRequest'
 *     responses:
 *       200:
 *         description: User retrieved successfully and token returned
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       description: The token
 *                       example: '1234567890'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/by-email-and-password',
  [body('email').isEmail().notEmpty(), body('password').isString().notEmpty()],
  validate([body('email'), body('password')]),
  userController.getUserByEmailAndPassword.bind(userController)
);

router.post(
  '/by-id/:id/funds',
  [param('id').isString().notEmpty(), body('fund').isNumeric().notEmpty(), body('num').isNumeric().notEmpty()],
  validate([param('id'), body('fund'), body('num')]),
  userController.updateUserFunds.bind(userController)
);

export default router;
