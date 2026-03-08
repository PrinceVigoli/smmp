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

## 🔒 Security

- All SMM API calls are server-side only (API key never exposed to client)
- Passwords hashed with bcrypt (12 rounds)
- Protected routes via NextAuth.js session middleware
- Admin routes protected with role check
- CSRF protection via NextAuth
