import { Request, Response, NextFunction } from 'express';
import { jobBidService } from '../../services/database/job.bid.service.js';

export class JobBidController {
    async createJobBid(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;
            const result = await jobBidService.createJobBid(params);
            res.json({
                success: true,
                data: result,
                message: 'Job bid created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateJobBid(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;
            const result = await jobBidService.updateJobBid(id, params);
            res.json({
                success: true,
                data: result,
                message: 'Job bid updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    //  make this admin only
    async deleteJobBid(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await jobBidService.deleteJobBid(id);
            res.json({
                success: true,
                message: 'Job bid deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getJobBidById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await jobBidService.getJobBidById(id);
            res.json({
                success: true,
                data: result,
                message: 'Job bid retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getJobBidsByJobId(req: Request, res: Response, next: NextFunction) {
        try {
            const { job_id } = req.params;
            const result = await jobBidService.getJobBidsByJobId(job_id);
            res.json({
                success: true,
                data: result,
                message: 'Job bids retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getJobBidsByFreelancerId(req: Request, res: Response, next: NextFunction) {
        try {
            const { freelancer_id } = req.params;
            const result = await jobBidService.getJobBidsByFreelancerId(freelancer_id);
            res.json({
                success: true,
                data: result,
                message: 'Job bids retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getJobBids(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await jobBidService.getJobBids();
            res.json({
                success: true,
                data: result,
                message: 'Job bids retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}

export const jobBidController = new JobBidController();