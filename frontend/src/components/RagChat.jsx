import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import API from "../services/api";

function Message({ role, content }) {
  const isUser = role === "user";
  return (
    <div style={{
      display: "flex", gap: "12px", padding: "20px 0",
      borderBottom: "1px solid var(--border)", alignItems: "flex-start",
    }}>
      <div style={{
        width: "30px", height: "30px", borderRadius: "50%",
        background: isUser ? "var(--surface-hover)" : "var(--text-primary)",
        border: isUser ? "1px solid var(--border)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: "2px",
      }}>
        {isUser ? <User size={14} color="var(--text-secondary)" /> : <Bot size={14} color="white" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px" }}>
          {isUser ? "You" : "RAG Assistant"}
        </div>
        {isUser ? (
          <div style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: "1.6" }}>{content}</div>
        ) : (
          <div className="prose" style={{ fontSize: "15px", color: "var(--text-primary)" }}>
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const suggestions = [
    "What are the key findings in my documents?",
    "Summarize the main topics covered",
    "What dates or numbers are mentioned?",
    "Find any action items or decisions",
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: "48px", height: "48px", background: "var(--text-primary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L4 7v10l8 4 8-4V7l-8-4z" fill="white" />
        </svg>
      </div>
      <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>Ask your documents</h2>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "340px", lineHeight: "1.6", marginBottom: "32px" }}>
        Upload documents first, then ask questions. The AI will search through them to find relevant answers.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%", maxWidth: "520px" }}>
        {suggestions.map((s, i) => (
          <div key={i} style={{
            padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)", fontSize: "13px", color: "var(--text-secondary)",
            textAlign: "left", lineHeight: "1.4",
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

export default function RagChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleSubmit = async () => {
    const query = input.trim();
    if (!query || loading) return;
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/ask", { params: { query } });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 max(24px, calc(50% - 360px))" }}>
        {messages.length === 0 ? <EmptyState /> : (
          <div style={{ paddingTop: "24px" }}>
            {messages.map((msg, i) => <Message key={i} role={msg.role} content={msg.content} />)}
            {loading && (
              <div style={{ display: "flex", gap: "12px", padding: "20px 0", alignItems: "flex-start" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{ paddingTop: "6px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "10px" }}>RAG Assistant</div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-muted)", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                    <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:.5} 40%{transform:scale(1);opacity:1} }`}</style>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--danger-light)", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", marginTop: "12px", fontSize: "13px", color: "var(--danger)" }}>
                <AlertCircle size={14} />{error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: "16px max(24px, calc(50% - 360px)) 24px", background: "var(--bg)" }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}
          onFocusCapture={e => e.currentTarget.style.borderColor = "var(--text-primary)"}
          onBlurCapture={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <textarea ref={textareaRef} value={input}
            onChange={e => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents…"
            rows={1}
            style={{
              width: "100%", padding: "14px 16px 0", background: "transparent",
              border: "none", outline: "none", resize: "none",
              fontSize: "15px", color: "var(--text-primary)", lineHeight: "1.6",
              minHeight: "24px", maxHeight: "200px", overflow: "auto",
            }}
          />
          <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Press <kbd style={{ fontFamily: "inherit", background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: "4px", padding: "1px 5px", fontSize: "11px" }}>Enter</kbd> to send
            </div>
            <button onClick={handleSubmit} disabled={!input.trim() || loading}
              style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: input.trim() && !loading ? "var(--text-primary)" : "var(--surface-hover)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              }}>
              <Send size={14} color={input.trim() && !loading ? "#fff" : "var(--text-muted)"} />
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
          Answers are based only on your uploaded documents
        </div>
      </div>
    </div>
  );
}