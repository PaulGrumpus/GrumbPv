import { Request, Response, NextFunction } from 'express';
import { jobApplicationService } from '../../services/database/job.application.service.js';

export class JobApplicationController {
    async createJobApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;
            const result = await jobApplicationService.createJobApplication(params);
            res.json({
                success: true,
                data: result,
                message: 'Job application created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateJobApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, user_id } = req.params;
            const { ...params } = req.body;
            const result = await jobApplicationService.updateJobApplication(id, user_id, params);
            res.json({
                success: true,
                data: result,
                message: 'Job application updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getJobApplicationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await jobApplicationService.getJobApplicationById(id);
            res.json({
                success: true,
                data: result,
                message: 'Job application retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getJobApplicationByJobMilestoneId(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobMilestoneId } = req.params;
            const result = await jobApplicationService.getJobApplicationByJobMilestoneId(jobMilestoneId);
            res.json({
                success: true,
                data: result,
                message: 'Job application retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getJobApplicationsByUserId(req: Request, res: Response, next: NextFunction) {

        try {
            const { user_id } = req.params;
            const result = await jobApplicationService.getJobApplicationsByUserId(user_id);
            res.json({
                success: true,
                data: result,
                message: 'Job applications retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    
    async deleteJobApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await jobApplicationService.deleteJobApplication(id);
            res.json({
                success: true,
                message: 'Job application deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteJobApplicationsByJobId(req: Request, res: Response, next: NextFunction) {   
        try {
            const { jobId } = req.params;
            await jobApplicationService.deleteJobApplicationsByJobId(jobId);
            res.json({
                success: true,
                message: 'Job applications deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const jobApplicationController = new JobApplicationController();