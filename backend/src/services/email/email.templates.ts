export interface EmailTemplateData {
  title?: string;
  body?: string;
  userName?: string;
  actionUrl?: string;
  actionText?: string;
  footerText?: string;
  [key: string]: any;
}

const baseStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .email-header h1 {
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }
    .email-body {
      padding: 40px 30px;
    }
    .email-body h2 {
      font-size: 24px;
      color: #333333;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .email-body p {
      font-size: 16px;
      color: #666666;
      margin-bottom: 20px;
      line-height: 1.8;
    }
    .email-body .greeting {
      font-size: 16px;
      color: #666666;
      margin-bottom: 20px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .email-footer p {
      font-size: 14px;
      color: #999999;
      margin: 5px 0;
    }
    .email-footer a {
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .email-body {
        padding: 30px 20px !important;
      }
      .email-header {
        padding: 30px 20px !important;
      }
      .email-header h1 {
        font-size: 24px !important;
      }
      .email-body h2 {
        font-size: 20px !important;
      }
    }
  </style>
`;

const baseTemplate = (content: string, data: EmailTemplateData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${data.title || 'Notification'}</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>GrumBuild.com</h1>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p>${data.footerText || 'This is an automated notification from paulgrumpus.com.'}</p>
      <p>
        <a href="${process.env.FRONTEND_URL || 'https://grumbuild.com'}">Visit our website</a> | 
        <a href="${process.env.FRONTEND_URL || 'https://grumbuild.com'}/support">Support</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #999999;">
        © ${new Date().getFullYear()} GrumBuild.com. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

export const getEmailTemplate = (
  template: 'notification' | 'welcome' | 'job_update' | 'application_update' | 'contact',
  data: EmailTemplateData
): string => {
  switch (template) {
    case 'notification':
      return getNotificationTemplate(data);
    case 'welcome':
      return getWelcomeTemplate(data);
    case 'job_update':
      return getJobUpdateTemplate(data);
    case 'application_update':
      return getApplicationUpdateTemplate(data);
    case 'contact':
      return getContactTemplate(data);
    default:
      return getNotificationTemplate(data);
  }
};

const getNotificationTemplate = (data: EmailTemplateData): string => {
  const greeting = data.userName ? `Hello ${data.userName},` : 'Hello,';
  const content = `
    <div class="greeting">${greeting}</div>
    ${data.title ? `<h2>${data.title}</h2>` : ''}
    ${data.body ? `<p>${data.body}</p>` : ''}
    ${data.actionUrl
      ? `
      <div class="button-container">
        <a href="${data.actionUrl}" class="button">${data.actionText || 'View Details'}</a>
      </div>
      `
      : ''
    }
  `;
  return baseTemplate(content, data);
};

const getWelcomeTemplate = (data: EmailTemplateData): string => {
  const userName = data.userName || 'there';
  const content = `
    <div class="greeting">Welcome to GrumBuild.com, ${userName}!</div>
    <h2>Get Started</h2>
    <p>We're excited to have you on board. GrumBuild.com is your platform for connecting freelancers and clients in the blockchain ecosystem.</p>
    <p>Here's what you can do:</p>
    <ul style="margin: 20px 0; padding-left: 20px; color: #666666;">
      <li style="margin-bottom: 10px;">Browse and apply for jobs</li>
      <li style="margin-bottom: 10px;">Post your own projects</li>
      <li style="margin-bottom: 10px;">Manage your applications and milestones</li>
      <li style="margin-bottom: 10px;">Secure escrow payments</li>
    </ul>
    ${data.actionUrl
      ? `
      <div class="button-container">
        <a href="${data.actionUrl}" class="button">Complete Your Profile</a>
      </div>
      `
      : ''
    }
  `;
  return baseTemplate(content, {
    ...data,
    title: 'Welcome to GrumBuild.com!',
    footerText: 'Thank you for joining GrumBuild.com. We look forward to working with you!',
  });
};

const getJobUpdateTemplate = (data: EmailTemplateData): string => {
  const greeting = data.userName ? `Hello ${data.userName},` : 'Hello,';
  const content = `
    <div class="greeting">${greeting}</div>
    <h2>${data.title || 'Job Update'}</h2>
    ${data.body ? `<p>${data.body}</p>` : ''}
    ${data.jobTitle ? `<p><strong>Job:</strong> ${data.jobTitle}</p>` : ''}
    ${data.status ? `<p><strong>Status:</strong> <span style="color: #667eea; font-weight: 600;">${data.status}</span></p>` : ''}
    ${data.actionUrl
      ? `
      <div class="button-container">
        <a href="${data.actionUrl}" class="button">${data.actionText || 'View Job'}</a>
      </div>
      `
      : ''
    }
  `;
  return baseTemplate(content, data);
};

const getApplicationUpdateTemplate = (data: EmailTemplateData): string => {
  const greeting = data.userName ? `Hello ${data.userName},` : 'Hello,';
  const content = `
    <div class="greeting">${greeting}</div>
    <h2>${data.title || 'Application Update'}</h2>
    ${data.body ? `<p>${data.body}</p>` : ''}
    ${data.jobTitle ? `<p><strong>Job:</strong> ${data.jobTitle}</p>` : ''}
    ${data.applicationStatus
      ? `<p><strong>Application Status:</strong> <span style="color: #667eea; font-weight: 600;">${data.applicationStatus}</span></p>`
      : ''
    }
    ${data.actionUrl
      ? `
      <div class="button-container">
        <a href="${data.actionUrl}" class="button">${data.actionText || 'View Application'}</a>
      </div>
      `
      : ''
    }
  `;
  return baseTemplate(content, data);
};

const getContactTemplate = (data: EmailTemplateData): string => {
  const content = `
    <h2>New Contact Form Submission</h2>
    <p>You have received a new contact form submission from your website.</p>
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
      ${data.name ? `<p><strong>Name:</strong> ${data.name}</p>` : ''}
      ${data.email ? `<p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>` : ''}
      ${data.inquiry ? `<p><strong>Inquiry:</strong></p><p style="white-space: pre-wrap; margin-top: 10px;">${data.inquiry}</p>` : ''}
    </div>
    <p style="margin-top: 20px;">You can reply directly to this email to respond to the inquiry.</p>
  `;
  return baseTemplate(content, {
    ...data,
    title: 'New Contact Form Submission',
    footerText: 'This is an automated notification from your contact form.',
  });
};

