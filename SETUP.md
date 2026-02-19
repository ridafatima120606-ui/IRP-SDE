# Smart Dining System - Setup Guide

This guide will walk you through setting up the Smart Dining System on your local machine.

## 📋 Prerequisites

Before you start, ensure you have the following installed:

- **Node.js** v18 or higher - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** v14 or higher - [Download](https://www.postgresql.org/download/)
- **Redis** - [Download](https://redis.io/download)
- **Docker** (Optional, for containerized setup) - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

## 🔧 Installation Steps

### Step 1: Clone and Navigate to Project

```bash
git clone <repository-url>
cd IRP-SDE
```

### Step 2: Setup PostgreSQL Database

**On Windows:**
1. Install PostgreSQL using the installer
2. During installation, set a password for the `postgres` user
3. Keep the port as default (5432)
4. Open pgAdmin (comes with PostgreSQL) or use psql command line

**Create the database:**

```sql
CREATE DATABASE smart_dining;
```

**Note the connection details:**
- Host: localhost
- Port: 5432
- User: postgres
- Password: (your chosen password)
- Database: smart_dining

### Step 3: Setup Redis

**On Windows:**

Option A - Using Windows Subsystem for Linux (WSL):
```bash
wsl
sudo apt-get install redis-server
redis-server
```

Option B - Using Docker:
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### Step 4: Setup Backend

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create `.env` file from template:
```bash
# Copy the .env.example file
cp .env.example .env

# Edit .env with your values
# On Windows, you can use notepad or your editor:
notepad .env
```

Update the `.env` file with your database credentials:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/smart_dining
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

Setup Prisma and create database tables:
```bash
# Install Prisma CLI globally (optional)
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed the database (if seeds are available)
npx prisma db seed
```

### Step 5: Setup Frontend

Open a new terminal and navigate to frontend:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create `.env.local` file from template:
```bash
cp .env.example .env.local
```

Update the `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Step 6: Verify Setup

Check that all services are running:

**PostgreSQL:**
```bash
psql -U postgres -d smart_dining -c "SELECT version();"
```

**Redis:**
```bash
redis-cli ping
# Should return: PONG
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Smart Dining System Backend running on port 5000
Environment: development
```

Check health endpoint:
```bash
curl http://localhost:5000/api/v1/health
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
```

Visit http://localhost:3000 in your browser, and you should see the Smart Dining System homepage.

### Using Docker Compose (Alternative)

If you prefer to use Docker:

1. Make sure Docker and Docker Compose are installed
2. From the project root:

```bash
docker-compose -f docker/docker-compose.yml up
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend API (port 5000)
- Frontend (port 3000)

## 📚 Database Management

### Using Prisma Studio

View and manage database visually:
```bash
cd backend
npx prisma studio
```

This opens Prisma Studio at http://localhost:5555

### Running Migrations

Create a new migration:
```bash
cd backend
npx prisma migrate dev --name migration_name
```

Reset database (⚠️ This deletes all data):
```bash
npx prisma migrate reset
```

### Seeding Database (Optional)

Create a `backend/prisma/seed.ts` file:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add your seed data here
  console.log('Seeding database...');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

Then add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

## 🔐 Security Setup

### Generate JWT Secret

Generate a secure random string for JWT_SECRET:

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

Update your `.env` file with this value.

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/auth/callback`
6. Copy Client ID to `.env.local`

## 📊 Environment Configuration

### Backend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment mode |
| DATABASE_URL | - | PostgreSQL connection string |
| REDIS_URL | - | Redis connection string |
| JWT_SECRET | - | Secret for JWT signing |
| JWT_EXPIRE | 7d | JWT expiration time |
| CORS_ORIGIN | http://localhost:3000 | Frontend URL for CORS |

### Frontend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:5000 | Backend API URL |
| NEXT_PUBLIC_SOCKET_URL | http://localhost:5000 | WebSocket server URL |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | - | Google OAuth client ID |

## 🐛 Troubleshooting

### Issue: Cannot connect to PostgreSQL

**Solution:**
- Verify PostgreSQL is running: `pg_isready -h localhost`
- Check connection string in `.env`
- Ensure database exists: `createdb smart_dining`

### Issue: Redis connection failed

**Solution:**
- Verify Redis is running: `redis-cli ping`
- Check Redis URL in `.env`
- Try: `redis-cli shutdown` and restart

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port already in use

**Solution:**

Find and kill process using the port:

**On Windows (PowerShell):**
```powershell
# Find process
netstat -ano | findstr :<PORT>

# Kill process
Stop-Process -Id <PID> -Force
```

**On Mac/Linux:**
```bash
lsof -i :<PORT>
kill -9 <PID>
```

### Issue: Module not found errors

**Solution:**
```bash
# Clear Prisma cache
rm -rf node_modules/@prisma/client

# Regenerate
npx prisma generate
```

## 📝 Next Steps

After setup is complete:

1. **Review Database Schema**: Check `backend/prisma/schema.prisma`
2. **Create API Routes**: Start implementing routes in `backend/src/routes/`
3. **Build Components**: Create React components in `frontend/components/`
4. **Test APIs**: Use Postman or Thunder Client to test endpoints
5. **Read Documentation**: Check README.md for feature overview

## 🆘 Getting Help

- Check individual README files in frontend/ and backend/
- Review Prisma documentation: https://www.prisma.io/docs/
- Check Next.js documentation: https://nextjs.org/docs
- Review Express documentation: https://expressjs.com/

## 🎉 You're Ready!

Your Smart Dining System environment is now set up and ready for development. Happy coding!

---

**Last Updated**: January 2025
