import { prisma } from '../../prisma.js';
import { logger } from '../../utils/logger.js';
import { notificationService } from './notification.service.js';
import { job_status, notification_entity, notification_type } from '@prisma/client';

const EXPIRY_WINDOW_HOURS = 24;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Find open/in_review/in_progress jobs whose deadline is within the next 24 hours
 * and send a single platform + email notification to the client.
 * Skips jobs that already have a JOB_EXPIRING_SOON notification.
 */
export async function runJobExpiryNotifications(): Promise<void> {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + EXPIRY_WINDOW_HOURS * 60 * 60 * 1000);

    const jobsExpiringSoon = await prisma.jobs.findMany({
      where: {
        deadline_at: {
          gte: now,
          lte: windowEnd,
        },
        status: {
          in: [job_status.open],
        },
      },
      select: {
        id: true,
        title: true,
        client_id: true,
      },
    });

    if (jobsExpiringSoon.length === 0) {
      return;
    }

    const notifiedRows = await prisma.notifications.findMany({
      where: {
        entity_type: notification_entity.job,
        type: 'JOB_EXPIRING_SOON' as notification_type,
        entity_id: { in: jobsExpiringSoon.map((j) => j.id) },
      },
      select: { entity_id: true },
    });
    const alreadyNotifiedJobIds = new Set(notifiedRows.map((r) => r.entity_id));

    for (const job of jobsExpiringSoon) {
      if (alreadyNotifiedJobIds.has(job.id)) continue;

      const title = 'Job expiring soon';
      const body = `Your job "${job.title}" will expire in 24 hours. You can update the deadline or create a new one.`;

      try {
        await notificationService.createNotification({
          user_id: job.client_id,
          actor_user_id: null,
          type: 'JOB_EXPIRING_SOON' as notification_type,
          entity_type: notification_entity.job,
          entity_id: job.id,
          title,
          body,
        });
        logger.info('Job expiry notification sent', { jobId: job.id, clientId: job.client_id });
      } catch (err) {
        logger.error('Failed to send job expiry notification', { jobId: job.id, error: err });
      }
    }
  } catch (error) {
    logger.error('Job expiry scheduler run failed', { error });
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Start the job-expiry notification scheduler (runs every hour).
 * Call stopJobExpiryScheduler() on shutdown.
 */
export function startJobExpiryScheduler(): void {
  if (intervalId != null) return;
  runJobExpiryNotifications().catch((err) =>
    logger.error('Initial job expiry run failed', { error: err })
  );
  intervalId = setInterval(() => void runJobExpiryNotifications(), CHECK_INTERVAL_MS);
  logger.info('Job expiry scheduler started', { intervalMinutes: CHECK_INTERVAL_MS / 60000 });
}

/**
 * Stop the job-expiry notification scheduler.
 */
export function stopJobExpiryScheduler(): void {
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Job expiry scheduler stopped');
  }
}
