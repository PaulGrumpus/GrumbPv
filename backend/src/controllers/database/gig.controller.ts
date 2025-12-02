import { Request, Response, NextFunction } from 'express';
import { gigService } from '../../services/database/gig.service.js';

export class GigController {
    async createGig(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;
            const file = (req as Request & { file?: Express.Multer.File }).file;
            const result = await gigService.createGig(params, file);
            res.json({
                success: true,
                data: result,
                message: 'Gig created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateGig(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;
            const file = (req as Request & { file?: Express.Multer.File }).file;
            const result = await gigService.updateGig(id, params, file);
            res.json({
                success: true,
                data: result,
                message: 'Gig updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    //  make this admin only
    async deleteGig(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await gigService.deleteGig(id);
            res.json({
                success: true,
                data: result,
                message: 'Gig deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getGigById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await gigService.getGigById(id);
            res.json({  
                success: true,
                data: result,
                message: 'Gig retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    
    async getGigsByFreelancerId(req: Request, res: Response, next: NextFunction) {
        try {
            const { freelancer_id } = req.params;
            const result = await gigService.getGigsByFreelancerId(freelancer_id);
            res.json({
                success: true,
                data: result,
                message: 'Gigs retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getGigs(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await gigService.getGigs();
            res.json({
                success: true,
                data: result,
                message: 'Gigs retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const gigController = new GigController();