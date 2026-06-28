# 🌳 Dot-Explorer — Tree Monitoring System

A full-stack tree plantation and monitoring platform built for India's forest conservation efforts. Track plantations, detect deforestation using satellite NDVI data, log IoT sensor readings, run AI-based image analysis, and maintain blockchain-style tamper-proof audit trails.

---

## ⚡ Quick Start (5 Minutes)

### 1️⃣ Prerequisites Check
```bash
node --version    # Should be ≥ 18.x
pnpm --version    # Should be ≥ 10.x (npm install -g pnpm if missing)
psql --version    # Should be ≥ 15.x (PostgreSQL must be running)
```

### 2️⃣ Install & Setup
```bash
# Install dependencies
pnpm install

# Create database and tables
node setup-db.mjs

# Push schema to database
pnpm db:push-force
```

### 3️⃣ Run the Project
```bash
# Start both backend and frontend
pnpm dev

# Backend will be running on: http://localhost:5000
# Frontend will be running on: http://localhost:5173
```

### 4️⃣ Access the Application
Open your browser and go to: **http://localhost:5173**

---

> 📖 **For detailed setup instructions, see [Comprehensive Setup Guide](./README_SETUP.md)**

---

## 📁 Project Structure

```
Dot-Explorer/
├── backend/                        # Express.js API Server
│   ├── src/
│   │   ├── index.ts                # Server entry point (port 5000)
│   │   ├── app.ts                  # Express app setup (CORS, JSON, logging)
│   │   ├── routes/                 # API route handlers
│   │   │   ├── index.ts            # Route aggregator
│   │   │   ├── auth.ts             # Citizen & Officer auth (signup/login/OTP)
│   │   │   ├── admin.ts            # Admin CRUD for users
│   │   │   ├── trees.ts            # Tree CRUD with auto code generation
│   │   │   ├── reports.ts          # Tree event reporting
│   │   │   ├── dashboard.ts        # Analytics & statistics
│   │   │   ├── health.ts           # Health check endpoint
│   │   │   ├── iot.ts              # IoT sensor data endpoints
│   │   │   ├── ai.ts               # AI image analysis endpoints
│   │   │   ├── satellite.ts        # Satellite NDVI scan endpoints
│   │   │   └── blockchain.ts       # Blockchain audit log endpoints
│   │   ├── lib/
│   │   │   └── logger.ts           # Pino logger configuration
│   │   └── middlewares/            # Express middlewares (extensible)
│   ├── build.mjs                   # esbuild bundler script
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # React + Vite Client (TailwindCSS + shadcn/ui)
│   ├── src/
│   │   ├── main.tsx                # App entry point
│   │   ├── App.tsx                 # Router + providers setup
│   │   ├── index.css               # Tailwind + theme variables
│   │   ├── components/
│   │   │   ├── navbar.tsx          # Navigation bar
│   │   │   ├── logo.tsx            # Logo component
│   │   │   └── ui/                 # shadcn/ui components (55+ components)
│   │   ├── pages/
│   │   │   ├── home.tsx            # Landing page
│   │   │   ├── map.tsx             # Leaflet map view
│   │   │   ├── plant.tsx           # Plant a tree form
│   │   │   ├── trees.tsx           # Tree listing
│   │   │   ├── tree-detail.tsx     # Individual tree details
│   │   │   ├── dashboard.tsx       # Analytics dashboard
│   │   │   ├── report.tsx          # Submit reports
│   │   │   ├── admin.tsx           # Admin panel
│   │   │   ├── signup.tsx          # User registration
│   │   │   ├── login.tsx           # User login
│   │   │   ├── profile.tsx         # User profile
│   │   │   └── not-found.tsx       # 404 page
│   │   ├── contexts/
│   │   │   └── auth.tsx            # Authentication context & API calls
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx      # Responsive breakpoint hook
│   │   │   └── use-toast.ts        # Toast notification hook
│   │   └── lib/
│   │       └── utils.ts            # Utility functions (cn)
│   ├── public/                     # Static assets (favicon, logo, OG image)
│   ├── index.html                  # HTML entry
│   ├── vite.config.ts              # Vite config (proxy to backend on :5000)
│   ├── components.json             # shadcn/ui configuration
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                         # Shared libraries (used by both backend & frontend)
│   ├── db/                         # Database layer (Drizzle ORM + PostgreSQL)
│   │   ├── src/
│   │   │   ├── index.ts            # DB connection pool & Drizzle instance
│   │   │   └── schema/             # Table definitions
│   │   │       ├── index.ts        # Schema barrel export
│   │   │       ├── trees.ts        # Trees table
│   │   │       ├── reports.ts      # Reports table
│   │   │       ├── users.ts        # Users table
│   │   │       ├── citizens.ts     # Citizens table
│   │   │       ├── forest_officers.ts  # Forest officers table
│   │   │       ├── iot_sensors.ts      # IoT sensor readings
│   │   │       ├── ai_analysis.ts      # AI analysis results
│   │   │       ├── satellite_scans.ts  # Satellite NDVI scans
│   │   │       └── blockchain_logs.ts  # Blockchain audit logs
│   │   ├── drizzle.config.ts       # Drizzle Kit configuration
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api-spec/                   # OpenAPI specification
│   │   ├── openapi.yaml            # Full API spec (727 lines)
│   │   ├── orval.config.ts         # Code generation config
│   │   └── package.json
│   │
│   ├── api-zod/                    # Generated Zod validators (from OpenAPI)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── generated/api.ts    # Auto-generated validators
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api-client-react/           # Generated React Query hooks (from OpenAPI)
│       ├── src/
│       │   ├── index.ts
│       │   ├── custom-fetch.ts     # Custom fetch with auth token support
│       │   └── generated/          # Auto-generated API hooks
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/                        # Utility scripts
│   ├── src/
│   │   ├── hello.ts
│   │   └── create-test-officer.ts
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # pnpm workspace definition
├── tsconfig.base.json              # Shared TypeScript base config
├── tsconfig.json                   # Root TS project references
├── .npmrc                          # pnpm configuration
└── .gitignore
```

---

## 🚀 Prerequisites

Before starting, make sure you have the following installed:

| Tool          | Version   | Install Guide |
|---------------|-----------|---------------|
| **Node.js**   | ≥ 18.x    | [nodejs.org](https://nodejs.org/) |
| **pnpm**      | ≥ 8.x     | `npm install -g pnpm` |
| **PostgreSQL**| ≥ 14.x    | [postgresql.org](https://www.postgresql.org/download/) |

---

## 🛠️ Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Dot-Explorer.git
cd Dot-Explorer/Dot-Explorer
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for **all** workspace packages (backend, frontend, shared libraries, scripts).

### 3. Set Up PostgreSQL Database

#### Option A: Using the setup script

```bash
node setup-db.mjs
```

This creates the `tree_monitor` database and base tables.

#### Option B: Manual setup

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE tree_monitor;
\q
```

### 4. Push Database Schema (Drizzle)

```bash
# Push schema to database (uses Drizzle ORM)
pnpm db:push

# Or force push (drops and recreates tables)
pnpm db:push-force
```

> **Note:** The default connection string is `postgresql://postgres:postgres@localhost:5432/tree_monitor`. To customize, set the `DATABASE_URL` environment variable.

### 5. Environment Variables (Optional)

Create a `.env` file in the project root if you need custom configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tree_monitor

# Backend
PORT=5000
NODE_ENV=development
LOG_LEVEL=info

# Frontend (handled by Vite)
# The frontend dev server runs on port 5173 by default
# and proxies /api requests to the backend on port 5000
```

### 6. Start Development

#### Option 1: Run Both Servers (Recommended)
```bash
pnpm dev
```

This will start both the backend and frontend concurrently:
- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:5173

#### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
pnpm dev:backend
```
Expected output: `Server listening port: 5000`

**Terminal 2 - Frontend:**
```bash
pnpm dev:frontend
```
Expected output: `VITE v7.3.1  ready in 433 ms ➜  Local: http://localhost:5173/`

### 7. Verify Everything is Working

✅ Navigate to **http://localhost:5173** in your browser  
✅ You should see the Dot-Explorer home page  
✅ Try navigating to `/trees` or `/admin`  
✅ Backend API health check: `curl http://localhost:5000/health`

---

## 📚 Common Commands

### Development
```bash
pnpm dev              # Start both backend and frontend
pnpm dev:backend      # Start only backend (port 5000)
pnpm dev:frontend     # Start only frontend (port 5173)
pnpm build            # Build for production
pnpm format           # Format code with Prettier
pnpm lint             # Lint TypeScript files
```

### Database
```bash
pnpm db:push          # Push schema changes to database
pnpm db:push-force    # Force push (recreates tables)
pnpm db:generate      # Generate migrations from schema
pnpm db:studio        # Open Drizzle Studio (visual DB editor)
```

### Scripts
```bash
pnpm scripts:hello    # Run hello script
pnpm scripts:create-test-officer  # Create test officer
```

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| POST   | `/api/auth/citizen/signup`     | Citizen registration     |
| POST   | `/api/auth/citizen/login`      | Citizen login            |
| POST   | `/api/auth/officer/signup`     | Officer registration     |
| POST   | `/api/auth/officer/verify`     | Officer OTP verification |
| POST   | `/api/auth/officer/login`      | Officer login            |
| GET    | `/api/auth/me`                 | Get current user         |
| POST   | `/api/auth/logout`             | Logout                   |

### Trees
| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| GET    | `/api/trees`         | List trees (with filters)|
| POST   | `/api/trees`         | Plant a new tree         |
| GET    | `/api/trees/:id`     | Get tree details         |
| PATCH  | `/api/trees/:id`     | Update tree status       |
| DELETE | `/api/trees/:id`     | Delete a tree            |

### Reports
| Method | Endpoint        | Description           |
|--------|-----------------|-----------------------|
| GET    | `/api/reports`  | List all reports      |
| POST   | `/api/reports`  | Submit a new report   |

### Dashboard
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | `/api/dashboard/stats`      | Overall statistics      |
| GET    | `/api/dashboard/state-stats`| State-wise breakdown    |
| GET    | `/api/dashboard/year-stats` | Year-wise comparison    |

### Admin
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | `/api/admin/users`    | List all users     |
| POST   | `/api/admin/users`    | Create a user      |
| PUT    | `/api/admin/users/:id`| Update a user      |
| DELETE | `/api/admin/users/:id`| Delete a user      |

### Advanced Monitoring
| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | `/api/iot/:treeCode`            | Get IoT sensor data for tree   |
| POST   | `/api/iot/:treeCode`            | Submit IoT sensor reading      |
| POST   | `/api/ai/analyze`               | Submit AI analysis result      |
| GET    | `/api/ai/:treeCode`             | Get AI analysis history        |
| POST   | `/api/satellite/scan`           | Submit satellite NDVI scan     |
| GET    | `/api/satellite/red-zones`      | Get deforestation red zones    |
| POST   | `/api/blockchain/log`           | Create audit log entry         |
| GET    | `/api/blockchain/:treeCode`     | Get audit trail for tree       |
| GET    | `/api/healthz`                  | Health check                   |

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 5
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Validation:** Zod (auto-generated from OpenAPI)
- **Logging:** Pino + pino-pretty
- **Bundler:** esbuild

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** TailwindCSS 4 + shadcn/ui
- **Routing:** Wouter
- **State Management:** TanStack React Query
- **Maps:** Leaflet / React-Leaflet
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod resolvers

### Shared
- **API Contract:** OpenAPI 3.1 specification
- **Code Generation:** Orval (generates React Query hooks + Zod validators)
- **Type Safety:** Full end-to-end TypeScript with workspace references

---

## 📦 Workspace Packages

| Package                     | Location                     | Description                       |
|-----------------------------|------------------------------|-----------------------------------|
| `@workspace/api-server`     | `backend/`                   | Express API server                |
| `@workspace/tree-monitor`   | `frontend/`                  | React + Vite client application   |
| `@workspace/db`             | `shared/db/`                 | Drizzle ORM database layer        |
| `@workspace/api-spec`       | `shared/api-spec/`           | OpenAPI spec + Orval config       |
| `@workspace/api-zod`        | `shared/api-zod/`            | Generated Zod validation schemas  |
| `@workspace/api-client-react`| `shared/api-client-react/`  | Generated React Query API hooks   |
| `@workspace/scripts`        | `scripts/`                   | Utility & management scripts      |

---

## 🔧 Common Commands

```bash
# Install all dependencies
pnpm install

# Start development (backend + frontend)
pnpm dev

# Start only backend
pnpm dev:backend

# Start only frontend
pnpm dev:frontend

# Build everything
pnpm build

# Type check all packages
pnpm typecheck

# Push database schema
pnpm db:push

# Force push database schema (destructive)
pnpm db:push-force
```

---

## � Troubleshooting

### `net::ERR_CONNECTION_REFUSED` on localhost:5173
**Problem:** Frontend requests failing  
**Solution:** Ensure frontend dev server is running with `pnpm dev:frontend`

### Database Connection Error
**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`  
**Solution:** 
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `backend/.env`
3. Verify `tree_monitor` database exists
4. Run `pnpm db:push-force`

### Port Already in Use
**Problem:** `EADDRINUSE: address already in use :::5000`  
**Solution:**
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### PNPM Command Not Found
**Problem:** `pnpm: command not found`  
**Solution:**
```bash
npm install -g pnpm
```

### Module Not Found Errors
**Problem:** `Cannot find module '@...'`  
**Solution:**
```bash
rm -r node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

---

## 📖 Documentation

- **[Comprehensive Setup Guide](./README_SETUP.md)** — Detailed installation, configuration, and usage
- **[API Documentation](./backend/api-spec/openapi.yaml)** — Full OpenAPI specification
- **[Database Schema](./backend/src/db/schema/)** — Database table definitions

---

## �📝 License

MIT
#   T r e e L o c a t o r 
 
 