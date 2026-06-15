import { useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:3000";

function App() {
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingIngest, setLoadingIngest] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const handleIngest = async (e) => {
    e.preventDefault();
    setLoadingIngest(true);
    setArticle(null);
    setSummary("");
    setChatMessages([]);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/ingest`, { url });
      setArticle({ title: response.data.title, url: response.data.url });
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error ingesting article:", error);
      alert(
        `Failed to ingest article: ${error.response?.data?.error || error.message}`,
      );
    } finally {
      setLoadingIngest(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    setLoadingChat(true);
    const newMessages = [
      ...chatMessages,
      { role: "user", content: chatQuestion },
    ];
    setChatMessages(newMessages);
    setChatQuestion("");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        question: chatQuestion,
      });
      setChatMessages([
        ...newMessages,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources,
        },
      ]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      alert(
        `Failed to get chat response: ${error.response?.data?.error || error.message}`,
      );
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="App">
      <h1 style={{ color: "white" }}>Wikipedia RAG Chatbot</h1>

      <form onSubmit={handleIngest} className="ingest-form">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Wikipedia Article URL"
          disabled={loadingIngest}
          required
        />
        <button type="submit" disabled={loadingIngest}>
          {loadingIngest ? "Loading..." : "Load Article"}
        </button>
      </form>

      {article && (
        <div className="article-info">
          <h2>{article.title}</h2>
          <p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.url}
            </a>
          </p>
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}

      {article && (
        <div className="chat-section">
          <h3>Chat about the article:</h3>
          <div className="messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <strong>{msg.role === "user" ? "You:" : "Assistant:"}</strong>{" "}
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources">
                    <h4>Sources:</h4>
                    <ul>
                      {msg.sources.map((source, srcIndex) => (
                        <li key={srcIndex}>{source}...</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleChat} className="chat-form">
            <input
              type="text"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              placeholder="Ask a question..."
              disabled={loadingChat}
              required
            />
            <button type="submit" disabled={loadingChat}>
              {loadingChat ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
