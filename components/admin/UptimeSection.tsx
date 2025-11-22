import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { UptimeLog, UptimeTarget } from "../../types/admin";
import { AlertTriangle, CheckCircle2, Clock3, Edit3, Loader2, RefreshCw, Trash2, XCircle } from "lucide-react";

type Props = {
  targets: UptimeTarget[];
  logs: UptimeLog[];
  selectedTargetId: string | null;
  loading: boolean;
  saving: boolean;
  statusMessage?: string | null;
  onRefresh: () => void;
  onSelect: (id: string) => void;
  onSave: (payload: { id?: string; url: string; checkInterval: number }) => void;
  onDelete: (id: string) => void;
};

const INTERVAL_OPTIONS = [
  { value: 1, label: "Every 1 min" },
  { value: 5, label: "Every 5 min" },
  { value: 15, label: "Every 15 min" },
  { value: 60, label: "Every hour" },
];

export const UptimeSection: React.FC<Props> = ({
  targets,
  logs,
  selectedTargetId,
  loading,
  saving,
  statusMessage,
  onRefresh,
  onSelect,
  onSave,
  onDelete,
}) => {
  const [form, setForm] = useState<{ id?: string; url: string; checkInterval: number }>({
    url: "",
    checkInterval: 5,
  });

  useEffect(() => {
    if (!targets.length && form.id) {
      setForm({ url: "", checkInterval: 5 });
    }
  }, [targets, form.id]);

  const activeTarget = targets.find(t => t.id === selectedTargetId) || targets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) return;
    onSave({ ...form, checkInterval: Number(form.checkInterval) || 5 });
    setForm({ url: "", checkInterval: 5 });
  };

  const startEdit = (target: UptimeTarget) => {
    setForm({ id: target.id, url: target.url, checkInterval: target.checkInterval });
  };

  const statusLabel = (target: UptimeTarget) => {
    if (!target.lastChecked) return { label: "Pending", tone: "bg-yellow-500/20 text-yellow-200" };
    if (target.lastStatus && target.lastStatus >= 200 && target.lastStatus < 400) {
      return { label: "Up", tone: "bg-green-500/20 text-green-200" };
    }
    return { label: "Down", tone: "bg-red-500/20 text-red-200" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Uptime Monitoring</h1>
          <p className="text-muted text-sm">Track availability, response time, and alert thresholds for your sites.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRefresh} disabled={loading || saving}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {statusMessage && <p className="text-sm text-muted">{statusMessage}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-muted tracking-widest">{form.id ? "Edit monitor" : "Add monitor"}</p>
              <h3 className="text-xl font-bold text-white">{form.id ? "Update URL" : "Monitor URL"}</h3>
            </div>
            {saving && <Loader2 size={18} className="animate-spin text-muted" />}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-muted mb-2">URL to monitor</label>
              <input
                className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                placeholder="https://example.com"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
                type="url"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Check interval</label>
              <select
                className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
                value={form.checkInterval}
                onChange={(e) => setForm({ ...form, checkInterval: Number(e.target.value) })}
              >
                {INTERVAL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {form.id ? "Save Changes" : "Add Monitor"}
              </Button>
              {form.id && (
                <Button type="button" variant="secondary" onClick={() => setForm({ url: "", checkInterval: 5 })}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {targets.map((target) => {
            const status = statusLabel(target);
            const avg = target.averageUptime ?? 100;
            return (
              <div
                key={target.id}
                className={`bg-surface border ${selectedTargetId === target.id ? "border-primary/50" : "border-white/10"} rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${status.tone}`}>{status.label}</span>
                    {target.alertActive && (
                      <span className="px-2 py-1 rounded text-xs bg-red-500/15 text-red-200 flex items-center gap-1">
                        <AlertTriangle size={14} /> Alerting
                      </span>
                    )}
                  </div>
                  <p className="text-white font-semibold">{target.url}</p>
                  <div className="text-sm text-muted flex flex-wrap gap-4">
                    <span className="flex items-center gap-1"><Clock3 size={14} /> {target.checkInterval} min</span>
                    <span>Last check: {target.lastChecked ? new Date(target.lastChecked).toLocaleString() : "—"}</span>
                    <span>Avg uptime: {avg.toFixed(1)}%</span>
                    <span>Last response: {target.lastResponseTimeMs ? `${target.lastResponseTimeMs}ms` : "—"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onSelect(target.id)}>
                    View Logs
                  </Button>
                  <button
                    onClick={() => startEdit(target)}
                    className="px-3 py-2 rounded border border-white/10 text-muted hover:text-white hover:border-white/40 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(target.id)}
                    className="px-3 py-2 rounded border border-red-500/40 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            );
          })}

          {!targets.length && (
            <div className="bg-background border border-dashed border-white/10 rounded-xl p-6 text-center text-muted">
              No monitors yet. Add your first URL to start tracking uptime.
            </div>
          )}
        </div>
      </div>

      {activeTarget && (
        <div className="bg-surface border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-muted tracking-widest">Recent checks</p>
              <h3 className="text-xl font-bold text-white">{activeTarget.url}</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSelect(activeTarget.id)}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Reload Logs
            </Button>
          </div>

          {loading && <p className="text-muted text-sm mb-2 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading checks...</p>}

          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted uppercase text-xs">
                <tr>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Response</th>
                  <th className="py-2 pr-4">Result</th>
                </tr>
              </thead>
              <tbody className="text-white/90">
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-white/5">
                    <td className="py-2 pr-4">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2 pr-4">{log.statusCode ?? "—"}</td>
                    <td className="py-2 pr-4">{log.responseTime ? `${log.responseTime}ms` : "—"}</td>
                    <td className="py-2 pr-4">
                      {log.passed ? (
                        <span className="inline-flex items-center gap-1 text-green-300"><CheckCircle2 size={16} /> Up</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-300"><XCircle size={16} /> Down</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!logs.length && (
            <p className="text-muted text-sm mt-2">No checks recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
