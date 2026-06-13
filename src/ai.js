/**
 * Generate a short summary of article text using Ollama.
 * @param {string} text - Article or chunk text to summarize
 * @returns {Promise<string>}
 */
export async function summarize(text) {
  // TODO: POST to Ollama chat/completions API with summarization prompt
}

/**
 * Generate a chat reply grounded in retrieved Wikipedia context.
 * @param {string} userMessage - User question or message
 * @param {Array<{ text: string, title: string, url: string }>} contextChunks
 * @returns {Promise<string>}
 */
export async function chat(userMessage, contextChunks) {
  // TODO: build RAG prompt with context, call Ollama chat API
}
