import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ClientContractsList } from "../components/ClientContractsList";
import { FileText, Clock, ExternalLink, FileSignature, RefreshCw, Users, LifeBuoy, Loader2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Client: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_URL || "https://api.noblesweb.design").replace(/\/$/, "");
  const TEAM_ENABLED = import.meta.env.VITE_FEATURE_TEAM_ENABLED !== "false";
  const TICKETS_ENABLED = import.meta.env.VITE_FEATURE_TICKETS_ENABLED !== "false";
  const navigate = useNavigate();

  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "firstTime">("login");
  const [firstTimeStep, setFirstTimeStep] = useState<"pin" | "password">("pin");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(false);
  const [hydrateError, setHydrateError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [contractsOpen, setContractsOpen] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({ title: "", description: "", priority: "Medium", category: "General" });
  const [ticketSaving, setTicketSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState({ name: "", email: "", role: "", phone: "", notes: "" });
  const [teamSaving, setTeamSaving] = useState(false);
  const filesByProject = React.useMemo(() => {
    const grouping: Record<string, any[]> = {};
    (files || []).forEach((file: any) => {
      const key = file.project?.name || "General";
      if (!grouping[key]) grouping[key] = [];
      grouping[key].push(file);
    });
    return grouping;
  }, [files]);
  const panelClass = "rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5";
  const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted font-semibold";
  const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
  const formatMoney = (cents?: number | null, currency = "usd") => {
    if (!cents && cents !== 0) return "—";
    const amount = Math.max(0, cents) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Restore existing session
  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      setLoading(false);
      return;
    }

    const hydrate = async () => {
      try {
        const meRes = await fetch(`${API_BASE}/api/client/me`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        const profile = meData.user || meData.data?.user;
        if (meData?.error || !profile) {
          setLoading(false);
          setHydrateError(meData?.error || "Session expired. Please sign in again.");
          return;
        }

        setUser(profile);
        setIsAuth(true);
        await hydrateClient(token);
      } catch (err) {
        console.error("Unable to restore client session", err);
        setHydrateError("Unable to restore session. Please sign in again.");
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  const fetchProject = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/client/projects`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const projectList = data?.projects || (data?.data?.projects ?? []);
      if (Array.isArray(projectList)) {
        setProjects(projectList);
      }
      if (data?.project || data?.data?.project) {
        setProject(data.project || data?.data?.project);
      } else if (Array.isArray(projectList) && projectList.length) {
        setProject(projectList[0]);
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error("Unable to load project", err);
    }
  };

  const fetchFiles = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/client/files`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.files) setFiles(data.files);
    } catch (err) {
      console.error("Unable to load files", err);
    }
  };

  const fetchContracts = async (token: string) => {
    setContractsLoading(true);
    setContractsError(null);
    try {
      const res = await fetch(`${API_BASE}/api/client/contracts`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data?.contracts) {
        setContracts(data.contracts);
      } else if (data?.data?.contracts) {
        setContracts(data.data.contracts);
      } else if (data?.error) {
        setContractsError(data.error);
      }
    } catch (err) {
      setContractsError("Unable to load contracts");
    } finally {
      setContractsLoading(false);
    }
  };

  const fetchTickets = async (token: string) => {
    if (!TICKETS_ENABLED) return;
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const res = await fetch(`${API_BASE}/api/client/tickets`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data?.tickets) {
        setTickets(data.tickets);
      } else if (data?.error) {
        setTicketsError(data.error);
      }
    } catch (err) {
      setTicketsError("Unable to load tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchTeam = async (token: string) => {
    if (!TEAM_ENABLED) return;
    setTeamLoading(true);
    setTeamError(null);
    try {
      const res = await fetch(`${API_BASE}/api/clients/team`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data?.members) {
        setTeamMembers(data.members);
      } else if (data?.error) {
        setTeamError(data.error);
      }
    } catch (err) {
      setTeamError("Unable to load team members");
    } finally {
      setTeamLoading(false);
    }
  };

  const hydrateClient = async (token: string) => {
    setHydrating(true);
    setHydrateError(null);
    try {
      await Promise.all([
        fetchProject(token),
        fetchFiles(token),
        fetchContracts(token),
        fetchTickets(token),
        fetchTeam(token),
      ]);
    } catch (err) {
      console.error("hydrate error", err);
      setHydrateError("Unable to load your dashboard right now. Please refresh or sign in again.");
    } finally {
      setHydrating(false);
    }
  };

  const submitTicket = async () => {
    if (!TICKETS_ENABLED) return;
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) return;
    const token = localStorage.getItem("client_token");
    if (!token) {
      setError("Please log in again.");
      return;
    }
    setTicketSaving(true);
    setTicketsError(null);
    try {
      const res = await fetch(`${API_BASE}/api/client/tickets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(ticketForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to submit ticket");
      setTickets((prev) => [data.ticket, ...(prev || [])]);
      setTicketForm({ title: "", description: "", priority: "Medium", category: "General" });
    } catch (err: any) {
      setTicketsError(err?.message || "Unable to submit ticket");
    } finally {
      setTicketSaving(false);
    }
  };

  const submitTeamMember = async () => {
    if (!TEAM_ENABLED) return;
    if (!teamForm.name || !teamForm.email || !teamForm.role || !teamForm.phone) return;
    const token = localStorage.getItem("client_token");
    if (!token) {
      setError("Please log in again.");
      return;
    }
    setTeamSaving(true);
    setTeamError(null);
    try {
      const res = await fetch(`${API_BASE}/api/clients/team`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(teamForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to add team member");
      setTeamMembers((prev) => [data.member, ...(prev || [])]);
      setTeamForm({ name: "", email: "", role: "", phone: "", notes: "" });
    } catch (err: any) {
      setTeamError(err?.message || "Unable to add team member");
    } finally {
      setTeamSaving(false);
    }
  };

  const login = async () => {
    setError(null);
    setAuthMessage(null);
    setInviteToken(null);
    setFirstTimeStep("pin");
    setHydrateError(null);
    const res = await fetch(`${API_BASE}/api/client/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("client_token", data.token);
      const profile = data.user || data.data?.user;
      if (!profile) {
        setError("Login succeeded but profile is missing. Please try again.");
        return;
      }
      setUser(profile);
      setIsAuth(true);
      hydrateClient(data.token);
    } else {
      setError(data.error || "Please check your email or password.");
    }
  };

  const startFirstTime = async () => {
    setError(null);
    setAuthMessage(null);
    const res = await fetch(`${API_BASE}/api/client/auth/start`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pin }),
    });
    const data = await res.json();
    if (res.ok && (data.inviteToken || data.data?.inviteToken)) {
      const token = data.inviteToken || data.data?.inviteToken;
      setInviteToken(token);
      setFirstTimeStep("password");
      setAuthMessage(data.message || "PIN verified. Create your password.");
    } else {
      setError(data.error || "Invalid PIN. Please try again.");
    }
  };

  const completeInvite = async () => {
    setError(null);
    setAuthMessage(null);
    setHydrateError(null);
    const tokenPayload = inviteToken;
    const res = await fetch(`${API_BASE}/api/client/auth/complete`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteToken: tokenPayload || undefined,
        email,
        pin,
        password: newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("client_token", data.token);
      const profile = data.user || data.data?.user;
      if (!profile) {
        setError("Profile missing after activation. Please log in again.");
        return;
      }
      setUser(profile);
      setIsAuth(true);
      hydrateClient(data.token);
      setAuthMessage("Account activated");
    } else {
      setError(data.error || "Invalid pin or password");
    }
  };

  const logout = () => {
    localStorage.removeItem("client_token");
    setIsAuth(false);
    setUser(null);
    setProjects([]);
    setProject(null);
    setFiles([]);
    setContracts([]);
    setTickets([]);
    setTeamMembers([]);
    setInviteToken(null);
    setFirstTimeStep("pin");
    setAuthMessage(null);
    setHydrateError(null);
  };

  const toggleContracts = () => {
    setContractsOpen((prev) => {
      const next = !prev;
      if (!prev) {
        const token = localStorage.getItem("client_token");
        if (token) fetchContracts(token);
      }
      return next;
    });
  };

  const goToTeam = () => {
    if (!localStorage.getItem("client_token")) {
      navigate("/client");
      return;
    }
    navigate("/team");
  };
  const goToSupport = () => {
    if (!localStorage.getItem("client_token")) {
      navigate("/client");
      return;
    }
    navigate("/support");
  };

  const refreshContracts = () => {
    const token = localStorage.getItem("client_token");
    if (token) fetchContracts(token);
  };

  const goToBilling = () => {
    if (!localStorage.getItem("client_token")) {
      navigate("/client");
      return;
    }
    navigate("/portal/billing");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstTimeStep === "pin") {
      startFirstTime();
    } else {
      completeInvite();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center text-white">Loading...</div>;
  }

  // LOGIN SCREEN
  if (!isAuth) {
    return (
      <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-90 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.16),transparent_32%)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-6"
          >
            <p className={labelClass}>Client Portal</p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight">
              A private, premium room for your builds.
            </h1>
            <p className="text-muted text-lg">
              Sign in to review deliverables, sign contracts, and watch progress in real-time. Designed to feel like Noble is sitting right beside you.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: "Contracts", desc: "ESIGN compliant, DocuSeal powered", icon: FileSignature },
                { title: "Support", desc: "Priority tickets & updates", icon: LifeBuoy },
                { title: "Status", desc: "Launch plans, milestones, uptime", icon: Clock },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-primary" />
                      <span className="font-semibold">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="w-full"
          >
            <div className={`${panelClass} p-8 lg:p-10`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className={labelClass}>Secure access</p>
                  <h2 className="text-2xl font-semibold mt-2">Welcome back</h2>
                  <p className="text-sm text-muted">Log in or activate your invite-only account.</p>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-muted">
                  Invite-only
                </div>
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <button
                  className={`flex-1 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${mode === "login" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-muted hover:text-white"
                    }`}
                  onClick={() => {
                    setMode("login");
                    setFirstTimeStep("pin");
                    setInviteToken(null);
                    setAuthMessage(null);
                    setError(null);
                    setNewPassword("");
                    setPin("");
                  }}
                >
                  Login
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${mode === "firstTime" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-muted hover:text-white"
                    }`}
                  onClick={() => {
                    setMode("firstTime");
                    setFirstTimeStep("pin");
                    setInviteToken(null);
                    setAuthMessage(null);
                    setError(null);
                    setNewPassword("");
                  }}
                >
                  First-time setup
                </button>
              </div>

              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={mode}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {mode === "login" && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Email</label>
                        <input
                          type="email"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
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
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 px-4 py-3 text-sm font-semibold transition-colors shadow-lg shadow-primary/20"
                      >
                        Login
                      </button>
                    </form>
                  )}

                  {mode === "firstTime" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Activate your invite</h2>
                        <form onSubmit={handleActivateSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Email</label>
                            <input
                              type="email"
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                              placeholder="you@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              disabled={firstTimeStep === "password" && !!inviteToken}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-slate-300">Temporary PIN</label>
                            <input
                              type="text"
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                              placeholder="6-digit code"
                              value={pin}
                              onChange={(e) => setPin(e.target.value)}
                              required
                              disabled={firstTimeStep === "password" && !!inviteToken}
                            />
                          </div>

                          {firstTimeStep === "password" && (
                            <div className="space-y-2">
                              <label className="text-sm text-slate-300">Create password</label>
                              <input
                                type="password"
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-primary/60 focus:outline-none"
                                placeholder="Create a password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                              />
                            </div>
                          )}

                          {authMessage && (
                            <div className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
                              {authMessage}
                            </div>
                          )}

                          <div className="flex flex-col gap-3">
                            <button
                              type="submit"
                              className="w-full inline-flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-600 px-4 py-3 text-sm font-semibold transition-colors shadow-lg shadow-green-500/20"
                            >
                              {firstTimeStep === "pin" ? "Verify PIN" : "Create password"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setMode("login")}
                              className="w-full inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:border-white/30 hover:bg-white/10 transition-colors"
                            >
                              Back to Login
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="mt-6 text-xs text-slate-500 text-center">Registration is invite-only. Contact Noble for access.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const unsignedContracts = (contracts || []).filter(
    (c: any) => (c.status || "").toLowerCase() !== "signed"
  ).length;

  // DASHBOARD
  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_40%_70%,rgba(236,72,153,0.16),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/10 to-transparent blur-3xl" />
      {hydrating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm text-sm text-white">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/15 bg-white/5">
            <Loader2 className="animate-spin" size={16} /> Loading your dashboard...
          </div>
        </div>
      )}
      <div className="relative max-w-6xl mx-auto pt-28 pb-24 px-4 md:px-8 space-y-10">
        {hydrateError && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-100 p-4 text-sm">
            {hydrateError}
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <p className={labelClass}>Client Portal</p>
            <h1 className="text-4xl font-heading font-bold text-white">
              Welcome, {user?.name || "Client"}
            </h1>
            <p className="text-muted">{user?.email}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted">Project access</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted">
                {unsignedContracts > 0 ? `${unsignedContracts} contract${unsignedContracts > 1 ? "s" : ""} pending` : "All contracts signed"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={logout}>Sign Out</Button>
          </div>
        </div>

        {/* Project Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`${panelClass} p-8 bg-gradient-to-br from-surface to-background relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-4 bg-green-500/10 text-green-500 text-sm font-mono font-bold rounded-bl-xl border-b border-l border-green-500/20">
            STATUS: {project?.statusBadge || project?.status?.toUpperCase() || "ACTIVE"}
          </div>

          <h2 className="text-2xl text-white font-bold mb-6">{project?.name || "Project"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-sm text-muted mb-1">Timeline</p>
              <p className="text-white font-semibold">{project?.timelineLabel || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Next Milestone</p>
              <p className="text-white font-semibold">{project?.nextMilestone || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Launch Date</p>
              <p className="text-white font-semibold">
                {project?.launchDate ? new Date(project.launchDate).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Budget Used</p>
              <p className="text-white font-semibold">{project?.budgetUsed ? `$${project.budgetUsed}` : "—"}</p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            {project?.stagingUrl && (
              <a
                href={project.stagingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white border border-white/5 transition-colors"
              >
                <ExternalLink size={16} /> View Staging
              </a>
            )}
            {project?.designSystemUrl && (
              <a
                href={project.designSystemUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white border border-white/5 transition-colors"
              >
                <FileText size={16} /> Design System
              </a>
            )}
          </div>

          {projects.length > 1 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Other projects</p>
              <div className="grid gap-2">
                {projects.slice(1).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-xs text-muted">{p.statusBadge || p.status}</p>
                    </div>
                    <span className="text-xs text-muted">{p.timelineLabel || p.nextMilestone || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3 }}
            className={`${panelClass} p-8`}
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock size={20} className="text-accent" /> Recent Activity
            </h3>

            <div className="space-y-6">
              {(project?.activities || []).map((item: any, i: number) => (
                <div key={item.id || i} className="flex items-center gap-4 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.occurredAt ? new Date(item.occurredAt).toLocaleDateString() : ""} {item.category ? `• ${item.category}` : ""}
                    </p>
                  </div>
                  {item.category && <span className="text-xs border border-white/10 px-2 py-1 rounded text-muted">{item.category}</span>}
                </div>
              ))}
              {(!project?.activities || project.activities.length === 0) && (
                <p className="text-muted text-sm">No activity yet.</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className={`${panelClass} p-8`}
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={20} className="text-secondary" /> Documents
            </h3>

            <div className="space-y-4">
              {Object.keys(filesByProject).length ? (
                Object.entries(filesByProject).map(([group, docs]) => (
                  <div key={group} className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">{group === "General" ? "Files" : group}</p>
                    <div className="space-y-2">
                      {docs.map((doc: any, i: number) => (
                        <div key={doc.id || i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 text-white rounded">
                              <FileText size={18} />
                            </div>
                            <div>
                              <p className="text-white text-sm font-bold">{doc.name}</p>
                              <p className="text-xs text-muted">
                                {(doc.project?.name ? `${doc.project.name} • ` : "")}{doc.fileType || ""}
                              </p>
                            </div>
                          </div>
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-white text-sm">Open</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-sm">No documents yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
          className={`${panelClass} p-8`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className={labelClass}>Billing</p>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard size={20} className="text-secondary" /> Invoices & payments
              </h3>
              <p className="text-muted text-sm">Review charges and pay securely without leaving the portal.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={goToBilling} className="text-xs px-3 py-2">
                Open billing
              </Button>
              <Button variant="outline" onClick={() => navigate("/support")} className="text-xs px-3 py-2">
                Need help?
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-semibold text-base">Embedded checkout</p>
              <p className="text-xs text-muted mt-1">Stripe’s Payment Element sits inside the portal so you never leave.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-semibold text-base">Clear status</p>
              <p className="text-xs text-muted mt-1">Charges stay pending until paid, then flip to a recorded payment.</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white font-semibold text-base">One hub</p>
              <p className="text-xs text-muted mt-1">Invoices, support, and projects all live in your portal.</p>
            </div>
          </div>
        </motion.div>

        {(TEAM_ENABLED || TICKETS_ENABLED) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TICKETS_ENABLED && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3 }}
                className={`${panelClass} p-8 space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={labelClass}>Support</p>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <LifeBuoy size={18} /> Tickets
                    </h3>
                    <p className="text-sm text-muted">Submit a request or check status.</p>
                  </div>
                  <Button variant="outline" onClick={goToSupport} className="text-xs">Open full view</Button>
                </div>
                {ticketsError && <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">{ticketsError}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Subject" value={ticketForm.title} onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })} />
                  <select className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}>
                    {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <select className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}>
                    {["General", "Billing", "Bug", "Feature"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <textarea
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white h-28"
                  placeholder="Describe the issue"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <Button onClick={submitTicket} disabled={ticketSaving || !ticketForm.title || !ticketForm.description}>
                    {ticketSaving ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Sending</span> : "Submit ticket"}
                  </Button>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem("client_token");
                      if (token) fetchTickets(token);
                    }}
                    className="text-xs text-muted hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
                <div className="divide-y divide-white/10 border border-white/10 rounded-xl">
                  {ticketsLoading ? (
                    <div className="p-4 text-sm text-muted flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Loading tickets...</div>
                  ) : tickets.length ? (
                    tickets.slice(0, 4).map((t) => (
                      <div key={t.id} className="p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold">{t.title}</p>
                          <span className={`px-2 py-1 rounded-full text-[11px] border ${t.status === "Closed"
                              ? "border-green-400/40 text-green-200"
                              : t.status === "In Progress"
                                ? "border-amber-400/40 text-amber-200"
                                : "border-cyan-400/40 text-cyan-200"
                            }`}>{t.status}</span>
                        </div>
                        <p className="text-sm text-muted line-clamp-2">{t.description}</p>
                        {t.adminMessage && <p className="text-xs text-primary">Admin note: {t.adminMessage}</p>}
                        <p className="text-[11px] text-muted">Opened {t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-muted">No tickets yet.</div>
                  )}
                </div>
              </motion.div>
            )}

            {TEAM_ENABLED && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3 }}
                className={`${panelClass} p-8 space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={labelClass}>Team</p>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Users size={18} /> Your collaborators
                    </h3>
                    <p className="text-sm text-muted">We’ll add anyone you list here.</p>
                  </div>
                  <Button variant="outline" onClick={goToTeam} className="text-xs">Open full view</Button>
                </div>
                {teamError && <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">{teamError}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Name" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} />
                  <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Email" value={teamForm.email} onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} />
                  <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Role" value={teamForm.role} onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })} />
                  <input className="bg-background border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Phone" value={teamForm.phone} onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })} />
                </div>
                <textarea className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm text-white h-24" placeholder="Notes (optional)" value={teamForm.notes} onChange={(e) => setTeamForm({ ...teamForm, notes: e.target.value })} />
                <div className="flex items-center gap-2">
                  <Button onClick={submitTeamMember} disabled={teamSaving || !teamForm.name || !teamForm.email || !teamForm.role || !teamForm.phone}>
                    {teamSaving ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Sending</span> : "Add team member"}
                  </Button>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem("client_token");
                      if (token) fetchTeam(token);
                    }}
                    className="text-xs text-muted hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
                <div className="space-y-2">
                  {teamLoading ? (
                    <div className="text-sm text-muted flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Loading team...</div>
                  ) : teamMembers.length ? (
                    teamMembers.slice(0, 4).map((member) => (
                      <div key={member.id} className="p-3 border border-white/10 rounded-lg bg-white/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">{member.name}</p>
                            <p className="text-xs text-muted">{member.role}</p>
                          </div>
                          <p className="text-xs text-muted">{member.phone}</p>
                        </div>
                        <p className="text-xs text-muted">{member.email}</p>
                        {member.notes && <p className="text-xs text-muted mt-1">{member.notes}</p>}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted">No team members yet.</div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
          className={`${panelClass} p-8 mt-8`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <FileSignature size={20} className="text-primary" /> Contracts
              </h3>
              <p className="text-muted text-sm">
                Legally binding, ESIGN compliant agreements for your project.
              </p>
              {contractsError && (
                <p className="text-xs text-amber-300 mt-2">{contractsError}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {contractsOpen && (
                <button
                  onClick={refreshContracts}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              )}
              <button
                onClick={toggleContracts}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                View &amp; Sign Contracts
              </button>
            </div>
          </div>

          <div className="mt-6">
            {contractsOpen ? (
              <ClientContractsList
                contracts={contracts}
                loading={contractsLoading}
                onRefresh={refreshContracts}
              />
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted">
                {unsignedContracts > 0
                  ? `${unsignedContracts} contract${unsignedContracts > 1 ? "s" : ""} pending signature.`
                  : "All assigned contracts are signed."}
              </div>
            )}
          </div>
        </motion.div>

        {!project && (
          <div className={`${panelClass} p-8 text-white mt-8`}>
            <p>No project assigned yet. Contact Noble for access.</p>
          </div>
        )}
      </div>
    </div>
  );
};
