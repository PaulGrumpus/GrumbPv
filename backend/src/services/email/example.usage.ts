/**
 * Example usage of the Email Service
 * 
 * This file demonstrates how to use the email service module
 * for sending various types of email notifications.
 */

import { emailService } from './email.service.js';

// Example 1: Send a simple notification email
export async function sendSimpleNotification() {
  await emailService.sendNotificationEmail(
    'user@example.com',
    'New Job Application Received',
    'You have received a new job application for your project "Website Redesign".',
    'https://grumbuild.com',
    'View Application'
  );
}

// Example 2: Send a welcome email
export async function sendWelcomeEmail() {
  await emailService.sendEmail({
    to: 'newuser@example.com',
    subject: 'Welcome to GrumBuild.com!',
    template: 'welcome',
    data: {
      userName: 'John Doe',
      actionUrl: 'https://grumbuild.com/',
    },
  });
}

// Example 3: Send a job update email
export async function sendJobUpdateEmail() {
  await emailService.sendEmail({
    to: 'client@example.com',
    subject: 'Your Job Has Been Updated',
    template: 'job_update',
    data: {
      userName: 'Jane Smith',
      title: 'Job Status Updated',
      body: 'Your job "Mobile App Development" status has been changed to "In Progress".',
      jobTitle: 'Mobile App Development',
      status: 'In Progress',
      actionUrl: 'https://grumbuild.com/dashboard?view=create-job&jobId=5a1f5af4-82ab-4037-a820-c35b7c242f6c',
      actionText: 'View Job',
    },
  });
}

// Example 4: Send an application update email
export async function sendApplicationUpdateEmail() {
  await emailService.sendEmail({
    to: 'freelancer@example.com',
    subject: 'Application Status Changed',
    template: 'application_update',
    data: {
      userName: 'Bob Johnson',
      title: 'Application Accepted',
      body: 'Congratulations! Your application for "UI/UX Designer" has been accepted.',
      jobTitle: 'UI/UX Designer',
      applicationStatus: 'Accepted',
      actionUrl: 'https://grumbuild.com/',
      actionText: 'View Application',
    },
  });
}

// Example 5: Custom email with all options
export async function sendCustomEmail() {
  await emailService.sendEmail({
    to: 'user@example.com',
    subject: 'Custom Notification',
    template: 'notification',
    data: {
      userName: 'Alice',
      title: 'Important Update',
      body: 'This is a custom notification with additional information.',
      actionUrl: 'https://grumbuild.com/',
      actionText: 'Learn More',
      footerText: 'This is a custom footer message.',
    },
  });
}

