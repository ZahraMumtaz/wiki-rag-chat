# TASKS.md

This is the execution log of how I built this project, in the order I tackled things.

## Phase 1 - Understanding the brief

Read the brief carefully and figured out what actually needs to be built. The core flow is simple: URL in, scrape, chunk, embed, store, summarise, chat. Decided to keep scope tight and not add anything extra.

Looked at LLM options. Brief said local is preferred. Tried to sign up for NVIDIA build platform for free model access but OTP verification did not work so that was out. Went with Ollama directly since it was the most straightforward local setup. Pulled qwen2.5:3b for chat and nomic-embed-text for embeddings.

## Phase 2 - Planning with Cursor

Opened Cursor and used it to help scaffold the plan. Gave it the brief and walked through what needs to be built. Used this to produce the first drafts of REQUIREMENTS.md and DESIGN.md. 
Broke the work into small tasks so each Cursor or Cline run could do one thing at a time.

## Phase 3 - Backend (Cursor)

| Task | Who did it |
|---|---|
| Project scaffold, package.json, folder structure | Cursor |
| wikipedia.js - fetch and parse article with axios and cheerio | Cursor |
| chunks.js - fixed size chunking with overlap | Cursor |
| vectors.js - Ollama embedding calls | Cursor |
| database.js - Qdrant client, save and search | Cursor |
| ai.js - summarise and chat via Ollama | Cursor |
| server.js - Express routes /api/ingest and /api/chat | Cursor |

Tested each endpoint in Postman as it was built. Ingest worked end to end locally before moving on.

## Phase 4 - Issues I fixed manually

**ESM import error in tests**
Jest was not mocking axios correctly with ESM modules. The standard jest.mock did not work. Had to switch to jest.unstable_mockModule and import modules after the mock was set up. Fixed this manually after understanding the ESM quirk.

**Text color issue in frontend**
Summary text was not visible because color was wrong inside the white panel. Fixed the CSS manually.

**Qdrant connection error in Docker**
App could not reach Qdrant container using the hostname qdrant. Fixed by adding an explicit network in docker-compose.yml so both containers share the same bridge network. Also fixed a bug where QdrantClient was being initialised inside initDatabase every call instead of once at the top of the file.

## Phase 5 - Frontend (Cline)

Cursor free tier ran out so switched to Cline with Gemini 2.5 Flash. Built the React frontend with Vite. Single page with URL input, summary panel, and chat box. Kept it simple as brief said functional is enough.

## Phase 6 - Tests (Cline)

Wrote unit tests for all service files. Hit ESM mocking issue mentioned above and fixed manually. Final coverage came to 94% which is above the 85% requirement.

## Phase 7 - Docker (Cline)

Added Dockerfile and docker-compose.yml. Wired Qdrant and app as separate services on a shared network. Ollama runs on host machine. This is documented in DESIGN.md.

## Phase 8 - Final

Wrote README.md. Cleaned up MD files. Ran docker compose up and tested end to end one more time in browser.