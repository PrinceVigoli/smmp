# SMMP - Social Media Marketing Panel

A complete SMM (Social Media Marketing) Panel website built with **Next.js 16 (App Router)** + **Tailwind CSS**.

## 🖥️ Screenshots

### Landing Page
A clean, modern light-theme landing page with hero section, features, how-it-works, and services preview.

### Dashboard
User dashboard with balance, orders overview, quick actions, and recent orders table.

### Admin Panel
Dark-themed admin sidebar with stats overview and management pages for users, orders, top-ups, and services.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: SQLite via Prisma ORM v7 + `@prisma/adapter-better-sqlite3`
- **Auth**: NextAuth.js v4 (Credentials Provider)
- **Icons**: Lucide React

---

## 📦 Setup Instructions

### 1. Clone and Install

```bash
git clone <repo-url>
cd smmp
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
SMM_API_KEY="your-smm-api-key"
SMM_API_URL="https://izzysmm.shop/api/v2"
```

### 3. Set Up the Database

```bash
# Push schema to database
npm run db:push

# Seed the admin user
npm run db:seed
```

This creates a default admin user:
- **Email**: `admin@smmp.com`
- **Password**: `admin123`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
smmp/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed admin user
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx   # Dashboard layout with sidebar
│   │   │   ├── page.tsx     # Dashboard home
│   │   │   ├── new-order/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── add-funds/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx   # Admin layout
│   │   │   ├── page.tsx     # Admin dashboard
│   │   │   ├── users/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   └── topups/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── services/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── orders/[id]/route.ts
│   │   │   ├── balance/route.ts
│   │   │   ├── topup/route.ts
│   │   │   ├── profile/route.ts
│   │   │   └── admin/
│   │   │       ├── stats/route.ts
│   │   │       ├── users/route.ts
│   │   │       ├── orders/route.ts
│   │   │       └── topups/route.ts
│   │   ├── page.tsx         # Landing page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/              # Button, Card, Badge, Input, Toast
│   │   ├── dashboard/       # Sidebar, Header, StatsCard
│   │   └── landing/         # Hero, Features, HowItWorks
│   └── lib/
│       ├── prisma.ts        # Prisma client
│       ├── auth.ts          # NextAuth config
│       ├── smm-api.ts       # SMM API wrapper
│       └── utils.ts
├── .env.example
├── prisma.config.ts
└── package.json
```

---

## 🔑 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed default admin user |
| `npm run db:generate` | Regenerate Prisma client |

---

## 📋 Features

### Public Pages
- **Landing Page** (`/`) — Hero, features, how-it-works, services preview
- **Login** (`/login`) — Email/password authentication
- **Register** (`/register`) — Account creation

### User Dashboard
- **Dashboard** (`/dashboard`) — Balance, order stats, recent orders
- **New Order** (`/dashboard/new-order`) — Browse services, search, filter by category, place orders
- **My Orders** (`/dashboard/orders`) — Order history with status, check status, request refill
- **Add Funds** (`/dashboard/add-funds`) — Submit top-up requests, view request history
- **Profile** (`/dashboard/profile`) — Account info, API key, change password

### Admin Panel
- **Dashboard** (`/admin`) — Platform overview stats
- **Users** (`/admin/users`) — Manage users and edit balances
- **Orders** (`/admin/orders`) — View all orders with status filter
- **Services** (`/admin/services`) — View all available SMM services
- **Top-ups** (`/admin/topups`) — Approve or reject top-up requests

---

## 🚢 Deployment

### Option 1: Docker (Recommended)

The easiest way to deploy SMMP is with Docker.

#### Quick Start

```bash
# 1. Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your production values

# 2. Build and start the container
docker compose up -d --build

# 3. Push the database schema
docker compose exec smmp npx prisma db push

# 4. Seed the admin user
docker compose exec smmp npx prisma db seed
```

The app will be available at `http://localhost:3000`.

#### Docker only (without Compose)

```bash
docker build -t smmp .

docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="file:./data/prod.db" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -e NEXTAUTH_SECRET="generate-a-strong-secret" \
  -e SMM_API_KEY="your-smm-api-key" \
  -e SMM_API_URL="https://izzysmm.shop/api/v2" \
  -v smmp-data:/app/data \
  --name smmp \
  smmp
```

### Option 2: Vercel

SMMP works on [Vercel](https://vercel.com) but requires switching from SQLite to a hosted database (e.g., PostgreSQL via Vercel Postgres or Neon) since Vercel's serverless functions don't support persistent file storage.

1. Push the repo to GitHub
2. Import the project on [vercel.com/new](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard
4. Deploy

### Option 3: VPS / Bare Metal

```bash
# 1. Install Node.js 20+
# 2. Clone and install
git clone <repo-url>
cd smmp
npm ci

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with production values — set NEXTAUTH_URL to your domain

# 4. Build
npm run build

# 5. Set up database
npm run db:push
npm run db:seed

# 6. Start the production server
npm run start
```

Use a process manager like [PM2](https://pm2.keymetrics.io/) to keep the app running:

```bash
npm install -g pm2
pm2 start npm --name smmp -- start
pm2 save
pm2 startup
```

Put a reverse proxy like [Nginx](https://nginx.org/) or [Caddy](https://caddyserver.com/) in front for HTTPS.

### Production Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path (e.g., `file:./data/prod.db`) |
| `NEXTAUTH_URL` | Your public URL (e.g., `https://yourdomain.com`) |
| `NEXTAUTH_SECRET` | A strong random secret — generate with `openssl rand -base64 32` |
| `SMM_API_KEY` | Your SMM API key |
| `SMM_API_URL` | SMM API endpoint |

---

## 🔒 Security

- All SMM API calls are server-side only (API key never exposed to client)
- Passwords hashed with bcrypt (12 rounds)
- Protected routes via NextAuth.js session middleware
- Admin routes protected with role check
- CSRF protection via NextAuth
