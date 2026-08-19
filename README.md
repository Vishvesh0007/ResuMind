# 🧠 ResuMind

> **AI-Powered Applicant Tracking System & Resume Analysis Platform**  
> Optimize your resume, analyze ATS compatibility, match job descriptions, and unlock actionable AI career insights seamlessly in the cloud.

---

## 🌟 Overview

**ResuMind** is a full-stack, cloud-native resume feedback and Applicant Tracking System (ATS) application built with **React 19**, **React Router v8**, **Tailwind CSS v4**, and **Puter.js**. 

Designed for job seekers and career professionals, ResuMind allows users to upload PDF resumes, extract resume text client-side, match qualifications against specific job descriptions, and generate structured AI analysis across multiple evaluation pillars (ATS compatibility, tone & style, content quality, structural organization, and key skills match).

---

## ✨ Key Features

- 📄 **Client-Side PDF Parsing & Thumbnail Generation**
  - Instant text extraction and cover image thumbnail rendering using `pdfjs-dist` on the browser main/worker thread—no backend file converter required.
- 🤖 **Deep AI Analysis Engine**
  - Integrated with OpenAI via Puter.js AI SDK to provide structured feedback, quantitative scores, and tailored advice based on target job descriptions.
- 🎯 **ATS Compatibility & Gauge Visualizations**
  - Custom SVG score gauges (`ScoreGauge`), circular progress indicators (`ScoreCircle`), and color-coded status badges (`ScoreBadge`) providing instant visual breakdown of ATS friendliness.
- 📊 **Detailed Category Accordions**
  - Section-by-section breakdown covering **Tone & Style**, **Content Quality**, **Structure & Formatting**, and **Skills Alignment** with actionable tips and suggestions.
- ☁️ **Cloud Storage & Persistence via Puter.js**
  - Persistence of resume metadata in Puter Key-Value (KV) store and original PDF assets in Puter Cloud File System (FS).
- 🔐 **Built-in Authentication**
  - Simple user session management using Puter Auth.
- 🛠️ **Developer Utility Tools**
  - Included `/wipe` developer interface for quick data clearing and store testing.
- 🐳 **Docker Ready**
  - Multi-stage Docker build optimized for production containerized deployment.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [React Router v8](https://reactrouter.com/) | Modern SSR/SPA client integration powered by Vite |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | Type-safe React components and Puter SDK bindings |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Vite-integrated styling (`@tailwindcss/vite`) & `tw-animate-css` |
| **Cloud Platform** | [Puter.js](https://puter.com/) | Serverless Auth, KV Store, Cloud FS, and AI SDK integration |
| **PDF Engine** | [PDF.js (`pdfjs-dist`)](https://mozilla.github.io/pdf.js/) | In-browser PDF parsing and thumbnail canvas rendering |
| **State Management** | [Zustand v5](https://zustand-demo.pmnd.rs/) | Global state management for Puter SDK & application data |
| **File Handling** | [React Dropzone](https://react-dropzone.js.org/) | Drag-and-drop file upload interface |

---

## 📂 Project Structure

```
ResuMind/
├── app/                        # Application source code
│   ├── components/             # Reusable UI components
│   │   ├── Accordion.tsx       # Expandable category accordion container
│   │   ├── ATS.tsx             # ATS compatibility score card & feedback
│   │   ├── Details.tsx         # Detailed breakdown category accordion list
│   │   ├── FileUploader.tsx    # Drag-and-drop PDF upload component
│   │   ├── Navbar.tsx          # Main header navigation bar
│   │   ├── ResumeCard.tsx      # Dashboard resume card with thumbnail & actions
│   │   ├── ScoreBadge.tsx      # Rating pill badge (Good / Warning / Bad)
│   │   ├── ScoreCircle.tsx     # Circular score indicator SVG
│   │   ├── ScoreGauge.tsx      # Custom semi-circle gauge SVG chart
│   │   └── Summary.tsx         # Overall analysis summary panel
│   ├── lib/                    # Core utilities & cloud services
│   │   ├── pdf2img.ts          # PDF text extraction & image canvas preview generator
│   │   ├── puter.ts            # Zustand store wrapping Puter Auth, KV, FS & AI SDK
│   │   └── utils.ts            # Formatting helpers & Tailwind class mergers
│   ├── routes/                 # React Router route pages
│   │   ├── auth.tsx            # Login / Authentication screen
│   │   ├── home.tsx            # Application dashboard & resume grid
│   │   ├── resume.tsx          # Interactive resume review & breakdown view
│   │   ├── upload.tsx          # Upload form & job description matching page
│   │   └── wipe.tsx            # Developer data wipe utility
│   ├── app.css                 # Global CSS design tokens & Tailwind imports
│   ├── root.tsx                # HTML shell & application root provider
│   └── routes.ts               # React Router route definitions
├── constants/                  # Prompts, sample data & static definitions
├── public/                     # Icons, backgrounds & scan animations
├── types/                      # TypeScript definitions (Puter SDK & Resume schema)
├── Dockerfile                  # Multi-stage production container build
├── package.json                # Project dependencies & scripts
└── vite.config.ts              # Vite & Tailwind plugin configuration
```

---

## 🗺️ Application Routes

| Route | Purpose | Key Components |
| :--- | :--- | :--- |
| `/` | **Dashboard**: Grid overview of all saved resumes & scores | `Navbar`, `ResumeCard`, `ScoreCircle` |
| `/upload` | **Upload & Match**: Submit resume PDF & target job details | `Navbar`, `FileUploader` |
| `/resume/:id` | **Detailed Review**: PDF preview side-by-side with AI feedback | `Summary`, `ATS`, `Details`, `ScoreGauge` |
| `/auth` | **Authentication**: User sign-in/sign-out via Puter Auth | Centered Auth Card |
| `/admin` | **Admin Dashboard**: Real-time user login tracking, session logs & system analytics | User directory table, Stat cards |
| `/wipe` | **Developer Utility**: Quick wipe tool for KV & Cloud FS storage | File list & Data wipe trigger |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- **Node.js**: `v20.0.0` or higher (Node.js 24 recommended)
- **npm**: `v10.0.0` or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vishvesh0007/ResuMind.git
   cd ResuMind
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Development

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

### Production Build

Typecheck and create an optimized production build:

```bash
# Typecheck
npm run typecheck

# Build application
npm run build

# Start production server
npm run start
```

---

## 🐳 Docker Deployment

You can build and run **ResuMind** using Docker:

### 1. Build the Docker Image
```bash
docker build -t resumind-app .
```

### 2. Run the Container
```bash
docker run -p 3000:3000 resumind-app
```

Access the application in your browser at `http://localhost:3000`.

---

## 📄 Documentation

For an in-depth architecture blueprint, UI design tokens, component hierarchy, and data flow specifications, see [FRONTEND_DESIGN_DOCUMENTATION.md](file:///d:/github%20project/ResuMind/FRONTEND_DESIGN_DOCUMENTATION.md).

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
