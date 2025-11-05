import { Request, Response, NextFunction } from 'express';
import { chainTxsService } from '../../services/database/chainTxs.service.js';

export class ChainTxsController {
    async createChainTx(req: Request, res: Response, next: NextFunction) {
        try {
            const { purpose, chain_id, from_address, to_address, tx_hash, status, user_id } = req.body;
            const result = await chainTxsService.createChainTx(purpose, chain_id, from_address, to_address, tx_hash, status, user_id);
            res.json({
                success: true,
                data: result,
                message: 'Chain tx created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getChainTxByTxHash(req: Request, res: Response, next: NextFunction) {
        try {
            const { tx_hash } = req.params;
            const result = await chainTxsService.getChainTxByTxHash(tx_hash);
            res.json({
                success: true,
                data: result,
                message: 'Chain tx found successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getChainTxById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await chainTxsService.getChainTxById(id);
            res.json({
                success: true,
                data: result,
                message: 'Chain tx found successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getChainTxsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id } = req.params;
            const result = await chainTxsService.getChainTxsByUserId(user_id);
            res.json({
                success: true,
                data: result,
                message: 'Chain txs found successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteChainTx(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await chainTxsService.deleteChainTx(id);
            res.json({
                success: true,
                message: 'Chain tx deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const chainTxsController = new ChainTxsController();