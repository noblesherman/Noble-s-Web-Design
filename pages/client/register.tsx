import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { motion } from "framer-motion";

const ClientRegister: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_URL || "https://api.noblesweb.design").replace(/\/$/, "");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"pin" | "password">("pin");

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (token) navigate("/client");
  }, [navigate]);

  const verifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/client/auth/start`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.inviteToken) throw new Error(data.error || "Unable to verify invite");
      setInviteToken(data.inviteToken);
      setStatus("PIN verified. Create your password to finish onboarding.");
      setStep("password");
    } catch (err: any) {
      setError(err?.message || "Unable to verify invite");
    } finally {
      setLoading(false);
    }
  };

  const completeInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/client/auth/complete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteToken,
          password,
          email,
          pin,
          name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || "Unable to finish onboarding");
      localStorage.setItem("client_token", data.token);
      navigate("/client");
    } catch (err: any) {
      setError(err?.message || "Unable to finish onboarding");
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
          <p className={labelClass}>Invite-only portal</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
            Activate your client access
          </h1>
          <p className="text-muted text-lg max-w-xl">
            Enter the email and one-time PIN your admin sent you. Then set your password to join the portal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["Contracts", "Support", "Status"].map((item, idx) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
          className={`${panelClass} p-8 lg:p-10`}
        >
          <div className="space-y-1 mb-6">
            <p className={labelClass}>{step === "pin" ? "Verify invite" : "Set password"}</p>
            <h2 className="text-2xl font-semibold">
              {step === "pin" ? "Enter your email + PIN" : "Create your password"}
            </h2>
            <p className="text-sm text-muted">
              {step === "pin"
                ? "We’ll confirm your invite code and move you to the password step."
                : "Finish onboarding with a password you’ll use to sign in."}
            </p>
          </div>

          {status && (
            <div className="mb-3 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              {status}
            </div>
          )}

          {error && (
            <div className="mb-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          {step === "pin" ? (
            <form onSubmit={verifyPin} className="space-y-4">
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
                <label className="text-sm text-slate-300">One-time PIN</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.75 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                  placeholder="6-digit code"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full justify-center shadow-lg shadow-primary/20"
              >
                {loading ? "Verifying..." : "Verify invite"}
              </Button>
              <Button variant="outline" type="button" onClick={() => navigate("/client/login")} className="w-full">
                Back to login
              </Button>
            </form>
          ) : (
            <form onSubmit={completeInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.75 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Create password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.75 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                  placeholder="Create a password"
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
                {loading ? "Finishing..." : "Finish onboarding"}
              </Button>
              <Button variant="outline" type="button" onClick={() => setStep("pin")} className="w-full">
                Back to PIN step
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientRegister;
