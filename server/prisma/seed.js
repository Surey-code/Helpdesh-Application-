// server/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Comprehensive user data for all roles
const usersToCreate = [
  // SUPER_ADMIN users
  {
    email: 'admin@helpdesk.com',
    password: 'admin123',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    department: 'IT Administration',
  },
  {
    email: 'superadmin@helpdesk.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'SUPER_ADMIN',
    department: 'IT Administration',
  },

  // ADMIN users
  {
    email: 'admin1@helpdesk.com',
    password: 'admin123',
    name: 'John Admin',
    role: 'ADMIN',
    department: 'Operations',
  },
  {
    email: 'admin2@helpdesk.com',
    password: 'admin123',
    name: 'Sarah Admin',
    role: 'ADMIN',
    department: 'Customer Success',
  },
  {
    email: 'admin3@helpdesk.com',
    password: 'admin123',
    name: 'Michael Admin',
    role: 'ADMIN',
    department: 'Technical Support',
  },

  // MANAGER users
  {
    email: 'manager1@helpdesk.com',
    password: 'manager123',
    name: 'David Manager',
    role: 'MANAGER',
    department: 'Support',
  },
  {
    email: 'manager2@helpdesk.com',
    password: 'manager123',
    name: 'Emily Manager',
    role: 'MANAGER',
    department: 'Support',
  },
  {
    email: 'manager3@helpdesk.com',
    password: 'manager123',
    name: 'Robert Manager',
    role: 'MANAGER',
    department: 'Technical Support',
  },

  // AGENT users
  {
    email: 'agent1@helpdesk.com',
    password: 'agent123',
    name: 'Alice Agent',
    role: 'AGENT',
    department: 'Support',
  },
  {
    email: 'agent2@helpdesk.com',
    password: 'agent123',
    name: 'Bob Agent',
    role: 'AGENT',
    department: 'Support',
  },
  {
    email: 'agent3@helpdesk.com',
    password: 'agent123',
    name: 'Charlie Agent',
    role: 'AGENT',
    department: 'Technical Support',
  },
  {
    email: 'agent4@helpdesk.com',
    password: 'agent123',
    name: 'Diana Agent',
    role: 'AGENT',
    department: 'Support',
  },
  {
    email: 'agent5@helpdesk.com',
    password: 'agent123',
    name: 'Ethan Agent',
    role: 'AGENT',
    department: 'Technical Support',
  },

  // CUSTOMER users
  {
    email: 'customer1@example.com',
    password: 'customer123',
    name: 'John Customer',
    role: 'CUSTOMER',
    department: null,
  },
  {
    email: 'customer2@example.com',
    password: 'customer123',
    name: 'Jane Customer',
    role: 'CUSTOMER',
    department: null,
  },
  {
    email: 'customer3@example.com',
    password: 'customer123',
    name: 'Mike Customer',
    role: 'CUSTOMER',
    department: null,
  },
  {
    email: 'customer4@example.com',
    password: 'customer123',
    name: 'Lisa Customer',
    role: 'CUSTOMER',
    department: null,
  },
  {
    email: 'customer5@example.com',
    password: 'customer123',
    name: 'Tom Customer',
    role: 'CUSTOMER',
    department: null,
  },
  {
    email: 'customer6@example.com',
    password: 'customer123',
    name: 'Amy Customer',
    role: 'CUSTOMER',
    department: null,
  },
  {
    email: 'customer7@example.com',
    password: 'customer123',
    name: 'Chris Customer',
    role: 'CUSTOMER',
    department: null,
  },
  {
    email: 'customer8@example.com',
    password: 'customer123',
    name: 'Patricia Customer',
    role: 'CUSTOMER',
    department: null,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const createdUsers = {};
  for (const user of usersToCreate) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          name: user.name,
          role: user.role,
          department: user.department,
          isActive: true,
        },
      });
      createdUsers[user.role] = createdUsers[user.role] || [];
      createdUsers[user.role].push(createdUser);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    } else {
      if (!createdUsers[user.role]) {
        createdUsers[user.role] = [];
      }
      createdUsers[user.role].push(existingUser);
      console.log(`⚠️ Skipped ${user.role} (${user.email}) - Already exists`);
    }
  }

  // Create SLA configurations
  console.log('\n📋 Creating SLA configurations...');
  const slaConfigs = [
    { priority: 'LOW', responseTimeMinutes: 480, resolutionTimeMinutes: 2880 }, // 8 hours response, 48 hours resolution
    { priority: 'MEDIUM', responseTimeMinutes: 240, resolutionTimeMinutes: 1440 }, // 4 hours response, 24 hours resolution
    { priority: 'HIGH', responseTimeMinutes: 60, resolutionTimeMinutes: 480 }, // 1 hour response, 8 hours resolution
    { priority: 'URGENT', responseTimeMinutes: 15, resolutionTimeMinutes: 120 }, // 15 minutes response, 2 hours resolution
  ];

  for (const sla of slaConfigs) {
    const existingSLA = await prisma.sLA.findUnique({
      where: { priority: sla.priority },
    });

    if (!existingSLA) {
      await prisma.sLA.create({ data: sla });
      console.log(`✅ Created SLA for ${sla.priority} priority`);
    } else {
      console.log(`⚠️ SLA for ${sla.priority} already exists`);
    }
  }

  // Create sample tickets
  console.log('\n🎫 Creating sample tickets...');
  const customers = createdUsers['CUSTOMER'] || [];
  const agents = createdUsers['AGENT'] || [];
  let sampleTickets = [];

  if (customers.length > 0 && agents.length > 0) {
    sampleTickets = [
      {
        subject: 'Unable to login to my account',
        description: 'I forgot my password and cannot reset it. The reset email is not arriving.',
        priority: 'HIGH',
        status: 'OPEN',
        customerId: customers[0].id,
        assignedAgentId: null,
      },
      {
        subject: 'Feature request: Dark mode',
        description: 'It would be great to have a dark mode option in the application.',
        priority: 'LOW',
        status: 'OPEN',
        customerId: customers[1].id,
        assignedAgentId: null,
      },
      {
        subject: 'System is very slow today',
        description: 'The application has been running very slowly since this morning. All pages take forever to load.',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        customerId: customers[2].id,
        assignedAgentId: agents[0].id,
      },
      {
        subject: 'Payment issue - charged twice',
        description: 'I was charged twice for my subscription. Please refund one of the charges.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        customerId: customers[3].id,
        assignedAgentId: agents[1].id,
      },
      {
        subject: 'How to export my data?',
        description: 'I need to export all my data. Can you guide me through the process?',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        customerId: customers[4].id,
        assignedAgentId: agents[2].id,
      },
      {
        subject: 'Bug: Form validation not working',
        description: 'The contact form on the website is not validating email addresses correctly.',
        priority: 'MEDIUM',
        status: 'WAITING',
        customerId: customers[5].id,
        assignedAgentId: agents[0].id,
      },
      {
        subject: 'Account deletion request',
        description: 'I would like to delete my account and all associated data.',
        priority: 'MEDIUM',
        status: 'OPEN',
        customerId: customers[6].id,
        assignedAgentId: null,
      },
      {
        subject: 'API integration help needed',
        description: 'I need help integrating your API into my application. Documentation is unclear.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        customerId: customers[7].id,
        assignedAgentId: agents[3].id,
      },
    ];

    const createdTickets = [];
    for (const ticket of sampleTickets) {
      const createdTicket = await prisma.ticket.create({
        data: ticket,
      });
      createdTickets.push(createdTicket);
      console.log(`✅ Created ticket: ${ticket.subject}`);
    }

    // Create sample comments
    console.log('\n💬 Creating sample comments...');
    if (createdTickets.length > 0 && agents.length > 0) {
      const comments = [
        {
          content: 'Thank you for reporting this issue. We are looking into it.',
          type: 'PUBLIC',
          ticketId: createdTickets[0].id,
          authorId: agents[0].id,
        },
        {
          content: 'Internal note: Password reset service might be down. Check email service status.',
          type: 'INTERNAL',
          ticketId: createdTickets[0].id,
          authorId: agents[0].id,
        },
        {
          content: 'This is a great suggestion! We will add it to our roadmap.',
          type: 'PUBLIC',
          ticketId: createdTickets[1].id,
          authorId: agents[1].id,
        },
        {
          content: 'I have checked the server logs. There was a spike in traffic. Monitoring now.',
          type: 'INTERNAL',
          ticketId: createdTickets[2].id,
          authorId: agents[0].id,
        },
        {
          content: 'I have processed your refund. It should appear in 3-5 business days.',
          type: 'PUBLIC',
          ticketId: createdTickets[3].id,
          authorId: agents[1].id,
        },
        {
          content: 'Here is the step-by-step guide: 1. Go to Settings 2. Click Export 3. Select format',
          type: 'PUBLIC',
          ticketId: createdTickets[4].id,
          authorId: agents[2].id,
        },
      ];

      for (const comment of comments) {
        await prisma.comment.create({ data: comment });
        console.log(`✅ Created comment on ticket ${comment.ticketId.substring(0, 8)}...`);
      }
    }
  }

  // Create Knowledge Base Articles
  console.log('\n📚 Creating Knowledge Base articles...');
  const kbArticles = [
    {
      title: 'How to Reset Your Password',
      content: '## Overview\nThis guide explains how to reset your account password if you have forgotten it or if your current one has expired.\n\n### Steps to Reset\n1. Go to the login page and click on **"Forgot Password"**.\n2. Enter your registered email address.\n3. Check your inbox for a reset link (don\'t forget to check the spam folder).\n4. Click the link and follow the instructions to set a new password.\n\n**Note**: The reset link is only valid for 24 hours. If you don\'t receive the email within 10 minutes, please contact support.',
      category: 'Account Management',
      visibility: 'PUBLIC',
    },
    {
      title: 'Understanding Ticket Priorities',
      content: '## Priority Levels\nTo ensure we address the most critical issues first, we use a four-tier priority system:\n\n| Priority | Response SLA | Resolution SLA | Description |\n| :--- | :--- | :--- | :--- |\n| **URGENT** | 15 Mins | 2 Hours | Critical system outage affecting all users. |\n| **HIGH** | 1 Hour | 8 Hours | Major functionality broken for multiple users. |\n| **MEDIUM** | 4 Hours | 24 Hours | Non-critical functionality broken or minor bugs. |\n| **LOW** | 8 Hours | 48 Hours | Feature requests, general questions, or minor cosmetic issues. |\n\n*Priorities are automatically analyzed but can be adjusted by support agents.*',
      category: 'General',
      visibility: 'PUBLIC',
    },
    {
      title: 'VPN and Remote Access Guide',
      content: '## Remote Work Setup\nOur VPN allows you to securely access internal resources when working from home.\n\n### Requirements\n- Company-issued laptop\n- MFA (Multi-Factor Authentication) enabled on your phone\n- GlobalProtect or AnyConnect client installed\n\n### Instructions\n1. Launch the VPN client from your system tray.\n2. Enter your company credentials.\n3. Complete the MFA prompt on your mobile device.\n4. You are now connected to the internal network.',
      category: 'Technical',
      visibility: 'PUBLIC',
    },
    {
      title: 'Security Best Practices: Phishing Awareness',
      content: '## Protect Your Account\nPhishing is a major threat to our company security. Follow these tips to stay safe:\n\n- **Check the sender**: Always verify the sender\'s email address matches the company domain.\n- **Links and Attachments**: Never click on suspicious links or download attachments from unknown sources.\n- **Urgency**: Be wary of emails that create a false sense of urgency or demand password changes via external links.\n\n**Reporting suspicious emails**: Use the "Report Phishing" button in your email client or forward the email to security@company.com.',
      category: 'Security',
      visibility: 'PUBLIC',
    },
    {
      title: 'Mobile App Setup - Helpdesk Go',
      content: '## Stay Connected on the Move\nYou can access your tickets on your mobile device using our dedicated app.\n\n### Download Links\n- [App Store (iOS)](https://apps.apple.com/helpdesk-go)\n- [Google Play (Android)](https://play.google.com/helpdesk-go)\n\n### Initial Setup\n1. Open the app and enter the company server URL: `https://helpdesk.company.com`.\n2. Log in with your standard SSO credentials.\n3. Enable push notifications to stay updated on ticket status changes.',
      category: 'Technical',
      visibility: 'PUBLIC',
    },
    {
      title: 'Troubleshooting Common Software Errors',
      content: '## Basic Software Troubleshooting\nBefore raising a ticket, please try these common steps for software issues:\n\n1. **Restart**: Many issues are resolved by a simple system or application restart.\n2. **Clear Cache**: If a web-based tool is acting up, try clearing your browser cache and cookies.\n3. **Updates**: Ensure your operating system and the application in question are fully updated.\n4. **Disk Space**: Check if your system has at least 5GB of free space remaining.',
      category: 'Technical',
      visibility: 'PUBLIC',
    },
    {
      title: 'Internal: Escalation Process',
      content: '## Agent Guidelines\nFor tickets that cannot be resolved within the defined SLA or require specialized knowledge:\n\n1. **Document**: Ensure all troubleshooting steps are documented in the ticket history.\n2. **Internal Note**: Add an internal note explaining why the ticket is being escalated.\n3. **Assign**: Reassign the ticket to the relevant Tier 2 or Tier 3 queue.\n4. **Notify**: Slack the relevant channel for urgent escalations.',
      category: 'Internal',
      visibility: 'PRIVATE',
    },
    {
      title: 'Setting Up Your Home Office',
      content: '## Remote Work Ergonomics\nEnsuring you have a comfortable and productive workspace at home is essential for long-term health and efficiency.\n\n### Workspace Checklist\n- **Chair**: Use a chair with proper lumbar support.\n- **Monitor**: Position the top of the screen at or slightly below eye level.\n- **Internet**: A wired ethernet connection is preferred over Wi-Fi for stability.\n- **Lighting**: Ensure adequate lighting to reduce eye strain, preferably from natural sources.',
      category: 'Human Resources',
      visibility: 'PUBLIC',
    },
    {
      title: 'Employee Benefits Overview 2026',
      content: '## Our Commitment to You\nWe offer a comprehensive benefits package designed to support your health, wealth, and well-on-the-go.\n\n- **Healthcare**: Comprehensive medical, dental, and vision coverage.\n- **Retirement**: 4% matching on 401(k) contributions from day one.\n- **Wellness**: Annual stipend for gym memberships or mental health apps.\n- **PTO**: 20 days of paid time off plus 10 company holidays.',
      category: 'Human Resources',
      visibility: 'PUBLIC',
    },
    {
      title: 'Traveling for Business: Expense Policy',
      content: '## Reclaiming Business Expenses\nFollow these guidelines when traveling for company business to ensure timely reimbursement.\n\n1. **Pre-Approval**: All travel must be approved by your manager via the HR portal.\n2. **Receipts**: Keep all digital and physical receipts for items over $10.\n3. **Daily Allowance**: Per diem for meals is capped at $75 in most major cities.\n4. **Booking**: Use our preferred travel partner for all flights and hotels.',
      category: 'Human Resources',
      visibility: 'PUBLIC',
    },
    {
      title: 'Password Management Protocols',
      content: '## Strengthening Your Digital Identity\nPasswords are the first line of defense against unauthorized access.\n\n### Best Practices\n- **Complexity**: Use 12+ characters with symbols and numbers.\n- **Unique**: Never reuse passwords across different platforms.\n- **Manager**: Use the company-provided LastPass account for storage.\n- **MFA**: Enable Multi-Factor Authentication on every account that supports it.',
      category: 'Security',
      visibility: 'PUBLIC',
    },
    {
      title: 'Handling Data Breaches: Immediate Actions',
      content: '## Response Protocol\nIf you suspect that company or customer data has been compromised, act immediately:\n\n1. **Contain**: Change your own credentials immediately.\n2. **Report**: Alert the IT Security Team via their emergency Slack channel.\n3. **Isolate**: Disconnect your device from the corporate network.\n4. **Audit**: Prepare a list of systems you accessed in the last 24 hours.',
      category: 'Security',
      visibility: 'PRIVATE',
    },
    {
      title: 'The Art of Customer Success',
      content: '## Beyond Support\nCustomer Success is about ensuring our clients achieve their desired outcomes using our tools.\n\n- **Proactive Outreach**: Don\'t wait for a ticket; check in with top users weekly.\n- **Education**: share relevant KB articles proactively during meetings.\n- **Feedback Loop**: Document feature requests and pain points for the product team.\n- **Empathy**: Listen first, solve second. Understand the business impact of the issue.',
      category: 'Customer Success',
      visibility: 'PUBLIC',
    },
    {
      title: 'Renewals and Retention Strategies',
      content: '## Keeping Our Clients Happy\nRetention is the lifeblood of our SaaS business. Use these strategies for upcoming renewals:\n\n1. **Health Checks**: Schedule a ROI review 90 days before the contract ends.\n2. **Feature Adoption**: Identify features the user isn\'t using and offer training.\n3. **Executive Alignment**: Ensure decision-makers are aware of the value we provide.\n4. **Early Renewal Discounts**: Offer 5% off for signing 60 days in advance.',
      category: 'Customer Success',
      visibility: 'PRIVATE',
    },
    {
      title: 'Advanced Git Workflow for Developers',
      content: '## Best Practices for VCS\nMaintain a clean and readable git history across all company projects.\n\n- **Atomic Commits**: Each commit should represent a single logical change.\n- **Branching**: Use the `feature/` and `bugfix/` naming conventions.\n- **Rebase over Merge**: Keep a linear history by rebasing your branches before merging.\n- **Pull Requests**: Every PR must be reviewed by at least one other developer before merging into `main`.',
      category: 'Technical',
      visibility: 'PRIVATE',
    },
    {
      title: 'Database Performance Optimization',
      content: '## Speeding Up PostgreSQL Queries\nAs our data scale increases, query performance becomes critical for application responsiveness.\n\n### Optimization Tips\n1. **Indexing**: Ensure all foreign keys and frequently filtered columns are indexed.\n2. **EXPLAIN ANALYZE**: Use this tool to identify slow-performing joins or scans.\n3. **Batch Processing**: Avoid fetching thousands of records at once; use pagination.\n4. **Vacuuming**: Run regular VACUUM operations to reclaim disk space from deleted rows.',
      category: 'Technical',
      visibility: 'PRIVATE',
    },
    {
      title: 'Holiday Schedule 2026',
      content: '## Mark Your Calendars\nBelow are the official company holidays for the 2026 calendar year:\n\n- New Year\'s Day: Jan 1\n- Presidents\' Day: Feb 16\n- Memorial Day: May 25\n- Independence Day: July 4\n- Labor Day: Sept 7\n- Thanksgiving: Nov 26-27\n- Winter Break: Dec 24 - Jan 1\n\n*Note: Floating holidays can be requested via the HR portal.*',
      category: 'General',
      visibility: 'PUBLIC',
    },
    {
      title: 'Company Mission and Core Values',
      content: '## What Drives Us\nOur mission is to empower teams to solve problems faster and more efficiently through intelligent automation.\n\n### Our Values\n- **Transparency**: We share information openly and honestly.\n- **Empathy**: We put ourselves in the shoes of our users and teammates.\n- **Innovation**: We are never satisfied with the status quo.\n- **Ownership**: We take responsibility for our successes and our failures.',
      category: 'General',
      visibility: 'PUBLIC',
    },
    {
      title: 'Internal Audit Preparation Checklist',
      content: '## Compliance and Readiness\nPrepare for our upcoming Q3 internal audit by ensuring all department documents are up to date.\n\n1. **User Permissions**: Review access lists for sensitive systems.\n2. **Financial Records**: Ensure all expense reports match bank statements.\n3. **Security Training**: Verify 100% completion of the annual security awareness course.\n4. **Equipment Inventory**: Tag and record all company-issued hardware currently assigned to staff.',
      category: 'Internal',
      visibility: 'PRIVATE',
    },
    {
      title: 'Standardizing API Error Responses',
      content: '## Developer Guidelines\nTo ensure a consistent experience for our API consumers, follow these error response patterns:\n\n- **400 Bad Request**: Used for validation errors (include a detailed `errors` array).\n- **401 Unauthorized**: No valid credentials provided.\n- **403 Forbidden**: Valid credentials, but insufficient permissions.\n- **404 Not Found**: The requested resource does not exist.\n- **500 Server Error**: Use sparingly; log the error details with a unique ID for support.',
      category: 'Technical',
      visibility: 'PRIVATE',
    },

  ];

  for (const article of kbArticles) {
    const existingArticle = await prisma.kBArticle.findFirst({
      where: { title: article.title },
    });

    if (!existingArticle) {
      await prisma.kBArticle.create({ data: article });
      console.log(`✅ Created KB article: ${article.title}`);
    } else {
      console.log(`⚠️ KB article "${article.title}" already exists`);
    }
  }

  console.log('\n✨ Seeding finished successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users created: ${usersToCreate.length}`);
  console.log(`   - SLA configurations: ${slaConfigs.length}`);
  console.log(`   - Sample tickets: ${sampleTickets?.length || 0}`);
  console.log(`   - KB articles: ${kbArticles.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });