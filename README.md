<div align="center">
  <img src="https://locked-in-five-olive.vercel.app/hero-preview.png" alt="LockedIn Banner" width="100%" />

  <br />

  # 🔒 LockedIn

  ### Your Comfort Space For Building Better Days.

  A zero-knowledge encrypted, full-stack productivity platform with focus tracking, analytics, leaderboards, and social features — built for people who take deep work seriously.

  <br />

  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-locked--in--five--olive.vercel.app-000000?style=for-the-badge)](https://locked-in-five-olive.vercel.app/)
  [![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Frontend_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  [![Render](https://img.shields.io/badge/Backend_on_Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)

</div>

<br />

## 📋 Table of Contents

- [Why LockedIn?](#-why-lockedin)
- [Features](#-features)
- [Zero-Knowledge E2E Encryption](#-zero-knowledge-e2e-encryption)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

<br />

## 💡 Why LockedIn?

Most productivity apps treat your data as theirs. LockedIn is different.

Your tasks are **encrypted in your browser** before they ever leave your device. The server never sees your plaintext — not even the developer can read your to-dos. Combine that with a focus stopwatch, analytics dashboards, competitive leaderboards, and a social layer, and you get a productivity platform that respects your privacy while keeping you accountable.

<br />

## ✨ Features

### 🔐 End-to-End Encrypted Workspace
- **Client-side AES-GCM 256-bit encryption** — tasks are encrypted in the browser before transmission
- **PBKDF2 key derivation** (250,000 iterations) from your password
- **64-character recovery key** generated at signup for vault recovery
- The server stores only ciphertext — **zero-knowledge architecture**

### 📦 Day Session Boxes
- One workspace box per day (midnight IST-normalized)
- Add tasks, set deadlines, track completion status
- Timer sessions attached to each workspace box
- Complete or delete boxes with full cascade cleanup

### ⏱️ Dual Timer System
- **Workspace Timer** — start/pause/resume focus sessions tied to your workspace box
- **Standalone Stopwatch** — isolated deep-work timer with independent metrics
- Both timers maintain separate accumulators to prevent data interference
- Zero-render atomic state engine using `useSyncExternalStore` for 60fps performance

### 📊 Analytics Dashboard
- **Current & longest streaks** tracking
- **30-day consistency percentage**
- **Weekly focus hours** bar chart
- **365-day activity heatmap** with 5 intensity levels
- **Most productive day** identification
- Retro **dither-kit** canvas-rendered charts (custom library using D3 scales)

### 🏆 Global Leaderboard
- Real-time competitive focus rankings
- **4-tier tie-breaker algorithm**: Focus XP → Current Streak → All-Time Streak → Account Age
- Top 3 champion podium with animated stack
- 10-level badge progression system (Feather → Crowned)
- Swiper.js coverflow badge showcase carousel
- 60-second TTL in-memory cache for performance

### 📅 Calendar
- Apple Calendar-inspired month & day timeline views
- Event categorization: Normal, Important, Birthday
- Real-time red timeline indicator bar
- Tomorrow's birthday & important event notification toasts
- Auto-polling every 12 hours for upcoming events

### 👤 User Profiles & Social
- Customizable bio, avatar selection, and social links (X, LinkedIn, YouTube, Instagram, Medium)
- Follow/unfollow system with real-time notifications
- Active days counter and level badge unlock progression
- User search (case-insensitive, ReDoS-safe regex)

### ⚙️ Settings & Personalization
- **10 font themes**: Inter, Playfair, Space Mono, Righteous, Cinzel, Bangers, Caveat, Chakra Petch, Milkshake, Pixeloid
- UI scale multiplier (zoom slider)
- Text brightness adjustment
- Fullscreen toggle (`F` keyboard shortcut)
- All preferences persisted in `localStorage`

### 🎨 Design & UX
- Glassmorphism, dynamic gradients, and smooth micro-interactions
- Scroll-driven landing page animations powered by Framer Motion
- WebGL shader backgrounds
- Lottie animations
- Fully responsive — desktop, tablet, and mobile
- Custom retro typography with Eurostile, Manrope, and Pixeloid font families

<br />

## 🔐 Zero-Knowledge E2E Encryption

LockedIn implements a **zero-knowledge encryption model** where the server never has access to your plaintext data. Here's how it works:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR BROWSER (CLIENT)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Password / Recovery Key                                    │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                    │
│  │  PBKDF2 (SHA-256, 250K iterations)  │                    │
│  │  + Random 16-byte Salt              │                    │
│  └──────────────┬──────────────────────┘                    │
│                 ▼                                           │
│  ┌──────────────────────────┐                               │
│  │  KEK (Key Encryption Key) │ ◄── Derived, never stored    │
│  │  AES-GCM 256-bit          │                              │
│  └──────────┬───────────────┘                               │
│             │                                               │
│             ▼                                               │
│  ┌──────────────────────────┐    ┌────────────────────────┐ │
│  │  Encrypt/Decrypt DEK     │───►│  DEK (Data Enc. Key)   │ │
│  │  (12-byte IV, AES-GCM)   │    │  Random 256-bit        │ │
│  └──────────────────────────┘    └──────────┬─────────────┘ │
│                                             │               │
│                                             ▼               │
│                                  ┌─────────────────────┐    │
│                                  │  Encrypt/Decrypt     │    │
│                                  │  Task Descriptions   │    │
│                                  │  (AES-GCM + 12B IV)  │    │
│                                  └─────────────────────┘    │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    Only ciphertext
                    leaves your device
                           │
                           ▼
              ┌────────────────────────┐
              │   SERVER (MongoDB)      │
              │                        │
              │  • encryptedDEK_pwd    │
              │  • encryptedDEK_rec    │
              │  • encryptedDescription│
              │  • Salts & iterations  │
              │                        │
              │  ⛔ No plaintext ever   │
              └────────────────────────┘
```

**Key guarantees:**
- Passwords are hashed with **bcrypt** on the server — never stored in plain text
- DEK is encrypted twice — once with password-derived KEK, once with recovery-key-derived KEK
- Vault key resets invalidate all existing JWT sessions instantly via `lastVaultResetAt` timestamp
- Recovery key is shown **once** at signup and never stored anywhere

<br />

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework with latest concurrent features |
| **Vite 8** | Lightning-fast build tooling & HMR |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Scroll-driven animations & layout transitions |
| **Lottie React** | Vector animations |
| **Swiper.js** | Touch-enabled carousels |
| **D3 Scale + Shape** | Data visualization primitives for dither-kit |
| **Web Crypto API** | Browser-native AES-GCM & PBKDF2 encryption |
| **Radix UI** | Accessible headless component primitives |
| **Lucide React** | Icon library |
| **React Router v7** | Client-side routing with lazy loading |
| **Google OAuth** | Social authentication |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM with compound indexing |
| **JWT** | Stateless authentication (HTTP-only cookies + Bearer) |
| **bcrypt** | Password hashing |
| **Zod** | Runtime request validation |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | API rate limiting & DDoS protection |
| **Winston** | Structured logging with slow-query monitoring |
| **Nodemailer** | Transactional email delivery |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend hosting + SPA deployment |
| **Render** | Backend API server hosting |
| **MongoDB Atlas** | Cloud-hosted database |
| **Vercel Serverless Functions** | Email delivery service (Render blocks outgoing SMTP to prevent spam) |

<br />

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                          │
│                                                                    │
│  React 19 SPA ──► Web Crypto API (E2E Encryption)                 │
│       │                                                            │
│       ├── CryptoContext (DEK in memory + sessionStorage)           │
│       ├── SettingsContext (fonts, scale, brightness → localStorage)│
│       └── CalendarNotificationProvider (12h polling + toasts)      │
│                                                                    │
│  Dual Auth: HTTP-only Cookie + Bearer Token (localStorage)         │
└────────────────────────────┬───────────────────────────────────────┘
                             │  HTTPS (REST API)
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                      SERVER (Express 5 on Vercel)                  │
│                                                                    │
│  Middleware Pipeline:                                              │
│  cors → helmet → cookie-parser → rate-limiters → auth → perf-log  │
│                                                                    │
│  Layers:                                                           │
│  routes/ → controller/ → models/ → database/                      │
│            validators/ (Zod)                                       │
│            Services/ (Email)                                       │
│            utils/ (Cache, Logger)                                  │
│                                                                    │
│  Key Features:                                                     │
│  • In-memory TTL cache (60s) with invalidation hooks               │
│  • Slow-query monitoring (>300ms threshold)                        │
│  • IST timezone normalization for streak calculations              │
│  • Graceful shutdown (SIGINT/SIGTERM)                              │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  MongoDB Atlas   │
                    │  (maxPoolSize:50)│
                    └──────────────────┘
```

<br />

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google OAuth Client ID** (for Google sign-in)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramanraj00/LockedIn.git
   cd LockedIn
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

   Start the frontend dev server:
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

<br />

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: `3000`) | No |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `FRONTEND_URL` | Frontend origin for CORS | Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | Yes |

<br />

## 📁 Project Structure

```
LockedIn/
├── backend/
│   ├── index.js                 # Express server entry point
│   ├── package.json
│   ├── vercel.json              # Vercel serverless deployment config
│   ├── controller/
│   │   └── auth.controller.js   # Auth & user management logic
│   ├── routes/
│   │   ├── auth.js              # Auth & profile endpoints
│   │   ├── task.js              # Encrypted task CRUD
│   │   ├── sessions.js          # Timer & stopwatch endpoints
│   │   ├── calendar.route.js    # Calendar event CRUD
│   │   ├── dashboards.js        # Analytics & heatmap data
│   │   └── leaderboard.routes.js # Global rankings
│   ├── models/
│   │   ├── users.js             # User schema (with crypto fields)
│   │   ├── tasks.js             # Encrypted task schema
│   │   ├── daysession.js        # Workspace day box schema
│   │   ├── studysession.js      # Timer session chunk schema
│   │   ├── calendar.js          # Calendar event schema
│   │   └── notification.js      # Follow notification schema
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT + vault reset validation
│   │   ├── performance.js       # Response time logging
│   │   └── uservalidation.js    # Zod schema validation
│   ├── validators/              # Zod validation schemas
│   ├── Services/
│   │   └── emailServices.js     # Password reset email service
│   ├── database/
│   │   └── db.js                # MongoDB connection + monitoring
│   └── utils/
│       ├── cache.js             # In-memory TTL cache engine
│       └── logger.js            # Winston structured logger
│
├── frontend/
│   ├── index.html               # SPA entry with OG metadata
│   ├── package.json
│   ├── vite.config.js           # Vite 8 build config
│   ├── tailwind.config.js       # Custom font extensions
│   ├── vercel.json              # SPA rewrite rules
│   ├── api/
│   │   └── sendEmail.js         # Vercel serverless email function
│   ├── public/
│   │   ├── avatars/             # Profile avatar images
│   │   ├── badges/              # 10-tier level badge images
│   │   └── fonts/               # Custom typography (Eurostile, Manrope, Pixeloid)
│   └── src/
│       ├── App.jsx              # Routes & lazy loading
│       ├── apiClient.js         # Fetch wrapper with auth headers
│       ├── main.jsx             # React DOM entry
│       ├── context/
│       │   ├── CryptoContext.jsx             # E2E encryption state
│       │   ├── SettingsContext.jsx           # Font, scale, brightness
│       │   └── CalendarNotificationProvider.jsx # Event notifications
│       ├── utils/
│       │   └── e2eMasterKey.js  # Web Crypto API encryption library
│       ├── pages/
│       │   ├── landing.jsx      # Marketing landing page
│       │   ├── login.jsx        # Auth page
│       │   ├── Leaderboard.jsx  # Global rankings
│       │   └── Settings.jsx     # App configuration
│       └── components/
│           ├── workspace/       # E2E encrypted task workspace
│           ├── stopwatch/       # Focus timer (zero-render engine)
│           ├── Analytics/       # Charts & stats dashboard
│           ├── Calendar/        # Event scheduler
│           ├── Profile/         # User profile & social
│           ├── Sidebar/         # Navigation drawer
│           ├── session/         # Timer session cards
│           ├── loginpages/      # Auth flows & protected routes
│           ├── showcase/        # Landing page feature sections
│           ├── dither-kit/      # Custom retro chart library
│           ├── hero/            # Landing hero section
│           ├── shaderbackground/ # WebGL shader visuals
│           ├── ui/              # Shadcn/Radix primitives
│           └── common/          # Shared components
│
└── README.md
```

<br />

## 📡 API Reference

### Authentication & Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ✗ | Register with email/password + E2E key generation |
| `POST` | `/api/auth/signin` | ✗ | Login with credentials, returns crypto params |
| `POST` | `/api/auth/google-auth` | ✗ | Google OAuth authentication |
| `POST` | `/api/auth/logout` | ✗ | Clear session cookie |
| `GET` | `/api/auth/check-auth` | ✓ | Verify active session |
| `GET` | `/api/auth/me` | ✓ | Get logged-in user profile |
| `GET` | `/api/auth/profile/:id` | ✗ | Get public user profile |
| `PUT` | `/api/auth/profile` | ✓ | Update profile details |
| `PUT` | `/api/auth/profile/links` | ✓ | Update social links |
| `GET` | `/api/auth/search?q=` | ✗ | Search users by name/username |
| `POST` | `/api/auth/forgetPassword` | ✗ | Request password reset email |
| `GET` | `/api/auth/verify-reset-token/:token` | ✗ | Verify reset token |
| `POST` | `/api/auth/reset-password/:token` | ✗ | Reset password |
| `POST` | `/api/auth/setup-keys` | ✓ | Initialize vault crypto keys |
| `POST` | `/api/auth/reset-vault-keys` | ✓ | Reset vault encryption keys |

### Social

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/follow/:id` | ✓ | Toggle follow/unfollow |
| `GET` | `/api/auth/follow-data/:id` | ✓ | Get followers & following lists |
| `GET` | `/api/auth/notifications` | ✓ | Get latest 20 notifications |
| `PUT` | `/api/auth/notifications/read` | ✓ | Mark all notifications as read |
| `GET` | `/api/auth/public-stats` | ✗ | Total users & sessions count |

### Tasks (E2E Encrypted)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/task/addtask` | ✓ | Create encrypted task |
| `GET` | `/api/task/gettask/:daySessionId` | ✓ | Get encrypted tasks for a day |
| `PATCH` | `/api/task/patchtask/:taskId` | ✓ | Toggle task completion |
| `DELETE` | `/api/task/deletetask/:taskId` | ✓ | Delete task |

### Sessions & Timers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/session/day/add` | ✓ | Create today's workspace box |
| `GET` | `/api/session/day/all` | ✓ | Get all workspace boxes |
| `PATCH` | `/api/session/day/:id` | ✓ | Update box title/deadline/status |
| `DELETE` | `/api/session/day/:id` | ✓ | Delete box (cascade) |
| `PATCH` | `/api/session/day/:id/complete` | ✓ | Complete workspace box |
| `POST` | `/api/session/session/start` | ✓ | Start workspace timer |
| `POST` | `/api/session/session/:id/resume` | ✓ | Resume paused timer |
| `PATCH` | `/api/session/session/:id/pause` | ✓ | Pause running timer |
| `DELETE` | `/api/session/session/:id` | ✓ | Delete timer chunk |
| `GET` | `/api/session/day/:id/sessions` | ✓ | Get timer chunks for a day |
| `DELETE` | `/api/session/day/:id/sessions/reset` | ✓ | Reset workspace timers |
| `POST` | `/api/session/stopwatch/start` | ✓ | Start stopwatch session |
| `POST` | `/api/session/stopwatch/stop` | ✓ | Stop stopwatch session |
| `GET` | `/api/session/stopwatch/today-stats` | ✓ | Today's stopwatch stats |

### Calendar

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/calendar/` | ✓ | Get all events |
| `POST` | `/api/calendar/` | ✓ | Create event |
| `PUT` | `/api/calendar/:id` | ✓ | Update event |
| `DELETE` | `/api/calendar/:id` | ✓ | Delete event |

### Analytics & Leaderboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/profile` | ✓ | Streaks, focus time, consistency |
| `GET` | `/api/dashboard/weekly-chart` | ✓ | Last 7 days focus hours |
| `GET` | `/api/dashboard/heatmap` | ✓ | 365-day activity heatmap |
| `GET` | `/api/leaderboard/` | ✓ | Global rankings (paginated, cached) |

### Health Check

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | ✗ | Database connection status |

<br />

## 🚢 Deployment

The frontend and backend are deployed on **separate platforms** for optimal performance and reliability.

### Frontend → Vercel
```bash
cd frontend
vercel --prod
```
- SPA rewrite rule (`/(.*) → /index.html`) configured in `vercel.json`
- Vercel Serverless Functions handle email delivery (`api/sendEmail.js`) since Render blocks outgoing SMTP to prevent spam abuse

### Backend → Render
- Deployed as a **Web Service** on [Render](https://render.com/)
- Auto-deploys from the `backend/` directory
- `vercel.json` in backend is kept as a fallback config

<br />

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

<br />

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

<br />

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ramanraj00">Raman Raj</a></p>
  <p>
    <a href="https://locked-in-five-olive.vercel.app/">Live Demo</a>
    ·
    <a href="https://github.com/ramanraj00/LockedIn/issues">Report Bug</a>
    ·
    <a href="https://github.com/ramanraj00/LockedIn/issues">Request Feature</a>
  </p>
</div>
