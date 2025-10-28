// ...existing code...
import React, { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([
    { id: Date.now(), role: "bot", text: "Hello! I'm your AI assistant. How can I help today?" },
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
    setMessages((m) => [...m, { id: Date.now() + Math .random(), role, text }]);
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
    const socketInstance = io('http://localhost:3000'); 
    setSocket(socketInstance);
    socketInstance.on('ai-response', (response) => {
      console.log(response);
      addMessage("bot", response.response);
      setIsTyping(false);
    })
  },[])

  return (
    <div className="chat-app" role="application" aria-label="AI Chat Interface">
     
      <main className="chat-panel">
        <header className="chat-header">
          <div>
            <h2>Assistant</h2>
            <p className="sub">&copy; Deveploped by Gaurav Dwivedi</p>
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
            <div key={m.id} className={`message-row ${m.role === "user" ? "user" : "bot"}`}>
              <div className="avatar" aria-hidden>
                {m.role === "user" ? "U" : "A"}
              </div>
              <div className="bubble">
                <div className="bubble-text">{m.text}</div>
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