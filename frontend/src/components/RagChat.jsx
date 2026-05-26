import { useState } from "react";
import API from "../services/api";
import ReactMarkdown from "react-markdown";

function RagChat() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      const res = await API.get("/ask", {
        params: {
          query,
        },
      });

      setAnswer(res.data.answer);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-full">

      <div className="p-5 border-b border-slate-800">
        <h2 className="text-xl font-semibold">
          AI RAG Assistant
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {answer ? (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>
              {answer}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-slate-500">
            Ask questions from uploaded documents...
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-800 flex gap-3">

        <input
          type="text"
          placeholder="Ask a question..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={askQuestion}
          className="bg-blue-600 hover:bg-blue-500 px-6 rounded-xl"
        >
          {loading ? "..." : "Ask"}
        </button>

      </div>
    </div>
  );
}

export default RagChat;