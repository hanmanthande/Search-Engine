import { useEffect, useState } from "react";
import { FileText, Trash2, RefreshCw, FileImage, Clock } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function DocumentsPanel() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/documents");
      setDocuments(res.data.documents);
    } catch { toast.error("Failed to load documents"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const deleteDocument = async (id, filename) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    try {
      setDeleting(id);
      await API.delete(`/documents/${id}`);
      toast.success("Document deleted");
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(null); }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "640px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>Documents</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{documents.length} document{documents.length !== 1 ? "s" : ""} indexed</p>
        </div>
        <button onClick={fetchDocuments} disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text-secondary)" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          Refresh
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </button>
      </div>

      {loading && documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontSize: "14px" }}>Loading…</div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
          <FileText size={32} color="var(--text-muted)" style={{ marginBottom: "12px" }} />
          <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "6px" }}>No documents yet</div>
          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Upload a PDF or image to get started</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {documents.map(doc => (
            <div key={doc.id}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-strong)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ width: "34px", height: "34px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--text-secondary)" }}>
                {doc.mime_type?.startsWith("image/") ? <FileImage size={15} /> : <FileText size={15} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "3px" }}>
                  {doc.filename}
                </div>
                <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>{doc.chunk_count} chunks</span>
                  {doc.page_count && <span>{doc.page_count} page{doc.page_count !== 1 ? "s" : ""}</span>}
                  <span>{formatSize(doc.file_size)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <Clock size={10} />{formatDate(doc.created_at)}
                  </span>
                </div>
              </div>
              <button onClick={() => deleteDocument(doc.id, doc.filename)} disabled={deleting === doc.id}
                style={{ padding: "5px", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", flexShrink: 0, opacity: deleting === doc.id ? 0.5 : 1 }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-light)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}