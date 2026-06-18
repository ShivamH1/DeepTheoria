# DeepTheoria: Multi-Agent Research Assistant

DeepTheoria is a high-fidelity, multi-agent research intelligence platform that transforms raw topics or questions into deeply researched, structured markdown reports. It handles the complete pipeline: searching the web, scraping top sources, pausing for human review (Human-in-the-Loop), drafting reports with token-by-token streaming, and iteratively critiquing and revising the output until a target quality is met.

The user interface follows a premium, warm editorial design system inspired by Mistral—featuring a cream/sunset canvas, high-contrast serif typography, and a vibrant sunset accent gradient.

---

## 🏗️ Architecture & Pipeline

### Visual Diagrams

|                      Architecture Map                      |
| :--------------------------------------------------------: |
| ![Architecture Map](apps/frontend/public/Architecture.png) |

#### Research Flow & Execution Pipeline

```mermaid
graph TD
    Client[Next.js Frontend] -->|1. Start topic stream /api/research/stream| API[FastAPI Server]
    API -->|2. Run Graph| GatherGraph[Research Graph]
    GatherGraph -->|2a. Search Node| Tavily[Tavily Search API]
    GatherGraph -->|2b. Reader Node| Scraper[BeautifulSoup4 Scraper]
    GatherGraph -->|3. Interrupt & Await Review| HITL[Awaiting Review State]
    HITL -->|4. Stream gathered resources to UI| Client
    Client -->|5. Approve /api/research/approve/{id}| API
    API -->|6. Resume Execution| WriterNode[Writer Node]
    WriterNode -->|6a. Write draft & stream tokens| Mistral[Mistral AI]
    WriterNode -->|7. Critique Node| CriticNode[Critic Node]
    CriticNode -->|7a. Evaluate & score| ScoreCheck{Score < 6 & revision < MAX?}
    ScoreCheck -->|Yes: Revise| WriterNode
    ScoreCheck -->|No: Finish| SaveDB[Save to Postgres]
    SaveDB -->|8. Stream completion done| Client
```

---

## ✨ Features & Orchestration

### 1. Stateful Pipeline Execution & SSE Streaming

- **SSE Stream (`/api/research/stream`)**: Real-time progress updates are sent to the client via Server-Sent Events (SSE) as each pipeline step finishes, including live token-by-token report streaming from Mistral AI.
- **Pipeline Checkpoints (Fault Tolerance)**: Using LangGraph's checkpointer (`AsyncPostgresSaver`), execution state is saved at each checkpoint, allowing seamless interruption and resumption.

### 2. Human-in-the-Loop (HITL) Review

- **Interrupt State**: The research graph automatically halts before the writing phase begins.
- **Interactive Approval**: Users can review the raw search results, scraped text, and active URLs. Once satisfied, they click "Approve" to send a POST request to `/api/research/approve/{thread_id}`, releasing the block and initiating report generation.

### 3. Critique & Revise Loop

- **Automatic Iterative Refinement**: The writer drafts the report in markdown. A critic node evaluates the report's quality and outputs a score (out of 10) and qualitative feedback.
- **Target-Quality Threshold**: If the score is less than 6 and the revision budget hasn't been exhausted, the graph automatically loops back to the writer node, appending the critique to the prompt for a target revision.

### 4. Persistent Research History

- **PostgreSQL Store**: All completed research records—containing the original topic, search results, scraped content, final report, and critic feedback—are stored persistently in a database table.
- **Interactive Dashboard**: Users can load, read, and delete historical research runs directly from the UI.

---

## 🛠️ Tech Stack

- **Monorepo Manager**: Turborepo & Bun
- **Frontend**: Next.js 15+ (TypeScript, App Router), Tailwind CSS (v4)
- **Backend**: Python 3.10+, FastAPI, LangGraph, LangChain, asyncpg, psycopg
- **Database**: PostgreSQL (handling both LangGraph checkpoints and history storage)
- **AI Models & Engines**:
  - **Core LLM & Intelligence**: Mistral AI (`mistral-large-latest` or configured model)
  - **Search Engine**: Tavily API (for structured, AI-optimized web queries)
  - **Scraper**: BeautifulSoup4 (`bs4`) for fetching clean text from URLs

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Bun](https://bun.sh/) (for frontend and package manager)
- Python 3.10+ (for backend)
- PostgreSQL (running locally or a cloud database URL)

### Environment Setup

1. **Database Setup**:
   Create a PostgreSQL database (e.g., named `deeptheoria`).

2. **Backend Configuration**:
   Create a `.env` file in `apps/backend/` and populate it with your keys:

   ```env
   MISTRAL_API_KEY=your_mistral_api_key_here
   MISTRAL_MODEL=mistral-large-latest
   TAVILY_API_KEY=your_tavily_api_key_here
   DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/deeptheoria
   ```

3. **Backend Dependencies**:
   Navigate to the backend directory and set up a Python virtual environment:

   ```sh
   cd apps/backend
   python -m venv .venv

   # Activate environment:
   # On Windows (PowerShell)
   .venv\Scripts\activate
   # On macOS/Linux
   source .venv/bin/activate

   # Install dependencies:
   pip install -r requirements.txt
   ```

### Running the Project

From the **root** directory of the project, run all applications in development mode simultaneously:

```sh
bun dev
```

- **Frontend**: Running on [http://localhost:3000](http://localhost:3000)
- **Backend**: Running on [http://localhost:8000](http://localhost:8000)

---

## 🔑 Environment Variables

Create `apps/backend/.env` to configure the backend:

| Variable          | Required | Default / Recommendation | Description                                             |
| :---------------- | :------- | :----------------------- | :------------------------------------------------------ |
| `MISTRAL_API_KEY` | **Yes**  | —                        | Mistral AI API key                                      |
| `MISTRAL_MODEL`   | No       | `mistral-large-latest`   | Mistral model used for report generation and critiquing |
| `TAVILY_API_KEY`  | **Yes**  | —                        | Tavily Search API key                                   |
| `DATABASE_URL`    | **Yes**  | —                        | PostgreSQL connection DSN (`postgresql+asyncpg://...`)  |

---

## 📁 Repository Directory Structure

```
DeepTheoria/
├── apps/
│   ├── backend/
│   │   ├── db/                      # Database handlers
│   │   │   └── history.py           # asyncpg-based PostgreSQL CRUD operations
│   │   ├── graph/                   # LangGraph orchestration
│   │   │   ├── graph.py             # Compiles the StateGraph with Postgres Saver
│   │   │   ├── nodes.py             # Agent nodes (search, reader, writer, critic)
│   │   │   ├── prompt.py            # Writer and Critic prompt templates
│   │   │   └── state.py             # Typed ResearchState representation
│   │   ├── tools/                   # Scraping and search tools
│   │   │   ├── scraper.py           # BeautifulSoup4 scraping handler
│   │   │   └── search.py            # Tavily Search client wrapper
│   │   ├── config.py                # Pydantic Settings configuration parser
│   │   ├── main.py                  # FastAPI server and SSE router
│   │   └── requirements.txt         # Backend Python dependencies
│   └── frontend/
│       ├── app/                     # Next.js Page components & stylesheets
│       │   ├── history/             # Interactive research history viewer
│       │   ├── globals.css          # Mistral-inspired design tokens and styling
│       │   ├── layout.tsx           # Page wrappers and sidebar layouts
│       │   └── page.tsx             # Interactive research console
│       ├── components/              # Modular UI components
│       │   ├── ui/                  # Shared base elements (button, dialog, input, etc.)
│       │   ├── HistoryCard.tsx      # Sidebar card for historical runs
│       │   ├── HumanReview.tsx      # HITL inspection and approval pane
│       │   ├── LiveReport.tsx       # Live markdown text streamer
│       │   ├── PipelineProgress.tsx # Horizontal progress flow tracker
│       │   ├── ReportTabs.tsx       # Tabbed interface for Report, Scraped data, and Critique
│       │   ├── ResearchForm.tsx     # Initial topic submit input
│       │   ├── ScoreCard.tsx        # Graphic display of the critic's scores
│       │   └── Sidebar.tsx          # History and navigation drawer
│       ├── lib/                     # API fetching utilities
│       │   ├── api.ts               # EventSource and POST helpers
│       │   ├── parse-feedback.ts    # String parser for critique scores
│       │   └── types.ts             # TypeScript definitions
│       └── package.json             # Frontend packages
├── package.json                     # Root Bun workspaces manifest
└── turbo.json                       # Turborepo task pipeline configuration
```

---

## 🎨 Warm Sunset Editorial UI Design

DeepTheoria's UI is designed with a premium, Warm Sunset editorial theme inspired by Mistral AI:

- **Serif Elegance**: Titles and major headers render in the high-contrast `EB Garamond` serif typeface, giving research reports a classic, literary publication feel.
- **Warm Canvas**: A warm-cream page background (`#fbf9f8`) paired with off-black text (`#1b1c1c`) reduces eye strain for comfortable reading.
- **Sunset Accents**: Key interactive items and primary buttons leverage a vibrant orange primary accent (`#ae3200`) and a gradient sunset stripe (`#3a0b00` to `#ffdbd0`) for a modern aesthetic.
- **Structural Lines**: Grid dividers and containers utilize thin, clean hairline borders (`#e5e5e5`) to elevate content structure cleanly without heavy box-shadows.
