import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getArticle } from "./wikipedia.js";
import { splitIntoChunks } from "./chunks.js";
import { initDatabase, saveVectors, searchVectors } from "./database.js";
import { getEmbeddings, getEmbedding } from "./vectors.js";
import { summarize, chat } from "./ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/ingest", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res
      .status(400)
      .json({ error: "Request body must include a url string" });
  }

  try {
    const article = await getArticle(url);
    const chunks = splitIntoChunks(article.text, article.title);
    const vectors = await getEmbeddings(chunks.map((c) => c.text));
    await initDatabase();
    await saveVectors(chunks, vectors);
    const summary = await summarize(article.text);

    return res.json({
      title: article.title,
      url: article.url,
      totalChunks: chunks.length,
      summary,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to ingest article";

    if (
      message.includes("wikipedia.org") ||
      message.includes("Invalid URL") ||
      message.includes("too short")
    ) {
      return res.status(400).json({ error: message });
    }

    console.error("[server] Ingest error:", error);
    return res.status(500).json({ error: "Failed to fetch Wikipedia article" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const queryVector = await getEmbedding(question);
    const results = await searchVectors(queryVector, 5);
    const answer = await chat(question, results);
    return res.json({
      answer,
      sources: results.map((r) => r.text.slice(0, 150)),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get chat reply";
    console.error("[server] Chat error:", error);
    return res.status(500).json({ error: "Failed to get chat reply" });
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
