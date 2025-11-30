import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus,
  Github,
  Trash2,
  Edit,
  LogOut,
  Activity,
  FileSignature,
  RefreshCw,
  LifeBuoy,
  Loader2,
} from "lucide-react";
import { BLOG_POSTS } from "../constants";
import { BlogPost } from "../types";
import { AlertSettings, UptimeLog, UptimeTarget } from "../types/admin";
import { UptimeSection } from "../components/admin/UptimeSection";
import { AlertSettingsPanel } from "../components/admin/AlertSettingsPanel";

export const Admin: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const DOCUSEAL_EMBED_URL = import.meta.env.VITE_DOCUSEAL_EMBED_URL || "https://www.docuseal.com/docs/embed";

  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"dashboard" | "blog" | "leads" | "clients" | "projects" | "contracts" | "uptime" | "settings" | "tickets">("dashboard");

  const [posts, setPosts] = useState<BlogPost[]>(BLOG_POSTS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePin, setInvitePin] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [leadActionStatus, setLeadActionStatus] = useState<string | null>(null);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadFilters, setLeadFilters] = useState({ query: "", status: "all" });
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: "", description: "", status: "active" });
  const [assignProjectId, setAssignProjectId] = useState<string>("");
  const [assignUserId, setAssignUserId] = useState<string>("");
  const [assignRole, setAssignRole] = useState<string>("");
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractForm, setContractForm] = useState({ title: "", version: "1.0", body: "", docusealEmbedUrl: "" });
  const [docusealTemplateId, setDocusealTemplateId] = useState("");
  const [assignContractId, setAssignContractId] = useState<string>("");
  const [assignContractUserId, setAssignContractUserId] = useState<string>("");
  const [contractFetchStatus, setContractFetchStatus] = useState<string | null>(null);
  const [contractCreateStatus, setContractCreateStatus] = useState<string | null>(null);
  const [contractAssignStatus, setContractAssignStatus] = useState<string | null>(null);
  const [contractDeleteStatus, setContractDeleteStatus] = useState<string | null>(null);
  const [contractAssignLoading, setContractAssignLoading] = useState(false);
  const [contractDeleteLoading, setContractDeleteLoading] = useState<string | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [projectDrafts, setProjectDrafts] = useState<Record<string, any>>({});
  const [activityDraft, setActivityDraft] = useState<Record<string, { title: string; category: string }>>({});
  const [docDraft, setDocDraft] = useState<Record<string, { title: string; status: string; amount: string; dueDate: string; url: string }>>({});
  const [fileClientId, setFileClientId] = useState<string>("");
  const [fileProjectId, setFileProjectId] = useState<string>("");
  const [fileBase64, setFileBase64] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const [uptimeTargets, setUptimeTargets] = useState<UptimeTarget[]>([]);
  const [uptimeLogs, setUptimeLogs] = useState<UptimeLog[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [uptimeLoading, setUptimeLoading] = useState(false);
  const [uptimeSaving, setUptimeSaving] = useState(false);
  const [uptimeStatus, setUptimeStatus] = useState<string | null>(null);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({ alertThreshold: 2 });
  const [alertSettingsStatus, setAlertSettingsStatus] = useState<string | null>(null);
  const [alertSettingsLoading, setAlertSettingsLoading] = useState(false);
  const [testAlertStatus, setTestAlertStatus] = useState<string | null>(null);
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [ticketsStatusFilter, setTicketsStatusFilter] = useState<string>("All");
  const [ticketsSearch, setTicketsSearch] = useState<string>("");
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [teamViewClientId, setTeamViewClientId] = useState<string>("");
  const [teamViewMembers, setTeamViewMembers] = useState<any[]>([]);
  const [teamViewLoading, setTeamViewLoading] = useState(false);

  const navItems: { id: typeof activeView; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "blog", label: "Blog Posts", icon: FileText },
    { id: "leads", label: "Leads", icon: Users },
    { id: "uptime", label: "Uptime", icon: Activity },
    { id: "tickets", label: "Support", icon: LifeBuoy },
    { id: "contracts", label: "Contracts", icon: FileSignature },
    { id: "clients", label: "Clients", icon: Users },
    { id: "projects", label: "Projects", icon: LayoutDashboard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const viewVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  const panelClass =
    "rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-[0_16px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5";
  const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted font-semibold";
  const currentNav = navItems.find((n) => n.id === activeView);

  // Check session on load
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/me`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setIsAuth(true);
        setLoading(false);
        if (!data.error) {
          refreshClients();
          refreshProjects();
          refreshLeads();
          refreshUptimeTargets();
          refreshContracts();
          loadAlertSettings();
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    if (activeView === "uptime") {
      refreshUptimeTargets();
    }
    if (activeView === "contracts") {
      refreshContracts();
      refreshClients();
    }
    if (activeView === "settings") {
      loadAlertSettings();
    }
    if (activeView === "tickets") {
      refreshAdminTickets();
    }
  }, [activeView, isAuth]);

  useEffect(() => {
    if (!isAuth || activeView !== "leads") return;
    refreshLeads(leadFilters);
  }, [leadFilters, activeView, isAuth]);

  useEffect(() => {
    if (!projects.length) return;
    setProjectDrafts((prev) => {
      const next = { ...prev };
      projects.forEach((project) => {
        if (!next[project.id]) {
          next[project.id] = {
            statusBadge: project.statusBadge || "",
            timelineLabel: project.timelineLabel || "",
            nextMilestone: project.nextMilestone || "",
            launchDate: project.launchDate ? project.launchDate.substring(0, 10) : "",
            budgetUsed: project.budgetUsed ?? "",
            stagingUrl: project.stagingUrl || "",
            designSystemUrl: project.designSystemUrl || "",
            description: project.description || "",
          };
        }
      });
      return next;
    });
    setActivityDraft((prev) => {
      const next = { ...prev };
      projects.forEach((project) => {
        if (!next[project.id]) {
          next[project.id] = { title: "", category: "" };
        }
      });
      return next;
    });
    setDocDraft((prev) => {
      const next = { ...prev };
      projects.forEach((project) => {
        if (!next[project.id]) {
          next[project.id] = { title: "", status: "", amount: "", dueDate: "", url: "" };
        }
      });
      return next;
    });
  }, [projects]);

  const handleDeletePost = (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleCreateInvite = async () => {
    issueClientPin();
  };

  const issueClientPin = async (payload?: { email?: string; name?: string }) => {
    const targetEmail = payload?.email || inviteEmail;
    const targetName = payload?.name || inviteName;
    setInviteStatus(null);
    setInviteError(null);
    setInvitePin(null);
    setInviteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients/issue-pin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, name: targetName }),
      });
      const data = await res.json();
      if (res.ok && data.pin) {
        setInvitePin(data.pin);
        const expires = data.expiresAt
          ? new Date(data.expiresAt).toLocaleString()
          : "soon";
        setInviteStatus(payload ? `New PIN sent to ${targetEmail}. Expires ${expires}` : `PIN created. Expires ${expires}`);
        if (!payload) {
          setInviteEmail("");
          setInviteName("");
        }
      } else {
        setInviteError(data.error || "Unable to create invite");
      }
      refreshClients();
    } catch (err) {
      setInviteError("Unable to create invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResendPin = (client: any) => {
    if (!client?.email) return;
    setInviteEmail(client.email || "");
    setInviteName(client.name || "");
    issueClientPin({ email: client.email, name: client.name });
  };

  const refreshClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients`, { credentials: "include" });
      const data = await res.json();
      if (data.clients) setClients(data.clients);
    } catch (err: any) {
      setProjectStatus(err?.message || "Unable to assign project");
    }
  };

  const refreshProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects`, { credentials: "include" });
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch {}
  };

  const refreshLeads = async (filters = leadFilters) => {
    setLeadLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append("search", filters.query);
      if (filters.status !== "all") params.append("status", filters.status);
      const res = await fetch(`${API_BASE}/api/admin/leads?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch {
      // ignore
    } finally {
      setLeadLoading(false);
    }
  };

  const refreshUptimeTargets = async () => {
    setUptimeLoading(true);
    setUptimeStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/uptime`, { credentials: "include" });
      const data = await res.json();
      if (data.targets) {
        setUptimeTargets(data.targets);
        if (data.targets.length && !selectedTargetId) {
          setSelectedTargetId(data.targets[0].id);
          await loadUptimeLogs(data.targets[0].id);
        } else if (selectedTargetId) {
          const exists = data.targets.find((t: UptimeTarget) => t.id === selectedTargetId);
          if (exists) {
            await loadUptimeLogs(selectedTargetId);
          }
        }
      }
    } catch {
      setUptimeStatus("Unable to load uptime targets.");
    } finally {
      setUptimeLoading(false);
    }
  };

  const loadUptimeLogs = async (targetId: string) => {
    if (!targetId) return;
    setSelectedTargetId(targetId);
    setUptimeLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/uptime/logs/${targetId}?limit=75`, { credentials: "include" });
      const data = await res.json();
      setUptimeLogs(data.logs || []);
    } catch {
      setUptimeStatus("Unable to load logs.");
    } finally {
      setUptimeLoading(false);
    }
  };

  const saveUptimeTarget = async (payload: { id?: string; url: string; checkInterval: number }) => {
    setUptimeSaving(true);
    setUptimeStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/uptime`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save target");
      const target = data.target as UptimeTarget;
      setUptimeTargets(prev => {
        const exists = prev.find(t => t.id === target.id);
        if (exists) {
          return prev.map(t => (t.id === target.id ? { ...t, ...target } : t));
        }
        return [target, ...prev];
      });
      await loadUptimeLogs(target.id);
      setSelectedTargetId(target.id);
      setUptimeStatus(payload.id ? "Updated monitor" : "Added new monitor");
    } catch (err: any) {
      setUptimeStatus(err?.message || "Unable to save target");
    } finally {
      setUptimeSaving(false);
    }
  };

  const deleteUptimeTarget = async (id: string) => {
    if (!window.confirm("Delete this monitor? Logs will be removed.")) return;
    setUptimeSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/uptime/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unable to delete target");
      setUptimeTargets(prev => prev.filter(t => t.id !== id));
      if (selectedTargetId === id) {
        setSelectedTargetId(null);
        setUptimeLogs([]);
      }
      setUptimeStatus("Deleted monitor");
    } catch (err: any) {
      setUptimeStatus(err?.message || "Unable to delete target");
    } finally {
      setUptimeSaving(false);
    }
  };

  const loadAlertSettings = async () => {
    setAlertSettingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/alerts`, { credentials: "include" });
      const data = await res.json();
      if (data.settings) setAlertSettings(data.settings);
    } catch {
      setAlertSettingsStatus("Unable to load alert settings.");
    } finally {
      setAlertSettingsLoading(false);
    }
  };

  const saveAlertSettings = async (payload: AlertSettings) => {
    setAlertSettingsLoading(true);
    setAlertSettingsStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/alerts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save settings");
      setAlertSettings(data.settings);
      setAlertSettingsStatus("Saved alert settings");
    } catch (err: any) {
      setAlertSettingsStatus(err?.message || "Unable to save settings");
    } finally {
      setAlertSettingsLoading(false);
    }
  };

  const sendTestAlert = async () => {
    setTestAlertStatus("Sending test alert...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/alerts/test`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send test alert");
      setTestAlertStatus("Test alert sent");
    } catch (err: any) {
      setTestAlertStatus(err?.message || "Unable to send test alert");
    }
  };

  const refreshAdminTickets = async () => {
    setTicketsLoading(true);
    try {
      const params = new URLSearchParams();
      if (ticketsStatusFilter !== "All") params.append("status", ticketsStatusFilter);
      if (ticketsSearch) params.append("search", ticketsSearch);
      const res = await fetch(`${API_BASE}/api/admin/tickets?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.tickets) setAdminTickets(data.tickets);
    } catch (err) {
      console.error("Unable to load tickets", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuth || activeView !== "tickets") return;
    refreshAdminTickets();
  }, [ticketsStatusFilter, ticketsSearch, isAuth, activeView]);

  const updateAdminTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/tickets/${ticketId}/status`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update ticket");
      setAdminTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
    } catch (err) {
      console.error("ticket status error", err);
    }
  };

  const loadClientTeam = async (clientId: string) => {
    if (!clientId) return;
    setTeamViewLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients/${clientId}/team`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setTeamViewMembers(data.members || []);
    } catch (err) {
      console.error("Unable to load team members", err);
    } finally {
      setTeamViewLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name) return;
    setProjectStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      const data = await res.json();
      if (data.project) {
        setNewProject({ name: "", description: "", status: "active" });
        refreshProjects();
        setProjectStatus("Project created");
      } else {
        setProjectStatus(data.error || "Unable to create project");
      }
    } catch {
      setProjectStatus("Unable to create project");
    }
  };

  const refreshContracts = async () => {
    setContractLoading(true);
    setContractFetchStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/contracts`, { credentials: "include" });
      const data = await res.json();
      if (data.contracts) setContracts(data.contracts);
    } catch {
      setContractFetchStatus("Unable to load contracts");
    } finally {
      setContractLoading(false);
    }
  };

  const handleCreateContract = async () => {
    if (!contractForm.title || !contractForm.version || !contractForm.body) {
      setContractCreateStatus("Fill all fields before saving.");
      return;
    }
    setContractCreateStatus("Saving...");
    try {
      const embedUrl = contractForm.docusealEmbedUrl
        ? contractForm.docusealEmbedUrl.trim()
        : docusealTemplateId.trim()
          ? `https://docuseal.com/d/${docusealTemplateId.trim()}`
          : "";
      const res = await fetch(`${API_BASE}/api/admin/contracts`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contractForm, docusealEmbedUrl: embedUrl || undefined, docusealTemplateId: docusealTemplateId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save contract");
      setContractForm({ title: "", version: "1.0", body: "", docusealEmbedUrl: "" });
      setDocusealTemplateId("");
      setContractCreateStatus("Contract created");
      refreshContracts();
    } catch (err: any) {
      setContractCreateStatus(err?.message || "Unable to save contract");
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!window.confirm("Delete this contract, assignments, and signatures?")) return;
    setContractDeleteStatus(null);
    setContractDeleteLoading(contractId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/contracts/${contractId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete contract");
      setContractDeleteStatus("Contract deleted");
      refreshContracts();
    } catch (err: any) {
      setContractDeleteStatus(err?.message || "Unable to delete contract");
    } finally {
      setContractDeleteLoading(null);
    }
  };

  const handleAssignContract = async () => {
    if (!assignContractId || !assignContractUserId) {
      setContractAssignStatus("Select contract and client first.");
      return;
    }
    setContractAssignStatus("Assigning...");
    setContractAssignLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/contracts/${assignContractId}/assign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: assignContractUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to assign");
      setContractAssignStatus("Assigned contract to client");
      setAssignContractUserId("");
      refreshContracts();
    } catch (err: any) {
      setContractAssignStatus(err?.message || "Unable to assign");
    } finally {
      setContractAssignLoading(false);
    }
  };

  const handleAssignProject = async () => {
    if (!assignProjectId || !assignUserId) return;
    setProjectStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${assignProjectId}/assign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: assignUserId, role: assignRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to assign project");
      }
      refreshProjects();
      setAssignRole("");
      setProjectStatus("Project assigned");
    } catch {}
  };

  const handleUpdateProject = async (projectId: string) => {
    const draft = projectDrafts[projectId] || {};
    setProjectStatus("Saving project details...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${projectId}/details`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to save project");
      }
      setProjectStatus("Saved project details");
      refreshProjects();
    } catch (err: any) {
      setProjectStatus(err?.message || "Unable to save project");
    }
  };

  const handleAddActivity = async (projectId: string) => {
    const draft = activityDraft[projectId];
    if (!draft?.title) return;
    setProjectStatus("Logging activity...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${projectId}/activity`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to add activity");
      }
      setActivityDraft({ ...activityDraft, [projectId]: { title: "", category: "" } });
      setProjectStatus("Added activity");
      refreshProjects();
    } catch (err: any) {
      setProjectStatus(err?.message || "Unable to add activity");
    }
  };

  const handleAddDoc = async (projectId: string) => {
    const draft = docDraft[projectId];
    if (!draft?.title) return;
    setProjectStatus("Saving document...");
    const amountValue = draft.amount ? Number(draft.amount) : null;
    const safeAmount = amountValue !== null && !Number.isNaN(amountValue) ? amountValue : null;
    try {
      const res = await fetch(`${API_BASE}/api/admin/projects/${projectId}/documents`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          amount: safeAmount,
          dueDate: draft.dueDate || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unable to add document");
      }
      setDocDraft({ ...docDraft, [projectId]: { title: "", status: "", amount: "", dueDate: "", url: "" } });
      setProjectStatus("Added document");
      refreshProjects();
    } catch (err: any) {
      setProjectStatus(err?.message || "Unable to add document");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setFileBase64(base64);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFile = async () => {
    if (!fileClientId || !fileBase64 || !fileName) {
      setFileStatus("Select client and file first.");
      return;
    }
    setFileStatus("Uploading...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/files/upload`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: fileClientId,
          projectId: fileProjectId || undefined,
          fileName,
          fileBase64,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFileStatus("Uploaded");
        setFileBase64("");
        setFileName("");
        setFileProjectId("");
        refreshProjects();
        refreshClients();
      } else {
        setFileStatus(data.error || "Upload failed");
      }
    } catch (err) {
      setFileStatus("Upload failed");
    }
  };

  const getProjectDraft = (project: any) => {
    return projectDrafts[project.id] || {
      statusBadge: project.statusBadge || "",
      timelineLabel: project.timelineLabel || "",
      nextMilestone: project.nextMilestone || "",
      launchDate: project.launchDate ? project.launchDate.substring(0, 10) : "",
      budgetUsed: project.budgetUsed ?? "",
      stagingUrl: project.stagingUrl || "",
      designSystemUrl: project.designSystemUrl || "",
      description: project.description || "",
    };
  };

  const handleDeleteLead = async (id: string) => {
    setLeadActionStatus("Deleting lead...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/leads/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unable to delete lead");
      setLeadActionStatus("Lead deleted");
      refreshLeads(leadFilters);
    } catch {
      setLeadActionStatus("Unable to delete lead");
    }
  };

  const handleMarkReplied = async (id: string) => {
    setLeadActionStatus("Updating lead...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/leads/${id}/replied`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unable to update lead");
      setLeadActionStatus("Lead marked as replied");
      refreshLeads(leadFilters);
    } catch {
      setLeadActionStatus("Unable to update lead");
    }
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPost.title || !currentPost.slug) return;

    const newPost: BlogPost = {
      id: currentPost.id || Math.random().toString(36).substr(2, 9),
      title: currentPost.title,
      slug: currentPost.slug,
      excerpt: currentPost.excerpt || "",
      date:
        currentPost.date ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      readTime: currentPost.readTime || "5 min read",
      author: "Noble Sherman",
      tags: currentPost.tags || [],
      image: currentPost.image || "",
      content: currentPost.content || "",
    };

    if (currentPost.id) {
      setPosts(posts.map(p => (p.id === currentPost.id ? newPost : p)));
    } else {
      setPosts([newPost, ...posts]);
    }

    setIsEditing(false);
    setCurrentPost({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!isAuth) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#05070f] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-70 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.16),transparent_35%)]" />
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-xl"
        >
          <div className={`${panelClass} p-10 text-center`}>
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-inner shadow-black/40">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
                N
              </div>
            </div>
            <p className={labelClass}>Admin Console</p>
            <h2 className="text-3xl font-bold mt-3">Noble Web Designs</h2>
            <p className="text-muted mt-2 mb-8">Authenticate with GitHub to manage content, clients, and uptime.</p>

            <button
              onClick={() => {
                window.location.href = `${API_BASE}/api/auth/github`;
              }}
              className="w-full flex items-center justify-center gap-3 bg-white text-background hover:bg-slate-100 py-3.5 px-4 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
            >
              <Github size={20} />
              Continue with GitHub
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05070f] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-80 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.14),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.14),transparent_38%),radial-gradient(circle_at_40%_75%,rgba(236,72,153,0.14),transparent_36%)]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/5 to-transparent blur-3xl" />

      <div className="relative flex gap-5 xl:gap-8 pt-24 pb-16 px-4 md:px-6 lg:px-10">
        <aside className="hidden md:flex w-72 shrink-0">
          <div className={`${panelClass} w-full h-[calc(100vh-120px)] sticky top-24 p-4 flex flex-col gap-4`}>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className={labelClass}>Command</p>
              <p className="text-xl font-semibold text-white">Admin Suite</p>
              <p className="text-xs text-muted">Content, contracts, uptime, and clients.</p>
            </div>
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                      active
                        ? "bg-white/10 border-white/20 text-white shadow-lg shadow-primary/10"
                        : "border-transparent text-muted hover:text-white hover:border-white/10"
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={18} />
                    {item.label}
                    {active && <span className="ml-auto w-2 h-2 rounded-full bg-primary shadow shadow-primary/40" />}
                  </motion.button>
                );
              })}
            </nav>
            <button
              onClick={() => {
                fetch(`${API_BASE}/api/logout`, { method: "POST", credentials: "include" })
                  .finally(() => setIsAuth(false));
              }}
              className="flex items-center gap-2 text-muted hover:text-red-400 text-sm justify-center px-4 py-3 rounded-xl border border-white/10 hover:border-red-400/40 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto space-y-8">
          <div className={`${panelClass} p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className={labelClass}>Noble Command</p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mt-2">
                  {currentNav?.label || "Admin"}
                </h1>
                <p className="text-muted text-sm mt-2">
                  One cohesive, premium control room for the agency.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left">
                  <p className="text-xs text-muted">Session</p>
                  <p className="text-sm font-semibold text-white">Authenticated</p>
                </div>
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left">
                  <p className="text-xs text-muted">Active area</p>
                  <p className="text-sm font-semibold text-white">{currentNav?.label}</p>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.section
                key="dashboard"
                variants={viewVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { title: "Total Views", value: "12.4k", accent: "from-cyan-400/30 via-cyan-500/10 to-transparent", hint: "+12% vs last month" },
                    { title: "Active Leads", value: "8", accent: "from-emerald-400/30 via-emerald-500/10 to-transparent", hint: "Warm + ready" },
                    { title: "Projects Live", value: "14", accent: "from-indigo-400/30 via-indigo-500/10 to-transparent", hint: "Across web + brand" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`${panelClass} p-6 bg-gradient-to-br ${item.accent}`}
                    >
                      <p className="text-sm text-muted">{item.title}</p>
                      <div className="flex items-baseline justify-between mt-3">
                        <p className="text-3xl font-bold text-white">{item.value}</p>
                        <span className="text-xs text-muted">{item.hint}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className={`${panelClass} border border-primary/20 p-6 md:p-8`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <p className={labelClass}>Client Onboarding</p>
                      <h3 className="text-2xl font-bold text-white mt-2">Issue an invite</h3>
                      <p className="text-muted text-sm">Send a premium, PIN-based handoff to activate the client portal.</p>
                    </div>
                    <Button onClick={handleCreateInvite} disabled={inviteLoading || !inviteEmail || !inviteName} className="shadow-lg shadow-primary/20">
                      {inviteLoading ? "Creating..." : "Create Client Invite"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="w-full bg-background/80 border border-white/10 rounded-lg p-3 text-white focus:border-primary/60 transition-colors"
                      placeholder="Client name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                    <input
                      className="w-full bg-background/80 border border-white/10 rounded-lg p-3 text-white focus:border-primary/60 transition-colors"
                      placeholder="Client email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  {inviteStatus && (
                    <div className="mt-4 text-sm text-muted">
                      {inviteStatus}
                    </div>
                  )}
                  {inviteError && (
                    <div className="mt-2 text-sm text-red-300">
                      {inviteError}
                    </div>
                  )}
                  {invitePin && (
                    <div className="mt-3 p-3 rounded border border-primary/30 bg-primary/10 text-white font-mono text-sm">
                      PIN: {invitePin}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {activeView === "clients" && (
              <motion.section
                key="clients"
                variants={viewVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className={labelClass}>Clients</p>
                    <h1 className="text-3xl font-heading font-bold text-white mt-1">Client roster</h1>
                    <p className="text-muted text-sm">Invites, uploads, and team visibility in one premium lane.</p>
                  </div>
                  <Button onClick={refreshClients} variant="outline" className="flex items-center gap-2">
                    <RefreshCw size={16} /> Refresh
                  </Button>
                </div>

                <div className={`${panelClass} p-6 md:p-8`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <p className={labelClass}>Onboard</p>
                      <h3 className="text-2xl font-bold text-white">Create client invite</h3>
                      <p className="text-muted text-sm">Generate a PIN and guide them into the portal.</p>
                    </div>
                    <Button onClick={handleCreateInvite} disabled={inviteLoading || !inviteEmail || !inviteName}>
                      {inviteLoading ? "Creating..." : "Create Client Invite"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="w-full bg-background/80 border border-white/10 rounded-lg p-3 text-white focus:border-primary/60 transition-colors"
                      placeholder="Client name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                    <input
                      className="w-full bg-background/80 border border-white/10 rounded-lg p-3 text-white focus:border-primary/60 transition-colors"
                      placeholder="Client email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  {inviteStatus && (
                    <div className="mt-4 text-sm text-muted">
                      {inviteStatus}
                    </div>
                  )}
                  {inviteError && (
                    <div className="mt-2 text-sm text-red-300">
                      {inviteError}
                    </div>
                  )}
                  {invitePin && (
                    <div className="mt-3 p-3 rounded border border-primary/30 bg-primary/10 text-white font-mono text-sm">
                      PIN: {invitePin}
                    </div>
                  )}
                </div>

                <div className={`${panelClass} overflow-hidden`}>
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-muted text-sm uppercase">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-white text-sm">
                      {clients.map((client) => (
                        <tr key={client.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">{client.name || "—"}</td>
                          <td className="p-4">{client.email}</td>
                          <td className="p-4">
                            {client.hasPassword ? (
                              <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-300 text-xs border border-green-500/30">Active</span>
                            ) : client.hasActivePin ? (
                              <span className="px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-300 text-xs border border-yellow-500/30">PIN issued</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-white/5 text-muted text-xs border border-white/10">Invite pending</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResendPin(client)}
                                disabled={inviteLoading}
                              >
                                {inviteLoading && inviteEmail === client.email ? "Sending..." : "Resend PIN"}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setFileClientId(client.id);
                                  setFileStatus(`Ready to upload to ${client.name || client.email}`);
                                }}
                              >
                                Upload document
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setTeamViewClientId(client.id);
                                  loadClientTeam(client.id);
                                }}
                              >
                                View team members
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`${panelClass} p-6 md:p-8`}>
                  <h3 className="text-xl font-bold text-white mb-4">Upload document</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                      className="w-full bg-background/80 border border-white/10 rounded-lg p-3 text-white"
                      value={fileClientId}
                      onChange={(e) => setFileClientId(e.target.value)}
                    >
                      <option value="">Select client</option>
                      {clients.map((c) => (
                        <option value={c.id} key={c.id}>{c.name || c.email}</option>
                      ))}
                    </select>
                    <select
                      className="w-full bg-background/80 border border-white/10 rounded-lg p-3 text-white"
                      value={fileProjectId}
                      onChange={(e) => setFileProjectId(e.target.value)}
                    >
                      <option value="">Attach to project (optional)</option>
                      {projects.map((p) => (
                        <option value={p.id} key={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="file"
                      className="w-full bg-background/80 border border-white/10 rounded-lg p-3 text-white file:text-white file:bg-white/10 file:border-0"
                      onChange={handleFileSelect}
                    />
                    <Button onClick={handleUploadFile} disabled={!fileClientId || !fileBase64}>Upload</Button>
                  </div>
                  {fileStatus && <p className="text-muted text-sm mt-3">{fileStatus}</p>}
                </div>

                <div className={`${panelClass} p-6 md:p-8`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Client team members</h3>
                      <p className="text-muted text-sm">Select a client to view their added team members.</p>
                    </div>
                    <select
                      className="bg-background/80 border border-white/10 rounded-lg p-3 text-white text-sm"
                      value={teamViewClientId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setTeamViewClientId(id);
                        if (id) loadClientTeam(id);
                      }}
                    >
                      <option value="">Select client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name || c.email}</option>
                      ))}
                    </select>
                  </div>
                  {teamViewLoading ? (
                    <div className="text-sm text-muted flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Loading...</div>
                  ) : teamViewMembers.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {teamViewMembers.map((m) => (
                        <div key={m.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-xs text-white/80">
                                {m.headshotUrl ? <img src={m.headshotUrl} alt={m.name} className="w-full h-full object-cover" /> : m.name?.[0]}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{m.name}</p>
                                <p className="text-xs text-muted">{m.role}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted">{new Date(m.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-2 text-xs text-muted space-y-1">
                            <div>{m.email}</div>
                            <div>{m.phone}</div>
                            {m.notes && <div className="text-muted/80 border border-white/10 rounded p-2">{m.notes}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted">No team members for this client yet.</div>
                  )}
                </div>
              </motion.section>
            )}

        {/* Projects */}
        {activeView === "projects" && (
          <motion.section
            key="projects"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-heading font-bold text-white">Projects</h1>
                {projectStatus && <p className="text-sm text-muted mt-1">{projectStatus}</p>}
              </div>
              <Button onClick={refreshProjects} variant="outline">Refresh</Button>
            </div>

            <div className={`${panelClass} p-6 md:p-8`}>
              <h3 className="text-xl font-bold text-white mb-4">Create Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                  placeholder="Project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
                <input
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                  placeholder="Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <select
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <div className="mt-4">
                <Button onClick={handleCreateProject} disabled={!newProject.name}>Create Project</Button>
              </div>
            </div>

            <div className={`${panelClass} p-6 md:p-8`}>
              <h3 className="text-xl font-bold text-white mb-4">Assign Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                  value={assignProjectId}
                  onChange={(e) => setAssignProjectId(e.target.value)}
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option value={p.id} key={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option value={c.id} key={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
                <input
                  className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                  placeholder="Role (optional)"
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                />
                <Button onClick={handleAssignProject} disabled={!assignProjectId || !assignUserId}>Assign</Button>
              </div>
            </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className={`${panelClass} p-6 md:p-7`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-lg">{project.name}</h4>
                      <p className="text-muted text-sm">{project.description}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-white/10 text-muted text-xs capitalize">{project.status}</span>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs text-muted uppercase">Status Badge</label>
                        <input
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).statusBadge}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), statusBadge: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-muted uppercase">Timeline</label>
                        <input
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).timelineLabel}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), timelineLabel: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-muted uppercase">Next Milestone</label>
                        <input
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).nextMilestone}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), nextMilestone: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-muted uppercase">Launch Date</label>
                        <input
                          type="date"
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).launchDate}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), launchDate: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-muted uppercase">Budget Used</label>
                        <input
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).budgetUsed}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), budgetUsed: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-muted uppercase">Staging URL</label>
                        <input
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).stagingUrl}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), stagingUrl: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs text-muted uppercase">Design System URL</label>
                        <input
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).designSystemUrl}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), designSystemUrl: e.target.value } })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-xs text-muted uppercase">Description</label>
                        <textarea
                          className="w-full bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                          value={getProjectDraft(project).description}
                          onChange={(e) => setProjectDrafts({ ...projectDrafts, [project.id]: { ...getProjectDraft(project), description: e.target.value } })}
                        />
                      </div>
                    </div>
                    <Button onClick={() => handleUpdateProject(project.id)} variant="outline" size="sm">Save Project Details</Button>

                    <div>
                      <p className="text-muted text-sm mb-2">Assignments</p>
                      <div className="flex flex-wrap gap-2">
                        {project.assignments?.length ? project.assignments.map((a: any) => (
                          <span key={a.id} className="px-2 py-1 rounded bg-primary/10 text-white text-xs">
                            {a.user?.name || a.user?.email} {a.role ? `– ${a.role}` : ""}
                          </span>
                        )) : (
                          <span className="text-muted text-sm">No one assigned yet.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-muted text-sm mb-2">Recent Activity</p>
                        <div className="flex gap-2">
                          <input
                            className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                            placeholder="Title"
                            value={activityDraft[project.id]?.title || ""}
                            onChange={(e) => setActivityDraft({ ...activityDraft, [project.id]: { ...(activityDraft[project.id] || { category: "" }), title: e.target.value } })}
                          />
                          <input
                            className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                            placeholder="Category"
                            value={activityDraft[project.id]?.category || ""}
                            onChange={(e) => setActivityDraft({ ...activityDraft, [project.id]: { ...(activityDraft[project.id] || { title: "" }), category: e.target.value } })}
                          />
                          <Button size="sm" onClick={() => handleAddActivity(project.id)}>Add</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.activities?.map((act: any) => (
                          <span key={act.id} className="px-3 py-2 rounded bg-white/5 text-white text-xs flex items-center gap-2">
                            <span className="text-muted">{new Date(act.occurredAt).toLocaleDateString()}</span>
                            <span className="font-semibold">{act.title}</span>
                            {act.category && <span className="text-muted">• {act.category}</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-muted text-sm mb-2">Documents</p>
                        <div className="flex flex-wrap gap-2">
                          <input
                            className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                            placeholder="Title"
                            value={docDraft[project.id]?.title || ""}
                            onChange={(e) => setDocDraft({ ...docDraft, [project.id]: { ...(docDraft[project.id] || { status: "", amount: "", dueDate: "", url: "" }), title: e.target.value } })}
                          />
                          <input
                            className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                            placeholder="Status"
                            value={docDraft[project.id]?.status || ""}
                            onChange={(e) => setDocDraft({ ...docDraft, [project.id]: { ...(docDraft[project.id] || { title: "", amount: "", dueDate: "", url: "" }), status: e.target.value } })}
                          />
                          <input
                            className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                            placeholder="Amount"
                            value={docDraft[project.id]?.amount || ""}
                            onChange={(e) => setDocDraft({ ...docDraft, [project.id]: { ...(docDraft[project.id] || { title: "", status: "", dueDate: "", url: "" }), amount: e.target.value } })}
                          />
                          <input
                            type="date"
                            className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                            value={docDraft[project.id]?.dueDate || ""}
                            onChange={(e) => setDocDraft({ ...docDraft, [project.id]: { ...(docDraft[project.id] || { title: "", status: "", amount: "", url: "" }), dueDate: e.target.value } })}
                          />
                          <input
                            className="bg-background border border-white/10 rounded-lg p-2 text-white text-sm"
                            placeholder="URL"
                            value={docDraft[project.id]?.url || ""}
                            onChange={(e) => setDocDraft({ ...docDraft, [project.id]: { ...(docDraft[project.id] || { title: "", status: "", amount: "", dueDate: "" }), url: e.target.value } })}
                          />
                          <Button size="sm" onClick={() => handleAddDoc(project.id)}>Add</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.documents?.map((doc: any) => (
                          <span key={doc.id} className="px-3 py-2 rounded bg-white/5 text-white text-xs flex items-center gap-2">
                            <span className="font-semibold">{doc.title}</span>
                            {doc.status && <span className="text-muted">• {doc.status}</span>}
                            {doc.amount ? <span className="text-muted">• ${doc.amount}</span> : null}
                            {doc.dueDate ? <span className="text-muted">• Due {new Date(doc.dueDate).toLocaleDateString()}</span> : null}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Contracts */}
        {activeView === "contracts" && (
          <motion.section
            key="contracts"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-heading font-bold text-white">Contracts</h1>
              <div className="flex gap-2">
                <Button onClick={refreshContracts} variant="outline" className="flex items-center gap-2">
                  <RefreshCw size={16} /> Refresh
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-surface border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">New Contract</h3>
                    <p className="text-muted text-sm">
                      Create the contract text record. PDF templates and signatures are handled through DocuSeal Cloud Embed.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm"
                    placeholder="Contract title"
                    value={contractForm.title}
                    onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                  />
                  <input
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm"
                    placeholder="Version (e.g. 1.0)"
                    value={contractForm.version}
                    onChange={(e) => setContractForm({ ...contractForm, version: e.target.value })}
                  />
                  <textarea
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm h-48"
                    placeholder="Paste full contract text..."
                    value={contractForm.body}
                    onChange={(e) => setContractForm({ ...contractForm, body: e.target.value })}
                  />

                  <div className="space-y-2">
                    <label className="block text-xs text-muted uppercase tracking-[0.18em]">DocuSeal Embed</label>
                    <textarea
                      className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm h-24"
                      placeholder='Paste the DocuSeal iframe embed code or share URL (e.g. https://docuseal.com/d/cMNgqMeAmVc8GC)'
                      value={contractForm.docusealEmbedUrl}
                      onChange={(e) => setContractForm({ ...contractForm, docusealEmbedUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted">
                      We store the embed URL so clients can sign directly in their portal. If you paste an iframe snippet, we will extract the src automatically.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-muted uppercase tracking-[0.18em]">DocuSeal Template ID (optional)</label>
                    <input
                      className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm"
                      placeholder="e.g. 2183525"
                      value={docusealTemplateId}
                      onChange={(e) => setDocusealTemplateId(e.target.value)}
                    />
                    <p className="text-xs text-muted">
                      If you only have the template ID, we’ll build the embed link (https://docuseal.com/d/ID) for you.
                    </p>
                  </div>

                  <Button onClick={handleCreateContract} disabled={!contractForm.title || !contractForm.version || !contractForm.body}>
                    Save Contract
                  </Button>
                  {contractCreateStatus && <p className="text-muted text-sm">{contractCreateStatus}</p>}
                </div>
              </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6">
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                    <p className="text-white font-semibold flex items-center gap-2">
                    DocuSeal handles PDFs & signatures
                    </p>
                    <p className="text-muted text-sm mt-2">
                    We no longer host PDF editing or placements here. Paste the DocuSeal embed link you already created and assign it to clients; signing happens in the client portal via that embed.
                    </p>
                    <a
                    href={DOCUSEAL_EMBED_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:text-white underline"
                    >
                    Open DocuSeal embed guide
                    </a>
                  </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">Assign to Client</h3>
                    <p className="text-muted text-sm">Assign a saved contract to a client for signing.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <select
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm"
                    value={assignContractId}
                    onChange={(e) => setAssignContractId(e.target.value)}
                  >
                    <option value="">Select contract</option>
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} (v{c.version})</option>
                    ))}
                  </select>
                  <select
                    className="w-full bg-background border border-white/10 rounded-lg p-3 text-white text-sm"
                    value={assignContractUserId}
                    onChange={(e) => setAssignContractUserId(e.target.value)}
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                  <Button onClick={handleAssignContract} disabled={!assignContractId || !assignContractUserId || contractAssignLoading}>
                    {contractAssignLoading ? "Assigning..." : "Assign Contract"}
                  </Button>
                  {contractAssignStatus && <p className="text-muted text-sm">{contractAssignStatus}</p>}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">All Contracts</h3>
                {contractLoading && <span className="text-muted text-sm">Loading...</span>}
              </div>
              {contractFetchStatus && (
                <p className="text-amber-300 text-sm mb-2">{contractFetchStatus}</p>
              )}
              {contractDeleteStatus && (
                <p className="text-muted text-sm mb-2">{contractDeleteStatus}</p>
              )}
              <div className="space-y-4">
                {contracts.map((contract) => {
                  const signedCount = (contract.assignments || []).filter((a: any) => a.status === "signed" || a.signature).length;
                  const pendingCount = (contract.assignments || []).length - signedCount;
                  return (
                    <div key={contract.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">{contract.title}</p>
                          <p className="text-xs text-muted">Version {contract.version} {contract.templatePdfUrl ? "• PDF template" : ""}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-300">
                            Signed {signedCount}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200">
                            Pending {pendingCount}
                          </span>
                          <Button
                            variant="outline"
                            className="px-3 py-2 text-xs"
                            disabled={contractDeleteLoading === contract.id}
                            onClick={() => handleDeleteContract(contract.id)}
                          >
                            <Trash2 size={14} className="mr-2" /> {contractDeleteLoading === contract.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(contract.assignments || []).length ? (
                          contract.assignments.map((a: any) => (
                            <span key={a.id} className="px-3 py-2 bg-background border border-white/10 rounded-lg text-xs text-white flex items-center gap-2">
                              <span className="font-semibold">{a.user?.name || a.user?.email}</span>
                              <span className="text-muted">
                                {a.signature ? "Signed" : "Unsigned"}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-muted text-sm">No assignments yet.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!contracts.length && (
                  <div className="text-muted text-sm">No contracts yet. Create one above.</div>
                )}
              </div>
            </div>
          </motion.section>
        )}
        {/* Leads */}
        {activeView === "leads" && (
          <motion.section
            key="leads"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-heading font-bold text-white">Leads</h1>
              <Button variant="outline" onClick={() => refreshLeads(leadFilters)} disabled={leadLoading}>
                {leadLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            {leadActionStatus && <div className="mb-4 text-sm text-muted">{leadActionStatus}</div>}
            <div className={`${panelClass} p-5 md:p-6 space-y-4`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <input
                  className="w-full md:max-w-sm bg-background border border-white/10 rounded-lg p-3 text-white"
                  placeholder="Search by name, email, project..."
                  value={leadFilters.query}
                  onChange={(e) => setLeadFilters({ ...leadFilters, query: e.target.value })}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setLeadFilters({ ...leadFilters, status: 'all' })}
                    className={`px-3 py-2 rounded text-xs border ${
                      leadFilters.status === 'all'
                        ? 'bg-white text-background border-white'
                        : 'bg-transparent text-muted border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLeadFilters({ ...leadFilters, status: 'new' })}
                    className={`px-3 py-2 rounded text-xs border ${
                      leadFilters.status === 'new'
                        ? 'bg-white text-background border-white'
                        : 'bg-transparent text-muted border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => setLeadFilters({ ...leadFilters, status: 'replied' })}
                    className={`px-3 py-2 rounded text-xs border ${
                      leadFilters.status === 'replied'
                        ? 'bg-white text-background border-white'
                        : 'bg-transparent text-muted border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    Replied
                  </button>
                </div>
              </div>

              {leadLoading && (
                <div className="text-xs text-muted flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} /> Updating leads...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {leads
                  .filter((lead) => {
                    const q = leadFilters.query.toLowerCase();
                    const matches =
                      lead.name?.toLowerCase().includes(q) ||
                      lead.email?.toLowerCase().includes(q) ||
                      lead.projectType?.toLowerCase().includes(q) ||
                      lead.notes?.toLowerCase().includes(q);
                    const statusOk =
                      leadFilters.status === 'all' ||
                      (leadFilters.status === 'new' && !lead.replied) ||
                      (leadFilters.status === 'replied' && lead.replied);
                    return matches && statusOk;
                  })
                  .map((lead) => (
                    <div key={lead.id} className="bg-background border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">{lead.name}</p>
                          <p className="text-xs text-muted">{lead.businessName || '—'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          lead.replied
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {lead.replied ? 'Replied' : 'New'}
                        </span>
                      </div>
                      <div className="text-sm text-muted space-y-1 break-words">
                        <a href={`mailto:${lead.email}`} className="text-primary hover:text-white">{lead.email}</a>
                        <div>Project: {lead.projectType || '—'}</div>
                        <div>Priority: {lead.priority || '—'}</div>
                        <div>Scope: {lead.scope || '—'}</div>
                        <div>Timeline: {lead.timeline || '—'}</div>
                        <div>Budget: {lead.budget || '—'}</div>
                        <div className="text-xs text-muted">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                      {lead.notes && (
                        <div className="text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg p-3 max-h-28 overflow-y-auto whitespace-pre-line">
                          {lead.notes}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`mailto:${lead.email}`}
                          className="px-3 py-2 rounded bg-white/10 text-xs hover:bg-white/20"
                        >
                          Reply
                        </a>
                        <button
                          onClick={() => handleMarkReplied(lead.id)}
                          className="px-3 py-2 rounded bg-green-500/20 text-green-200 text-xs hover:bg-green-500/30"
                        >
                          Mark Replied
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="px-3 py-2 rounded bg-red-500/20 text-red-200 text-xs hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                {(!leads || leads.length === 0) && (
                  <div className="text-muted text-sm">No leads yet.</div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* Uptime Monitoring */}
        {activeView === "uptime" && (
          <motion.section
            key="uptime"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <UptimeSection
              targets={uptimeTargets}
              logs={uptimeLogs}
              selectedTargetId={selectedTargetId}
              loading={uptimeLoading}
              saving={uptimeSaving}
              statusMessage={uptimeStatus}
              onRefresh={refreshUptimeTargets}
              onSelect={loadUptimeLogs}
              onSave={saveUptimeTarget}
              onDelete={deleteUptimeTarget}
            />
          </motion.section>
        )}

        {/* Settings */}
        {activeView === "settings" && (
          <motion.section
            key="settings"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-white">Admin Settings</h1>
                <p className="text-muted text-sm">Configure alerting and monitoring preferences.</p>
              </div>
            </div>

            <AlertSettingsPanel
              settings={alertSettings}
              statusMessage={alertSettingsStatus}
              testStatus={testAlertStatus}
              loading={alertSettingsLoading}
              onSave={saveAlertSettings}
              onTest={sendTestAlert}
            />
          </motion.section>
        )}

        {/* Support Tickets */}
        {activeView === "tickets" && (
          <motion.section
            key="tickets"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-white">Support Tickets</h1>
                <p className="text-muted text-sm">All tickets from all clients with quick status updates.</p>
              </div>
              <Button variant="outline" onClick={refreshAdminTickets} className="flex items-center gap-2">
                <RefreshCw size={16} /> Refresh
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="Search title or description"
                value={ticketsSearch}
                onChange={(e) => setTicketsSearch(e.target.value)}
              />
              <select
                className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                value={ticketsStatusFilter}
                onChange={(e) => setTicketsStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
              <Button size="sm" onClick={refreshAdminTickets}>Apply</Button>
              {ticketsLoading && <span className="text-xs text-muted">Loading...</span>}
            </div>

            <div className={`${panelClass} overflow-hidden`}>
              <div className="grid grid-cols-6 text-xs uppercase text-muted px-4 py-2 border-b border-white/10 bg-white/5">
                <span>Title</span>
                <span>Client</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Category</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-white/10">
                {adminTickets.map((t) => (
                  <div key={t.id} className="grid grid-cols-6 px-4 py-3 text-sm items-center">
                    <div>
                      <p className="text-white font-semibold">{t.title}</p>
                      <p className="text-xs text-muted line-clamp-2">{t.description}</p>
                    </div>
                    <div className="text-xs text-muted">
                      {t.user?.name || t.user?.email || "Unknown"}
                    </div>
                    <div>
                      <select
                        className="bg-background border border-white/10 rounded px-2 py-1 text-xs text-white"
                        value={t.status}
                        onChange={(e) => updateAdminTicketStatus(t.id, e.target.value)}
                      >
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Closed</option>
                      </select>
                    </div>
                    <div className="text-xs text-muted">{t.priority}</div>
                    <div className="text-xs text-muted">{t.category}</div>
                    <div className="text-xs text-muted">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
                {!adminTickets.length && (
                  <div className="px-4 py-6 text-sm text-muted">No tickets match this filter.</div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* Blog */}
        {activeView === "blog" && (
          <motion.section
            key="blog"
            variants={viewVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={labelClass}>Content</p>
                <h1 className="text-3xl font-heading font-bold text-white">Blog Posts</h1>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => {
                    setIsEditing(true);
                    setCurrentPost({});
                  }}
                >
                  <Plus size={18} className="mr-2" /> New Post
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className={`${panelClass} p-8`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {currentPost.id ? "Edit Post" : "Create New Post"}
                  </h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-muted hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSavePost} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-muted mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={currentPost.title || ""}
                        onChange={e =>
                          setCurrentPost({ ...currentPost, title: e.target.value })
                        }
                        className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        required
                        value={currentPost.slug || ""}
                        onChange={e =>
                          setCurrentPost({ ...currentPost, slug: e.target.value })
                        }
                        className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm text-muted mb-2">
                        Read Time
                      </label>
                      <input
                        type="text"
                        value={currentPost.readTime || ""}
                        onChange={e =>
                          setCurrentPost({
                            ...currentPost,
                            readTime: e.target.value,
                          })
                        }
                        className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-muted mb-2">
                        Cover Image URL
                      </label>
                      <input
                        type="text"
                        value={currentPost.image || ""}
                        onChange={e =>
                          setCurrentPost({ ...currentPost, image: e.target.value })
                        }
                        className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted mb-2">
                      Content (HTML)
                    </label>
                    <textarea
                      required
                      value={currentPost.content || ""}
                      onChange={e =>
                        setCurrentPost({ ...currentPost, content: e.target.value })
                      }
                      className="w-full h-64 bg-background border border-white/10 rounded-lg p-3 text-white font-mono text-sm"
                      placeholder="<p>Write your content here...</p>"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditing(false)}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Post</Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid gap-4">
                {posts.map(post => (
                  <div
                    key={post.id}
                    className={`${panelClass} p-4 flex items-center justify-between hover:border-white/20 transition-colors group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                        {post.image && (
                          <img
                            src={post.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{post.title}</h3>
                        <p className="text-sm text-muted">
                          {post.date} • {post.readTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setCurrentPost(post);
                          setIsEditing(true);
                        }}
                        className="p-2 text-muted hover:text-primary hover:bg-white/5 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-muted hover:text-red-500 hover:bg-white/5 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}
        </AnimatePresence>
      </main>
    </div>
  </div>
  );
};
