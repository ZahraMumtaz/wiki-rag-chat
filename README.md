# Wikipedia RAG Chatbot

A RAG-based chatbot that lets you load any Wikipedia article 
and ask questions about it using a local LLM.

## Before You Start

You need these installed:
- Docker Desktop
- Ollama (https://ollama.com/download)

Pull the models Ollama needs:
ollama pull nomic-embed-text
ollama pull qwen2.5:3b

## Running the App

git clone <your-repo-url>
cd wiki-rag-chat
docker compose up --build

Open http://localhost:3000 in your browser.

## Check Everything is Working

Health check:
GET http://localhost:3000/api/health

Should return: { "status": "ok" }

## Running Tests

npm install
npm test

For coverage report:
npm test -- --coverage

## How it Works

1. Paste a Wikipedia URL and click Load Article
2. App fetches the article, chunks it, and stores embeddings in Qdrant
3. A summary is shown using qwen2.5:3b via Ollama
4. Ask questions in the chat — answers come from the article only