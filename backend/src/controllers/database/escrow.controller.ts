import { Request, Response, NextFunction } from 'express';
import { escrowService } from '../../services/database/escrow.service.js';

export class EscrowController {
    async createEscrow(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;
            const result = await escrowService.createEscrow(params);
            res.json({
                success: true,
                data: result,
                message: 'Escrow created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateEscrowCurrentState(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { current_state } = req.body;
            const result = await escrowService.updateEscrowCurrentState(id, current_state);
            res.json({
                success: true,
                data: result,
                message: 'Escrow current state updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getEscrowById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await escrowService.getEscrowById(id);
            res.json({
                success: true,
                data: result,
                message: 'Escrow retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getEscrowsByJobId(req: Request, res: Response, next: NextFunction) {
        try {
            const { job_id } = req.params;
            const result = await escrowService.getEscrowsByJobId(job_id);
            res.json({
                success: true,
                data: result,
                message: 'Escrows retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getEscrowsByMilestoneId(req: Request, res: Response, next: NextFunction) {
        try {
            const { milestone_id } = req.params;
            const result = await escrowService.getEscrowsByMilestoneId(milestone_id);
            res.json({
                success: true,
                data: result,
                message: 'Escrows retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getEscrowsByFactoryAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { factory_address } = req.params;
            const result = await escrowService.getEscrowsByFactoryAddress(factory_address);
            res.json({
                success: true,
                data: result,
                message: 'Escrows retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getAllEscrows(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await escrowService.getAllEscrows();
            res.json({
                success: true,
                data: result,
                message: 'Escrows retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}

export const escrowController = new EscrowController();