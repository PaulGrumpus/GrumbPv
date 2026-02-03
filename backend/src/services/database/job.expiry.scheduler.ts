import { prisma } from '../../prisma.js';
import { logger } from '../../utils/logger.js';
import { notificationService } from './notification.service.js';
import { job_status, notification_entity, notification_type } from '@prisma/client';

const EXPIRY_WINDOW_HOURS = 24;
const CHECK_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours

function formatExpiryTime(deadlineAt: Date): string {
  return deadlineAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Every 3 hours: find open jobs whose deadline is within the next 24 hours from now,
 * and send platform + email notification with the exact expiry time.
 * No deduplication: each run notifies for all jobs in the window.
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
        deadline_at: true,
      },
    });

    for (const job of jobsExpiringSoon) {
      const expiryTime = job.deadline_at ? formatExpiryTime(job.deadline_at) : 'soon';
      const title = 'Job expiring soon';
      const body = `Your job "${job.title}" expires at ${expiryTime}. You can update the deadline or create a new one.`;

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
        logger.info('Job expiry notification sent', { jobId: job.id, clientId: job.client_id, expiryTime });
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
 * Start the job-expiry notification scheduler (runs every 3 hours).
 * Call stopJobExpiryScheduler() on shutdown.
 */
export function startJobExpiryScheduler(): void {
  if (intervalId != null) return;
  runJobExpiryNotifications().catch((err) =>
    logger.error('Initial job expiry run failed', { error: err })
  );
  intervalId = setInterval(() => void runJobExpiryNotifications(), CHECK_INTERVAL_MS);
  logger.info('Job expiry scheduler started', { intervalHours: CHECK_INTERVAL_MS / (60 * 60 * 1000) });
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
