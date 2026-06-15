import { jest, test, expect, beforeEach } from "@jest/globals";
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
};
jest.unstable_mockModule("axios", () => ({
  default: mockAxios
}));

const { getEmbedding, getEmbeddings } = await import("../src/vectors.js");

describe("vectors.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getEmbedding() returns array of numbers", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: { embedding: [0.1, 0.2, 0.3] },
    });
    const embedding = await getEmbedding("test text");
    expect(embedding).toEqual([0.1, 0.2, 0.3]);
  });

  test("getEmbedding() throws error if ollama is unreachable", async () => {
    mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));
    await expect(getEmbedding("test text")).rejects.toThrow(
      "Embedding request failed: Network Error",
    );
  });

  test("getEmbedding() throws error if ollama response does not include a valid embedding array", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: { someOtherData: "value" },
    });
    await expect(getEmbedding("test text")).rejects.toThrow(
      "Ollama response did not include a valid embedding array",
    );
  });

  test("getEmbeddings() returns array of arrays of numbers", async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: { embedding: [0.1, 0.2, 0.3] },
    });
    mockAxios.post.mockResolvedValueOnce({
      data: { embedding: [0.4, 0.5, 0.6] },
    });
    const embeddings = await getEmbeddings(["text 1", "text 2"]);
    expect(embeddings).toEqual([
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
    ]);
  });
});
