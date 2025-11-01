import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { jobMilestoneController } from '../../controllers/database/job.milestone.controller.js';

const router = Router();

/**
 * @swagger
 * /api/v1/database/job-milestones:
 *   post:
 *     tags: [Job Milestones]
 *     summary: Create a job milestone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobMilestoneRequest'
 *     responses:
 *       200:
 *         description: Job milestone created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               MissingRequired:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job ID, order index, title and amount are required
 *                     code: JOB_ID_ORDER_INDEX_TITLE_AMOUNT_REQUIRED
 *               JobNotFound:
 *                 summary: Job not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job not found
 *                     code: JOB_NOT_FOUND
 *               CreatorNotFound:
 *                 summary: Creator not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Creator not found
 *                     code: CREATOR_NOT_FOUND
 *               DuplicateMilestone:
 *                 summary: Milestone with same order_index exists
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job milestone already exists
 *                     code: JOB_MILESTONE_ALREADY_EXISTS
 */
router.post(
    '/',
    [body('job_id').isString().notEmpty(), body('order_index').isInt().notEmpty(), body('title').isString().notEmpty(), ],
    validate([body('job_id'), body('order_index'), body('title'), ]),
    jobMilestoneController.createJobMilestone.bind(jobMilestoneController)
);

/**
 * @swagger
 * /api/v1/database/job-milestones/{id}:
 *   post:
 *     tags: [Job Milestones]
 *     summary: Update a job milestone
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
 *             $ref: '#/components/schemas/UpdateJobMilestoneRequest'
 *     responses:
 *       200:
 *         description: Job milestone updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               MissingId:
 *                 summary: Missing milestone id
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job milestone ID is required
 *                     code: JOB_MILESTONE_ID_REQUIRED
 *               NotFound:
 *                 summary: Milestone not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job milestone not found
 *                     code: JOB_MILESTONE_NOT_FOUND
 *               MissingRequired:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job ID, order index, title and amount are required
 *                     code: JOB_ID_ORDER_INDEX_TITLE_AMOUNT_REQUIRED
 *               JobNotFound:
 *                 summary: Job not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job not found
 *                     code: JOB_NOT_FOUND
 *               CreatorNotFound:
 *                 summary: Creator not found
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Creator not found
 *                     code: CREATOR_NOT_FOUND
 */
router.post(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    jobMilestoneController.updateJobMilestone.bind(jobMilestoneController)
);

/**
 * @swagger
 * /api/v1/database/job-milestones/{id}:
 *   delete:
 *     tags: [Job Milestones]
 *     summary: Delete a job milestone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job milestone deleted successfully
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
 *                 summary: Missing milestone id
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job milestone ID is required
 *                     code: JOB_MILESTONE_ID_REQUIRED
 */
router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    jobMilestoneController.deleteJobMilestone.bind(jobMilestoneController)
);

/**
 * @swagger
 * /api/v1/database/job-milestones/by-id/{id}:
 *   get:
 *     tags: [Job Milestones]
 *     summary: Get a job milestone by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job milestone retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               MissingId:
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job milestone ID is required
 *                     code: JOB_MILESTONE_ID_REQUIRED
 *               NotFound:
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job milestone not found
 *                     code: JOB_MILESTONE_NOT_FOUND
 */
router.get(
    '/by-id/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    jobMilestoneController.getJobMilestoneById.bind(jobMilestoneController)
);

/**
 * @swagger
 * /api/v1/database/job-milestones/by-job-id/{job_id}:
 *   get:
 *     tags: [Job Milestones]
 *     summary: List job milestones by job id
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Job milestones retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request or job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               MissingJobId:
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job ID is required
 *                     code: JOB_ID_REQUIRED
 *               JobNotFound:
 *                 value:
 *                   success: false
 *                   error:
 *                     message: Job not found
 *                     code: JOB_NOT_FOUND
 */
router.get(
    '/by-job-id/:job_id',
    [param('job_id').isString().notEmpty()],
    validate([param('job_id')]),
    jobMilestoneController.getJobMilestonesByJobId.bind(jobMilestoneController)
);

/**
 * @swagger
 * /api/v1/database/job-milestones:
 *   get:
 *     tags: [Job Milestones]
 *     summary: List all job milestones
 *     responses:
 *       200:
 *         description: Job milestones retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get(
    '/',
    jobMilestoneController.getJobMilestones.bind(jobMilestoneController)
);

export default router;