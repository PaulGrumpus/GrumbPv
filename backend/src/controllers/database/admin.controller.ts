import { Request, Response, NextFunction } from 'express';
import { adminService } from '../../services/database/admin.service.js';

export class AdminController {
  /**
   * Admin login endpoint
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const token = await adminService.adminLogin(email, password);

      res.json({
        success: true,
        data: token,
        message: 'Admin login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
        message: 'Dashboard stats retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;

      const result = await adminService.getAllUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Users retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user details by ID
   */
  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await adminService.getUserDetails(id);

      res.json({
        success: true,
        data: user,
        message: 'User details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all gigs with pagination
   */
  async getAllGigs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;

      const result = await adminService.getAllGigs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Gigs retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gig details by ID
   */
  async getGigDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const gig = await adminService.getGigDetails(id);

      res.json({
        success: true,
        data: gig,
        message: 'Gig details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all jobs with pagination and filters
   */
  async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status } = req.query;

      const result = await adminService.getAllJobs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as any,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Jobs retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive job details
   */
  async getJobDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const job = await adminService.getJobDetails(id);

      res.json({
        success: true,
        data: job,
        message: 'Job details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all conversations with pagination
   */
  async getAllConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search } = req.query;

      const result = await adminService.getAllConversations({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Conversations retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation details with messages
   */
  async getConversationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const conversation = await adminService.getConversationDetails(id);

      res.json({
        success: true,
        data: conversation,
        message: 'Conversation details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
