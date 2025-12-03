import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { motion } from "framer-motion";

const ClientLogin: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (token) navigate("/client");
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/clients/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || "Login failed");
      localStorage.setItem("client_token", data.token);
      navigate("/client");
    } catch (err: any) {
      setError(err?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  const panelClass =
    "rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)]";
  const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted font-semibold";

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-80 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-4"
        >
          <p className={labelClass}>Client portal</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
            Log in to your project room
          </h1>
          <p className="text-muted text-lg max-w-xl">
            Access deliverables, sign contracts, and chat with support—all in one place.
          </p>
          <Button variant="outline" onClick={() => navigate("/client/register")} className="w-fit">
            Have an invite? Activate it
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className={`${panelClass} p-8 lg:p-10`}
        >
          <div className="space-y-1 mb-6">
            <p className={labelClass}>Login</p>
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-muted">Use your client credentials to enter the portal.</p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.75 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.75 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center shadow-lg shadow-primary/20"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientLogin;
