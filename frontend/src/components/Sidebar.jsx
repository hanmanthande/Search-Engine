import { FileText, MessageSquare, Upload, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { id: "chat",      icon: MessageSquare, label: "Chat" },
  { id: "upload",    icon: Upload,        label: "Upload" },
  { id: "documents", icon: FileText,      label: "Documents" },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); toast.success("Logged out"); };

  return (
    <div style={{
      width: "var(--sidebar-width)",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", background: "var(--text-primary)",
            borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 7v10l8 4 8-4V7l-8-4z" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)" }}>RAG Assistant</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Document AI</div>
          </div>
        </div>
      </div>

      {/* New chat button */}
      <div style={{ padding: "12px 12px 8px" }}>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            width: "100%", padding: "8px 12px",
            background: activeTab === "chat" ? "var(--surface-hover)" : "transparent",
            border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
            display: "flex", alignItems: "center", gap: "8px",
            color: "var(--text-primary)", fontSize: "13px", fontWeight: "500",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = activeTab === "chat" ? "var(--surface-hover)" : "transparent"}
        >
          <MessageSquare size={15} />
          New conversation
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: "1px" }}>
        <div style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-muted)", padding: "8px 4px 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Tools
        </div>
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{
              width: "100%", padding: "8px 10px",
              background: activeTab === id ? "var(--surface-hover)" : "transparent",
              borderRadius: "var(--radius-sm)",
              display: "flex", alignItems: "center", gap: "9px",
              color: activeTab === id ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: "13.5px", fontWeight: activeTab === id ? "500" : "400",
              textAlign: "left",
            }}
            onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.background = "var(--surface-hover)"; }}
            onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        padding: "12px", borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "var(--surface-hover)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <User size={13} color="var(--text-secondary)" />
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.username}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} title="Log out"
          style={{ padding: "5px", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-light)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}