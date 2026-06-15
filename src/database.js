import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || "http://127.0.0.1:6333";
const COLLECTION_NAME = "wiki_chunks";
const VECTOR_SIZE = 768;
const DISTANCE_TYPE = "Cosine";

const qdrantClient = new QdrantClient({ url: QDRANT_URL });

/**
 * Initialize Qdrant client and ensure the collection exists.
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  const { collections } = await qdrantClient.getCollections();

  if (collections.some((c) => c.name === COLLECTION_NAME)) {
    console.log(`[database] Deleting existing collection '${COLLECTION_NAME}'`);
    await qdrantClient.deleteCollection(COLLECTION_NAME);
  }

  console.log(`[database] Creating collection '${COLLECTION_NAME}'`);
  await qdrantClient.createCollection(COLLECTION_NAME, {
    vectors: { size: VECTOR_SIZE, distance: DISTANCE_TYPE },
  });
  console.log(
    `[database] collection '${COLLECTION_NAME}' created successfully...`,
  );
}

/**
 * Save embedded chunks to the Qdrant collection.
 * @param {Array<{ id: string, text: string, articleTitle: string, index: number }>} chunks
 * @param {number[][]} vectors
 * @returns {Promise<void>}
 */
export async function saveVectors(chunks, vectors) {
  const points = chunks.map((chunk, i) => ({
    id: chunk.index,
    vector: vectors[i],
    payload: {
      text: chunk.text,
      articleTitle: chunk.articleTitle,
      url: chunk.url,
      index: chunk.index,
    },
  }));

  console.log(`[database] Saving ${points.length} vectors to Qdrant`);
  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    batch: {
      ids: points.map((p) => p.id),
      vectors: points.map((p) => p.vector),
      payloads: points.map((p) => p.payload),
    },
  });
}

/**
 * Search for chunks similar to a query embedding.
 * @param {number[]} queryVector - Embedding of the user query
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array<{ text: string, title: string, url: string, score: number }>>}
 */
export async function searchVectors(queryVector, topK = 5) {
  const result = await qdrantClient.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });

  return result.map((point) => ({
    text: point.payload.text,
    articleTitle: point.payload.articleTitle,
    url: point.payload.url,
    score: point.score,
  }));
}
