/**
 * Request an embedding vector from Ollama for a single text input.
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  // TODO: POST to Ollama embeddings API (OLLAMA_BASE_URL, OLLAMA_EMBED_MODEL)
}

/**
 * Generate embeddings for multiple texts in batch.
 * @param {string[]} texts - Texts to embed
 * @returns {Promise<number[][]>}
 */
export async function embedTexts(texts) {
  // TODO: embed each text, return array of vectors
}
