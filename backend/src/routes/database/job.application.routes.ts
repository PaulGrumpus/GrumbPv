import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../../middlewares/validateRequest.js';
import { jobApplicationController } from '../../controllers/database/job.application.controller.js';

const router = Router();

router.post(
    '/',
    [
        body('job_id').isString().notEmpty(),
        body('client_id').isString().notEmpty(),
        body('freelancer_id').isString().notEmpty(),
    ],
    validate([body('job_id'), body('client_id'), body('freelancer_id')]),
    jobApplicationController.createJobApplication.bind(jobApplicationController)
);

router.post(
    '/:id',
    [
        body('job_id').isString().notEmpty(),
        body('client_id').isString().notEmpty(),
        body('freelancer_id').isString().notEmpty(),
    ],
    validate([body('job_id'), body('client_id'), body('freelancer_id')]),
    jobApplicationController.updateJobApplication.bind(jobApplicationController)
);

router.get(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    jobApplicationController.getJobApplicationById.bind(jobApplicationController)
);

router.get(
    '/by-job-milestone-id/:job_milestone_id',
    [param('job_milestone_id').isString().notEmpty()],
    validate([param('job_milestone_id')]),
    jobApplicationController.getJobApplicationByJobMilestoneId.bind(jobApplicationController)
);

router.delete(
    '/:id',
    [param('id').isString().notEmpty()],
    validate([param('id')]),
    jobApplicationController.deleteJobApplication.bind(jobApplicationController)
);

router.delete(
    '/by-job-id/:job_id',
    [param('job_id').isString().notEmpty()],
    validate([param('job_id')]),
    jobApplicationController.deleteJobApplicationsByJobId.bind(jobApplicationController)
);

export default router;