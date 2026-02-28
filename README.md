# 🌑 Umbra — Space Biology Knowledge Engine

> A full-stack research intelligence platform that scrapes, indexes, and makes scientific literature on space biology searchable and conversational using AI.

<div align="center">

![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA%20Space%20Apps%20Challenge-2025-blue?style=for-the-badge&logo=nasa)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Python](https://img.shields.io/badge/Python-3-3776AB?style=for-the-badge&logo=python)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8-512BD4?style=for-the-badge&logo=dotnet)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=for-the-badge&logo=google)

</div>

---

## 🚀 NASA Space Apps Challenge 2025

**Umbra** was built for the [NASA Space Apps Challenge 2025](https://www.spaceappschallenge.org/), held on **October 4–5, 2025**.

### The Challenge: *A Body in Motion*

Enable a new era of human space exploration! NASA has been performing biology experiments in space for decades, generating a tremendous amount of information critical for preparing humans to revisit the Moon and explore Mars. Although this knowledge is publicly available, it is difficult for potential users to find information pertaining to their specific interests.

**The objective:** Build a functional web application leveraging **AI, knowledge graphs, and other tools** to summarize the **608 NASA bioscience publications** and enable users to explore the impacts and results of the experiments they describe.

### Our Solution

Umbra addresses this challenge by providing:
- **AI-powered conversational interface** — Ask natural language questions about space biology research
- **Knowledge graph visualization** — Visually explore relationships between papers, organisms, and biological processes
- **Automated data pipeline** — A Python scraper that extracts structured knowledge from all 608 publications using Gemini AI
- **Smart search & filtering** — Find papers by organism, experimental condition, space environment, and more
- **Targeted audience support** — Useful for scientists, mission architects, and research managers alike

---

## 📖 Project Overview

**Umbra** is a multi-component, AI-powered research platform focused on **space biology**. It enables researchers, students, and enthusiasts to discover, explore, and converse with a curated knowledge base of space biology research papers.

The platform consists of three major components:

| Component | Technology | Purpose |
|---|---|---|
| `umbra/` | Next.js 15 + Convex + WorkOS | Frontend web application & real-time database |
| `Urban.api/` | ASP.NET Core 8 | REST API backend with authentication |
| `scraper/` | Python 3 + Gemini AI | Research paper crawler & data pipeline |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Umbra Platform                           │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────────┐  │
│  │   umbra/     │────▶│  Convex DB   │◀────│   scraper/     │  │
│  │  Next.js 15  │     │  (Realtime)  │     │  Python Bot    │  │
│  │  Frontend    │     └──────────────┘     │  + Gemini AI   │  │
│  └──────┬───────┘                          └────────────────┘  │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │  Urban.api/  │                                               │
│  │ ASP.NET Core │                                               │
│  │   REST API   │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Frontend — `umbra/`

The frontend is a modern, responsive web application that serves as the primary interface for users to interact with the knowledge base.

### Features
- **AI Chat Interface** — Conversational assistant powered by Google Gemini, specialized in answering questions about space biology research
- **Research Paper Browser** — Browse and read indexed research papers  
- **Knowledge Graph** — Interactive D3.js visualization of relationships between papers, organisms, and biological processes
- **Text Editor** — Rich text editing capabilities for note-taking and annotations
- **Authentication** — Secure sign-in / sign-up via WorkOS AuthKit
- **Dark / Light Theme** — System-aware theming with user preference persistence
- **Real-time Data** — Live updates via Convex's reactive database

### Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) with App Router |
| **Runtime** | React 19 |
| **Language** | TypeScript 5 |
| **Backend-as-a-Service** | [Convex](https://convex.dev/) (real-time database + serverless functions) |
| **Authentication** | [WorkOS AuthKit](https://workos.com/authkit) (`@workos-inc/authkit-nextjs`) |
| **AI / LLM** | Google Gemini API (`@google/generative-ai`) |
| **Styling** | Tailwind CSS v4 + `tw-animate-css` |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) primitives (Accordion, Dialog, Dropdown, Select, Tabs, Tooltip, etc.) |
| **Icons** | Lucide React + React Icons |
| **Data Visualization** | [D3.js](https://d3js.org/) v7 |
| **Animations** | [Motion](https://motion.dev/) (Framer Motion successor) + React Scroll Parallax |
| **Markdown** | `react-markdown`, `marked`, `remark-gfm`, `shiki` (syntax highlighting) |
| **Carousel** | Embla Carousel |
| **CSV Parsing** | PapaParse |
| **Resizable Panels** | `react-resizable-panels` |
| **Notifications** | Sonner (toast library) |
| **Code Quality** | ESLint + Prettier |

### Key Pages & Routes

| Route | Description |
|---|---|
| `/` | Landing page / home |
| `/chat` | AI-powered research assistant chat |
| `/graph` | Knowledge graph visualization |
| `/researches` | Research paper browser |
| `/text-editor` | Annotation & text editor |
| `/server` | Server-side data page |
| `/sign-in` | Authentication — sign in |
| `/sign-up` | Authentication — sign up |
| `/callback` | WorkOS OAuth callback handler |

### Running the Frontend

```bash
cd umbra

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in: CONVEX_URL, WORKOS_CLIENT_ID, WORKOS_API_KEY, GEMINI_API_KEY

# Start both frontend and Convex backend
npm run dev
```

---

## 🔧 Backend API — `Urban.api/`

A clean, layered REST API following the **BLL/DAL** (Business Logic Layer / Data Access Layer) architectural pattern.

### Features
- **JWT Authentication** — Secure token-based authentication with configurable issuer/audience
- **Password Hashing** — BCrypt-based password security
- **RESTful Controllers** — Clean HTTP endpoints exposed via ASP.NET controllers
- **Swagger / OpenAPI** — Auto-generated API documentation at `/swagger`
- **Layered Architecture** — Strict separation into `DAL` (database queries) and `BLL` (business rules)

### Tech Stack

| Category | Technology |
|---|---|
| **Framework** | ASP.NET Core 8 Web API |
| **Language** | C# (.NET 8) |
| **ORM** | Entity Framework Core 8 |
| **Database** | Microsoft SQL Server |
| **Authentication** | JWT Bearer Tokens (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| **Password Security** | `BCrypt.Net-Next` |
| **API Documentation** | Swashbuckle / Swagger (`Swashbuckle.AspNetCore` 6.6.2) |
| **Architecture** | 3-tier: API → BLL → DAL |

### Project Structure

```
Urban.api/
├── Urban.api/        # ASP.NET Core Web API (controllers, startup, config)
│   └── Controllers/  # HTTP endpoints
├── BLL/              # Business Logic Layer (services, domain rules)
│   └── Services/
└── DAL/              # Data Access Layer (EF Core contexts, models, migrations)
```

### Running the Backend

```bash
cd Urban.api

# Restore NuGet packages
dotnet restore

# Update appsettings.json with your SQL Server connection string
# Run database migrations
dotnet ef database update --project DAL --startup-project Urban.api

# Start the API
dotnet run --project Urban.api
# API available at https://localhost:{port}/swagger
```

---

## 🤖 Data Scraper — `scraper/`

An asynchronous Python automation bot that crawls scientific publications, extracts structured data using AI, generates vector embeddings, and populates the Convex database.

### Features
- **Automated Paper Crawling** — Reads a CSV of paper URLs and processes them in bulk
- **HTML Parsing** — BeautifulSoup-based extraction of title, authors, abstract, methods, results, discussion, conclusions, DOI, keywords, and citation counts
- **AI Entity Extraction** — Uses **Gemini 2.0 Flash** to identify:
  - 🧬 **Organisms** (species, microorganisms, cell types)
  - 🔬 **Experimental Conditions** (temperature, pressure, microgravity, radiation)
  - 🌱 **Biological Processes** (cellular processes, molecular pathways)
  - 🚀 **Space Environments** (ISS, cosmic radiation, mission contexts)
- **Vector Embeddings** — Generates semantic embeddings for similarity search
- **Progress Tracking** — Resumable processing with `progress.json` (survives interruptions)
- **Rate Limiting** — Respects Google Gemini API rate limits with exponential backoff
- **Convex Integration** — Directly populates the Convex real-time database

### Tech Stack

| Category | Technology |
|---|---|
| **Language** | Python 3 (async/await with `asyncio`) |
| **AI / LLM** | Google Gemini 2.0 Flash (`google-generativeai`) |
| **HTTP Client** | `httpx` (async) + `requests` (sync) |
| **HTML Parsing** | `BeautifulSoup4` + `lxml` |
| **Data Processing** | `pandas` |
| **Database** | Convex (`convex` Python SDK) |
| **Configuration** | `python-dotenv` |
| **Progress UI** | `tqdm` |

### Running the Scraper

```bash
cd scraper

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.local .env
# Fill in: CONVEX_URL, CONVEX_DEPLOY_KEY, GEMINI_API_KEY, INPUT_CSV_PATH

# Prepare your sources CSV (columns: title, link)
# Then run the bot
python main.py
```

The scraper is resumable — if interrupted, it picks up from the last successfully processed row using `progress.json`.

---

## 🔑 Environment Variables

### `umbra/.env.local`

```env
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...
WORKOS_CLIENT_ID=...
WORKOS_API_KEY=...
NEXT_PUBLIC_WORKOS_REDIRECT_URI=...
GEMINI_API_KEY=...
```

### `scraper/.env`

```env
CONVEX_URL=...
CONVEX_DEPLOY_KEY=...
GEMINI_API_KEY=...
INPUT_CSV_PATH=sources.csv
```

### `Urban.api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=...;..."
  },
  "JwtSettings": {
    "SecretKey": "...",
    "Issuer": "UrbanAPI",
    "Audience": "UrbanAPI"
  }
}
```

---

## 📂 Repository Structure

```
Umbra/
├── umbra/              # Next.js 15 frontend
│   ├── app/            # App Router pages & API routes
│   ├── components/     # Reusable UI components
│   ├── convex/         # Convex serverless functions & schema
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Shared utilities
│
├── Urban.api/          # ASP.NET Core 8 REST API
│   ├── Urban.api/      # Web API project (controllers, program)
│   ├── BLL/            # Business Logic Layer
│   └── DAL/            # Data Access Layer (EF Core)
│
└── scraper/            # Python data pipeline
    ├── main.py         # Entry point
    ├── extraction.py   # Web scraping + Gemini entity extraction
    ├── database.py     # Convex database operations
    ├── embedding_generator.py  # Vector embedding generation
    ├── rate_limiter.py # API rate limiting logic
    ├── progress_tracker.py     # Resumable processing tracker
    └── config.py       # Configuration dataclasses
```

---

## 🛠️ Technology Summary

| Category | Technologies |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript 5, Tailwind CSS v4 |
| **Real-time DB** | Convex |
| **Authentication** | WorkOS AuthKit, JWT |
| **AI / LLM** | Google Gemini API (Gemini 2.0 Flash) |
| **UI Library** | Radix UI, Lucide React, React Icons |
| **Data Viz** | D3.js v7 |
| **Animation** | Motion (Framer Motion), React Scroll Parallax |
| **Backend** | ASP.NET Core 8, C#, .NET 8 |
| **ORM** | Entity Framework Core 8 |
| **Database** | Microsoft SQL Server |
| **Security** | JWT Bearer, BCrypt |
| **API Docs** | Swagger / OpenAPI (Swashbuckle) |
| **Scraping** | Python, BeautifulSoup4, httpx, lxml |
| **Data Pipeline** | pandas, asyncio, tqdm |
| **Code Quality** | ESLint, Prettier, TypeScript strict mode |

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
