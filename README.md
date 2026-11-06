# TypeFlow ⚡

🚀 Live Demo: https://typeflow-frontend.onrender.com

> **TypeFlow** is a modern, full-stack typing practice and personalized learning web application inspired by Monkeytype, built with high performance, beautiful aesthetics, and intelligent learning features.

TypeFlow goes beyond simple speed tests by actively identifying your **weak words**, analyzing typing bottlenecks (mistyped letters, slow character pairings, hesitation duration), and **automatically generating targeted drill tests** that dynamically repeat difficult words in both repetitive and natural sentence contexts.

---

## ✨ Key Features

### 1. Minimalist, Distraction-Free Typing Engine
- **Live Performance Metrics**: Real-time Words Per Minute (WPM), Raw WPM, Accuracy %, and live remaining time / word count progress.
  - $\text{WPM} = \frac{\text{Correct Characters} / 5}{\text{Elapsed Minutes}}$
  - $\text{Raw WPM} = \frac{\text{Total Characters} / 5}{\text{Elapsed Minutes}}$
  - $\text{Accuracy} = \frac{\text{Correct Characters}}{\text{Total Typed Characters}} \times 100$
- **Multiple Modes**:
  - **Time Mode**: 15s, 30s, 60s, 120s
  - **Words Mode**: 10, 25, 50, 100 words
  - **Quote Mode**: Famous tech and philosophical quotes with author attributions
  - **Sentence Mode**: Structured English sentences with natural punctuation
  - **Custom Text Mode**: Paste or type any arbitrary text to practice
  - **Targeted Weak Words Mode**: Dynamically drill your weakest words
  - **Zen Mode**: Continuous typing without timer limits
- **Punctuation & Numbers Toggles**: Inject punctuation marks and numbers on demand.
- **Smooth Animated Caret**: Choice of Line (`|`), Block (`█`), Underline (`_`), and Outline (`▢`) with millisecond-level position interpolation.
- **Sound Synthesis**: Real-time Web Audio API synthesized keyboard feedback (Tactile Cherry Blue switches, vintage mechanical Typewriter, soft Pop, or Mute) with zero external asset latency.

### 2. Weak Words Analysis (Signature Feature)
- Dedicated analytics engine storing per-word metrics:
  - Total attempts
  - Mistake frequency
  - Error percentage ($\%$)
  - Average typing duration (milliseconds)
  - Last practiced date
- **Color-Coded Status Tiers**:
  - 🔴 **Critical Weak** ($>25\%$ error rate)
  - 🟡 **Needs Practice** ($10\% - 25\%$ error rate)
  - 🟢 **Mastered** ($<10\%$ error rate)
- Interactive dashboard with filtering (Top 10 Weakest, Most Mistakes, Critical Weak, Needs Practice, Mastered) and instant search.

### 3. Targeted Word Practice Generator
- **"Practice My Weak Words"**: One-click generation of personalized tests pulling directly from your weakest database records.
- **Configurable Scope**: Top 5, Top 10, Top 20, All Weak Words, or custom entered words.
- **Intelligent Word Distribution**: High-frequency repetition of difficult words seamlessly woven with natural English connector words.
- **Sentence Mode**: Generates grammatically coherent sentences embedding your specific weak words.
- **Instant Result Screen Drill**: After completing any test, click "Practice Missed Words" to immediately drill any word you mistyped.

### 4. Activity Heatmap & Deep Analytics
- **GitHub-Style 365-Day Activity Calendar**: Visual grid of all 52 weeks with 4 intensity levels based on daily practice duration, complete with hover tooltips displaying tests, minutes, and average WPM.
- **Daily Activity Graph**: Switchable between `7D`, `30D`, `6M`, and `1Y` views.
- **Monthly Activity Graph**: 12-month historical breakdown of practice minutes and average WPM.
- **Speed & Accuracy Trendline**: Recharts progression curve tracking your long-term speed velocity.
- **Lifetime Statistics**: Total practice time, total words, total tests, peak WPM (PB), average accuracy, and current/longest daily streaks.

### 5. Configurable Themes & Visual Customization
- **Themes**:
  - `TypeFlow Dark` (Default obsidian with violet/cyan accents)
  - `Midnight Cyber` (Deep navy with neon cyan)
  - `Retro Amber` (Warm golden amber on dark charcoal)
  - `Forest Mint` (Deep spruce with emerald mint)
  - `Dracula Night` (Iconic purple, pink, and cyan)
  - `Minimal Light` (Crisp clean paper white with indigo)
- **Monospace Fonts**: JetBrains Mono, Fira Code, Roboto Mono.
- **Font Sizes**: Small (18px), Medium (22px), Large (26px), Extra Large (30px).

### 6. Authentication & User Profile
- Secure email/password registration with bcrypt password hashing (10 rounds) and JWT authentication.
- **One-Click Demo Account**: Instant access to `demo@typeflow.app` preloaded with 150+ historical tests, 365-day activity records, and 30+ tracked weak words for immediate evaluation.
- Profile management with password updates and display name customization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Canvas Confetti |
| **Audio Engine** | Web Audio API (Synthesized oscillators and biquad filters) |
| **Backend** | Node.js, Express, TypeScript, tsx, CORS, dotenv, jsonwebtoken, bcryptjs |
| **Database & ORM** | Prisma ORM with SQLite (Default zero-config local) or PostgreSQL / Supabase |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Tab</kbd> | Restart current test |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | Generate completely new test / text |
| <kbd>Enter</kbd> | Start test or confirm result / restart on result screen |
| <kbd>Esc</kbd> | Close modals or exit custom input screen |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | Open Settings view |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd> | Open Targeted Weak Words practice |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **npm** v9+

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "TYPING PRO"

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Initialize Prisma SQLite database
npx prisma db push

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Default `backend/.env` contents:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="typeflow_super_secure_jwt_secret_key_2026"
NODE_ENV=development
```

### 3. Run Development Servers
From the root directory, run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
- **Backend**:
  ```bash
  npm run dev:backend
  # Backend runs at http://localhost:5000
  ```
- **Frontend**:
  ```bash
  npm run dev:frontend
  # Frontend runs at http://localhost:3000
  ```

Open your browser at **`http://localhost:3000`**.

---

## 🗄️ Database Options: SQLite vs PostgreSQL / Supabase

TypeFlow uses **Prisma ORM** for fully typed relational schema definitions.

### Default Local SQLite
The default setup uses SQLite (`backend/prisma/dev.db`), allowing the application to run out of the box with zero external database services required.

### Switching to PostgreSQL or Supabase
To connect to a managed PostgreSQL database (e.g. Supabase, Neon, Railway, or AWS RDS):
1. In `backend/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `backend/.env` with your connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
   ```
3. Run Prisma migration:
   ```bash
   cd backend
   npx prisma db push
   ```

---

## 📦 Project Structure

```
TYPING PRO/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma relational schema (User, TypingTest, WordStatistic, DailyActivity, UserSettings)
│   │   └── dev.db              # SQLite database file
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts         # /api/auth (register, login, demo, me)
│   │   │   ├── typingTests.ts  # /api/typing-tests (submit test, history, summary)
│   │   │   ├── weakWords.ts    # /api/weak-words (tracking, targeted test generator)
│   │   │   ├── analytics.ts    # /api/analytics (heatmap, daily, monthly, progress)
│   │   │   └── user.ts         # /api/user (profile, settings)
│   │   ├── seed/
│   │   │   └── demoData.ts     # Realistic demo seeder (150+ tests, 365d heatmap, 30 weak words)
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── index.ts            # Express server initialization
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── test/TypingArea.tsx
│   │   │   ├── test/ResultScreen.tsx
│   │   │   ├── weakwords/WeakWordsDashboard.tsx
│   │   │   ├── weakwords/TargetedPracticeModal.tsx
│   │   │   ├── analytics/AnalyticsDashboard.tsx
│   │   │   ├── history/TypingHistory.tsx
│   │   │   ├── settings/SettingsView.tsx
│   │   │   ├── profile/ProfileModal.tsx
│   │   │   └── auth/AuthModal.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/
│   │   │   └── useTypingEngine.ts # Core keystroke, WPM, and timeline engine
│   │   ├── utils/
│   │   │   ├── soundEngine.ts     # Web Audio API keyboard synthesizer
│   │   │   └── textGenerator.ts   # Word banks, quotes, and punctuation injector
│   │   ├── types/index.ts         # Full frontend TypeScript definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css              # Themes, CSS variables, and caret styles
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── .env.example
├── package.json
└── README.md
```

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```
Set the environment variable `VITE_API_URL` to your production backend URL.

### Backend (Render / Railway / Fly.io / AWS ECS)
```bash
cd backend
npm run build
npm start
```
Configure environment variables:
- `PORT` (e.g. 5000 or dynamic `$PORT`)
- `DATABASE_URL` (PostgreSQL / Supabase connection string)
- `JWT_SECRET` (A strong random secret)
- `NODE_ENV=production`

---

## 📄 License
MIT © Vedant. All rights reserved.
