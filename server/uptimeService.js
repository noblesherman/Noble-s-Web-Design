/** 
 * @typedef {Object} UptimeServiceOptions
 * @property {import('@prisma/client').PrismaClient} prisma
 * @property {ReturnType<typeof import('nodemailer').createTransport> | null} mailer
 * @property {() => Promise<import('@prisma/client').SiteSettings>} loadSettings
 * @property {string} smtpFrom
 * @property {number} timeoutMs
 * @property {number} pollFrequencyMs
 */

const CHECK_WINDOW_MS = 1000;

/**
 * Lightweight helper to send an email if mailer/recipients exist.
 * @param {{ mailer: any, to: string[], subject: string, html: string, from: string }} params
 */
const safeSendEmail = async ({ mailer, to, subject, html, from }) => {
  if (!mailer || !to.length) return;
  try {
    await mailer.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error('Failed to send uptime email', err);
  }
};

/**
 * Runs a single HTTP check with a timeout.
 * @param {string} url
 * @param {number} timeoutMs
 */
const runHttpCheck = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();

  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal, cache: 'no-store' });
    const responseTime = Date.now() - started;
    clearTimeout(timeoutId);
    return {
      passed: res.ok,
      statusCode: res.status,
      responseTime,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      passed: false,
      statusCode: null,
      responseTime: Date.now() - started,
      error: err?.message || 'request failed',
    };
  }
};

/**
 * Calculates uptime percentage based on the provided logs.
 * @param {Array<{ passed: boolean }>} logs
 */
export const calculateUptimePercentage = (logs) => {
  if (!logs.length) return 100;
  const passed = logs.filter(l => l.passed).length;
  return Math.round((passed / logs.length) * 1000) / 10;
};

/**
 * Starts the polling loop for uptime checks.
 * @param {UptimeServiceOptions} options
 */
export const startUptimeMonitor = (options) => {
  const { prisma, mailer, loadSettings, smtpFrom, timeoutMs, pollFrequencyMs } = options;

  const poll = async () => {
    try {
      const targets = await prisma.uptimeTarget.findMany();
      if (!targets.length) return;

      const settings = await loadSettings();
      const alertThreshold = settings.alertThreshold || 2;
      const recipients = [settings.primaryAlertEmail, settings.secondaryAlertEmail].filter(Boolean);

      await Promise.all(
        targets.map(async (target) => {
          const due = !target.lastChecked
            || (Date.now() - target.lastChecked.getTime()) >= (target.checkInterval * 60 * 1000 - CHECK_WINDOW_MS);
          if (!due) return;

          const result = await runHttpCheck(target.url, timeoutMs);
          await prisma.uptimeLog.create({
            data: {
              targetId: target.id,
              statusCode: result.statusCode,
              responseTime: result.responseTime,
              passed: result.passed,
            },
          });

          const nextFailures = result.passed ? 0 : (target.consecutiveFailures || 0) + 1;
          let shouldAlert = !result.passed && nextFailures >= alertThreshold && !target.alertActive;
          let alertActiveFlag = target.alertActive;

          if (shouldAlert && recipients.length) {
            const subject = `Uptime alert: ${target.url} is DOWN`;
            const html = `
              <div style="font-family:Arial,sans-serif;color:#0f172a">
                <h2 style="margin:0 0 12px 0;">${target.url} is not responding</h2>
                <p style="margin:0 0 8px 0;">The site failed ${nextFailures} consecutive checks.</p>
                <ul style="padding-left:18px; color:#334155;">
                  <li>Last status: ${result.statusCode ?? 'no response'}</li>
                  <li>Checked at: ${new Date().toLocaleString()}</li>
                  <li>Response time: ${result.responseTime}ms</li>
                  <li>Interval: ${target.checkInterval} minute(s)</li>
                </ul>
              </div>
            `;
            await safeSendEmail({ mailer, to: recipients, subject, html, from: smtpFrom });
            alertActiveFlag = true;
          }

          if (result.passed && target.alertActive && recipients.length) {
            const subject = `Uptime restored: ${target.url} is back online`;
            const html = `
              <div style="font-family:Arial,sans-serif;color:#0f172a">
                <h2 style="margin:0 0 12px 0;">${target.url} is responding again</h2>
                <p style="margin:0 0 8px 0;">The latest check succeeded.</p>
                <ul style="padding-left:18px; color:#334155;">
                  <li>Status: ${result.statusCode}</li>
                  <li>Checked at: ${new Date().toLocaleString()}</li>
                  <li>Response time: ${result.responseTime}ms</li>
                </ul>
              </div>
            `;
            await safeSendEmail({ mailer, to: recipients, subject, html, from: smtpFrom });
            alertActiveFlag = false;
          }

          await prisma.uptimeTarget.update({
            where: { id: target.id },
            data: {
              lastStatus: result.statusCode ?? (result.passed ? 200 : 0),
              lastChecked: new Date(),
              lastResponseTimeMs: result.responseTime,
              consecutiveFailures: result.passed ? 0 : nextFailures,
              alertActive: alertActiveFlag,
            },
          });
        })
      );
    } catch (err) {
      console.error('uptime poll failed', err);
    }
  };

  // initial run and schedule
  poll();
  setInterval(poll, pollFrequencyMs);
};
