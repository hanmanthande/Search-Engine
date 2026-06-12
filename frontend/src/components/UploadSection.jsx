import { useState } from "react";
import { UploadCloud, FileText, Image, CheckCircle, XCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import API from "../services/api";
import toast from "react-hot-toast";

function UploadResult({ result }) {
  if (!result) return null;
  return (
    <div style={{
      marginTop: "16px", padding: "14px 16px",
      background: result.success ? "#f0fdf4" : "var(--danger-light)",
      border: `1px solid ${result.success ? "#bbf7d0" : "#fecaca"}`,
      borderRadius: "var(--radius-md)",
      display: "flex", gap: "10px", alignItems: "flex-start",
    }}>
      {result.success
        ? <CheckCircle size={16} color="#16a34a" style={{ marginTop: "1px", flexShrink: 0 }} />
        : <XCircle size={16} color="var(--danger)" style={{ marginTop: "1px", flexShrink: 0 }} />
      }
      <div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: result.success ? "#15803d" : "var(--danger)", marginBottom: "2px" }}>
          {result.success ? "Upload successful" : "Upload failed"}
        </div>
        <div style={{ fontSize: "13px", color: result.success ? "#166534" : "#991b1b" }}>
          {result.message}
        </div>
      </div>
    </div>
  );
}

export default function UploadSection() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setResult(null);
    try {
      setLoading(true);
      const res = await API.post("/upload", formData);
      setResult({ success: true, message: res.data.message });
      toast.success("Document processed");
    } catch (err) {
      const msg = err.response?.data?.detail || "Upload failed";
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    accept: { "application/pdf": [".pdf"], "image/png": [".png"], "image/jpeg": [".jpg",".jpeg"], "image/webp": [".webp"] },
    maxFiles: 1,
    disabled: loading,
  });

  const isActive = dragActive || isDragAccept;

  return (
    <div style={{ padding: "32px", maxWidth: "560px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>Upload a document</h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
          Upload a PDF or image and the AI will extract text, chunk it, and make it searchable.
        </p>
      </div>

      <div {...getRootProps()} style={{
        border: `2px dashed ${isActive ? "var(--text-primary)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-lg)", padding: "48px 24px", textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer",
        background: isActive ? "var(--surface-hover)" : "var(--surface)",
        transition: "all 0.15s", opacity: loading ? 0.7 : 1,
      }}>
        <input {...getInputProps()} />
        <div style={{ width: "52px", height: "52px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <UploadCloud size={24} color="var(--text-secondary)" />
        </div>
        {loading ? (
          <>
            <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>Processing document…</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Extracting text and generating embeddings</div>
          </>
        ) : isActive ? (
          <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-primary)" }}>Drop to upload</div>
        ) : (
          <>
            <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "4px" }}>Drag & drop your file here</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>or click to browse</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {[["PDF", FileText], ["PNG", Image], ["JPG", Image], ["WEBP", Image]].map(([label, Icon]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "20px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <Icon size={11} />{label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <UploadResult result={result} />
      <div style={{ marginTop: "14px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
        Maximum file size: 20 MB
      </div>
    </div>
  );
}