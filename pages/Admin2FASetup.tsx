import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const fieldClasses =
  "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition";

const panelClasses =
  "w-full max-w-lg mx-auto rounded-2xl bg-[#0b0f1a]/90 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-lg";

const Admin2FASetup: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/admin/2fa/setup`, {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.error) {
          setError(data.error || "Unable to fetch setup");
          return;
        }
        const qrCode = data.qrCodeDataUrl || data.data?.qrCodeDataUrl;
        const totpSecret = data.secret || data.data?.secret;
        setQr(qrCode || null);
        setSecret(totpSecret || null);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch setup");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API_BASE]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    setConfirming(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/2fa/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        setError(data.error || "Verification failed");
        return;
      }

      if (data.success || data.ok) {
        navigate("/admin/login?success=2FA%20setup%20complete");
      } else {
        setError("Verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed");
    } finally {
      setConfirming(false);
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
            <h1 className="text-2xl font-semibold">Set up two-factor auth</h1>
            <p className="text-sm text-slate-400">Scan the code with Google Authenticator, then confirm below.</p>
          </div>

          {error && <div className="rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 text-sm">{error}</div>}
          {status && <div className="rounded-lg bg-green-500/10 border border-green-500/40 text-green-200 px-4 py-3 text-sm">{status}</div>}

          {loading ? (
            <div className="text-center text-slate-400 py-10">Loading setup…</div>
          ) : (
            <>
              {qr && (
                <div className="flex flex-col items-center gap-3">
                  <img src={qr} alt="TOTP QR Code" className="w-48 h-48 rounded-xl border border-white/10 bg-white/5 p-3" />
                  {secret && <p className="text-sm text-slate-300 font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/10">{secret}</p>}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4 pt-2">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">Enter 6-digit code</label>
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    className="flex-1 py-3 rounded-lg border border-white/15 text-white hover:border-white/30 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={confirming}
                    className="flex-1 py-3 rounded-lg bg-white text-black font-semibold hover:bg-slate-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {confirming ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin2FASetup;
