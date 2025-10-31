import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/database/user.service.js';

export class UserController {
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
}

export const userController = new UserController();