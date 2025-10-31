import { Request, Response, NextFunction } from 'express';
import { jobService } from '../../services/database/job.service.js';

export class JobController {
    async createJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;
            const result = await jobService.createJob(params);
            res.json({
                success: true,
                data: result,
                message: 'Job created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;
            const result = await jobService.updateJob(id, params);
            res.json({
                success: true,
                data: result,
                message: 'Job updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    //  make this admin only
    async deleteJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await jobService.deleteJob(id);
            res.json({
                success: true,
                data: result,
                message: 'Job deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getJobById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await jobService.getJobById(id);
            res.json({  
                success: true,
                data: result,
                message: 'Job retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getJobsByClientId(req: Request, res: Response, next: NextFunction) {
        try {
            const { clientId } = req.params;
            const result = await jobService.getJobsByClientId(clientId);
            res.json({
                success: true,
                data: result,
                message: 'Jobs retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getJobs(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await jobService.getJobs();
            res.json({
                success: true,
                data: result,
                message: 'Jobs retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const jobController = new JobController();