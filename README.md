
# Spawn.

Spawn your own websites with just a prompt.

## About the Project

Spawn is an **AI-native cloud development environment** that turns natural language prompts into full-stack React applications in seconds. Unlike standard chatbots, Spawn runs a dedicated **Firecracker microVM** (via E2B) for every project, allowing the AI to write code, install dependencies, and run a dev server in real-time.

It features a robust **ReAct Agent architecture** capable of researching the web for design inspiration, planning component structures, and iteratively building production-ready UIs using Tailwind v4 and Shadcn. Users can preview their apps instantly via a live iframe, edit code manually in the browser, and download the source code as a ZIP file.

<p align="center" width="100%">
    <video width="90%" alt="Spawn Demo" src="https://github.com/user-attachments/assets/b131f454-4fb2-4a84-9785-e26185082d91" controls />
</p>

## System Architecture

The following flowchart demonstrates how data flows between the User, the AI Agent, the Database, and the Sandboxed Environment.

```mermaid
flowchart TD
    User["User / Frontend"] -->|1. Prompt| API["Backend API Express"]
    
    subgraph AI_Orchestration ["AI Orchestration Layer"]
        API -->|2. Stream Request| Agent["LangGraph Agent"]
        Agent <-->|3. Loop| Model["LLM OpenRouter"]
        Agent -->|4. Tool Call| Tools["Tool Manager"]
    end
    
    subgraph Data_Context ["Data & Context"]
        Tools -->|Read/Write Files| DB[("(PostgreSQL)")]
        Tools -->|Web Search| Exa["Exa.ai API"]
    end
    
    subgraph Infrastructure ["Infrastructure Layer"]
        Tools -->|5. Sync Files & Run| E2B["E2B Sandbox MicroVM"]
        E2B -->|6. Host Port 5173| Preview["Live Preview URL"]
    end
    
    API -.->|7. Stream Tokens SSE| User
    Preview -.->|8. Iframe Render| User

```

## Technologies Used

- **Frontend:** Next.js 14 , Tailwind CSS v4, Framer Motion, Shadcn UI, Monaco Editor
- **Backend:** Node.js, Express.js
- **AI & Orchestration:** LangGraph, OpenRouter
- **Infrastructure:** E2B (Sandboxed Firecracker VMs), Docker
- **Database:** PostgreSQL, Drizzle ORM
- **Tools:** Exa.ai, BetterAuth, Turborepo

## Getting Started

To start Spawn locally, use these following steps:

### Clone the repository

```bash
git clone https://github.com/Spandan-Mishra/spawn.git

cd spawn
```

### Installation

Since this is a Turborepo, install dependencies at the root:

```bash
pnpm install
```

### Configuration

Create `.env` files in `apps/web`, `apps/api` and `packages/db` (or a global one if configured). Use the example below:

```bash
# Database (Local Docker or Neon)
DATABASE_URL="postgresql://postgres:password@localhost:5433/spawn"

# AI Providers
OPENROUTER_API_KEY=sk-or-v1-...
EXA_API_KEY=...
E2B_API_KEY=...

# Authentication (BetterAuth)
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GITHUB_ID=...
GITHUB_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# API Connectivity
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
PORT=3001
```

### Infrastructure Setup

1. **Start the Database:**
   Spawn uses a local Docker container for PostgreSQL.
   ```bash
   docker-compose up -d
   ```

2. **Push Database Schema:**
   Sync the Drizzle schema with your local database.
   ```bash
   cd packages/db
   npx drizzle-kit push
   ```

### Starting the project

Go to the root directory and run the development command. This will start the Next.js frontend (Port 3000) and the Express backend (Port 3001) concurrently.

```bash
pnpm run dev
```

Visit `http://localhost:3000` to start your local instance of Spawn.