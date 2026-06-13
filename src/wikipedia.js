import axios from 'axios';
import * as cheerio from 'cheerio';

const REMOVABLE_SELECTORS =
  '.navbox, .reference, .reflist, #References, .infobox, .mw-editsection';

/**
 * Validate that a URL points to wikipedia.org.
 * @param {string} url
 * @throws {Error}
 */
function validateWikipediaUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!parsed.hostname.endsWith('wikipedia.org')) {
    throw new Error(`URL must be a wikipedia.org address: ${url}`);
  }
}

/**
 * Fetch and scrape plain text from a Wikipedia article.
 * @param {string} url - Full Wikipedia article URL
 * @returns {Promise<{ title: string, text: string, url: string }>}
 */
export async function getArticle(url) {
  validateWikipediaUrl(url);
  console.log(`[wikipedia] Fetching article: ${url}`);

  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'wiki-rag-chat/1.0 (educational project)',
    },
  });

  const $ = cheerio.load(html);

  const title = $('#firstHeading').text().trim();
  console.log(`[wikipedia] Title: ${title || '(empty)'}`);

  const $content = $('#mw-content-text').clone();
  $content.find(REMOVABLE_SELECTORS).remove();

  const paragraphs = $content
    .find('p')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean);

  const text = paragraphs.join('\n\n');
  console.log(`[wikipedia] Extracted ${paragraphs.length} paragraphs (${text.length} chars)`);

  if (text.length < 100) {
    throw new Error(
      `Extracted text too short (${text.length} chars); expected at least 100`,
    );
  }

  return { title, text, url };
}

/**
 * Build a Wikipedia article URL from a page title.
 * @param {string} title - Wikipedia page title (spaces or underscores)
 * @returns {string}
 */
export function buildArticleUrl(title) {
  const slug = title.trim().replace(/ /g, '_');
  const encoded = encodeURIComponent(slug).replace(/%20/g, '_');
  const url = `https://en.wikipedia.org/wiki/${encoded}`;
  console.log(`[wikipedia] Built URL for "${title}": ${url}`);
  return url;
}
