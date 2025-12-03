import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { CheckCircle2, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useStripePromise } from "../components/StripeProvider";
import { PaymentForm } from "../components/payments/PaymentForm";

const panelClass =
  "rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300";

const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted font-semibold";

const formatMoney = (cents?: number | null, currency = "usd") => {
  if (!cents && cents !== 0) return "—";
  const amount = Math.max(0, cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
};

const CheckoutReturn: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const { stripePromise, publishableKey } = useStripePromise();

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [assignedItem, setAssignedItem] = useState<any>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string>("");

  useEffect(() => {
    setReturnUrl(`${window.location.origin}/checkout/return`);
  }, []);

  const loadSession = async () => {
    if (!sessionId) {
      setError("Missing checkout session.");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("client_token");
    if (!token) {
      setError("Please sign in through the client portal to see your payment.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/payments/session-status?session_id=${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load payment status");

      setClientSecret(data.clientSecret || data.client_secret || "");
      setPaymentStatus(data.paymentStatus || data.payment_status);
      setStatus(data.status);
      setAssignedItem(data.assignedItem);
      setStatusText(null);
    } catch (err: any) {
      setError(err?.message || "Unable to load payment status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const appearance = useMemo(
    () => ({
      theme: "night" as const,
      variables: {
        colorPrimary: "#60a5fa",
        colorBackground: "#0a0f1f",
        colorText: "#e5e7eb",
        borderRadius: "12px",
      },
    }),
    []
  );

  const isComplete = paymentStatus === "paid" || status === "complete";
  const canRenderForm = !!clientSecret && !!publishableKey && !!stripePromise && !isComplete;

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />

      <div className="relative max-w-4xl mx-auto pt-24 pb-16 px-4 md:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/client")}>
            Return to portal
          </Button>
        </div>

        <div className={`${panelClass} p-8`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className={labelClass}>Payment status</p>
              <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-2">
                {isComplete ? <CheckCircle2 size={22} className="text-green-400" /> : <ShieldCheck size={22} className="text-primary" />}
                {isComplete ? "Payment complete" : "Finish your payment"}
              </h1>
              <p className="text-muted text-sm">
                {isComplete ? "We’ve recorded your payment. You can safely return to the portal." : "If your payment is still open, re-enter your details below."}
              </p>
            </div>
            <Button variant="outline" onClick={loadSession}>
              <RefreshCw size={14} className="mr-2" /> Refresh
            </Button>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          {assignedItem && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Item</p>
                <p className="text-white font-semibold">{assignedItem.title}</p>
                <p className="text-xs text-muted">
                  {assignedItem.type === "RECURRING" ? "Recurring" : "One-time"}
                  {assignedItem.recurringInterval ? ` • ${assignedItem.recurringInterval}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Amount</p>
                <p className="text-xl font-bold text-white">
                  {formatMoney(assignedItem.amountCents, assignedItem.currency)}
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted">
              <Loader2 className="animate-spin" size={16} /> Checking your payment status...
            </div>
          )}

          {!loading && isComplete && (
            <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 text-green-50 p-4 text-sm">
              Payment confirmed. You can close this tab or return to the client portal.
            </div>
          )}

          {!loading && canRenderForm && (
            <div className="mt-8">
              <Elements stripe={stripePromise!} options={{ clientSecret, appearance, loader: "always" }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  sessionId={sessionId || ""}
                  returnUrl={returnUrl}
                  onError={(msg) => setStatusText(msg)}
                  onSuccess={() => setStatusText("Processing...")}
                  submitLabel="Submit payment"
                />
              </Elements>
              {statusText && <p className="mt-3 text-xs text-muted">{statusText}</p>}
            </div>
          )}

          {!loading && !canRenderForm && !isComplete && (
            <div className="mt-6 text-sm text-muted">
              We could not render the payment form. Refresh or return to the portal to try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutReturn;
