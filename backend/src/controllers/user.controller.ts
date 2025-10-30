import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';

export class UserController {
    /**
     * Create new user
     */
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;

            const result = await userService.createUser(params);

            res.json({
                success: true,
                data: result,
                message: 'User created successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ...params } = req.body;

            const result = await userService.updateUser(id, params);

            res.json({
                success: true,
                data: result,
                message: 'User updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            await userService.deleteUser(id);

            res.json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await userService.getUsers();

            res.json({
                success: true,
                data: result,
                message: 'Users retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserByHandle(req: Request, res: Response, next: NextFunction) {
        try {
            const { handle } = req.params;

            const result = await userService.getUserByHandle(handle);

            res.json({
                success: true,
                data: result,
                message: 'User retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.params;

            const result = await userService.getUserByEmail(email);

            res.json({
                success: true,
                data: result,
                message: 'User retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const result = await userService.getUserById(id);

            res.json({
                success: true,
                data: result,
                message: 'User retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async createUserWallet(req: Request, res: Response, next: NextFunction) {
        try {
            const { ...params } = req.body;

            const result = await userService.createUserWallet(params);

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
            const { id, ...params } = req.body;

            const result = await userService.updateUserWallet(id, params);

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

            const result = await userService.deleteUserWallet(id);

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

            const result = await userService.deleteUserWalletByUserId(userId);

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

            const result = await userService.getUserWalletsByUserId(userId);

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

            const result = await userService.getUserWalletById(id);

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
            const result = await userService.getUserWalletByChainIdAndAddress(Number(chainId), address);

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
}

export const userController = new UserController();