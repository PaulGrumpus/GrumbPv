import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/wallet.service.js';
import { AppError } from '../middlewares/errorHandler.js';

export class WalletController {
    async createUserWallet(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;

            const result = await walletService.createUserWallet(params);

            res.json({
                success: true,
                data: result,
                message: 'User wallet created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUserWallet(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;

            const result = await walletService.updateUserWallet(id, params);
            if(!result) {
                throw new AppError('User wallet not found', 404, 'USER_WALLET_NOT_FOUND');
            }
            res.json({
                success: true,
                data: result,
                message: 'User wallet updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async deleteUserWallet(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await walletService.deleteUserWallet(id);

            res.json({
                success: true,
                data: result,
                message: 'User wallet deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async deleteUserWalletByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const result = await walletService.deleteUserWalletByUserId(userId);

            res.json({
                success: true,
                data: result,
                message: 'User wallet deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getUserWalletsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const result = await walletService.getUserWalletsByUserId(userId);

            res.json({
                success: true,
                data: result,
                message: 'User wallets retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getUserWalletById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await walletService.getUserWalletById(id);

            res.json({
                success: true,
                data: result,
                message: 'User wallet retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getUserWalletByChainIdAndAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { chainId, address } = req.params;
            const result = await walletService.getUserWalletByChainIdAndAddress(Number(chainId), address);

            res.json({
                success: true,
                data: result,
                message: 'User wallet retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }

    async getWallets(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await walletService.getWallets();

            res.json({
                success: true,
                data: result,
                message: 'Wallets retrieved successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}

export const walletController = new WalletController();