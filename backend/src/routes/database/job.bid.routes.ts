import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { jobBidController } from '../../controllers/database/job.bid.controller.js';

const router = Router();

/**
 * @openapi
 * /api/v1/database/job-bids:
 *   post:
 *     tags: [Job Bids]
 *     summary: Create a job bid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobBidRequest'
 *     responses:
 *       200:
 *         description: Job bid created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobBid'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  [body('job_id').isString().notEmpty(), body('freelancer_id').isString().notEmpty()],
  validate([body('job_id'), body('freelancer_id')]),
  jobBidController.createJobBid.bind(jobBidController)
);
/**
 * @openapi
 * /api/v1/database/job-bids/{id}:
 *   post:
 *     tags: [Job Bids]
 *     summary: Update a job bid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJobBidRequest'
 *     responses:
 *       200:
 *         description: Job bid updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobBid'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id',
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  [body('job_id').isString().notEmpty(), body('freelancer_id').isString().notEmpty()],
  validate([body('job_id'), body('freelancer_id')]),
  jobBidController.updateJobBid.bind(jobBidController)
);
/**
 * @swagger
 * /api/v1/database/job-bids/{id}:
 *   delete:
 *     tags: [Job Bids]
 *     summary: Delete a job bid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job bid deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request due to validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               MissingId:
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job bid ID is required
 *                     code: JOB_BID_ID_REQUIRED
 */
router.delete(
  '/:id',
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  jobBidController.deleteJobBid.bind(jobBidController)
);

/**
 * @openapi
 * /api/v1/database/job-bids/by-id/{id}:
 *   get:
 *     tags: [Job Bids]
 *     summary: Get a job bid by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job bid retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/JobBid'
 *       400:
 *         description: Bad request or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/by-id/:id',
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  jobBidController.getJobBidById.bind(jobBidController)
);

router.get(
  '/by-id-client/:id',
  [param('id').isString().notEmpty()],
  validate([param('id')]),
  jobBidController.getJobBidForClientById.bind(jobBidController)
);
/**
 * @openapi
 * /api/v1/database/job-bids/by-job-id/{job_id}:
 *   get:
 *     tags: [Job Bids]
 *     summary: List job bids by job id
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job bids retrieved successfully
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
 *                         $ref: '#/components/schemas/JobBid'
 *       400:
 *         description: Bad request or job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/by-job-id/:job_id',
  [param('job_id').isString().notEmpty()],
  validate([param('job_id')]),
  jobBidController.getJobBidsByJobId.bind(jobBidController)
);

/**
 * @openapi
 * /api/v1/database/job-bids/by-freelancer-id/{freelancer_id}:
 *   get:
 *     tags: [Job Bids]
 *     summary: List job bids by freelancer id
 *     parameters:
 *       - in: path
 *         name: freelancer_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job bids retrieved successfully
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
 *                         $ref: '#/components/schemas/JobBid'
 *       400:
 *         description: Bad request or freelancer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/by-freelancer-id/:freelancer_id',
  [param('freelancer_id').isString().notEmpty()],
  validate([param('freelancer_id')]),
  jobBidController.getJobBidsByFreelancerId.bind(jobBidController)
);

/**
 * @openapi
 * /api/v1/database/job-bids:
 *   get:
 *     tags: [Job Bids]
 *     summary: List all job bids
 *     responses:
 *       200:
 *         description: Job bids retrieved successfully
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
 *                         $ref: '#/components/schemas/JobBid'
 */
router.get('/', jobBidController.getJobBids.bind(jobBidController));

export default router;
