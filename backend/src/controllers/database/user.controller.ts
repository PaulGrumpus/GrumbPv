import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/database/user.service.js';

export class UserController {
  async createUserWithAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...params } = req.body;

      const result = await userService.createUserWithAddress(params);

      res.json({
        success: true,
        data: result,
        message: 'User created with address successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async createUserWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...params } = req.body;

      const result = await userService.createUserWithEmail(params);

      res.json({
        success: true,
        data: result,
        message: 'User created with email successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { ...params } = req.body;
      const file = (req as Request & { file?: Express.Multer.File }).file;

      const result = await userService.updateUser(id, params, file);

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

  async getUserByAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;

      const result = await userService.getUserByAddress(address);

      res.json({
        success: true,
        data: result,
        message: 'User retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserByEmailAndPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await userService.getUserByEmailAndPassword(email, password);

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

  async updateUserFunds(req: Request, res: Response, next: NextFunction) {

    try {
      const { id } = req.params;
      const { total_fund, finished_job_num } = req.body;
      const result = await userService.updateUserFunds(id, total_fund, finished_job_num);
      res.json({
        success: true,
        data: result,
        message: 'User funds updated successfully',
      });
    }
    catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await userService.resetPassword(email);
      res.json({
        success: true,
        data: result,
        message: 'Email sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const result = await userService.updateUserPassword(id, password);
      res.json({
        success: true,
        data: result,
        message: 'User password updated successfully',
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
