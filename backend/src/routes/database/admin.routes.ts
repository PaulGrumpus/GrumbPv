import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { adminController } from '../../controllers/database/admin.controller.js';
import { adminHandler } from '../../middlewares/adminHandler.js';

const router = Router();

/**
 * @openapi
 * /api/v1/admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Admin login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Access denied
 */
router.post(
  '/login',
  [body('email').isEmail().notEmpty(), body('password').isString().notEmpty()],
  validate([body('email'), body('password')]),
  adminController.login.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', adminHandler, adminController.getDashboardStats.bind(adminController));

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get(
  '/users',
  adminHandler,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
  ],
  validate([query('page'), query('limit'), query('search')]),
  adminController.getAllUsers.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 */
router.get(
  '/users/:id',
  adminHandler,
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  adminController.getUserDetails.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/gigs:
 *   get:
 *     tags: [Admin]
 *     summary: Get all gigs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gigs retrieved successfully
 */
router.get(
  '/gigs',
  adminHandler,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
  ],
  validate([query('page'), query('limit'), query('search')]),
  adminController.getAllGigs.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/gigs/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get gig details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gig details retrieved successfully
 */
router.get(
  '/gigs/:id',
  adminHandler,
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  adminController.getGigDetails.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/jobs:
 *   get:
 *     tags: [Admin]
 *     summary: Get all jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, open, in_review, in_progress, completed, cancelled, disputed]
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */
router.get(
  '/jobs',
  adminHandler,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('status').optional().isString(),
  ],
  validate([query('page'), query('limit'), query('search'), query('status')]),
  adminController.getAllJobs.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/jobs/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get comprehensive job details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 */
router.get(
  '/jobs/:id',
  adminHandler,
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  adminController.getJobDetails.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/conversations:
 *   get:
 *     tags: [Admin]
 *     summary: Get all conversations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 */
router.get(
  '/conversations',
  adminHandler,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
  ],
  validate([query('page'), query('limit'), query('search')]),
  adminController.getAllConversations.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/conversations/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get conversation details with messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation details retrieved successfully
 */
router.get(
  '/conversations/:id',
  adminHandler,
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  adminController.getConversationDetails.bind(adminController)
);

/**
 * @openapi
 * /api/v1/admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get system settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings retrieved successfully
 */
router.get('/settings', adminHandler, adminController.getSystemSettings.bind(adminController));

/**
 * @openapi
 * /api/v1/admin/settings:
 *   put:
 *     tags: [Admin]
 *     summary: Update system settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buyer_fee_bps:
 *                 type: integer
 *               vendor_fee_bps:
 *                 type: integer
 *               dispute_fee_bps:
 *                 type: integer
 *               reward_rate_bps:
 *                 type: integer
 *               reward_rate_per_1_e_18:
 *                 type: string
 *               arbiter_address:
 *                 type: string
 *               fee_recipient_address:
 *                 type: string
 *     responses:
 *       200:
 *         description: System settings updated successfully
 */
router.put(
  '/settings',
  adminHandler,
  [
    body('buyer_fee_bps').optional().isInt({ min: 0 }),
    body('vendor_fee_bps').optional().isInt({ min: 0 }),
    body('dispute_fee_bps').optional().isInt({ min: 0 }),
    body('reward_rate_bps').optional().isInt({ min: 0 }),
    body('reward_rate_per_1_e_18').optional().matches(/^\d+$/),
    body('arbiter_address').optional().isString(),
    body('fee_recipient_address').optional().isString(),
  ],
  validate([
    body('buyer_fee_bps'),
    body('vendor_fee_bps'),
    body('dispute_fee_bps'),
    body('reward_rate_bps'),
    body('reward_rate_per_1_e_18'),
    body('arbiter_address'),
    body('fee_recipient_address'),
  ]),
  adminController.updateSystemSettings.bind(adminController)
);

export default router;
