import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { AlertSettings } from "../../types/admin";
import { BellRing, Loader2, Mail } from "lucide-react";

type Props = {
  settings: AlertSettings;
  statusMessage?: string | null;
  testStatus?: string | null;
  loading: boolean;
  onSave: (payload: AlertSettings) => void;
  onTest: () => void;
};

export const AlertSettingsPanel: React.FC<Props> = ({
  settings,
  statusMessage,
  testStatus,
  loading,
  onSave,
  onTest,
}) => {
  const [form, setForm] = useState<AlertSettings>({
    primaryAlertEmail: "",
    secondaryAlertEmail: "",
    alertThreshold: 2,
  });

  useEffect(() => {
    setForm({
      primaryAlertEmail: settings.primaryAlertEmail || "",
      secondaryAlertEmail: settings.secondaryAlertEmail || "",
      alertThreshold: settings.alertThreshold ?? 2,
    });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-surface border border-white/10 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted tracking-widest">Alerting</p>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <BellRing size={20} /> Email Settings
          </h3>
          <p className="text-muted text-sm">Set who gets notified and how many failed checks trigger an alert.</p>
        </div>
        {loading && <Loader2 size={18} className="animate-spin text-muted" />}
      </div>

      {statusMessage && <p className="text-sm text-muted">{statusMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-muted mb-2 flex items-center gap-2">
              <Mail size={16} /> Primary Alert Email
            </label>
            <input
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
              placeholder="you@example.com"
              value={form.primaryAlertEmail || ""}
              onChange={(e) => setForm({ ...form, primaryAlertEmail: e.target.value })}
              type="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2 flex items-center gap-2">
              <Mail size={16} /> Secondary Alert Email (optional)
            </label>
            <input
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
              placeholder="optional"
              value={form.secondaryAlertEmail || ""}
              onChange={(e) => setForm({ ...form, secondaryAlertEmail: e.target.value })}
              type="email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-muted mb-2">Alert Threshold</label>
            <input
              className="w-full bg-background border border-white/10 rounded-lg p-3 text-white"
              type="number"
              min={1}
              value={form.alertThreshold ?? 2}
              onChange={(e) => setForm({ ...form, alertThreshold: Number(e.target.value) })}
            />
            <p className="text-xs text-muted mt-1">Number of consecutive failures before alerting.</p>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <Button type="submit" disabled={loading}>Save Settings</Button>
            <Button type="button" variant="outline" onClick={onTest} disabled={loading}>
              Send Test Alert
            </Button>
            {testStatus && <span className="text-sm text-muted">{testStatus}</span>}
          </div>
        </div>
      </form>
    </div>
  );
};
