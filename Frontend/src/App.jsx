// ...existing code...
import React, { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { io } from "socket.io-client";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      role: "bot",
      text: "Hello! I'm your AI assistant. How can I help today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    autoResize();
  }, [input]);

  function scrollToBottom() {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }

  function autoResize() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
  }

  function addMessage(role, text) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), role, text }]);
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    addMessage("user", trimmed);
    setIsTyping(true);
    setInput("");
    socket.emit("ai-message", trimmed);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    const socketInstance = io("https://ai-chatbot-server-g7l7.onrender.com");
    setSocket(socketInstance);

    socketInstance.on("ai-response", (data) => {
      let messageText = "";
      try {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }

        messageText = data?.response || "";
        messageText = messageText
          .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
          .trim();
      } catch (err) {
        console.error("Bad response format:", err, data);
        messageText = "[Error: Unstructured AI response]";
      }

      addMessage("bot", messageText);
      setIsTyping(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <div className="chat-app" role="application" aria-label="AI Chat Interface">
      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <h2>Assistant</h2>
            <p className="sub">&copy; Developed by Gaurav Dwivedi</p>
          </div>
          <div className="header-actions">
            <button
              className="icon-btn"
              title="Clear conversation"
              onClick={() => setMessages([])}
              aria-label="Clear conversation"
            >
              ✖
            </button>
          </div>
        </header>

        <section className="messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="empty-state">
              <p>No messages yet. Start by asking a question.</p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`message-row ${m.role === "user" ? "user" : "bot"}`}
            >
              <div className="avatar" aria-hidden>
                {m.role === "user" ? "U" : "A"}
              </div>
              <div className="bubble">
                {/* ✅ Markdown now readable */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return (
                        <pre
                          style={{
                            background: "#1e1e1e",
                            color: "#e0e0e0",
                            padding: "10px",
                            borderRadius: "6px",
                            overflowX: "auto",
                            fontSize: "0.9rem",
                          }}
                        >
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    },
                    h1: ({ children }) => (
                      <h1 style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p style={{ marginBottom: "8px", lineHeight: "1.4" }}>
                        {children}
                      </p>
                    ),
                    li: ({ children }) => (
                      <li style={{ marginLeft: "1.2rem" }}>{children}</li>
                    ),
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row bot typing" aria-hidden>
              <div className="avatar">A</div>
              <div className="bubble typing-bubble">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
        </section>

        <footer className="composer">
          <textarea
            ref={textareaRef}
            className="input"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message input"
          />
          <div className="composer-actions">
            <button
              className="send-btn"
              onClick={handleSend}
              aria-label="Send message"
              disabled={!input.trim()}
            >
              ➤
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
// ...existing code...
