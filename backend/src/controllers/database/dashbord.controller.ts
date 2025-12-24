import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../../services/database/dashboard.service.js';

class DashboardController {
  async getDashboardInfoByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = req.params
      const { role } = req.body;
      const result = await dashboardService.getDashboardData(user_id, role);
      res.json({
        success: true,
        data: result,
        message: 'Job application created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
