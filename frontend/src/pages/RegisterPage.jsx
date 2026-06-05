import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [form, setForm]       = useState({ email: "", username: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-500 mb-2">AI</div>
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-slate-400 mt-1">Start using your RAG Dashboard</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Username</label>
              <input type="text" name="username" value={form.username} onChange={handleChange}
                placeholder="johndoe" required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Min 6 characters" required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Confirm Password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
                placeholder="••••••••" required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-3 font-semibold transition">
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>
        </div>

        <p className="text-center text-slate-500 mt-5 text-sm">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </button>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;