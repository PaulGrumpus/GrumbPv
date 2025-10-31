import { logger } from '../../utils/logger.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { Prisma, PrismaClient, escrow_state, escrows } from '@prisma/client';
import { jobService } from './job.service.js';
import { userService } from './user.service.js';
import { jobMilestoneService } from './job.milestone.service.js';

export class EscrowService {
    private prisma: PrismaClient;

    public constructor() {
        this.prisma = new PrismaClient();
    }

    public async createEscrow(escrow: Prisma.escrowsUncheckedCreateInput): Promise<escrows> {
        try {
            if(!escrow.job_id || !escrow.buyer_id || !escrow.seller_id || !escrow.arbiter_id || !escrow.proxy_address) {
                throw new AppError('Job ID, buyer ID, seller ID, arbiter ID and proxy address are required', 400, 'JOB_ID_BUYER_ID_SELLER_ID_ARBITER_ID_PROXY_ADDRESS_REQUIRED');
            }
            const existingEscrow = await this.prisma.escrows.findFirst({
                where: {
                    job_id: escrow.job_id,
                    buyer_id: escrow.buyer_id,
                    seller_id: escrow.seller_id,
                    arbiter_id: escrow.arbiter_id,
                    proxy_address: escrow.proxy_address,
                },
            });
            if (existingEscrow) {
                throw new AppError('Escrow already exists', 400, 'ESCROW_ALREADY_EXISTS');
            }

            const existingJob = await jobService.getJobById(escrow.job_id);
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            const existingBuyer = await userService.getUserById(escrow.buyer_id);
            if (!existingBuyer) {
                throw new AppError('Buyer not found', 404, 'BUYER_NOT_FOUND');
            }
            const existingSeller = await userService.getUserById(escrow.seller_id);
            if (!existingSeller) {
                throw new AppError('Seller not found', 404, 'SELLER_NOT_FOUND');
            }
            const existingArbiter = await userService.getUserById(escrow.arbiter_id);
            if (!existingArbiter) {
                throw new AppError('Arbiter not found', 404, 'ARBITER_NOT_FOUND');
            }
            const newEscrow = await this.prisma.escrows.create({
                data: escrow,
            });
            return newEscrow;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error creating escrow', { error });
            throw new AppError('Error creating escrow', 500, 'DB_ESCROW_CREATION_FAILED');
        }
    }

    public async updateEscrowCurrentState(id: string, current_state: escrow_state): Promise<escrows> {
        try {
            if(!id) {
                throw new AppError('Escrow ID is required', 400, 'ESCROW_ID_REQUIRED');
            }
            const existingEscrow = await this.prisma.escrows.findUnique({
                where: { id },
            });
            if (!existingEscrow) {
                throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
            }
            const updatedEscrow = await this.prisma.escrows.update({
                where: { id },
                data: { current_state },
            });
            return updatedEscrow;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error updating escrow current state', { error });
            throw new AppError('Error updating escrow current state', 500, 'DB_ESCROW_CURRENT_STATE_UPDATE_FAILED');
        }
    }

    public async getEscrowById(id: string): Promise<escrows> {
        try {
            if(!id) {
                throw new AppError('Escrow ID is required', 400, 'ESCROW_ID_REQUIRED');
            }
            const existingEscrow = await this.prisma.escrows.findUnique({
                where: { id },
            });
            if (!existingEscrow) {
                throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
            }
            return existingEscrow;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrow by ID', { error });
            throw new AppError('Error getting escrow by ID', 500, 'DB_ESCROW_GET_BY_ID_FAILED');
        }
    }

    public async getEscrowsByJobId(job_id: string): Promise<escrows[]> {
        try {
            if(!job_id) {
                throw new AppError('Job ID is required', 400, 'JOB_ID_REQUIRED');
            }
            const existingJob = await jobService.getJobById(job_id);
            if (!existingJob) {
                throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
            }
            const existingEscrows = await this.prisma.escrows.findMany({
                where: { job_id },
            });
            return existingEscrows;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrows by job id', { error });
            throw new AppError('Error getting escrows by job id', 500, 'DB_ESCROWS_GET_BY_JOB_ID_FAILED');
        }
    }

    public async getEscrowsByMilestoneId(milestone_id: string): Promise<escrows> {
        try {
            if(!milestone_id) {
                throw new AppError('Milestone ID is required', 400, 'MILESTONE_ID_REQUIRED');
            }
            const existingMilestone = await jobMilestoneService.getJobMilestoneById(milestone_id);
            if (!existingMilestone) {
                throw new AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND');
            }
            const existingEscrow = await this.prisma.escrows.findFirst({
                where: { milestone_id },
            });
            if (!existingEscrow) {
                throw new AppError('Escrow not found', 404, 'ESCROW_NOT_FOUND');
            }
            return existingEscrow;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrows by milestone id', { error });
            throw new AppError('Error getting escrows by milestone id', 500, 'DB_ESCROWS_GET_BY_MILESTONE_ID_FAILED');
        }
    }

    public async getEscrowsByFactoryAddress(factory_address: string): Promise<escrows[]> {
        try {
            if(!factory_address) {
                throw new AppError('Factory address is required', 400, 'FACTORY_ADDRESS_REQUIRED');
            }
            const existingEscrows = await this.prisma.escrows.findMany({
                where: { factory_address },
            });
            return existingEscrows;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrows by factory address', { error });
            throw new AppError('Error getting escrows by factory address', 500, 'DB_ESCROWS_GET_BY_FACTORY_ADDRESS_FAILED');
        }
    }

    public async getAllEscrows(): Promise<escrows[]> {
        try {
            const existingEscrows = await this.prisma.escrows.findMany();
            return existingEscrows;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error getting escrows', { error });
            throw new AppError('Error getting escrows', 500, 'DB_ESCROWS_GET_FAILED');
        }
    }
}

export const escrowService = new EscrowService();