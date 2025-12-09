import { Request, Response, NextFunction } from 'express';
import { jobMilestoneService } from '../../services/database/job.milestone.service.js';

export class JobMilestoneController {
  async createJobMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { ...params } = req.body;
      const result = await jobMilestoneService.createJobMilestone(params);
      res.json({
        success: true,
        data: result,
        message: 'Job milestone created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateJobMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { ...params } = req.body;
      const result = await jobMilestoneService.updateJobMilestone(id, params);
      res.json({
        success: true,
        data: result,
        message: 'Job milestone updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  //  make this admin only
  async deleteJobMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await jobMilestoneService.deleteJobMilestone(id);
      res.json({
        success: true,
        data: result,
        message: 'Job milestone deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobMilestoneById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await jobMilestoneService.getJobMilestoneById(id);
      res.json({
        success: true,
        data: result,
        message: 'Job milestone retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobMilestonesByJobId(req: Request, res: Response, next: NextFunction) {
    try {
      const { job_id } = req.params;
      const result = await jobMilestoneService.getJobMilestonesByJobId(job_id);
      res.json({
        success: true,
        data: result,
        message: 'Job milestones retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobMilestones(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobMilestoneService.getJobMilestones();
      res.json({
        success: true,
        data: result,
        message: 'Job milestones retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobMilestoneController = new JobMilestoneController();
