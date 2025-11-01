import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { jobController } from '../../controllers/database/job.controller.js';

const router = Router();

/**
 * @openapi
 * /api/v1/database/jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: Create a job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobRequest'
 *     responses:
 *       200:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
    '/',
    [body('title').isString().notEmpty(), body('description_md').isString().notEmpty(), body('client_id').isString().notEmpty(), body('status').isString().notEmpty()],
    validate([body('title'), body('description_md'), body('client_id'), body('status')]),
    jobController.createJob.bind(jobController)
);

/**
 * @openapi
 * /api/v1/database/jobs/{id}:
 *   post:
 *     tags: [Jobs]
 *     summary: Update a job by ID
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
 *             $ref: '#/components/schemas/UpdateJobRequest'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Job'
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
    jobController.updateJob.bind(jobController)
);

/**
 * @openapi
 * /api/v1/database/jobs/{id}:
 *   delete:
 *     tags: [Jobs]
 *     summary: Delete a job by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted successfully
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
 */
router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    jobController.deleteJob.bind(jobController)
);

/**
 * @openapi
 * /api/v1/database/jobs/by-id/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get job by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/by-id/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    jobController.getJobById.bind(jobController)
);

/**
 * @openapi
 * /api/v1/database/jobs/by-client-id/{client_id}:
 *   get:
 *     tags: [Jobs]
 *     summary: List jobs by client ID
 *     parameters:
 *       - in: path
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
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
 *                         $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/by-client-id/:client_id',
    [param('client_id').isString().notEmpty()],
    validate([param('client_id')]),
    jobController.getJobsByClientId.bind(jobController)
);

/**
 * @openapi
 * /api/v1/database/jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List all jobs
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
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
 *                         $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request due to validation or business rule errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
    '/',
    jobController.getJobs.bind(jobController)
);

export default router;