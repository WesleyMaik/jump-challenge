# Todo Application

A full-stack Todo application built with modern technologies, featuring user authentication, task management, and a responsive UI. This project uses a monorepo structure powered by Turborepo.

![Login Screenshot](./docs/login-screenshot.jpeg)
![App Screenshot](./docs/app-screenshot.jpeg)

## 🚀 Project Overview

This application consists of:

- **Backend API**: NestJS with PostgreSQL database and Prisma ORM
- **Frontend Web**: Next.js with React, TypeScript, and Tailwind CSS
- **Shared Packages**: UI components, ESLint configs, and TypeScript configurations

### Key Features

- 🔐 **User Authentication**: JWT-based authentication with login/signup
- ✅ **Todo Management**: Create, read, update, and delete todos
- 📱 **Responsive Design**: Modern UI with drag-and-drop functionality
- 🔒 **Role-based Access**: Admin and client user roles
- 📊 **Status Tracking**: Todo status management (Pending, In Progress, Done)

## 📋 Requirements

### System Requirements

- **Node.js**: >= 18.0.0
- **Package Manager**: PNPM 9.0.0 (preferred), Yarn, or NPM
- **Database**: PostgreSQL

### Environment Variables

Create a `.env` file in `apps/api/` based on `.env.example`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/todo_db"
JWT_SECRET_KEY="your-super-secret-jwt-key"
```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd todo
```

### 2. Install Dependencies

```bash
# Using PNPM (recommended)
pnpm install

# Using Yarn
yarn install

# Using NPM
npm install
```

### 3. Database Setup

1. **Create PostgreSQL Database**:

   ```sql
   CREATE DATABASE todo_db;
   ```

2. **Configure Environment Variables**:
   Copy `apps/api/.env.example` to `apps/api/.env` and update the values.

3. **Run Database Migrations**:

   ```bash
   cd apps/api
   pnpm prisma migrate dev
   # or
   npx prisma migrate dev
   ```

4. **Generate Prisma Client**:
   ```bash
   pnpm prisma generate
   # or
   npx prisma generate
   ```

## 🚀 Running the Application

### Development Mode

Start both frontend and backend in development mode:

```bash
# Start all applications
pnpm dev

# Start specific application
pnpm dev --filter=web    # Frontend only
pnpm dev --filter=api    # Backend only
```

The applications will be available at:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

### Production Build

```bash
# Build all applications
pnpm build

# Build specific application
pnpm build --filter=web
pnpm build --filter=api
```

### Start Production Server

```bash
# Start frontend production server
cd apps/web
pnpm start

# Start backend production server
cd apps/api
pnpm start:prod
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific app
cd apps/api
pnpm test              # Unit teststests
pnpm test:cov          # Coverage report

# Watch mode
pnpm test:watch
```

### Test Structure

- **API Tests**: Located in `apps/api/src/modules/*/test/`
- **Unit Tests**: Jest configuration in `apps/api/jest.config.ts`

## 🐳 Docker Setup

### Quick Start with Docker

1. **Clone and navigate to the project**:

   ```bash
   git clone <repository-url>
   cd todo
   ```

2. **Start all services (Production)**:

   ```bash
   docker compose up -d
   ```

### Available Services

When running with Docker Compose, the following services will be available:

- **Web Application**: http://localhost:3001
- **API Server**: http://localhost:3000
- **PostgreSQL Database**: localhost:5432
- **pgAdmin** (optional): http://localhost:5050
  - Email: admin@todo.com
  - Password: admin123

### Docker Commands

```bash
# Build and start all services
docker compose up -d

# Build and start with logs
docker compose up --build

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ This will delete all data)
docker compose down -v

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres

# Rebuild specific service
docker compose build api
docker compose build web

# Run database migrations
docker compose exec api npx prisma migrate dev

# Access database shell
docker compose exec postgres psql -U postgres -d todo_db

# Start with pgAdmin for database management
docker compose --profile tools up -d
```

### Development with Docker

For development with hot reloading:

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# View development logs
docker compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker compose -f docker-compose.dev.yml down
```

### Environment Variables for Docker

The Docker setup uses the following default environment variables:

**Database**:

- `POSTGRES_DB`: todo_db
- `POSTGRES_USER`: postgres
- `POSTGRES_PASSWORD`: postgres123

**API**:

- `DATABASE_URL`: postgresql://postgres:postgres123@postgres:5432/todo_db
- `JWT_SECRET_KEY`: your-super-secret-jwt-key-change-in-production

**Web**:

- `NEXT_PUBLIC_API_URL`: http://localhost:3000

> **⚠️ Security Note**: Change the default passwords and secrets before deploying to production!

## 📁 Project Structure

```
todo/
├── apps/
│   ├── api/                 # NestJS Backend API
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules
│   │   │   │   ├── auth/    # Authentication
│   │   │   │   ├── todos/   # Todo management
│   │   │   │   └── users/   # User management
│   │   │   └── common/      # Shared utilities
│   │   ├── prisma/          # Database schema & migrations
│   │   └── test/            # E2E tests
│   └── web/                 # Next.js Frontend
│       ├── src/
│       │   ├── app/         # App router pages
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities & API client
│       │   └── types/       # TypeScript types
│       └── public/          # Static assets
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # ESLint configurations
│   └── typescript-config/   # TypeScript configurations
└── turbo.json              # Turborepo configuration
```

## 🛠️ Available Scripts

### Root Level Commands

```bash
pnpm dev          # Start all apps in development
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm format       # Format code with Prettier
pnpm check-types  # Type check all apps
```

### API Specific Commands

```bash
cd apps/api
pnpm dev:watch    # Start with file watching
pnpm dev:debug    # Start in debug mode
pnpm test         # Run unit tests
pnpm test:e2e     # Run e2e tests
pnpm test:cov     # Run tests with coverage
```

### Web Specific Commands

```bash
cd apps/web
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint frontend code
```

## 🔧 Development Guidelines

### Code Style

- **Language**: All code and comments in English
- **TypeScript**: Strict typing, avoid `any` type
- **Formatting**: Prettier with project configuration
- **Linting**: ESLint with project-specific rules

### Database Management

```bash
# Create new migration
cd apps/api
pnpm prisma migrate dev --name migration_name

# Reset database
pnpm prisma migrate reset

# View database
pnpm prisma studio
```

### API Endpoints

- **Authentication**: `/auth/login`, `/auth/signup`
- **Todos**: `/todos` (CRUD operations)
- **Users**: `/users` (User management)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request
