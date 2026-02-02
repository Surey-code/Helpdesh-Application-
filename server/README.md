# Helpdesk Application - Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/helpdesk_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=5000
NODE_ENV=development
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Seed the database:
```bash
npm run prisma:seed
```

6. Start the server:
```bash
npm run dev
```

## Default Credentials

- **Email:** admin@helpdesk.com
- **Password:** admin123
- **Role:** SUPER_ADMIN

## API Endpoints

- `/api/auth` - Authentication (register, login)
- `/api/users` - User management
- `/api/tickets` - Ticket operations
- `/api/attachments` - File uploads
- `/api/kb` - Knowledge base articles
- `/api/reports` - Analytics and reports
- `/api/sla` - SLA management
