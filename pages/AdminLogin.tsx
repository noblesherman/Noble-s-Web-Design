import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const fieldClasses =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition";

const panelClasses =
  "w-full max-w-md mx-auto rounded-2xl bg-[#0b0f1a]/90 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-lg";

const AdminLogin: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("success");
    if (msg) {
      setStatus(msg);
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        setError(data.error || "Unable to login");
        return;
      }

      if (data.success || data.ok) {
        navigate("/admin/dashboard");
      } else {
        setError("Unable to login");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.16),transparent_35%)]" />
      <div className={panelClasses}>
        <div className="p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/70 to-blue-500/70 flex items-center justify-center mx-auto font-bold">
              N
            </div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Admin Console</p>
            <h1 className="text-2xl font-semibold">Sign in to dashboard</h1>
            <p className="text-sm text-slate-400">Use your admin email, password, and one-time code.</p>
          </div>

          {status && <div className="rounded-lg bg-green-500/10 border border-green-500/40 text-green-200 px-4 py-3 text-sm">{status}</div>}
          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@noblesweb.design"
                className={fieldClasses}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={fieldClasses}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-1 block">One-time code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-digit code"
                className={fieldClasses}
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-slate-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="pt-2 text-center text-sm text-slate-400">
            Need to set up 2FA?{" "}
            <button
              type="button"
              onClick={() => navigate("/admin/2fa/setup")}
              className="text-white hover:underline"
            >
              Go to setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
