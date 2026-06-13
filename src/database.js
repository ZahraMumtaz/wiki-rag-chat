/**
 * Initialize Qdrant client and ensure the collection exists.
 * @returns {Promise<void>}
 */
export async function initDatabase() {
  // TODO: connect to Qdrant (QDRANT_URL), create collection if missing
}

/**
 * Save embedded chunks to the Qdrant collection.
 * @param {Array<{ id: string, vector: number[], payload: object }>} points
 * @returns {Promise<void>}
 */
export async function saveVectors(points) {
  // TODO: upsert points into Qdrant collection
}

/**
 * Search for chunks similar to a query embedding.
 * @param {number[]} queryVector - Embedding of the user query
 * @param {{ limit?: number, scoreThreshold?: number }} [options]
 * @returns {Promise<Array<{ text: string, title: string, url: string, score: number }>>}
 */
export async function searchVectors(queryVector, options = {}) {
  // TODO: run similarity search and return ranked payload results
}
