# ✦ InterviewAce AI — Modern AI Mock Interview SaaS Platform
> **"Prepare. Practice. Improve. Get Hired."**  
> *A professional, production-ready MERN-stack mock interview platform engineered for Computer Science graduates and tech job seekers.*

---

## 📌 Project Overview
**InterviewAce AI** is a startup-quality SaaS platform that simulates realistic technical and HR interview rounds. Candidates select their target job track, customize difficulty levels, upload their PDF resume for personalized questions, speak or type answers in real-time, and receive instant rubric-based evaluation scores (1–10) with actionable diagnostics.

### 🌟 Key Highlights
- **Modern White SaaS Design**: Sleek `#FAFAFA` palette, crisp borders, subtle shadows, and indigo accent inspired by top-tier modern productivity products (Linear, Vercel).
- **Voice & Text Hybrid Workspace**: Seamless turn-by-turn interview simulation with Web Speech API text-to-speech narration and microphone speech-to-text transcription.
- **Contextual AI Question Generation**: Dynamically crafts questions based on **Role**, **Interview Type**, **Experience Level**, and **Uploaded PDF Resume**.
- **Rigid 5-Dimension Rubric Scoring**: Answers are evaluated on *Correctness*, *Relevance*, *Technical Depth*, *Completeness*, and *Communication Clarity*.
- **Comprehensive Diagnostic Reports**: Radial score meters, category breakdowns, highlighted strengths, and specific missing edge cases.
- **Complete Session History**: Search and inspect past mock interviews question by question.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Design System, React Router v7, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ORM, JWT, bcryptjs |
| **Speech Engine** | Browser Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`) |
| **Document Processing**| `multer` (in-memory buffer) & `pdf-parse` for fast PDF resume text extraction |
| **AI Evaluation Engine** | Dynamic AI Service with Gemini API support + intelligent domain heuristic fallback |

---

## 📐 System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    CLIENT (BROWSER)                    │
                               │  Vite + React (SPA) • Modern White CSS Design System   │
                               │  Web Speech API (TTS & STT) • Audio Wave Visualizer    │
                               └───────────┬────────────────────────────────┬───────────┘
                                           │ HTTPS / REST                   │
                                           ▼                                │
                 ┌──────────────────────────────────────────────────┐       │
                 │              EXPRESS / NODE.JS BACKEND           │       │
                 │                                                  │       │
                 │  • JWT Authentication Middleware                 │       │
                 │  • Interview Orchestration Controller            │       │
                 │  • PDF Resume Text Parser (pdf-parse)            │       │
                 │  • Rubric Evaluation & Scoring Pipeline          │       │
                 └──────────────┬─────────────────────────┬─────────┘       │
                                │                         │                 │
                                ▼                         ▼                 │
                 ┌──────────────────────┐  ┌──────────────────────────────┐ │
                 │  MONGODB DATABASE    │  │       AI LLM SERVICE         │ │
                 │  (Mongoose ORM)      │  │  • Contextual Question Gen   │ │
                 │  • Users & Profiles  │  │  • 5-Criteria Rubric Eval    │ │
                 │  • Interviews & State│  │  • Actionable Diagnostics    │ │
                 └──────────────────────┘  └──────────────────────────────┘ │
                                                                            ▼
                                                           [Local Browser Engine]
                                                           • SpeechSynthesis (TTS)
                                                           • SpeechRecognition (STT)
```

---

## 🖥️ Screen & UX Flow

1. **Landing Page (`/`)**: High-converting SaaS landing page with product preview frame, value proposition, and feature grid.
2. **Authentication (`/login` & `/register`)**: Clean cards with 1-click Demo Account button for instant recruiter evaluation.
3. **Dashboard (`/dashboard`)**: Metric cards (*Total Interviews, Average Score, Top Score*), quick-start action, and recent interviews table.
4. **Interview Configurator (`/interview/new`)**: Interactive role tiles, type segmented buttons, question count selector, and PDF resume dropper.
5. **Interview Room (`/interview/:id`)**: Distraction-free workspace with AI pulsing orb, question audio reader, voice recording button, waveform visualizer, and manual keyboard toggle.
6. **Answer Evaluation Transition**: Real-time `"AI is analyzing your answer against technical criteria..."` state.
7. **Interview Results (`/interview/:id/result`)**: SVG Radial score meter, 4-category bar breakdown, Strengths, Areas to Improve, and Recommendations.
8. **Interview History (`/history`)**: Filterable, searchable list of all completed mock interviews.
9. **Question Deep-Dive (`/history/:id`)**: Full question-by-question review of submitted answers, scores, and missed concepts.
10. **Profile & Settings (`/profile` & `/settings`)**: Career track management, speech speed adjuster, and test audio playback.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Quick Start (Run Both Client and Server)

```bash
# 1. Install all dependencies for root, server, and client
npm run install:all

# 2. Start both server (port 5000) and client (port 5173) concurrently
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📂 Project Directory Structure

```
InterviewAce AI/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # ScoreRadial, ProgressBar, WaveVisualizer
│   │   │   └── layout/         # DashboardLayout, Sidebar, Header, MobileNav
│   │   ├── context/            # AuthContext (JWT & User state)
│   │   ├── hooks/              # useSpeech (Web Speech API integration)
│   │   ├── pages/              # 12 production screens (Landing, Room, Result...)
│   │   ├── services/           # api.js (REST fetch client)
│   │   ├── index.css           # Modern White SaaS Design System
│   │   └── App.jsx             # React Router v7 configuration
│   └── package.json
│
├── server/                     # Express.js Backend
│   ├── config/                 # db.js (Mongoose connection)
│   ├── controllers/            # authController, interviewController, userController
│   ├── middleware/             # auth.js (JWT protect), upload.js (Multer PDF)
│   ├── models/                 # User.js, Interview.js
│   ├── routes/                 # authRoutes, interviewRoutes, userRoutes
│   ├── services/               # aiService.js (Question gen & Rubric eval), resumeParser.js
│   ├── server.js               # Express entry point
│   ├── .env                    # Environment configuration
│   └── package.json
│
├── package.json                # Root concurrent scripts
└── README.md                   # Project documentation
```

---

## 🔑 Environment Variables (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/interviewace
JWT_SECRET=interviewace_super_secret_jwt_key_2026_portfolio_prod
CLIENT_URL=http://localhost:5173

# Optional: Add your Gemini or OpenAI API key to enable external cloud LLM.
# If left blank, the built-in AI engine evaluates responses using domain heuristics!
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

## 👨‍💻 Engineering Highlights for Resume / Portfolio
- **Architected Turn-Based Stateful AI Interviews**: Designed MongoDB state tracking supporting session resume, turn progression, and dynamic question generation.
- **Implemented Pure CSS SaaS Design System**: Built a modern white design system with responsive layouts, CSS variables, and fluid typography without third-party utility bloat.
- **Browser-Native Voice Integration**: Integrated Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`) with fallback keyboard editing, saving infrastructure costs.
- **Resume-Driven Personalization**: Built server-side buffer parsing with `pdf-parse` to feed candidate project tech stacks directly into interview prompt generation.
# InterviewAce-AI
