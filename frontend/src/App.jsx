import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
            style={{ animation: "spin 1s linear infinite" }}>
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"
              strokeDasharray="40" strokeDashoffset="20" strokeLinecap="round" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          Loading…
        </div>
      </div>
    );
  }

  if (user) return <Dashboard />;
  if (showRegister) return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />;
  return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--text-primary)", color: "#fff",
            borderRadius: "var(--radius-md)", fontSize: "14px", padding: "10px 16px",
          },
          success: { iconTheme: { primary: "#4ade80", secondary: "#fff" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#fff" } },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}