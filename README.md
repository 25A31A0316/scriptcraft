# 🎬 ScriptCraft — Professional Screenplay & Pre-Production Platform

> An all-in-one screenplay development and pre-production studio platform for writers, directors, line producers, and filmmakers.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 🌟 Key Features

### ✍️ 1. Writing & Industry Formatting Engine
- **Courier Prime 12pt Geometry**: Exact 54–55 lines per page adherence matching Academy standards.
- **Hollywood Keyboard State Machine**: Intelligent Tab and Enter state transitions between Scene Headings, Action, Character, Parenthetical, Dialogue, Transitions, and Shots.
- **Multilingual & Indic Script Support**: Full native Unicode support, including Telugu script (*తెలుగు సంభాషణలు*) and bidirectional fidelity.
- **Dual Dialogue Formatting**: Native two-column simultaneous speech formatting (Fountain `^` syntax).

### 📄 2. Virtual Pagination & Interoperability
- **Virtual Paginator**: Real-time line-breaking engine with widow/orphan protection for scene headings and character cues.
- **Automatic Dialogue Continuation**: Automatically handles `(MORE)` and `(CONT'D)` splits across page breaks.
- **Bidirectional Fountain Support**: Full import and export for standard `.fountain` text files.
- **Final Draft XML (`.fdx`)**: Native import and export for Final Draft files.
- **Print / PDF**: Pixel-perfect printable screenplay layouts.

### 🎥 3. Pre-Production & Filmmaker Breakdown
- **Master Scene Stripboard**: Automated extraction of Scene #, Sluglines, Set Environments, Lighting Schedules, and Speaking Cast.
- **Scene Production Elements Tagger**: Tag every scene with Props 📦, Wardrobe 👕, Sound Effects (SFX) 🔊, Visual Effects (VFX) ✨, and Camera Rigs 🛡️.
- **Cast Call Sheets & CSV Export**: One-click spreadsheet export for Assistant Directors and Line Producers.
- **Visual Beat Board**: Interactive 3-Act structural index cards with direct jump-to-scene navigation.

### 🎨 4. Hollywood Revisions & Direction Tools
- **Standard Draft Sequence**: 9-stage revision colors (*White, Blue, Pink, Yellow, Green, Goldenrod, Buff, Salmon, Cherry*).
- **Locked Scene Numbers**: Locks scene numbering for production rewrites with alphanumeric revisions (`1A`, `1B`).
- **Script Reports in Eighths**: Exact Hollywood scene length breakdown in eighths of a page (`1/8` to `7/8`).
- **Table Read & Teleprompter Rehearsal**: Immersive audition mode with Actor Focus highlighting (e.g. spotlighting `SURESH` while dimming other cues) and variable auto-scroll (0.75x–3x).
- **Director Sticky Notes & Margin Comments**: Role-tagged margin notes (`Director`, `Camera`, `Audio`) with open/resolved filtering.
- **Title Page Designer & Security Watermark**: AMPAS 8.5" x 11" cover page simulator with configurable diagonal watermark.
- **Studio Theme Suite**: Toggle between **Obsidian Gold** (dark cinematic), **Classic Hollywood Paper** (warm ivory), and **Midnight Slate**.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/scriptcraft.git
   cd scriptcraft
   ```

2. **Install frontend & monorepo dependencies**:
   ```bash
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd apps/api
   pip install -r requirements.txt
   cd ../..
   ```

### Running Locally

1. **Start the Frontend Studio**:
   ```bash
   npm run dev --workspace=apps/web
   ```
   Open `http://localhost:3000` in your browser.

2. **Start the Collaborative FastAPI Backend**:
   ```bash
   cd apps/api
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   Interactive Swagger API docs will be available at `http://127.0.0.1:8000/docs`.

### Running Tests

```bash
# Run TypeScript Package Test Suites
npx tsx --test packages/**/*.test.ts

# Run Backend Python API Tests
cd apps/api
python -m unittest tests.test_api
```

---

## 📦 Project Structure

```text
scriptcraft/
├── apps/
│   ├── web/                    # React 18 + Vite + TipTap Studio Frontend
│   │   ├── src/components/     # ScreenplayEditor, BeatBoard, ProductionBreakdown, etc.
│   │   ├── src/hooks/          # useScreenplayPersistence, useCollaborationSync
│   │   └── src/utils/          # exportHelpers, continuityChecker
│   └── api/                    # FastAPI Python Backend & WebSocket Gateway
│       ├── routers/            # /api/auth, /api/projects, /api/documents, /ws
│       └── models/             # User, Project, Document, DocumentSnapshot
├── packages/
│   ├── screenplay-schema/      # Canonical AST, Node types, Geometry tokens
│   ├── screenplay-engine/      # Custom ProseMirror nodes & Serializer
│   ├── formatting/             # 54 lines/page virtual pagination engine
│   └── import-export/          # Fountain & Final Draft XML (.fdx) parsers
└── .github/workflows/          # Automatic GitHub Pages CI/CD workflow
```

---

## 🌐 Deploying to GitHub Pages

This repository includes an automatic GitHub Actions workflow (`.github/workflows/deploy.yml`).
1. Push this repository to GitHub.
2. In your repository settings, go to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. The workflow will automatically build and publish your live app to `https://<username>.github.io/<repo>/`!

---

## 📄 License

MIT License. Designed and engineered for filmmakers and storytellers everywhere.
