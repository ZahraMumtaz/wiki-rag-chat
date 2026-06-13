import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint.
 */
app.get('/health', (_req, res) => {
  // TODO: return server status
});

/**
 * Ingest a Wikipedia article: scrape, chunk, embed, and store in Qdrant.
 */
app.post('/ingest', async (_req, res) => {
  // TODO: accept article URL/title, run ingestion pipeline
});

/**
 * Chat with the RAG system using stored Wikipedia context.
 */
app.post('/chat', async (_req, res) => {
  // TODO: accept user message, retrieve relevant chunks, generate reply
});

/**
 * Start the Express server.
 */
export function startServer() {
  // TODO: listen on PORT
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;
