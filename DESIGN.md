# DESIGN.md

## Architecture Overview

```
Browser (React)
      |
      | HTTP
      |
Express Server (Node.js) port 3000
      |
      |-- POST /api/ingest
      |       |
      |       |--> wikipedia.js  (fetch + parse article)
      |       |--> chunks.js     (split into 500 word pieces)
      |       |--> vectors.js    (embed each chunk via Ollama)
      |       |--> database.js   (save to Qdrant)
      |       |--> ai.js         (generate summary via Ollama)
      |
      |-- POST /api/chat
              |
              |--> vectors.js    (embed user question)
              |--> database.js   (search similar chunks in Qdrant)
              |--> ai.js         (generate answer from chunks)

Qdrant (Docker) port 6333
Ollama (host machine) port 11434
```

## Tech Choices

**Node.js + Express**
I have hands on experience with Node so it made sense to use it here. Express is lightweight and gets the job done without extra overhead.

**Qdrant**
Felt the easiest and most convenient to set up. Runs in Docker with one line, has a clean JS client, and a dashboard to visually inspect stored vectors.

**qwen2.5:3b**
Small enough to run on 16GB RAM without issues. Good enough for summarisation and RAG based chat.

**nomic-embed-text**
Local embedding model via Ollama. Works well with Qdrant cosine similarity search.

**React + Vite**
Single page app with URL input, summary panel, and chat box. No routing needed. Vite kept at v5.4 for Node 18 compatibility.

## Data Flow

### Ingest

```
URL
 -> fetch HTML with axios and parse with cheerio
 -> extract title and paragraph text
 -> split into 500 word chunks with 50 word overlap
 -> embed each chunk using nomic-embed-text via Ollama (30 embeddings for a typical article)
 -> store all vectors and text payload in Qdrant
 -> generate summary from first 3000 chars using qwen2.5:3b
 -> return { title, summary, totalChunks }
```

### Chat

```
User question
 -> embed question using nomic-embed-text
 -> search Qdrant for top 5 similar chunks using cosine distance
 -> build prompt with those chunks as context
 -> get answer from qwen2.5:3b
 -> return { answer, sources }
```

## Chunking Strategy

Fixed size at 500 words per chunk with 50 word overlap between consecutive chunks. A typical Wikipedia article like Albert Einstein produces around 30 chunks.

Overlap is intentional. If a sentence falls at the end of a chunk, the next chunk repeats the last 50 words so context is not lost at boundaries.

## Embedding Model

nomic-embed-text running locally via Ollama. Returns 768 dimension vectors. Stored in Qdrant with cosine distance for similarity search. Chose local because the brief preferred it.

## AI Agent Used

Built using Cursor free tier and Cline VS Code extension with Gemini 2.5 Flash and Groq llama. Planning files were written collaboratively with the agent. Code was reviewed before every commit.

## Known Limitations

Ingest is slow because 30 chunks are embedded one by one meaning 30 separate Ollama calls. Could be improved by batching with Promise.all in groups of 5 but was not a stated requirement so left as is.

LLM responses are not streamed so the full response waits before returning to client.

Qdrant data is lost on container restart. A Docker volume would fix this but was not needed for a demo.

One article at a time. Loading a new URL clear the previous Qdrant collection because of no session handling (out of scope)
