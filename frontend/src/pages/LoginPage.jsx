import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const s = {
  page: { minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  card: { width: "100%", maxWidth: "380px" },
  logo: { textAlign: "center", marginBottom: "32px" },
  logoIcon: { width: "40px", height: "40px", background: "var(--text-primary)", borderRadius: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" },
  title: { fontSize: "20px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" },
  subtitle: { fontSize: "14px", color: "var(--text-secondary)" },
  form: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" },
  input: { width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "14px", outline: "none", transition: "border-color 0.15s" },
  btn: { width: "100%", padding: "10px", background: "var(--text-primary)", color: "#fff", borderRadius: "var(--radius-sm)", fontSize: "14px", fontWeight: "500", marginTop: "4px" },
  footer: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)" },
  link: { color: "var(--text-primary)", fontWeight: "500", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", fontSize: "13px" },
};

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form.email, form.password);
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 7v10l8 4 8-4V7l-8-4z" fill="white" />
            </svg>
          </div>
          <div style={s.title}>Welcome back</div>
          <div style={s.subtitle}>Sign in to your RAG Dashboard</div>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com" required style={s.input}
              onFocus={e => e.target.style.borderColor = "var(--text-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••" required style={s.input}
              onFocus={e => e.target.style.borderColor = "var(--text-primary)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </div>
          <button type="submit" disabled={loading}
            style={{ ...s.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={s.footer}>
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} style={s.link}>Create one</button>
        </div>
      </div>
    </div>
  );
}