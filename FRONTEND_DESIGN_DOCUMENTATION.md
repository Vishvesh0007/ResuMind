# Frontend Design Documentation

This document provides a comprehensive design and architectural analysis of the **Resumeind (AI-Powered Applicant Tracking System)** frontend application.

---

## 1. Frontend Technology

* **Frontend Framework**: **React 19** with **React Router v8** (Framework mode using Vite with React Router SSR/SPA client bundle integration).
* **Programming Language**: **TypeScript 5.9**.
* **CSS / Styling**: **Vanilla CSS & Tailwind CSS v4** (`@tailwindcss/vite` & `@import "tailwindcss"`), supplemented by `tw-animate-css` for animations and custom CSS utilities.
* **UI Component Library**: Custom-built UI components using Tailwind CSS and utility helpers (`clsx`, `tailwind-merge`).
* **Icon Library**: Custom inline SVG graphics and standard SVG asset files located in `public/icons/` (`ats-good.svg`, `ats-warning.svg`, `ats-bad.svg`, `back.svg`, `check.svg`, `warning.svg`, `cross.svg`, `info.svg`, `pin.svg`).
* **Chart / Gauge Library**: Custom SVG-based Gauge (`ScoreGauge.tsx`) and Circular SVG Progress indicator (`ScoreCircle.tsx`).
* **Animation Library**: Tailwind CSS animations, CSS transitions, and `tw-animate-css` keyframes (`fade-in`, `zoom-in-95`, pulse).
* **Routing System**: **React Router v8** using file route configuration (`app/routes.ts` defining `/`, `/auth`, `/upload`, `/resume/:id`, `/wipe`).
* **State Management**: **Zustand v5** (`usePuterStore` in `app/lib/puter.ts`) managing global Puter JS authentication, KV storage, FS file operations, and AI service state.
* **Form System**: Native HTML5 form handling with React `useState` state binding and `FormData` extraction. Drag-and-drop file upload is powered by `react-dropzone`.

---

## 2. Frontend Architecture

The application adopts a modular, component-driven client architecture centered around React Router v8 route modules and a Zustand store wrapping the Puter.js cloud SDK.

* **Client-Side Storage & Persistence**: Metadata (resume details, job details, parsed JSON feedback) is stored in Puter KV store (`resume:${uuid}`). Files (original PDF and preview images) are uploaded to Puter Cloud FS.
* **Client-Side PDF Processing**: Text extraction and first-page image thumbnail rendering are performed on the browser main/worker thread via `pdfjs-dist` (`pdf2img.ts`).

---

## 3. Folder Structure

```
d:\github project\ai-powered-applicant-tracking-system
├── .agents/                    # Agent & skills configuration
├── app/                        # Application source code
│   ├── components/             # Reusable UI components
│   │   ├── Accordion.tsx       # Compound Accordion component
│   │   ├── ATS.tsx             # ATS compatibility score card
│   │   ├── Details.tsx         # Detailed breakdown accordion
│   │   ├── FileUploader.tsx    # Drag-and-drop file upload zone
│   │   ├── Navbar.tsx          # Main header navigation bar
│   │   ├── ResumeCard.tsx      # Resume preview card with remove action
│   │   ├── ScoreBadge.tsx      # Score rating badge pill
│   │   ├── ScoreCircle.tsx     # Circular score chart SVG
│   │   ├── ScoreGauge.tsx      # Semi-circle gauge chart SVG
│   │   └── Summary.tsx         # Overall score summary panel
│   ├── lib/                    # Core utilities and client services
│   │   ├── pdf2img.ts          # PDF text extraction & image preview engine
│   │   ├── puter.ts            # Zustand store & Puter Cloud SDK wrapper
│   │   └── utils.ts            # Helper functions (UUID, Tailwind merge, formatSize)
│   ├── routes/                 # React Router route modules
│   │   ├── auth.tsx            # Authentication login/logout page
│   │   ├── home.tsx            # Application dashboard / resume list
│   │   ├── resume.tsx          # Resume analysis & review page
│   │   ├── upload.tsx          # Resume upload & job details form
│   │   └── wipe.tsx            # Developer data wipe tool
│   ├── app.css                 # Global CSS design tokens & Tailwind imports
│   ├── root.tsx                # Root layout & HTML document shell
│   └── routes.ts               # React Router route definition map
├── constants/
│   └── index.ts                # Mock resume data & AI prompt instructions
├── public/
│   ├── icons/                  # SVG icon assets
│   └── images/                 # Background graphics & gifs
├── types/
│   ├── index.d.ts              # TypeScript interfaces for Resume, Feedback, Job
│   └── puter.d.ts              # Puter SDK type definitions
├── react-router.config.ts      # React Router configuration
├── vite.config.ts              # Vite build setup
└── package.json                # Project dependencies
```

---

## 4. Page / Screen Inventory

### 1. Dashboard (Home)
* **Route**: `/`
* **Purpose**: Overview of all submitted resumes, ATS scores, and entry point to upload new resumes.
* **Sections**: Top Navigation (`Navbar`), Hero Heading (*"Track your Applications & Resume Ratings"*), Resume Grid Section, Empty State section.
* **Main Components**: `Navbar`, `ResumeCard`, `ScoreCircle`.
* **Primary Actions**: Click *"Upload Resume"* button to open `/upload`.
* **Secondary Actions**: Click a `ResumeCard` to view detailed analysis (`/resume/:id`), or click the trash icon to remove a resume.
* **Modals**: Remove confirmation modal (*"Remove this resume?"*).
* **Empty State**: Shown when `resumes.length === 0`: *"No Resumes Found. Upload your first resume to get feedback."* with a large button.
* **Loading State**: Animated scanning GIF (`/images/resume-scan-2.gif`) centered during KV retrieval.

---

### 2. Upload & Job Matching Screen
* **Route**: `/upload`
* **Purpose**: Form to collect company name, job title, job description, and upload a resume PDF for AI analysis.
* **Sections**: `Navbar`, Main Form Section (Inputs + Drag & Drop Upload Zone), Processing Status View.
* **Main Components**: `Navbar`, `FileUploader`.
* **Forms**: Upload form with inputs for `Company Name`, `Job Title`, `Job Description`, and PDF file.
* **Primary Actions**: Click *"Analyze Resume"* button.
* **Loading / Processing States**: Real-time progress feedback with status text (*"Extracting text from PDF..."*, *"Generating resume preview..."*, *"Uploading..."*, *"Analyzing with AI..."*) accompanied by scan GIF animation (`resume-scan.gif`).
* **Error States**: Red alert box with warning icon when file upload, text extraction, or AI analysis fails.

---

### 3. Resume Review & Details Screen
* **Route**: `/resume/:id`
* **Purpose**: In-depth AI review displaying resume preview side-by-side with overall score, ATS compatibility, and expandable category breakdowns.
* **Sections**: Top Navigation Bar (with back button), Split Screen View: Left Sticky PDF Preview Panel, Right Analysis Results Panel.
* **Main Components**: `Summary`, `ScoreGauge`, `ATS`, `Details` (`Accordion`), `ScoreBadge`.
* **Primary Actions**: Click *"Back to Homepage"* link.
* **Secondary Actions**: Expand/collapse category accordions (*Tone & Style*, *Content*, *Structure*, *Skills*).
* **Loading State**: Scan animation GIF while fetching resume data from Puter KV/FS.

---

### 4. Authentication Screen
* **Route**: `/auth`
* **Purpose**: User sign-in and sign-out gate using Puter.js Auth.
* **Sections**: Centered Login Card over background graphic.
* **Main Components**: Centered Auth Card, Log In / Log Out action button.
* **Primary Actions**: Click *"Log In"* or *"Log Out"* button.
* **Loading State**: Pulse animation on button with text *"Signing you in..."*.

---

### 5. Developer Data Wipe Tool
* **Route**: `/wipe`
* **Purpose**: Utility page to list and clear all files and flush KV data during testing.
* **Sections**: Authentication user header, File list, Action button.
* **Primary Actions**: Click *"Wipe App Data"* button.

---

## 5. Navigation Design

* **Top Navigation Bar (`Navbar.tsx`)**: Fixed at top on Home and Upload screens. Contains the gradient logo (`RESUMEIND`) linking to `/` and an *"Upload Resume"* button linking to `/upload`.
* **Sub-Navigation (`resume.tsx`)**: Features a clean top bar with a back button (*"Back to Homepage"* with back arrow icon).
* **Route Navigation Map**:
```
App Root
├── / (Home / Dashboard)
│   ├── /upload (Upload Form & Processing)
│   ├── /resume/:id (Detailed Analysis View)
│   └── [Remove Modal]
├── /auth (Authentication Gate)
└── /wipe (Developer Utility)
```

---

## 6. Dashboard Design

* **Visual Layout**: Single-column container (`max-w-[1850px]`) centered over a subtle SVG background (`bg-main.svg`).
* **Hero Heading**: Large gradient heading (`text-6xl text-gradient font-semibold`) with dark subtitle (`text-3xl text-dark-200`).
* **Resume Grid**: Responsive flex grid (`flex-wrap gap-6 justify-evenly`).
* **Card Design**: Clean white background (`bg-white rounded-2xl p-4 h-[560px] w-[350px] lg:w-[430px] xl:w-[490px]`) with header (Company name, Job title, circular score badge, remove button) and preview image thumbnail container (`gradient-border`).

---

## 7. Resume Management Design

* **Visual Flow**:
```
Drop PDF Resume in FileUploader
       ↓
Extract PDF Text & Render Page 1 Preview Image (Client-side)
       ↓
Upload File to Puter FS & Save KV Draft Data
       ↓
Send Text Prompt to Puter AI (Claude-Sonnet-4)
       ↓
Parse & Clean JSON Feedback
       ↓
Redirect to /resume/:id (Split Screen View)
```
* **Score Visualization**:
  * **ScoreCircle**: Circular SVG progress ring with score value centered.
  * **ScoreGauge**: Semi-circular gradient arc gauge (`ScoreGauge.tsx`) for overall score.
  * **ScoreBadge**: Pill badge (*"Strong"*, *"Good Start"*, *"Needs Work"*) with green/yellow/red color variants.
  * **ATS Card**: Customized gradient card with score (`/100`), status subtitle, explanation text, list of good/improve tips, and closing guidance.

---

## 8. Application Tracker Design

* **Current Implementation**: Application details (Company Name, Job Title, Job Description) are captured alongside each resume upload.
* **Card Representation**: Each card displays company name, job title, overall ATS score, and resume preview.
* **Status Tracking**: Calculated via AI score metrics (*Overall*, *ATS*, *Tone & Style*, *Content*, *Structure*, *Skills*).

---

## 9. Analytics Design

* **Current Analytics**: Embedded directly into the Resume Review screen (`/resume/:id`).
* **Visuals**:
  * Overall Score Semi-circle Gauge (`ScoreGauge.tsx`).
  * Breakdown Category Rows (`Summary.tsx`) for *Tone & Style*, *Content*, *Structure*, and *Skills*.
  * Color-coded category scores (Green > 70, Yellow > 49, Red ≤ 49).

---

## 10. AI Insights Design

* **Presentation**: Delivered as structured feedback split into:
  1. **ATS Compatibility Card (`ATS.tsx`)**: Highlighting machine-readability status and actionable formatting tips with check/warning icons.
  2. **Detailed Category Breakdown (`Details.tsx`)**: Accordion sections containing short titles and detailed explanations for good practices and areas needing improvement.

---

## 11. Settings Design

* **Current Implementation**: Authentication status and user session details are managed via Puter Auth (`auth.tsx` & Zustand store `usePuterStore`).

---

## 12. Design System

### Colors
* **Primary Gradient**: `linear-gradient(to bottom, #8e98ff, #606beb)`
* **Gradient Hover**: `linear-gradient(to bottom, #717dff, #4957eb)`
* **Text Gradient**: `bg-gradient-to-r from-[#AB8C95] via-[#000000] to-[#8E97C5]`
* **Background Surface**: `#FFFFFF` (White)
* **Background Pages**: SVG patterns (`bg-main.svg`, `bg-small.svg`, `bg-auth.svg`)
* **Dark Text**: `#475467` (`--color-dark-200`), `#000000`
* **Muted Text**: `#6B7280` (`gray-500`), `#9CA3AF` (`gray-400`)
* **Borders / Gradients**: `from-[#c1d3f81a] to-[#a7bff14d]` (`gradient-border`)
* **Badges**:
  * **Green (Good)**: BG `#d5faf1`, Text `#254d4a`
  * **Yellow (Warning)**: BG `#fceed8`, Text `#73321b`
  * **Red (Needs Work)**: BG `#f9e3e2`, Text `#752522`

### Typography
* **Font Family**: `"Mona Sans", ui-sans-serif, system-ui, sans-serif`
* **Headings**:
  * `h1`: `text-6xl font-semibold leading-tight` (Mobile: `text-[3rem]`)
  * `h2`: `text-3xl text-dark-200` (Mobile: `text-xl`)
  * `h3`: `text-xl font-bold`

### Spacing & Borders
* **Card Radius**: `rounded-2xl` (`16px`), `rounded-xl` (`12px`)
* **Inner Inset Shadows**: `box-shadow: inset 0 0 12px 0 rgba(36, 99, 235, 0.2)`

---

## 13. Component Inventory

| Component Name | File Path | Purpose | Key Props / State |
| :--- | :--- | :--- | :--- |
| **Navbar** | `app/components/Navbar.tsx` | Top application header with logo & upload button | None |
| **ResumeCard** | `app/components/ResumeCard.tsx` | Dashboard card with preview, score, and remove action | `resume: Resume`, `onDelete?: (id) => void` |
| **FileUploader** | `app/components/FileUploader.tsx` | Drag-and-drop PDF dropzone | `onFileSelect`, `disabled?` |
| **ScoreCircle** | `app/components/ScoreCircle.tsx` | Circular SVG progress ring | `score: number` |
| **ScoreGauge** | `app/components/ScoreGauge.tsx` | Semi-circle SVG arc gauge | `score: number` |
| **ScoreBadge** | `app/components/ScoreBadge.tsx` | Rating label pill badge (*Strong*, *Good Start*, *Needs Work*) | `score: number` |
| **Summary** | `app/components/Summary.tsx` | Score summary panel & category list | `feedback: Feedback` |
| **ATS** | `app/components/ATS.tsx` | ATS compatibility card & guidance list | `score: number`, `suggestions: []` |
| **Details** | `app/components/Details.tsx` | Category breakdown accordion list | `feedback: Feedback` |
| **Accordion** | `app/components/Accordion.tsx` | Compound collapsible accordion components | `defaultOpen`, `allowMultiple` |

---

## 14. Responsive Design

* **Breakpoints Used**: Tailwind default (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
* **Layout Adaptations**:
  * **Dashboard Grid**: Stacks vertically on mobile (`max-md:flex-col items-center`) and expands to multi-column grid on desktop (`gap-6 justify-evenly`).
  * **Resume Review Page**: Stacks vertically (`flex-col-reverse`) on mobile/tablet, and switches to side-by-side split screen (`w-1/2` sticky left preview, `w-1/2` right feedback panel) on `lg` screens (1024px+).
  * **Headings**: `h1` scales dynamically from `text-[3rem]` on mobile to `text-6xl` on desktop.

---

## 15. UX Flow

```
1. Home Page / Dashboard (/)
   ├── View Resume Cards with Scores & Previews
   ├── Click Resume Card ➔ Opens /resume/:id
   ├── Click Trash Icon ➔ Confirmation Modal ➔ Remove Resume
   └── Click "Upload Resume" ➔ Opens /upload

2. Upload Page (/upload)
   ├── Fill Company, Job Title, Job Description
   ├── Drag & Drop / Select PDF Resume
   ├── Click "Analyze Resume"
   └── Step-by-Step Processing Screen ➔ Automatic Redirect to /resume/:id

3. Review Page (/resume/:id)
   ├── Left Sticky PDF Preview Image
   ├── Right Feedback Summary (Overall Score, ATS Suitability)
   ├── Category Score Row & Badges
   └── Expandable Category Breakdown Accordions
```

---

## 16. Visual Quality Audit

| Category | Score (1–10) | Description / Findings |
| :--- | :---: | :--- |
| **Visual Hierarchy** | **9 / 10** | Clear text hierarchy with distinct gradient headings, score circles, and organized cards. |
| **Spacing & Padding** | **8.5 / 10** | Consistent padding (`p-4`, `p-6`) and generous section margins. |
| **Typography** | **9 / 10** | Modern `Mona Sans` font with crisp weights and readable line heights. |
| **Color Consistency** | **9 / 10** | Unified color system using soft blue gradient borders, dark text, and distinct status badges. |
| **Component Reusability**| **8.5 / 10** | Well-structured components (`ScoreCircle`, `ScoreGauge`, `Accordion`, `ScoreBadge`). |
| **Accessibility** | **8 / 10** | Form labels present, aria-labels on icon buttons, keyboard accessible modal controls. |
| **Responsiveness** | **8.5 / 10** | Smooth grid reflows and mobile split-screen fallbacks. |
| **Usability** | **9 / 10** | Simple 3-screen workflow with instant visual preview and clear feedback. |
| **Modern Appearance** | **9 / 10** | Glassmorphism subtle borders, soft shadows, micro-animations, and clean cards. |

---

## 17. Current Problems / Weaknesses

1. **No Application Status Workflow (Kanban/Table)**: The app focuses on resume scoring per job title; it does not currently feature a multi-stage Kanban board (e.g., *Applied*, *Interviewing*, *Offered*, *Rejected*).
2. **Single Page Document Preview**: The preview generator converts page 1 of the PDF into a PNG image preview. Multi-page document pagination inside the card preview is not implemented.
3. **No Direct Resume Edit Form**: Job title and company name are set during initial upload. Editing job metadata post-upload requires re-uploading.

---

## 18. Complete Screen Map

```
RESUMEIND APP
├── AUTH
│   └── /auth (Puter Auth Login / Logout Screen)
├── MAIN APP
│   ├── / (Home Dashboard - Application Grid & Resume Cards)
│   │   └── [Remove Resume Modal]
│   ├── /upload (Resume Drag-and-Drop & Analysis Form)
│   └── /resume/:id (Detailed Split-Screen Resume & ATS Analysis)
└── UTILITY
    └── /wipe (Developer Storage & KV Wipe Tool)
```
