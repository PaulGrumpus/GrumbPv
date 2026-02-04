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

export default router;
