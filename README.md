# TimeCapsule Memories 🎁

A full-stack web app where college students lock heartfelt messages for teachers and classmates, opened **5 years** (teachers) or **8 years** (students) in the future.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Supabase** account ([supabase.com](https://supabase.com)) — free tier works perfectly

### 1. Set up Database

1. Create a new Supabase project
2. Open **SQL Editor** → paste contents of [`database/schema.sql`](./database/schema.sql) → **Run**
3. Go to **Storage** → create a bucket named `capsule-media` (set to Public)

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env: add SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET

# Frontend  
cp frontend/.env.example frontend/.env
# Edit frontend/.env: add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### 3. Install & Run

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev
# → http://localhost:3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📁 Project Structure

```
time capsule/
├── frontend/               # React + Vite + TypeScript
│   └── src/
│       ├── pages/          # LandingPage, Login, Register, Dashboard, CreateCapsule, ViewCapsules, BatchManagement
│       ├── components/     # Navbar, CapsuleCard, CountdownTimer, ConfettiEffect
│       ├── contexts/       # AuthContext (JWT)
│       └── lib/            # supabase.ts, api.ts
│
├── backend/                # Node.js + Express
│   └── src/
│       ├── routes/         # auth, capsules, batches, users, notifications
│       ├── middleware/     # auth.js (JWT), supabase.js (admin client)
│       └── services/       # scheduler.js (cron), mailer.js (Nodemailer)
│
└── database/
    └── schema.sql          # Supabase PostgreSQL schema
```

---

## 🔐 Environment Variables

### `backend/.env`
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (keep secret!) |
| `JWT_SECRET` | Random string for signing JWTs |
| `PORT` | Backend port (default: 3001) |
| `SMTP_USER` | Gmail address for email notifications |
| `SMTP_PASS` | Gmail App Password ([how?](https://support.google.com/accounts/answer/185833)) |

### `frontend/.env`
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_URL` | Backend URL (default: http://localhost:3001) |

---

## ⏰ Time Lock Logic

| Recipient | Lock Duration | Unlock Year (for 2026 batch) |
|-----------|--------------|------------------------------|
| Teacher | 5 years | 2031 |
| Student | 8 years | 2034 |

The unlock date is calculated at capsule creation time. The backend scheduler (cron job) runs **every hour** to check for capsules past their unlock date and:
1. Marks them `is_unlocked = true` in the database
2. Creates in-app notifications for recipients
3. Sends beautiful HTML unlock emails (if SMTP configured)

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → connect to Vercel → set env vars → deploy
```

### Backend → Railway / Render
1. Create new project from your GitHub repo
2. Set root directory to `backend/`
3. Add all `.env` variables in the platform's env settings
4. Deploy

### Supabase (already hosted)
- Your Supabase project is already in the cloud — no extra deployment needed.

---

## 🎨 Features

- ✅ Role-based auth: Student / Teacher / Admin
- ✅ Time-locked capsules (5yr teachers, 8yr students)
- ✅ Text messages + photo/video upload (Supabase Storage)
- ✅ Live countdown timer (years · months · days · hours · min · sec)
- ✅ Confetti burst on unlock
- ✅ Scrapbook-style capsule cards
- ✅ In-app + email notifications on unlock
- ✅ Batch management (admin/teacher)
- ✅ Search + filter capsules
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Framer Motion page animations
- ✅ Typewriter effect on landing page

---

Made with ❤️ for the memories that matter.
