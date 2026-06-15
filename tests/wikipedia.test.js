import { jest, test, expect, beforeEach } from "@jest/globals";
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
};
jest.unstable_mockModule("axios", () => ({
  default: mockAxios
}));

const { getArticle, buildArticleUrl } = await import("../src/wikipedia.js");

describe("wikipedia.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getArticle() throws error if url is not wikipedia.org", async () => {
    await expect(getArticle("https://example.com/article")).rejects.toThrow(
      "URL must be a wikipedia.org address",
    );
  });

  test("getArticle() throws error if extracted text is less than 100 chars", async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: `<html><body><h1 id="firstHeading">Short Article</h1><div id="mw-content-text"><p>short</p></div></body></html>`,
    });
    await expect(getArticle("https://en.wikipedia.org/wiki/Short")).rejects.toThrow(
      "Extracted text too short",
    );
  });

  test("getArticle() returns { title, text, url } on valid response", async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: `<html><body><h1 id="firstHeading">Test Article</h1><div id="mw-content-text"><p>This is a test paragraph with enough content to be over 100 characters long. It should be extracted correctly.</p><p>Another paragraph here to make sure the concatenation works as expected.</p></div></body></html>`,
    });
    const article = await getArticle("https://en.wikipedia.org/wiki/Test_Article");
    expect(article).toEqual({
      title: "Test Article",
      text: expect.any(String),
      url: "https://en.wikipedia.org/wiki/Test_Article",
    });
    expect(article.text.length).toBeGreaterThanOrEqual(100);
  });

  test("buildArticleUrl() returns a correctly formatted URL", () => {
    const title = "Test Article Title";
    const url = buildArticleUrl(title);
    expect(url).toBe("https://en.wikipedia.org/wiki/Test_Article_Title");
  });
});
