import { test, expect } from "@jest/globals";
import { splitIntoChunks } from "../src/chunks.js";

describe("chunks.js", () => {
  test("splitIntoChunks() returns array of chunks", () => {
    const text = "This is a long article with many words. ".repeat(100);
    const title = "Test Article";
    const chunks = splitIntoChunks(text, title);

    expect(Array.isArray(chunks)).toBe(true);
    expect(chunks.length).toBeGreaterThan(0);
  });

  test("each chunk has id, text, articleTitle, index", () => {
    const text = "This is a long article with many words. ".repeat(100);
    const title = "Test Article";
    const chunks = splitIntoChunks(text, title);

    chunks.forEach((chunk, index) => {
      expect(chunk).toHaveProperty("id", `chunk_${index}`);
      expect(chunk).toHaveProperty("text");
      expect(typeof chunk.text).toBe("string");
      expect(chunk).toHaveProperty("articleTitle", title);
      expect(chunk).toHaveProperty("index", index);
    });
  });

  test("overlap works correctly", () => {
    const text = "word ".repeat(500) + "lastwords ".repeat(50);
    const title = "Test Article";
    const chunks = splitIntoChunks(text, title);

    if (chunks.length > 1) {
      const firstChunkWords = chunks[0].text.split(" ");
      const secondChunkWords = chunks[1].text.split(" ");
      const overlap = firstChunkWords.slice(firstChunkWords.length - 50).join(" ");
      expect(secondChunkWords.join(" ")).toContain(overlap);
    }
  });

  test("skips chunks with less than 20 words", () => {
    const text = "short ".repeat(15);
    const title = "Short Article";
    const chunks = splitIntoChunks(text, title);
    expect(chunks.length).toBe(0);
  });
});
