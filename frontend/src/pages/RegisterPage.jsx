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
  form: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" },
  input: { width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "14px", outline: "none", transition: "border-color 0.15s" },
  btn: { width: "100%", padding: "10px", background: "var(--text-primary)", color: "#fff", borderRadius: "var(--radius-sm)", fontSize: "14px", fontWeight: "500", marginTop: "4px" },
  footer: { textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-secondary)" },
  link: { color: "var(--text-primary)", fontWeight: "500", textDecoration: "underline", cursor: "pointer", background: "none", border: "none", fontSize: "13px" },
};

const fields = [
  { key: "email",    label: "Email address",    type: "email",    placeholder: "you@example.com" },
  { key: "username", label: "Username",          type: "text",     placeholder: "johndoe" },
  { key: "password", label: "Password",          type: "password", placeholder: "Min 6 characters" },
  { key: "confirm",  label: "Confirm password",  type: "password", placeholder: "••••••••" },
];

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      setLoading(true);
      await register(form.email, form.username, form.password);
      toast.success("Account created! Welcome 🎉");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
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
          <div style={s.title}>Create an account</div>
          <div style={s.subtitle}>Start using your RAG Dashboard</div>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} style={s.field}>
              <label style={s.label}>{label}</label>
              <input type={type} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder} required style={s.input}
                onFocus={e => e.target.style.borderColor = "var(--text-primary)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ ...s.btn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div style={s.footer}>
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} style={s.link}>Sign in</button>
        </div>
      </div>
    </div>
  );
}