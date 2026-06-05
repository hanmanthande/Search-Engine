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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) return <Dashboard />;

  if (showRegister) return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />;

  return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent />
    </AuthProvider>
  );
}

export default App;