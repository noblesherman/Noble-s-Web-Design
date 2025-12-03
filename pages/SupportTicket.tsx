import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_OPTIONS = ["Open", "In Progress", "Closed"];

type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const SupportTicket: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
  const navigate = useNavigate();
  const panelClass = "rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-white/20";

  const token = useMemo(() => localStorage.getItem("client_token"), []);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Open");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/client");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/clients/tickets/${ticketId}`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.ticket) {
          setTicket(data.ticket);
          setStatus(data.ticket.status);
        } else {
          setError(data.error || "Ticket not found");
        }
      } catch (err) {
        setError("Unable to load ticket");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE, ticketId, navigate, token]);

  const updateStatus = async () => {
    if (!ticketId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/clients/tickets/${ticketId}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update status");
      setTicket(data.ticket);
    } catch (err: any) {
      setError(err?.message || "Unable to update status");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-sm text-muted">{error || "Ticket not found"}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white pt-24 pb-16 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.16),transparent_36%),radial-gradient(circle_at_40%_80%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />
      <div className="relative max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button className="text-muted hover:text-white flex items-center gap-2" onClick={() => navigate("/client")}>
            <ArrowLeft size={16} /> Back to portal
          </button>
          <button className="text-muted hover:text-white flex items-center gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${panelClass} p-6 space-y-4`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted font-semibold">Ticket</p>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{ticket.title}</h1>
              <div className="flex flex-wrap gap-2 text-xs text-muted">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{ticket.category}</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">{ticket.priority}</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">ID: {ticket.id}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs border ${
                ticket.status === "Closed"
                  ? "border-green-400/50 bg-green-400/10 text-green-200"
                  : ticket.status === "In Progress"
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                    : "border-cyan-400/50 bg-cyan-400/10 text-cyan-200"
              }`}>
                {status}
              </span>
              <p className="text-[11px] text-muted">Status updates are handled by Noble support.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <p className="uppercase tracking-[0.18em] text-[10px] text-muted">Category</p>
              <p className="text-white mt-1">{ticket.category}</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <p className="uppercase tracking-[0.18em] text-[10px] text-muted">Priority</p>
              <p className="text-white mt-1">{ticket.priority}</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-3">
              <p className="uppercase tracking-[0.18em] text-[10px] text-muted">Status</p>
              <p className="text-white mt-1">{ticket.status}</p>
            </div>
          </div>

          <div className="text-sm text-slate-200 whitespace-pre-wrap leading-6">
            {ticket.description}
          </div>

          <div className="text-xs text-muted">
            Opened {new Date(ticket.createdAt).toLocaleString()}
            {ticket.updatedAt ? ` • Updated ${new Date(ticket.updatedAt).toLocaleString()}` : ""}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportTicket;
