import { jest, test, expect, describe, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";

// Mock external dependencies
jest.unstable_mockModule("../src/wikipedia.js", () => ({
  getArticle: jest.fn(),
}));
jest.unstable_mockModule("../src/chunks.js", () => ({
  splitIntoChunks: jest.fn(),
}));
jest.unstable_mockModule("../src/vectors.js", () => ({
  getEmbedding: jest.fn(),
  getEmbeddings: jest.fn(),
}));
jest.unstable_mockModule("../src/database.js", () => ({
  initDatabase: jest.fn(),
  saveVectors: jest.fn(),
  searchVectors: jest.fn(),
}));
jest.unstable_mockModule("../src/ai.js", () => ({
  summarize: jest.fn(),
  chat: jest.fn(),
}));

// Import the actual app after mocks are set up
const { default: app } = await import("../src/server.js");

const { getArticle } = await import("../src/wikipedia.js");
const { splitIntoChunks } = await import("../src/chunks.js");
const { getEmbedding, getEmbeddings } = await import("../src/vectors.js");
const { initDatabase, saveVectors, searchVectors } =
  await import("../src/database.js");
const { summarize, chat } = await import("../src/ai.js");

describe("server.js API routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure initDatabase is called once at start, not on every test
    initDatabase.mockResolvedValue(undefined);
  });

  test('GET /api/health returns { status: "ok" }', async () => {
    const response = await request(app).get("/api/health");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  describe("POST /api/ingest", () => {
    test("returns 400 if no url provided", async () => {
      const response = await request(app).post("/api/ingest").send({});
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Request body must include a url string",
      });
    });

    test("returns 400 if invalid url", async () => {
      getArticle.mockRejectedValueOnce(new Error("Invalid URL"));
      const response = await request(app)
        .post("/api/ingest")
        .send({ url: "invalid-url" });
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: "Invalid URL" });
    });

    test("returns 200 and article summary on successful ingest", async () => {
      getArticle.mockResolvedValueOnce({
        title: "Test Article",
        text: "This is a test article with sufficient length.",
        url: "https://en.wikipedia.org/wiki/Test_Article",
      });
      splitIntoChunks.mockReturnValueOnce([
        {
          id: "chunk_0",
          text: "chunk 1",
          articleTitle: "Test Article",
          index: 0,
        },
      ]);
      getEmbeddings.mockResolvedValueOnce([[0.1, 0.2, 0.3]]);
      saveVectors.mockResolvedValueOnce(undefined);
      summarize.mockResolvedValueOnce("This is a summary.");

      const response = await request(app)
        .post("/api/ingest")
        .send({ url: "https://en.wikipedia.org/wiki/Test_Article" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        title: "Test Article",
        url: "https://en.wikipedia.org/wiki/Test_Article",
        totalChunks: 1,
        summary: "This is a summary.",
      });
      expect(getArticle).toHaveBeenCalledTimes(1);
      expect(splitIntoChunks).toHaveBeenCalledTimes(1);
      expect(getEmbeddings).toHaveBeenCalledTimes(1);
      expect(initDatabase).toHaveBeenCalledTimes(1);
      expect(saveVectors).toHaveBeenCalledTimes(1);
      expect(summarize).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /api/chat", () => {
    test("returns 400 if no question provided", async () => {
      const response = await request(app).post("/api/chat").send({});
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({ error: "question is required" });
    });

    test("returns 200 and chat answer on successful chat", async () => {
      getEmbedding.mockResolvedValueOnce([0.1, 0.2, 0.3]);
      searchVectors.mockResolvedValueOnce([
        {
          text: "context chunk 1",
          title: "Article 1",
          url: "url1",
          score: 0.9,
        },
        {
          text: "context chunk 2",
          title: "Article 1",
          url: "url1",
          score: 0.8,
        },
      ]);
      chat.mockResolvedValueOnce("This is the answer based on context.");

      const response = await request(app)
        .post("/api/chat")
        .send({ question: "What is the article about?" });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        answer: "This is the answer based on context.",
        sources: ["context chunk 1", "context chunk 2"],
      });
      expect(getEmbedding).toHaveBeenCalledTimes(1);
      expect(searchVectors).toHaveBeenCalledTimes(1);
      expect(chat).toHaveBeenCalledTimes(1);
    });

    test("returns 500 if chat service fails", async () => {
      getEmbedding.mockRejectedValueOnce(new Error("Embedding service error"));

      const response = await request(app)
        .post("/api/chat")
        .send({ question: "What is the article about?" });

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({ error: "Failed to get chat reply" });
    });
  });
});
