/**
 * Split article text into smaller overlapping chunks for embedding.
 * @param {string} text - Full article plain text
 * @param {{ chunkSize?: number, overlap?: number }} [options]
 * @returns {string[]}
 */
export function splitIntoChunks(text, options = {}) {
  // TODO: split text by size with optional overlap between chunks
}

/**
 * Attach metadata to each chunk for storage and retrieval.
 * @param {string[]} chunks - Raw text chunks
 * @param {{ title: string, url: string }} source - Article metadata
 * @returns {Array<{ text: string, title: string, url: string, index: number }>}
 */
export function annotateChunks(chunks, source) {
  // TODO: add title, url, and chunk index to each piece
}
