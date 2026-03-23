# User Module Application (Turborepo)

A production-ready Full Stack application built with NestJS, React, Vite, Tailwind CSS, and Prisma ORM.

## Tech Stack
- **Monorepo:** Turborepo
- **Backend:** NestJS, Prisma ORM, PostgreSQL, class-validator
- **Frontend:** React, Vite, Tailwind CSS (Glassmorphism), Zustand, React Query, Axios
- **External Integrations:** didit.me (KYC API)

## Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running
- npm/yarn/pnpm

## Installation

1. Install dependencies at the root level:
```bash
cd conceps
npm install
```

2. Setup Environment Variables:
Copy `.env.example` to `.env` in both `apps/server` and `apps/client`, and configure them. Specifically, set your `DATABASE_URL` in `apps/server/.env`.

3. Generate Prisma Client and Run Migrations:
```bash
npm run db:generate
npm run db:migrate
```

## Running the App

You can run both the server and client concurrently from the root directory via Turbo:
```bash
npm run dev
```
Alternatively:
- **Server:** `cd apps/server && npm run start:dev` (runs on http://localhost:3000)
- **Client:** `cd apps/client && npm run dev` (runs on http://localhost:5173)

## Testing
A `postman_collection.json` has been included in the root directory. Import this into Postman to test backend APIs independently. For OTPs, during development, the backend logs the generatedOTP to the server console instead of sending real SMS. Use that OTP for verification.
