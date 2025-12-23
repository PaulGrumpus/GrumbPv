import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../../services/database/dashboard.service';

class DashboardController {
  async getDashboardInfoByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.body;
      const result = await dashboardService.getDashboardData(userId, role);
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
