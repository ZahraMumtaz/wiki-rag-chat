import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const EMBED_MODEL = 'nomic-embed-text';

/**
 * Request an embedding vector from Ollama for a single text input.
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>}
 */
export async function getEmbedding(text) {
  try {
    const { data } = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
      model: EMBED_MODEL,
      prompt: text,
    });

    if (!Array.isArray(data?.embedding)) {
      throw new Error('Ollama response did not include a valid embedding array');
    }

    return data.embedding;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to get embedding from Ollama';
    throw new Error(`Embedding request failed: ${message}`);
  }
}

/**
 * Generate embeddings for multiple texts sequentially.
 * @param {string[]} textsArray - Texts to embed
 * @returns {Promise<number[][]>}
 */
export async function getEmbeddings(textsArray) {
  const vectors = [];
  const total = textsArray.length;

  for (let i = 0; i < total; i++) {
    console.log(`[vectors] embedding ${i + 1}/${total}`);
    const vector = await getEmbedding(textsArray[i]);
    vectors.push(vector);
  }

  return vectors;
}
