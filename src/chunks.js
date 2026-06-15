const CHUNK_WORDS = 500;
const OVERLAP_WORDS = 50;
const MIN_CHUNK_WORDS = 20;
const STEP_WORDS = CHUNK_WORDS - OVERLAP_WORDS;

/**
 * Split article text into overlapping word-based chunks.
 * @param {string} text - Full article plain text
 * @param {string} title - Wikipedia article title
 * @returns {Array<{ id: string, text: string, articleTitle: string, index: number }>}
 */
export function splitIntoChunks(text, title) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks = [];

  for (let start = 0; start < words.length; start += STEP_WORDS) {
    const slice = words.slice(start, start + CHUNK_WORDS);

    if (slice.length < MIN_CHUNK_WORDS) {
      continue;
    }

    chunks.push({
      id: `chunk_${chunks.length}`,
      text: slice.join(' '),
      articleTitle: title,
      index: chunks.length,
    });
  }

  console.log(
    `[chunks] Created ${chunks.length} chunks from "${title}" (${words.length} words)`,
  );

  return chunks;
}
