import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { PaymentForm } from "../components/payments/PaymentForm";
import { useStripePromise } from "../components/StripeProvider";
import { Button } from "../components/ui/Button";
import { CreditCard, Loader2, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";

type ClientCharge = {
  id: string;
  label: string;
  amountCents: number;
  currency: string;
  status: string;
  stripeInvoiceId?: string | null;
  stripeSessionId?: string | null;
  hostedInvoiceUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
};

type PlanOption = {
  id: string;
  name: string;
  description?: string;
  priceId: string;
};

type ActiveCheckout = {
  id: string;
  clientSecret: string;
  sessionId?: string;
  type?: 'charge' | 'subscription';
  label?: string;
  amountCents?: number;
  currency?: string;
};

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

const PortalBilling: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
  const navigate = useNavigate();
  const { stripePromise, publishableKey } = useStripePromise();

  const [charges, setCharges] = useState<ClientCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [activeCheckout, setActiveCheckout] = useState<ActiveCheckout | null>(null);
  const [startingCheckout, setStartingCheckout] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const planOptions = useMemo<PlanOption[]>(() => {
    const plans: PlanOption[] = [];
    const hostingPrice = import.meta.env.VITE_STRIPE_HOSTING_PRICE_ID;
    const maintenancePrice = import.meta.env.VITE_STRIPE_MAINTENANCE_PRICE_ID;

    if (hostingPrice) {
      plans.push({
        id: "hosting",
        name: "Hosting + Maintenance",
        description: "Auto-billed hosting, updates, and monitoring.",
        priceId: hostingPrice,
      });
    }
    if (maintenancePrice) {
      plans.push({
        id: "maintenance",
        name: "Maintenance only",
        description: "Site care, updates, and priority support.",
        priceId: maintenancePrice,
      });
    }
    return plans;
  }, []);

  const fetchCharges = async () => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      setError("Please sign in through the client portal to view billing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/portal/me/charges`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load charges");
      setCharges(data.charges || data.data?.charges || []);
    } catch (err: any) {
      setError(err?.message || "Unable to load charges");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem("client_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/client/me`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const user = data?.user || data?.data?.user;
      if (user) setProfile(user);
    } catch (err) {
      console.warn("Unable to load profile", err);
    }
  };

  useEffect(() => {
    fetchCharges();
    fetchProfile();
  }, []);

  const startCheckout = async (chargeId: string) => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      navigate("/client");
      return;
    }
    const targetCharge = charges.find((c) => c.id === chargeId);
    if (targetCharge?.hostedInvoiceUrl) {
      setStatusText("Opening secure hosted invoice...");
      window.open(targetCharge.hostedInvoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!publishableKey) {
      setStatusText("Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to continue.");
      return;
    }
    setStartingCheckout(chargeId);
    setStatusText(null);
    try {
      const res = await fetch(`${API_BASE}/portal/charges/${chargeId}/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to start checkout");

      const clientSecret = data.clientSecret || data.client_secret;
      const sessionId = data.sessionId || data.session_id;
      if (!clientSecret) throw new Error("Checkout session is missing a client secret");

      setActiveCheckout({
        id: chargeId,
        clientSecret,
        sessionId,
        type: "charge",
        label: targetCharge?.label,
        amountCents: targetCharge?.amountCents,
        currency: targetCharge?.currency,
      });
      setStatusText("Secure checkout is ready below.");
    } catch (err: any) {
      setStatusText(err?.message || "Unable to start checkout");
    } finally {
      setStartingCheckout(null);
    }
  };

  const startSubscriptionCheckout = async (plan: PlanOption) => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      navigate("/client");
      return;
    }
    if (!publishableKey) {
      setSubscriptionStatus("Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to continue.");
      return;
    }
    setStartingCheckout(plan.id);
    setSubscriptionStatus(null);
    try {
      const customerRes = await fetch(`${API_BASE}/create-customer`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: profile?.email,
          name: profile?.name,
          clientId: profile?.id,
        }),
      });
      const customerData = await customerRes.json();
      if (!customerRes.ok) throw new Error(customerData.error || "Unable to create Stripe customer");

      const subscriptionRes = await fetch(`${API_BASE}/create-subscription`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerId: customerData.customerId,
          clientId: customerData.clientId,
          userId: customerData.userId,
          priceId: plan.priceId,
          metadata: { plan: plan.name },
          returnUrl: `${window.location.origin}/portal/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
        }),
      });
      const subData = await subscriptionRes.json();
      if (!subscriptionRes.ok) throw new Error(subData.error || "Unable to start subscription");

      const clientSecret = subData.clientSecret || subData.client_secret;
      const sessionId = subData.sessionId || subData.session_id;
      if (!clientSecret) throw new Error("Subscription checkout is missing a client secret");

      setActiveCheckout({
        id: plan.id,
        clientSecret,
        sessionId,
        type: "subscription",
        label: plan.name,
      });
      setSubscriptionStatus("Subscription checkout is ready below.");
    } catch (err: any) {
      setSubscriptionStatus(err?.message || "Unable to start subscription");
    } finally {
      setStartingCheckout(null);
    }
  };

  const pendingCharges = charges.filter((c) => (c.status || "").toLowerCase() !== "paid");
  const paidCharges = charges.filter((c) => (c.status || "").toLowerCase() === "paid");
  const activeCharge = activeCheckout?.type === "charge" ? charges.find((c) => c.id === activeCheckout.id) : null;

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

  const checkoutOptions = useMemo(
    () => (activeCheckout?.clientSecret ? { clientSecret: activeCheckout.clientSecret, elementsOptions: { appearance } } : null),
    [activeCheckout, appearance]
  );

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />

      <div className="relative max-w-5xl mx-auto pt-20 pb-16 px-4 md:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/client")} className="text-sm inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to portal
          </Button>
        </div>

        <div className={`${panelClass} p-6 md:p-8 space-y-4`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className={labelClass}>Billing</p>
              <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-2">
                <CreditCard size={22} className="text-primary" /> Your charges
              </h1>
              <p className="text-muted text-sm">Pay assigned charges without leaving the portal.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchCharges} className="text-sm">
                <RefreshCw size={14} className="mr-2" /> Refresh
              </Button>
            </div>
          </div>

          {statusText && (
            <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              {statusText}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}
          {!publishableKey && (
            <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to your environment to enable payments.
            </div>
          )}

          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Subscriptions</p>
                <p className="text-white font-semibold">Auto-bill hosting & maintenance</p>
                <p className="text-xs text-muted">Store a card on file for recurring services.</p>
              </div>
              {subscriptionStatus && (
                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  {subscriptionStatus}
                </div>
              )}
            </div>
            {planOptions.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {planOptions.map((plan) => (
                  <div key={plan.id} className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-2">
                    <p className="text-white font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted">{plan.description}</p>
                    <Button
                      variant="secondary"
                      className="text-sm"
                      disabled={!!startingCheckout}
                      onClick={() => startSubscriptionCheckout(plan)}
                    >
                      {startingCheckout === plan.id ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="animate-spin" size={14} /> Preparing...
                        </span>
                      ) : (
                        "Start subscription"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted bg-white/5 border border-white/10 rounded-lg p-3">
                Add Stripe price IDs to your environment (VITE_STRIPE_HOSTING_PRICE_ID or VITE_STRIPE_MAINTENANCE_PRICE_ID) to enable self-serve subscriptions.
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="animate-spin" size={16} /> Loading charges...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">Pending</p>
                  <span className="text-xs text-muted">{pendingCharges.length} item{pendingCharges.length === 1 ? "" : "s"}</span>
                </div>
                {pendingCharges.length ? (
                  <div className="space-y-3">
                    {pendingCharges.map((charge) => {
                      const status = (charge.status || "").toLowerCase();
                      const isFailed = status === "failed";
                      const statusLabel = isFailed ? "Failed" : "Pending";
                      const statusClass = isFailed
                        ? "border-red-400/40 text-red-200"
                        : "border-amber-400/40 text-amber-200";
                      return (
                        <div key={charge.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-white font-semibold">{charge.label}</p>
                              <p className="text-xs text-muted">{new Date(charge.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">{formatMoney(charge.amountCents, charge.currency)}</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] border ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted">
                              {charge.hostedInvoiceUrl ? "Open the hosted invoice to pay securely." : isFailed ? "Last attempt failed." : "Client not paid yet."}
                            </p>
                            <Button
                              onClick={() => startCheckout(charge.id)}
                              disabled={!!startingCheckout}
                              className="text-sm"
                              variant={isFailed ? "secondary" : "default"}
                            >
                              {startingCheckout === charge.id ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="animate-spin" size={14} /> Preparing
                                </span>
                              ) : (
                                charge.hostedInvoiceUrl ? "Pay invoice" : "Pay now"
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No unpaid charges.</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">Paid</p>
                  <span className="text-xs text-muted">{paidCharges.length} item{paidCharges.length === 1 ? "" : "s"}</span>
                </div>
                {paidCharges.length ? (
                  <div className="space-y-2">
                    {paidCharges.map((charge) => (
                      <div key={charge.id} className="p-3 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{charge.label}</p>
                          <p className="text-xs text-muted">{new Date(charge.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{formatMoney(charge.amountCents, charge.currency)}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] border border-green-400/40 text-green-200">
                            Paid
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No completed charges yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {activeCheckout && checkoutOptions && stripePromise && (
          <div className={`${panelClass} p-6 md:p-8 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={labelClass}>Checkout</p>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-secondary" /> Complete payment
                </h3>
                <p className="text-muted text-sm">Stay on this page to finish paying for your charge.</p>
              </div>
              {activeCharge ? (
                <div className="text-right">
                  <p className="text-xs text-muted">Amount</p>
                  <p className="text-xl font-bold text-white">{formatMoney(activeCharge.amountCents, activeCharge.currency)}</p>
                  <p className="text-xs text-muted mt-1">For {activeCharge.label}</p>
                </div>
              ) : activeCheckout?.type === "subscription" && (
                <div className="text-right">
                  <p className="text-xs text-muted">Subscription</p>
                  <p className="text-xl font-bold text-white">{activeCheckout.label || "Recurring plan"}</p>
                  <p className="text-xs text-muted mt-1">Card will be stored for automatic billing.</p>
                </div>
              )}
            </div>

            <CheckoutProvider stripe={stripePromise!} options={checkoutOptions}>
              <PaymentForm
                submitLabel="Confirm and pay"
                onSuccess={() => {
                  setStatusText("Payment submitted...");
                  if (activeCheckout?.type === "subscription") {
                    setSubscriptionStatus("Subscription payment submitted. Stripe will confirm shortly.");
                  }
                  fetchCharges();
                }}
                onError={(msg) => setStatusText(msg)}
              />
            </CheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalBilling;
