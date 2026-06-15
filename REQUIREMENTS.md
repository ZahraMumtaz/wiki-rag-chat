# REQUIREMENTS.md

## What I understood from the brief

Build a web app where a user pastes a Wikipedia URL, the app reads the article, shows a summary, and lets the user chat with the article content using a local LLM. The chat answers should come from the article only, not from the model's general knowledge.

---

## What the app does

- User pastes a Wikipedia URL and clicks Load Article
- App fetches and reads the article text
- Splits it into chunks and stores embeddings in Qdrant
- Generates a summary using local LLM and shows it on the page
- User can ask questions in a chat box below the summary
- Answers are grounded in the article chunks only

---

## What I decided NOT to build

- No login or user accounts  (not asked for).
- No saving chat history between sessions  (out of scope).
- No multi-article support (one article at a time, new URL replaces old one),
- No analytics or tracking.

---

## Assumptions I made

- User will always paste a full Wikipedia URL.
- One article per session. If user loads a new URL, old data is wiped from Qdrant.
- LLM runs locally via Ollama. Brief said hosted is okay during development but the running app must use local, so I used qwen2.5:3b for both summary and chat.
- Embeddings are also local using nomic-embed-text via Ollama.
- The React frontend is a simple single page.

---

## Known Limitations I did not fix

**Slow ingest and chat endpoints**
Ingest is slow because 30 chunks are embedded one by one which means 30 separate Ollama calls.
Chat is also slow because LLM takes time to respond locally.

This could be fixed by batching embeddings of size 5 at a time using Promise.all
instead of one by one. But the brief docs did not mention performance optimization
as a requirement, so I left it as is and noted it here instead.
