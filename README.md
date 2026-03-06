# Project Management App

Full-stack project management application with:
- ASP.NET Core Minimal API (`backend/ProjectManagement.Api`)
- React + Vite frontend (`frontend/project-management-ui`)
- PostgreSQL database

## Features

- Sign up / sign in
- Projects CRUD
- Task CRUD with status
- Project invitations (send / accept / decline / cancel)
- Participant management:
  - creator can remove participants
  - participant can leave project
  - participant task assignments in that project are removed on leave/remove
- Seeded demo data on first app start

## Repository Structure

- `backend/ProjectManagement.Api` - API, EF Core, migrations, seeding
- `frontend/project-management-ui` - React UI
- `Dockerfile` - single image containing API + built frontend static files
- `docker-compose.yml` - app + PostgreSQL services

## Prerequisites

For local (non-Docker) development:
- .NET SDK 10
- Node.js 22+
- PostgreSQL 17+ (or compatible)

For containerized run:
- Docker + Docker Compose

## Quick Start (Recommended: Docker Compose)

From repository root:

```bash
docker compose up --build
```

App: `http://localhost:8080`

### Next runs

Use `--build` only when code/image changed:

```bash
docker compose up
```

Background mode:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

Stop and remove DB volume:

```bash
docker compose down -v
```

## Local Development (Without Docker)

### Backend

```bash
cd backend/ProjectManagement.Api
dotnet restore
dotnet run
```

API endpoints are available under `https://localhost:5001/api` in Development.

### Frontend

```bash
cd frontend/project-management-ui
npm ci
npm run dev
```

Vite proxies `/api` calls to `https://localhost:5001`.

## Demo Seed Data

On empty database, startup seeds:
- 7 users
- 14 projects
- 84 tasks
- 11 invitations

Demo users:
- `alice@example.com`
- `bob@example.com`
- `carol@example.com`
- `dave@example.com`
- `emma@example.com`
- `frank@example.com`
- `grace@example.com`

Password for all seeded users: `password123`

## Build Checks

Backend:

```bash
cd backend/ProjectManagement.Api
dotnet build
```

Frontend:

```bash
cd frontend/project-management-ui
npm run build
```

## Common Issue

If app container logs show DB connection errors to `localhost:5432`, it means app cannot see your host DB from inside container.

Use `docker compose up` (recommended), or pass a container-safe connection string via environment variables.
