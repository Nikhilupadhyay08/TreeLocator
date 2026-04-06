# Dot-Explorer - Tree Tracking System

A comprehensive full-stack application for monitoring and managing forest trees, powered by IoT sensors, AI analysis, and satellite data integration.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [API Endpoints](#api-endpoints)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## 🌍 Project Overview

Dot-Explorer is an intelligent tree monitoring and management system designed for environmental conservation and forest health tracking. It combines:

- **Real-time IoT sensor data** from multiple locations
- **Satellite imagery analysis** for large-scale monitoring
- **AI-powered analysis** for tree health assessment
- **Blockchain logging** for transparent record-keeping
- **User management** with role-based access (citizens, forest officers, admins)
- **Interactive dashboards** for insights and reporting

### Key Use Cases

- Monitor tree health and growth patterns
- Track deforestation and unauthorized tree cutting
- Manage reforestation initiatives
- Generate comprehensive forest analysis reports
- Visualize tree locations on interactive maps
- Manage forest officer assignments and performance

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Radix UI** - Component library (55+ components)
- **React Query** - API state management
- **Leaflet** - Interactive mapping
- **Wouter** - Routing

### Backend
- **Express.js** - Server framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **Pino** - Logging

### Database
- **PostgreSQL 15+** - Primary database
- **Drizzle Kit** - Schema migration tool

### DevOps
- **pnpm** - Package manager (v10.33.0+)
- **Node.js** - Runtime

---

## 📦 Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **pnpm** (v10.33.0 or higher)
   ```bash
   npm install -g pnpm@latest
   pnpm --version  # Should be v10.33.0+
   ```

3. **PostgreSQL** (v15 or higher)
   ```bash
   psql --version  # Should be PostgreSQL 15+
   ```
   - PostgreSQL should be running on the default port `5432`
   - Ensure you have a superuser account or admin credentials

4. **Git** (for version control)
   ```bash
   git --version
   ```

---

## 💾 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/username/tree_tracking_system.git
cd tree_tracking_system-main
```

### Step 2: Install Dependencies

The project uses pnpm workspaces with three packages: root, backend, and frontend.

```bash
# Install all dependencies across the workspace
pnpm install

# Verify installation
pnpm list --depth=0
```

**Expected output**: Three packages should be listed:
- `root` (dot-explorer@1.0.0)
- `backend` (backend@1.0.0)
- `frontend` (frontend@1.0.0)

---

## 🗄️ Database Setup

### Step 1: Create PostgreSQL Database

First, connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL (you'll be prompted for password)
psql -U postgres

# Create the tree_monitor database
CREATE DATABASE tree_monitor;

# List databases to verify
\l

# Exit psql
\q
```

Alternatively, if PostgreSQL is running as a service:

```bash
# Windows (if psql is in PATH)
psql -U postgres -c "CREATE DATABASE tree_monitor;"
```

### Step 2: Configure Database Connection

Create a `.env` file in the `backend` directory:

**File**: `backend/.env`

```env
# Database Connection
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/tree_monitor"
NODE_ENV=development
```

Replace `your_password` with your PostgreSQL superuser password.

### Step 3: Push Drizzle Schema

Initialize the database with the Drizzle ORM schema:

```bash
# Navigate to project root
cd tree_tracking_system-main

# Push schema to database (creates all tables)
pnpm db:push-force
```

**Expected output**:
```
✓ Successfully pushed schema to the database
```

This command will create the following tables:
- `users` - User accounts (citizens, officers, admins)
- `trees` - Tree records with location and metadata
- `reports` - Environmental reports and analysis
- `iot_sensors` - IoT device tracking data
- `satellite_scans` - Satellite imagery data
- `ai_analysis` - AI-generated analysis results
- `blockchain_logs` - Immutable transaction logs
- `forest_officers` - Officer profile information (legacy)
- `citizens` - Citizen profile information (legacy)

### Step 4: Verify Database

```bash
# Connect to tree_monitor database
psql -U postgres -d tree_monitor

# List all tables
\dt

# Exit
\q
```

---

## 🚀 Running the Project

### Option 1: Run Both Servers (Recommended)

This command starts both the backend and frontend development servers in parallel:

```bash
# From project root
pnpm dev
```

**Expected output**:
```
Backend: Listening on http://localhost:5000
Frontend: Listening on http://localhost:5173
```

### Option 2: Run Servers Separately

#### Terminal 1: Start Backend Server

```bash
pnpm dev:backend
```

**Expected output**:
```
Server listening
    port: 5000
```

#### Terminal 2: Start Frontend Dev Server

```bash
pnpm dev:frontend
```

**Expected output**:
```
VITE v7.3.1  ready in 433 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.41:5173/
```

### Verify Both Servers are Running

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the Dot-Explorer home page. If you see:
- ✅ Navbar with navigation items
- ✅ Hero section
- ✅ Tree browse functionality
- ✅ API data loading without errors

Both servers are working correctly!

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Web application UI |
| Backend API | http://localhost:5000/api | REST API endpoints |
| Backend Health | http://localhost:5000/health | Server status check |
| Admin Panel | http://localhost:5173/admin | Admin dashboard (requires admin role) |
| Live Map | http://localhost:5173/map | Interactive tree map |
| Login | http://localhost:5173/login | User authentication |

---

## 📁 Project Structure

```
tree_tracking_system-main/
├── backend/                      # Express.js server
│   ├── src/
│   │   ├── app.ts              # Express application setup
│   │   ├── index.ts            # Server entry point
│   │   ├── db/
│   │   │   ├── index.ts        # Database configuration
│   │   │   └── schema/         # Drizzle ORM schemas
│   │   │       ├── users.ts
│   │   │       ├── trees.ts
│   │   │       ├── reports.ts
│   │   │       ├── iot_sensors.ts
│   │   │       ├── ai_analysis.ts
│   │   │       ├── satellite_scans.ts
│   │   │       └── blockchain_logs.ts
│   │   ├── routes/             # API routes
│   │   │   ├── admin.ts        # Admin endpoints
│   │   │   ├── auth.ts         # Authentication
│   │   │   ├── trees.ts        # Tree management
│   │   │   ├── reports.ts      # Report generation
│   │   │   ├── iot.ts          # IoT sensor data
│   │   │   ├── satellite.ts    # Satellite data
│   │   │   ├── ai.ts           # AI analysis
│   │   │   ├── blockchain.ts   # Blockchain logs
│   │   │   └── dashboard.ts    # Dashboard data
│   │   ├── lib/
│   │   │   └── logger.ts       # Logging utility
│   │   └── middlewares/        # Express middlewares
│   ├── drizzle.config.ts       # Drizzle ORM config
│   ├── build.mjs               # esbuild configuration
│   └── package.json
│
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── App.tsx             # Root component
│   │   ├── main.tsx            # Entry point
│   │   ├── index.css           # Global styles
│   │   ├── api/
│   │   │   ├── custom-fetch.ts # HTTP client
│   │   │   ├── index.ts        # API hooks
│   │   │   └── generated/      # OpenAPI generated types
│   │   ├── components/
│   │   │   ├── navbar.tsx      # Navigation bar
│   │   │   ├── logo.tsx        # Logo component
│   │   │   └── ui/             # Radix UI components
│   │   ├── contexts/
│   │   │   └── auth.tsx        # Authentication context
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx  # Mobile detection
│   │   │   └── use-toast.ts    # Toast notifications
│   │   ├── pages/              # Page components
│   │   │   ├── home.tsx
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   ├── trees.tsx
│   │   │   ├── tree-detail.tsx
│   │   │   ├── map.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── admin.tsx
│   │   │   ├── reports.tsx
│   │   │   ├── profile.tsx
│   │   │   └── not-found.tsx
│   │   └── lib/
│   │       └── utils.ts        # Utility functions
│   ├── vite.config.ts
│   ├── components.json         # Radix UI config
│   └── package.json
│
├── tsconfig.base.json          # Shared TypeScript config
├── tsconfig.json               # Root TypeScript config
├── pnpm-workspace.yaml         # Workspace configuration
├── pnpm-lock.yaml              # Dependency lock file
├── setup-db.mjs                # Database initialization script
└── README.md                   # This file
```

---

## ✨ Key Features

### 1. User Management
- **Role-based Access Control**: Citizen, Forest Officer, Admin
- **User Registration & Login**: JWT-based authentication
- **Admin Panel**: Manage users, trees, and reports

### 2. Tree Monitoring
- **Tree Database**: Track individual trees with metadata
- **Location Mapping**: Interactive map visualization
- **Tree Details**: Health status, species, location, history

### 3. Report Generation
- **Environmental Reports**: Analyze tree health and forest status
- **Report Filtering**: By type (plantation, cutting, survival check) and status
- **Admin-only Access**: Secure report management

### 4. IoT Integration
- **Sensor Data**: Real-time monitoring from IoT devices
- **Data Analysis**: Temperature, humidity, soil moisture tracking
- **Alert System**: Notifications for anomalies

### 5. Satellite Data
- **Imagery Analysis**: Satellite scans for large-scale monitoring
- **Trend Analysis**: Historical comparison and tracking
- **Pattern Recognition**: Identify changes and threats

### 6. AI Analysis
- **Predictive Analytics**: ML models for tree health prediction
- **Automated Insights**: AI-generated analysis reports
- **Recommendation Engine**: Suggest management actions

### 7. Blockchain Logging
- **Immutable Records**: Transaction logs for transparency
- **Audit Trail**: Track all system modifications
- **Compliance**: Environmental reporting requirements

### 8. Dashboard
- **Real-time Stats**: Key metrics and KPIs
- **Visualizations**: Charts and graphs
- **Quick Actions**: Fast access to common tasks

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
```

### Trees
```
GET    /api/trees              # List all trees (with filtering)
POST   /api/trees              # Create new tree
GET    /api/trees/:id          # Get tree details
PUT    /api/trees/:id          # Update tree
DELETE /api/trees/:id          # Delete tree
```

### Reports
```
GET    /api/reports            # List all reports
POST   /api/reports            # Create new report
GET    /api/reports/:id        # Get report details
PUT    /api/reports/:id        # Update report
DELETE /api/reports/:id        # Delete report
```

### IoT Sensors
```
GET    /api/iot/sensors        # List all sensors
POST   /api/iot/sensors        # Register new sensor
GET    /api/iot/data           # Get sensor readings
```

### Satellite Data
```
GET    /api/satellite/scans    # List satellite scans
POST   /api/satellite/scans    # Upload new scan
```

### AI Analysis
```
GET    /api/ai/analysis/:id    # Get AI analysis for tree
POST   /api/ai/analyze         # Request analysis
```

### Blockchain
```
GET    /api/blockchain/logs    # Get transaction logs
```

### Dashboard
```
GET    /api/dashboard/stats    # Get dashboard statistics
```

### Admin
```
GET    /api/admin/users        # List all users
POST   /api/admin/users        # Create user
PUT    /api/admin/users/:id    # Update user
DELETE /api/admin/users/:id    # Delete user
```

---

## 🔐 Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tree_monitor"

# Server
NODE_ENV=development
PORT=5000

# Optional: JWT Secret for authentication
JWT_SECRET=your_secret_key_here

# Optional: API Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
# API Base URL (usually proxied through Vite)
VITE_API_URL=http://localhost:5000

# Features
VITE_ENABLE_MAP=true
VITE_ENABLE_AI_ANALYSIS=true
VITE_ENABLE_BLOCKCHAIN=true
```

---

## 📚 Common Commands

### Development

```bash
# Start both servers
pnpm dev

# Start only backend
pnpm dev:backend

# Start only frontend
pnpm dev:frontend

# Build production
pnpm build

# Format code
pnpm format

# Lint code
pnpm lint
```

### Database

```bash
# Push schema changes
pnpm db:push

# Push with force (recreate)
pnpm db:push-force

# Generate migrations
pnpm db:generate

# View database UI
pnpm db:studio
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

---

## 🐛 Troubleshooting

### Issue: `net::ERR_CONNECTION_REFUSED` on localhost:5173

**Problem**: Frontend requests failing with connection refused error

**Solution**:
1. Ensure frontend dev server is running: `pnpm dev:frontend`
2. Check if port 5173 is in use: `netstat -ano | findstr :5173`
3. Try a different port if needed

---

### Issue: Database Connection Error

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
1. Verify PostgreSQL is running
2. Check DATABASE_URL in `backend/.env`
3. Verify database `tree_monitor` exists
4. Run `pnpm db:push-force` to initialize schema

---

### Issue: Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use a different port in backend code
PORT=5001 pnpm dev:backend
```

---

### Issue: PNPM Command Not Found

**Problem**: `pnpm: command not found`

**Solution**:
```bash
# Install pnpm globally
npm install -g pnpm

# Or use with npx
npx pnpm install
```

---

### Issue: Module Not Found Errors

**Problem**: `Cannot find module '@...'`

**Solution**:
1. Clear node_modules: `rm -r node_modules pnpm-lock.yaml`
2. Reinstall dependencies: `pnpm install`
3. Rebuild: `pnpm build`

---

### Issue: Hot Module Reload (HMR) Not Working

**Problem**: Frontend changes not reflecting without full page reload

**Solution**:
1. Check console for WebSocket connection errors
2. Verify Vite dev server is running
3. Check firewall settings for localhost:5173
4. Try refreshing the browser

---

## 📞 Support

For issues or questions:

1. Check the **Troubleshooting** section above
2. Review error logs in the terminal
3. Check browser console (F12) for frontend errors
4. Verify all prerequisites are installed

---

## 📄 License

This project is part of the Dot-Explorer initiative for environmental conservation.

---

## 🎯 Next Steps

After successful setup:

1. **Create test accounts**:
   - Navigate to `/signup`
   - Create a citizen and officer account
   - Use admin credentials from database initialization

2. **Explore features**:
   - View tree listings at `/trees`
   - Check interactive map at `/map`
   - Access dashboards at `/dashboard`
   - Admin panel at `/admin` (admin role only)

3. **Add tree data**:
   - Use the "Plant Tree" form to add trees
   - Upload IoT sensor data
   - Generate reports

4. **Integrate real data**:
   - Connect IoT sensors
   - Upload satellite imagery
   - Configure AI analysis models

---

**Happy tree tracking! 🌱**
