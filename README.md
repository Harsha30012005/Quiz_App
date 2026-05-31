# 🧠 MindQuest: Gamified Quiz Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?logo=vercel&logoColor=white)](https://quiz-52y1j4457-harsha30012005s-projects.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-336791?logo=postgresql)](https://neon.tech/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Interactive-FF69B4?logo=framer)](https://www.framer.com/motion/)

**MindQuest** is a production-ready, highly interactive gamified quiz platform inspired by the engagement style of Duolingo and Duolingo Chess. It features linear path progression, passwordless email OTP authentication, streak retention algorithms, real-time level ups, and automated badges, alongside a strict dashboard separation between Admins and standard Users.

🔗 **Live Deployment**: [quiz-52y1j4457-harsha30012005s-projects.vercel.app](https://quiz-52y1j4457-harsha30012005s-projects.vercel.app)

---

## ✨ Features

### 🔒 Passwordless Email OTP Authentication
* **Frictionless Entry**: Zero passwords to remember. Users and Admins sign in by simply verifying a 6-digit OTP sent to their email.
* **Dual-Delivery System**: If SMTP credentials are configured, codes deliver directly to the user's inbox using Nodemailer. In local sandbox environments, it falls back to printing the code directly to the server CLI console.
* **Shielded Admin Login**: Admin entry requires a two-part security process: email OTP verification combined with a secret, pre-shared administrator bypass code ("Contact_Me_If_U_Need_Code").

### 🗺️ The Learning Path (Duolingo Style)
* **Progress Roadmaps**: Visual, interactive, and bouncing SVG-drawn path nodes showing your learning journey.
* **Dynamic Node States**: Completed quizzes show as Golden, active/unlocked nodes show as vibrant green with bouncing hover animations, and locked modules show as faded lock symbols.
* **Linear Unlocking**: Completing quiz node $N$ with a passing score (80% accuracy or higher) automatically unlocks node $N+1$ on the path.

### 🎮 Quiz Engine & Gamification Engine
* **Interactive Modals**: Multi-stage quiz cards featuring bouncy options, progress bars, and Framer Motion sliding verification drawers.
* **Instant Feedback**: Bouncy animations and color drawer status indicators showing immediate correctness (Green celebration drawers for correct answers; Red warning boxes displaying correct answers for errors).
* **XP & Level Systems**: Earn XP for every correct response and completed quiz. Levels automatically calculate and increment on a scaling threshold ($150\text{ XP} = 1\text{ Level}$).
* **Streaks**: A streak calculator that tracks daily activity. Practicing consecutively increments the streak, while missing a day resets it.
* **Badge System**: System analyzes performance in real-time to unlock achievements ("First Quiz", "7-Day Streak", "Quiz Master", etc.).
* **Olympics Leaderboard**: Weekly, Monthly, and All-Time tables rendering top-3 ranking positions on visual podium stages.

### 👤 Profile Customization
* **Prepopulated Avatars**: Choose from 8 unique, cute, custom-generated vector character avatars.
* **Custom Computer Uploads**: Option to upload images directly from local files. The client validates sizes under 1.5MB and saves images as base64 strings directly in the database.
* **Display Bios**: Update name, title badges, and bio status cards (max 160 characters).

### 🛠️ Admin Control Center (`/admin/*` Protected routes)
* **Dashboard Analytics**: High-level telemetry showing Total Registered Users, Global Accuracy metrics, and Quiz Participation rates.
* **Quiz Builder Console**: Form utilities to create, edit, draft, and delete quizzes and questions. Supports configuring question formats (Single Choice vs. Multiple Choices), difficulty levels, custom XP amounts, and ordering sequences.
* **User Management Table**: Monitor all players, view their stats, and grant Admin privileges directly.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Animations**: Framer Motion
* **Database & ORM**: PostgreSQL (hosted on [Neon Cloud](https://neon.tech/)), Prisma ORM (Version 7)
* **Auth & Security**: Stateless Session JWTs (encoded via `jose`), secure `httpOnly` Cookies, Middleware guards
* **Mail Delivery**: Nodemailer (supporting secure SMTP connection pools)

---

## 📂 Directory Layout

```
Quiz_app/
├── prisma/
│   ├── schema.prisma      # Database models (User, Quiz, Attempt, Badge, XPHistory)
│   └── seed.ts            # Database seed script for starter quizzes and badges
├── src/
│   ├── app/
│   │   ├── actions/       # Server Actions (quizzes, admin, auth, profile)
│   │   ├── admin/         # Admin Management dashboard, user management, and quiz builders
│   │   ├── dashboard/     # Standard user home, XP/streak telemetry
│   │   ├── leaderboard/   # Weekly/Monthly/All-time user rankings
│   │   ├── login/         # Passwordless login, OTP input, roles tab switcher
│   │   ├── path/          # Bouncy learning path SVG map
│   │   ├── profile/       # User profile details and avatar grid selection modal
│   │   ├── quiz/[id]/     # Immersive quiz-taking application and results
│   │   ├── middleware.ts  # Route guards restricting role access (/admin vs /dashboard)
│   │   └── globals.css    # Custom 3D design tokens & global CSS styles
│   ├── components/
│   │   └── Sidebar.tsx    # Responsive side drawer navigation
│   └── lib/
│       ├── jwt.ts         # JWT signing and validation
│       └── prisma.ts      # Prisma Client driver adapter initialization
├── prisma.config.ts       # Prisma 7 CLI configuration
└── package.json           # Project dependencies
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database connection URL (e.g. Neon PostgreSQL Connection String)
DATABASE_URL="postgresql://username:password@ep-host-name.aws.neon.tech/neondb?sslmode=require"

# JWT Encryption Secret (generate a secure random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration (Secure SMTP details)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE="true"  # Set to true for Port 465, false for 587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM='"MindQuest App" <your-email@gmail.com>'
```

---

## 🚀 Getting Started

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/your-username/mindquest.git
cd mindquest
npm install
```

### 2. Set up database schemas (Prisma & Neon Cloud)
Ensure the `DATABASE_URL` environment variable is active in your `.env` file, then push the schema:
```bash
npx prisma db push
```

### 3. Seed initial quizzes & badges
MindQuest has a database seed script that initializes 3 starter quizzes (JavaScript, React Hooks, Next.js App Router) and the badge criteria templates:
```bash
npx prisma db seed
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Testing Credentials (Quick Admin Setup)
* **Accessing Admin Area**: Go to `/login` and select the **Admin** tab.
* **Email**: Enter any admin email.
* **Verification**: Verify the OTP received in your email (or check terminal logs).
* **Secret Code**: Enter the default administrative bypass key: `Connect_Me` to enter.

---

## 📦 Production Compiles & Deployment

Build the application for production:
```bash
npm run build
```

Run the built server:
```bash
npm run start
```

### ☁️ Vercel Deployment Settings
When deploying to Vercel, make sure to add your environment variables (`DATABASE_URL`, `JWT_SECRET`, `SMTP_*`) under **Project Settings > Environment Variables** before triggering your build.

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
