# 🌳 Dot-Explorer — Tree Monitoring System

A full-stack tree plantation and monitoring platform designed for forest conservation efforts. It enables tracking of planted trees, detection of deforestation using satellite NDVI data, logging IoT sensor readings, AI-based image analysis, and maintaining tamper-proof blockchain-style audit trails.

---

## 🚀 Features

* 🌱 Tree plantation tracking with unique codes
* 🛰️ Satellite NDVI-based deforestation detection
* 📡 IoT sensor data collection (temperature, moisture, etc.)
* 🤖 AI-powered tree health analysis
* 🔗 Blockchain-style audit logs for transparency
* 📊 Advanced analytics dashboard
* 👥 Role-based authentication (Citizen, Officer, Admin)
* 🗺️ Interactive map visualization (Leaflet)

---

## 📁 Project Structure

```
Dot-Explorer/
├── backend/        # Express.js API Server
├── frontend/       # React + Vite Client
├── shared/         # Shared libraries (DB, API, validation)
├── scripts/        # Utility scripts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## 🏗️ Tech Stack

### Backend

* Node.js
* Express.js 5
* Drizzle ORM
* PostgreSQL
* Zod (validation)
* Pino (logging)
* esbuild

### Frontend

* React 19
* Vite 7
* TailwindCSS 4 + shadcn/ui
* Wouter (routing)
* React Query (state management)
* Leaflet (maps)
* Recharts (charts)
* Framer Motion (animations)

### Shared

* OpenAPI 3.1
* Orval (code generation)
* Full TypeScript monorepo

---

## 📦 Workspace Packages

| Package                       | Description     |
| ----------------------------- | --------------- |
| `@workspace/api-server`       | Backend API     |
| `@workspace/tree-monitor`     | Frontend app    |
| `@workspace/db`               | Database layer  |
| `@workspace/api-spec`         | OpenAPI spec    |
| `@workspace/api-zod`          | Zod schemas     |
| `@workspace/api-client-react` | API hooks       |
| `@workspace/scripts`          | Utility scripts |

---

## 🛠️ Prerequisites

* Node.js ≥ 18.x
* pnpm ≥ 8.x
* PostgreSQL ≥ 14.x

---

## ⚙️ Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Dot-Explorer.git
cd Dot-Explorer
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Database

#### Option A (Recommended)

```bash
node setup-db.mjs
```

#### Option B (Manual)

```bash
psql -U postgres
CREATE DATABASE tree_monitor;
\q
```

### 4. Push Schema

```bash
pnpm db:push
```

---

## 🔐 Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tree_monitor
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
```

---

## ▶️ Run the Project

```bash
pnpm dev
```

* Frontend: http://localhost:5173
* Backend: http://localhost:5000

---

## 🌐 API Overview

### Authentication

* `/api/auth/citizen/signup`
* `/api/auth/citizen/login`
* `/api/auth/officer/signup`
* `/api/auth/officer/login`

### Trees

* `GET /api/trees`
* `POST /api/trees`
* `GET /api/trees/:id`

### Monitoring

* `/api/iot/:treeCode`
* `/api/ai/analyze`
* `/api/satellite/scan`
* `/api/blockchain/log`

### Dashboard

* `/api/dashboard/stats`
* `/api/dashboard/state-stats`

---

## 📊 Key Capabilities

* Real-time environmental monitoring
* Data-driven forest insights
* Scalable monorepo architecture
* Strong type safety with TypeScript
* Automated API generation (OpenAPI + Orval)

---

## 🔧 Common Commands

```bash
pnpm dev            # Start all services
pnpm build          # Build project
pnpm typecheck      # Type checking
pnpm db:push        # Push DB schema
pnpm db:push-force  # Reset DB schema
```

---

## 📜 License

MIT License

---

## 🌍 Vision

Dot-Explorer aims to empower governments, organizations, and citizens to collaboratively monitor and protect forests using modern technology like IoT, AI, and satellite data.

---
