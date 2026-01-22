import { Request, Response, NextFunction } from 'express';
import { jobService } from '../../services/database/job.service.js';
import { job_status } from '@prisma/client';

export class JobController {
  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...params } = req.body;
      const file = (req as Request & { file?: Express.Multer.File }).file;
      const result = await jobService.createJob(params, file);
      res.json({
        success: true,
        data: result,
        message: 'Job created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { ...params } = req.body;
      const file = (req as Request & { file?: Express.Multer.File }).file;
      const result = await jobService.updateJob(id, params, file);
      res.json({
        success: true,
        data: result,
        message: 'Job updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJobStatusById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await jobService.updateJobStatusById(id, status as job_status);
      res.json({
        success: true,
        data: result,
        message: 'Job status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  //  make this admin only
  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await jobService.deleteJob(id);
      res.json({
        success: true,
        data: result,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await jobService.getJobById(id);
      res.json({
        success: true,
        data: result,
        message: 'Job retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobsByClientId(req: Request, res: Response, next: NextFunction) {
    try {
      const { client_id } = req.params;
      const result = await jobService.getJobsByClientId(client_id);
      res.json({
        success: true,
        data: result,
        message: 'Jobs retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobs(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobService.getJobs();
      res.json({
        success: true,
        data: result,
        message: 'Jobs retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
