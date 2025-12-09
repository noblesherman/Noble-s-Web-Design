import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { CheckCircle2, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";

const panelClass =
  "rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300";
const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted font-semibold";
const formatMoney = (cents?: number | null, currency = "usd") => {
  if (cents === undefined || cents === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(Math.max(0, cents) / 100);
};

const PortalBillingComplete: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_URL || "https://api.noblesweb.design").replace(/\/$/, "");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);

  const loadStatus = async () => {
    if (!sessionId) {
      setError("Missing checkout session.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("client_token");
    if (!token) {
      setError("Please sign in through the client portal to view this payment.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/portal/checkout-session-status?session_id=${sessionId}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load payment status");
      setStatus(data);
    } catch (err: any) {
      setError(err?.message || "Unable to load payment status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const isPaid =
    (status?.paymentStatus || "").toLowerCase() === "paid" ||
    (status?.status || "").toLowerCase() === "complete";

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />

      <div className="relative max-w-4xl mx-auto pt-20 pb-16 px-4 md:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/portal/billing")} className="text-sm inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to billing
          </Button>
        </div>

        <div className={`${panelClass} p-6 md:p-8 space-y-4`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className={labelClass}>Checkout status</p>
              <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-2">
                {isPaid ? <CheckCircle2 size={22} className="text-green-400" /> : <ShieldAlert size={22} className="text-amber-400" />}
                {isPaid ? "Payment complete" : "Payment pending"}
              </h1>
              <p className="text-muted text-sm">
                {isPaid ? "We’ve marked this charge as paid." : "If this session is still open, return to billing to try again."}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/portal/billing")}>Return to billing</Button>
          </div>

          {error && (
            <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="animate-spin" size={16} /> Checking payment...
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted">Status</p>
                  <p className="text-white font-semibold capitalize">{status?.paymentStatus || status?.status || "Unknown"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Amount</p>
                  <p className="text-lg font-bold text-white">{formatMoney(status?.amountCents, status?.currency)}</p>
                </div>
              </div>
              {isPaid ? (
                <div className="text-sm text-green-100 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  Payment confirmed. You can safely return to the billing page to see your updated list.
                </div>
              ) : (
                <div className="text-sm text-amber-100 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  If you already paid, refresh billing. Otherwise, start a new checkout from your billing page.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalBillingComplete;
