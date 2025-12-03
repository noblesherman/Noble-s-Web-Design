import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { CreditCard, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
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

const Checkout: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");
  const navigate = useNavigate();
  const { stripePromise, publishableKey } = useStripePromise();

  const [clientSecret, setClientSecret] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<any>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string>("");

  useEffect(() => {
    setReturnUrl(`${window.location.origin}/checkout/return`);
  }, []);

  const startCheckout = async () => {
    if (!itemId) {
      setError("No item selected to pay.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("client_token");
    if (!token) {
      setError("Please sign in through the client portal before paying.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch(`${API_BASE}/client/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      const userId = meData?.user?.id || meData?.data?.user?.id;
      if (!userId) throw new Error(meData?.error || "Unable to load your account");

      const res = await fetch(`${API_BASE}/payments/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, itemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to start checkout");

      setClientSecret(data.clientSecret || data.client_secret || "");
      setSessionId(data.sessionId || data.session_id || "");
      setItem(data.item);
      setStatusText(null);
    } catch (err: any) {
      setError(err?.message || "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const appearance = useMemo(
    () => ({
      theme: "night" as const,
      variables: {
        colorPrimary: "#60a5fa",
        colorBackground: "#0a0f1f",
        colorText: "#e5e7eb",
        borderRadius: "12px",
      },
      rules: {
        ".Input": {
          backgroundColor: "#0b1020",
          borderColor: "#1f2937",
          color: "#e5e7eb",
        },
        ".Input:focus": {
          borderColor: "#60a5fa",
        },
      },
    }),
    []
  );

  const canRenderForm = !!clientSecret && !!publishableKey && !!stripePromise;

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />

      <div className="relative max-w-4xl mx-auto pt-24 pb-16 px-4 md:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className={`${panelClass} p-8`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className={labelClass}>Checkout</p>
              <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-2">
                <CreditCard size={22} className="text-primary" /> Secure payment
              </h1>
              <p className="text-muted text-sm">Complete your payment without leaving the portal.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Stripe encrypted
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start justify-between gap-4">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={startCheckout}>
                Try again
              </Button>
            </div>
          )}

          {!publishableKey && (
            <div className="mt-4 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to your environment.
            </div>
          )}

          {item && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Item</p>
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-xs text-muted">{item.type === "RECURRING" ? "Recurring" : "One-time"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Amount</p>
                <p className="text-xl font-bold text-white">{formatMoney(item.amountCents, item.currency)}</p>
                {item.recurringInterval && item.type === "RECURRING" && (
                  <p className="text-xs text-muted">Every {item.recurringInterval}</p>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-8 flex items-center gap-2 text-sm text-muted">
              <Loader2 className="animate-spin" size={16} /> Preparing your secure payment...
            </div>
          )}

          {!loading && canRenderForm && (
            <div className="mt-8">
              <Elements stripe={stripePromise!} options={{ clientSecret, appearance, loader: "always" }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  sessionId={sessionId}
                  returnUrl={returnUrl}
                  onError={(msg) => setStatusText(msg)}
                  onSuccess={() => setStatusText("Processing...")}
                  submitLabel="Confirm and pay"
                />
              </Elements>
              {statusText && <p className="mt-3 text-xs text-muted">{statusText}</p>}
            </div>
          )}

          {!loading && !canRenderForm && !error && (
            <div className="mt-6 text-sm text-muted flex items-center gap-2">
              <RefreshCw size={14} /> We could not load the payment form. Please refresh and try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
