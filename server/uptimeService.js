// server/uptimeService.js
const CHECK_WINDOW_MS = 1000;

/**
 * Safely send an email without breaking the monitor loop.
 */
function safeSendEmail(mailer, to, subject, html, from) {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!mailer || !recipients.length) return Promise.resolve();

  return mailer.sendMail({ from, to: recipients, subject, html }).catch((err) => {
    console.error('Email failed:', err);
  });
}

/**
 * Safely send an SMS without breaking the monitor loop.
 */
function safeSendSMS(sendSms, to, message) {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!sendSms || !recipients.length) return Promise.resolve();

  return Promise.all(
    recipients.map((recipient) =>
      Promise.resolve(sendSms({ to: recipient, message })).catch((err) => {
        console.error('SMS failed:', err);
      })
    )
  ).then(() => undefined);
}

/**
 * Execute a timed HTTP GET check.
 */
async function runHttpCheck(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
    clearTimeout(timer);
    return {
      passed: res.ok,
      statusCode: res.status,
      responseTime: Date.now() - started,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      passed: false,
      statusCode: null,
      responseTime: Date.now() - started,
      error: err?.message || 'request failed',
    };
  }
}

/**
 * Calculate uptime score (0-100) rounded to one decimal place.
 */
function computeScore(logs) {
  const entries = Array.isArray(logs) ? logs : [];
  if (!entries.length) return 100;
  const passed = entries.filter((log) => Boolean(log?.passed)).length;
  return Math.round((passed / entries.length) * 1000) / 10;
}

/**
 * Backwards-compatible uptime percentage helper.
 */
export function calculateUptimePercentage(logs) {
  return computeScore(logs);
}

/**
 * Start the uptime monitoring loop without blocking server startup.
 */
export function startUptimeMonitor(options = {}) {
  const {
    prisma,
    mailer,
    loadSettings,
    smtpFrom,
    timeoutMs = 10000,
    pollFrequencyMs = 30000,
    sendSms,
  } = options;

  if (!prisma || typeof loadSettings !== 'function') {
    console.warn('Uptime monitor not started: missing prisma or loadSettings');
    return;
  }

  const isCheckDue = (target) => {
    const intervalMinutes = Math.max(1, Number(target.checkInterval) || 1);
    const intervalMs = intervalMinutes * 60 * 1000;
    const lastCheckedMs = target.lastChecked ? target.lastChecked.getTime() : 0;
    return Date.now() - lastCheckedMs >= intervalMs - CHECK_WINDOW_MS;
  };

  const processTarget = async (target, settings) => {
    if (!isCheckDue(target)) return;

    const result = await runHttpCheck(target.url, timeoutMs);
    const passed = Boolean(result.passed);
    const nextFailures = passed ? 0 : (target.consecutiveFailures || 0) + 1;

    const emailRecipients = [settings?.primaryAlertEmail, settings?.secondaryAlertEmail].filter(Boolean);
    const smsRecipients = Array.isArray(settings?.smsAlertNumber)
      ? settings.smsAlertNumber.filter(Boolean)
      : [settings?.smsAlertNumber].filter(Boolean);

    const alertThreshold = Number(settings?.alertThreshold ?? 2) || 2;
    let alertActive = Boolean(target.alertActive);
    const shouldAlertDown = !passed && nextFailures >= alertThreshold && !alertActive;
    const shouldAlertUp = passed && alertActive;

    if (shouldAlertDown) {
      alertActive = true;
      const subject = `Uptime Alert: ${target.url} is DOWN`;
      const html = `
        <div style="font-family:Arial,sans-serif;padding:12px 0;">
          <h2 style="margin:0 0 12px 0;">${target.url} is DOWN</h2>
          <p style="margin:0 0 8px 0;">Failed ${nextFailures} consecutive checks.</p>
          <p style="margin:0 0 8px 0;">Status: ${result.statusCode ?? 'No response'}</p>
          <p style="margin:0;">Checked at ${new Date().toLocaleString()}</p>
        </div>
      `;
      await safeSendEmail(mailer, emailRecipients, subject, html, smtpFrom);
      await safeSendSMS(
        sendSms,
        smsRecipients,
        `ALERT: ${target.url} is DOWN. Status: ${result.statusCode ?? 'none'}. Failures: ${nextFailures}.`
      );
    } else if (shouldAlertUp) {
      alertActive = false;
      const subject = `Uptime Restored: ${target.url} is back online`;
      const html = `
        <div style="font-family:Arial,sans-serif;padding:12px 0;">
          <h2 style="margin:0 0 12px 0;">${target.url} is UP</h2>
          <p style="margin:0 0 8px 0;">Status: ${result.statusCode ?? 'Unknown'}</p>
          <p style="margin:0;">Checked at ${new Date().toLocaleString()}</p>
        </div>
      `;
      await safeSendEmail(mailer, emailRecipients, subject, html, smtpFrom);
      await safeSendSMS(
        sendSms,
        smsRecipients,
        `RESTORED: ${target.url} is BACK ONLINE. Status: ${result.statusCode ?? 'unknown'}.`
      );
    }

    await prisma.uptimeLog.create({
      data: {
        targetId: target.id,
        statusCode: result.statusCode ?? null,
        responseTime: result.responseTime ?? null,
        passed,
        smsAlertNumber: smsRecipients[0] || null,
      },
    });

    const logs = await prisma.uptimeLog.findMany({
      where: { targetId: target.id },
      select: { passed: true },
    });

    const uptimeScore = computeScore(logs);

    await prisma.uptimeTarget.update({
      where: { id: target.id },
      data: {
        lastStatus: result.statusCode ?? null,
        lastChecked: new Date(),
        lastResponseTimeMs: result.responseTime ?? null,
        consecutiveFailures: nextFailures,
        alertActive,
        uptimeScore,
      },
    });
  };

  let running = false;

  const pollOnce = async () => {
    if (running) return;
    running = true;
    try {
      const targets = await prisma.uptimeTarget.findMany();
      if (!targets.length) return;

      const settings = await loadSettings();
      await Promise.all(
        targets.map((target) =>
          processTarget(target, settings).catch((err) => {
            console.error(`Uptime check failed for ${target.url}`, err);
          })
        )
      );
    } catch (err) {
      console.error('Uptime poll failed', err);
    } finally {
      running = false;
    }
  };

  // Run immediately without blocking startup, then schedule.
  queueMicrotask(() => {
    pollOnce();
    setInterval(() => {
      pollOnce();
    }, Number(pollFrequencyMs) || 30000);
  });
}
