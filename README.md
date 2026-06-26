# Neighborly Services Monorepo

This project is organized in a professional full-stack structure:

- `frontend/` → React + TypeScript + Vite UI
- `backend/` → Node.js + Express + MongoDB API

## Folder Layout

```text
neighborly-services-main/
  frontend/
    src/
    public/
    package.json
  backend/
    src/
      models/
      routes/
      middleware/
      scripts/
    package.json
  package.json
```

## Setup

```bash
npm run install:all
```

## Run Full Stack

```bash
npm run dev
```

- Frontend runs from `frontend/`
- Backend runs from `backend/`

## Useful Commands

```bash
npm run dev:frontend
npm run dev:backend
npm run seed
npm run build
npm run lint
npm run test
```

## Environment Files

- Frontend: `frontend/.env` (example: `frontend/.env.example`)
- Backend: `backend/.env` (example: `backend/.env.example`)
