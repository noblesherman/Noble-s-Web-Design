export type UptimeTarget = {
  id: string;
  url: string;
  checkInterval: number;
  lastStatus?: number | null;
  lastChecked?: string | Date | null;
  lastResponseTimeMs?: number | null;
  averageUptime?: number;
  alertActive?: boolean;
  consecutiveFailures?: number;
  createdAt?: string | Date;
};

export type UptimeLog = {
  id: string;
  timestamp: string;
  statusCode: number | null;
  responseTime: number | null;
  passed: boolean;
};

export type AlertSettings = {
  primaryAlertEmail?: string | null;
  secondaryAlertEmail?: string | null;
  alertThreshold?: number;
};
