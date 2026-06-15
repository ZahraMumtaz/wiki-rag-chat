import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

/**
 * Generate a short summary of article text using Ollama.
 * @param {string} text - Article or chunk text to summarize
 * @returns {Promise<string>}
 */
export async function summarize(text) {
  console.log('[ai] Generating summary');
  const prompt = `Summarize this Wikipedia article in 4-5 sentences:\n\n${text.slice(0, 3000)}`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'qwen2.5:3b',
      prompt,
      stream: false,
    });
    return response.data.response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get summary from Ollama';
    throw new Error(`Ollama summarization request failed: ${message}`);
  }
}

/**
 * Generate a chat reply grounded in retrieved Wikipedia context.
 * @param {string} question - User question or message
 * @param {Array<{ text: string }>} contextChunks
 * @returns {Promise<string>}
 */
export async function chat(question, contextChunks) {
  console.log('[ai] Generating chat reply');
  const context = contextChunks.map((chunk) => chunk.text).join('\n\n');

  const prompt = `Answer using ONLY the context below. If answer is not in context, say so.\n\nContext:\n${context}\n\nQuestion: ${question}`;

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'qwen2.5:3b',
      prompt,
      stream: false,
    });
    return response.data.response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get chat reply from Ollama';
    throw new Error(`Ollama chat request failed: ${message}`);
  }
}