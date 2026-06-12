import { useState } from "react";
import Sidebar from "../components/Sidebar";
import RagChat from "../components/RagChat";
import UploadSection from "../components/UploadSection";
import DocumentsPanel from "../components/DocumentsPanel";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("chat");

  const topBar = (label, right = null) => (
    <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <span style={{ fontSize: "13.5px", fontWeight: "500", color: "var(--text-primary)" }}>{label}</span>
      {right && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{right}</span>}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeTab === "chat" && (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {topBar("RAG Chat", "Powered by Llama 3.3 70B")}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <RagChat />
            </div>
          </div>
        )}
        {activeTab === "upload" && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {topBar("Upload")}
            <UploadSection />
          </div>
        )}
        {activeTab === "documents" && (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {topBar("Documents")}
            <DocumentsPanel />
          </div>
        )}
      </main>
    </div>
  );
}