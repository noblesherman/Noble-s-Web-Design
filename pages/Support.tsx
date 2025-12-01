import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Loader2, PlusCircle, LifeBuoy, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  createdAt: string;
};

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Closed"];

export const Support: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const navigate = useNavigate();
  const panelClass = "rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-white/20";
  const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted font-semibold";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", category: "General" });

  const token = useMemo(() => localStorage.getItem("client_token"), []);

  useEffect(() => {
    if (!token) {
      navigate("/client");
      return;
    }
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const query = statusFilter !== "All" ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const res = await fetch(`${API_BASE}/clients/tickets${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTickets(data.tickets || []);
      else setError(data.error || "Unable to load tickets");
    } catch (err) {
      setError("Unable to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/clients/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to submit ticket");
      setTickets((prev) => [data.ticket, ...prev]);
      setCreateOpen(false);
      setForm({ title: "", description: "", priority: "Medium", category: "General" });
    } catch (err: any) {
      setError(err?.message || "Unable to submit ticket");
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        Redirecting to client login...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white pt-24 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.16),transparent_36%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />
      <div className="relative max-w-6xl mx-auto space-y-6">
        <div className={`${panelClass} p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/client")}
              className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors text-sm"
            >
              <ArrowLeft size={16} /> Back to portal
            </button>
            <div>
              <p className={labelClass}>Support</p>
              <h1 className="text-3xl font-bold">Tickets</h1>
              <p className="text-sm text-muted">Submit issues and track status.</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
            <PlusCircle size={16} /> New ticket
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs border ${
                statusFilter === s ? "border-primary bg-primary/10 text-white" : "border-white/10 text-muted hover:border-white/30"
              }`}
            >
              {s}
            </button>
          ))}
          <button onClick={loadTickets} className="flex items-center gap-2 text-xs text-muted hover:text-white">
            <Loader2 className="animate-spin" size={14} /> Refresh
          </button>
        </div>

        {error && <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">{error}</div>}
        {loading ? (
          <div className="flex items-center gap-2 text-muted">
            <Loader2 className="animate-spin" size={16} /> Loading tickets...
          </div>
        ) : tickets.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((t) => (
              <Link key={t.id} to={`/support/${t.id}`} className={`${panelClass} p-4 hover:border-primary/40 transition-colors block`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{t.title}</p>
                    <p className="text-sm text-muted">{t.category} • {t.priority}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] border ${
                    t.status === "Closed"
                      ? "border-green-400/50 bg-green-400/10 text-green-200"
                      : t.status === "In Progress"
                        ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                        : "border-cyan-400/50 bg-cyan-400/10 text-cyan-200"
                  }`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-sm text-muted mt-2 line-clamp-3">{t.description}</p>
                <p className="text-[11px] text-muted mt-3">Opened {new Date(t.createdAt).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`${panelClass} text-sm text-muted border-dashed border-white/15`}>
            No tickets yet. Create your first support request.
          </div>
        )}
      </div>

      {createOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${panelClass} w-full max-w-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">New Ticket</p>
                <h2 className="text-xl font-semibold">Tell us what’s happening</h2>
              </div>
              <button className="text-muted hover:text-white" onClick={() => setCreateOpen(false)}>✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <select className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
              </select>
              <select className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["General", "Billing", "Bug", "Feature"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <textarea className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white h-32" placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={createTicket} disabled={saving || !form.title.trim() || !form.description.trim()}>
                {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Submitting</span> : "Submit ticket"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
