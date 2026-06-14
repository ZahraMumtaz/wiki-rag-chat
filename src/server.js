import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getArticle } from './wikipedia.js';
import { splitIntoChunks } from './chunks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/ingest', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Request body must include a url string' });
  }

  try {
    const article = await getArticle(url);
    const chunks = splitIntoChunks(article.text, article.title);
    return res.json({
      title: article.title,
      url: article.url,
      totalChunks: chunks.length,
      chunks,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to ingest article';

    if (
      message.includes('wikipedia.org') ||
      message.includes('Invalid URL') ||
      message.includes('too short')
    ) {
      return res.status(400).json({ error: message });
    }

    console.error('[server] Ingest error:', error);
    return res.status(500).json({ error: 'Failed to fetch Wikipedia article' });
  }
});

/**
 * Start the Express server.
 */
export function startServer() {
  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  startServer();
}

export default app;
