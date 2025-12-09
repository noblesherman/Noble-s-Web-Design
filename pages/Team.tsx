import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2, Phone, Mail, User, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  notes?: string | null;
  headshotUrl?: string | null;
};

export const Team: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_URL || "https://api.noblesweb.design").replace(/\/$/, "");
  const navigate = useNavigate();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "", phone: "", notes: "", headshotUrl: "", headshotBase64: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const panelClass = "rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-white/20";
  const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted font-semibold";

  const token = useMemo(() => localStorage.getItem("client_token"), []);

  useEffect(() => {
    if (!token) {
      navigate("/client");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/clients/team`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setMembers(data.members || []);
        else setError(data.error || "Unable to load team");
      } catch (err) {
        setError("Unable to load team");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API_BASE, navigate, token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", role: "", phone: "", notes: "", headshotUrl: "", headshotBase64: "" });
    setModalOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone,
      notes: member.notes || "",
      headshotUrl: member.headshotUrl || "",
      headshotBase64: "",
    });
    setModalOpen(true);
  };

  const handleHeadshotFile = (file?: File | null) => {
    if (!file) {
      setForm((f) => ({ ...f, headshotBase64: "", headshotUrl: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((f) => ({ ...f, headshotBase64: result }));
    };
    reader.readAsDataURL(file);
  };

  const saveMember = async () => {
    if (!form.name || !form.email || !form.role || !form.phone) return;
    setSaving(true);
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `${API_BASE}/api/clients/team/${editing.id}`
        : `${API_BASE}/api/clients/team`;
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save member");
      if (editing) {
        setMembers((prev) => prev.map((m) => (m.id === editing.id ? data.member : m)));
      } else {
        setMembers((prev) => [data.member, ...prev]);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: "", email: "", role: "", phone: "", notes: "", headshotUrl: "", headshotBase64: "" });
    } catch (err: any) {
      setError(err?.message || "Unable to save member");
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/clients/team/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err?.message || "Unable to delete member");
    } finally {
      setDeletingId(null);
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
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.16),transparent_36%),radial-gradient(circle_at_40%_80%,rgba(236,72,153,0.16),transparent_34%)]" />
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
            <div className="space-y-2 mt-1">
              <p className={labelClass}>Team Access</p>
              <h1 className="text-3xl font-bold leading-tight">Add a team member</h1>
              <p className="text-sm text-muted">Give your teammates access so we can onboard them to your site.</p>
            </div>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus size={16} /> Add member
          </Button>
        </div>

        {error && <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">{error}</div>}
        {loading ? (
          <div className="flex items-center gap-2 text-muted">
            <Loader2 className="animate-spin" size={16} /> Loading team...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className={`${panelClass} p-4`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-sm text-white/80 border border-white/10">
                      {member.headshotUrl ? (
                        <img src={member.headshotUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-muted" />
                          <p className="text-lg font-semibold">{member.name}</p>
                        </div>
                        <p className="text-sm text-muted">{member.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-muted hover:text-white" onClick={() => openEdit(member)}>
                      <Pencil size={16} />
                    </button>
                    <button className="text-muted hover:text-red-400" onClick={() => deleteMember(member.id)}>
                      {deletingId === member.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <Mail size={14} /> {member.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} /> {member.phone}
                  </div>
                  {member.notes && <p className="text-xs text-muted/80 bg-white/5 border border-white/10 rounded-lg p-2">{member.notes}</p>}
                </div>
              </div>
            ))}
            {!members.length && (
              <div className={`${panelClass} col-span-full text-sm text-muted border-dashed border-white/15`}>
                No team members yet. Add your first teammate to collaborate.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-surface border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editing ? "Edit member" : "Add member"}</h2>
              <button className="text-muted hover:text-white" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            {error && <div className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="file"
                accept="image/*"
                className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white"
                onChange={(e) => handleHeadshotFile(e.target.files?.[0] || null)}
              />
              <input
                className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white"
                placeholder="Headshot URL (optional)"
                value={form.headshotUrl}
                onChange={(e) => setForm({ ...form, headshotUrl: e.target.value })}
              />
            </div>
            {form.headshotBase64 && (
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Image selected</span>
              </div>
            )}
            <textarea className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white h-24" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={saveMember} disabled={saving || !form.name || !form.email || !form.role || !form.phone}>
                {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Saving</span> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
