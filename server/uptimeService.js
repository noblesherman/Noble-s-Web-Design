/**
 * @typedef {Object} UptimeServiceOptions
 * @property {import('@prisma/client').PrismaClient} prisma
 * @property {ReturnType<typeof import('nodemailer').createTransport> | null} mailer
 * @property {() => Promise<import('@prisma/client').SiteSettings>} loadSettings
 * @property {string} smtpFrom
 * @property {number} timeoutMs
 * @property {number} pollFrequencyMs
 * @property {(opts: { to: string, message: string }) => Promise<void>} sendSms
 */

const CHECK_WINDOW_MS = 1000;

/**
 * Safe email wrapper.
 */
const safeSendEmail = async ({ mailer, to, subject, html, from }) => {
  if (!mailer || !to?.length) return;
  try {
    await mailer.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error("Email failed:", err);
  }
};

/**
 * Safe SMS wrapper.
 */
const safeSendSMS = async (sendSms, to, message) => {
  if (!sendSms || !to) return;
  try {
    await sendSms({ to, message });
  } catch (err) {
    console.error("SMS failed:", err);
  }
};

/**
 * Run single HTTP check.
 */
const runHttpCheck = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    return {
      passed: res.ok,
      statusCode: res.status,
      responseTime: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timeout);
    return {
      passed: false,
      statusCode: null,
      responseTime: Date.now() - start,
      error: err?.message,
    };
  }
};

/**
 * Compute uptime score.
 */
const computeScore = (logs) => {
  if (!logs.length) return 100;
  const passed = logs.filter((l) => l.passed).length;
  return Math.round((passed / logs.length) * 1000) / 10;
};

/**
 * Start uptime monitor loop with SMS + score.
 */
export const startUptimeMonitor = (options) => {
  const {
    prisma,
    mailer,
    loadSettings,
    smtpFrom,
    timeoutMs,
    pollFrequencyMs,
    sendSms,
  } = options;

  const poll = async () => {
    try {
      const targets = await prisma.uptimeTarget.findMany({
        include: { logs: { select: { passed: true } } },
      });
      if (!targets.length) return;

      const settings = await loadSettings();
      const alertThreshold = settings.alertThreshold || 2;
      const emailRecipients = [settings.primaryAlertEmail, settings.secondaryAlertEmail].filter(
        Boolean
      );

      const smsRecipients = settings.smsAlertNumber || null;

      await Promise.all(
        targets.map(async (target) => {
          const now = Date.now();
          const last = target.lastChecked?.getTime() || 0;
          const intervalMs = target.checkInterval * 60 * 1000;
          const due = now - last >= intervalMs - CHECK_WINDOW_MS;
          if (!due) return;

          const result = await runHttpCheck(target.url, timeoutMs);

          // Store log
          await prisma.uptimeLog.create({
            data: {
              targetId: target.id,
              passed: result.passed,
              statusCode: result.statusCode,
              responseTime: result.responseTime,
            },
          });

          const nextFailures = result.passed
            ? 0
            : (target.consecutiveFailures || 0) + 1;

          let alertActive = target.alertActive;

          // ⛔ DOWN ALERT
          if (!result.passed && nextFailures >= alertThreshold && !alertActive) {
            alertActive = true;

            const subject = `Uptime Alert: ${target.url} is DOWN`;
            const html = `
              <div style="font-family:Arial;">
                <h2>${target.url} is DOWN</h2>
                <p>Failed ${nextFailures} checks.</p>
                <p>Status: ${result.statusCode ?? "No response"}</p>
              </div>
            `;

            // EMAIL
            await safeSendEmail({
              mailer,
              to: emailRecipients,
              subject,
              html,
              from: smtpFrom,
            });

            // SMS
            await safeSendSMS(
              sendSms,
              smsRecipients,
              `ALERT: ${target.url} is DOWN. Status: ${result.statusCode ?? "none"}.`
            );
          }

          // ✅ RESTORED ALERT
          if (result.passed && alertActive) {
            alertActive = false;

            const subject = `Uptime Restored: ${target.url} is back online`;
            const html = `
              <div style="font-family:Arial;">
                <h2>${target.url} is UP</h2>
                <p>Last response: ${result.statusCode}</p>
              </div>
            `;

            await safeSendEmail({
              mailer,
              to: emailRecipients,
              subject,
              html,
              from: smtpFrom,
            });

            await safeSendSMS(
              sendSms,
              smsRecipients,
              `RESTORED: ${target.url} is BACK ONLINE. Status: ${result.statusCode}.`
            );
          }

          // SCORE CALCULATION
          const logs = await prisma.uptimeLog.findMany({
            where: { targetId: target.id },
            select: { passed: true },
          });

          const score = computeScore(logs);

          // Update target
          await prisma.uptimeTarget.update({
            where: { id: target.id },
            data: {
              lastStatus: result.statusCode ?? 0,
              lastChecked: new Date(),
              lastResponseTimeMs: result.responseTime,
              consecutiveFailures: nextFailures,
              alertActive,
              uptimeScore: score,
            },
          });
        })
      );
    } catch (err) {
      console.error("Uptime poll failed:", err);
    }
  };

  const loop = async () => {
    try {
      await poll();
      setInterval(poll, pollFrequencyMs);
    } catch (err) {
      console.error("Failed to start uptime loop", err);
      setTimeout(loop, Math.min(pollFrequencyMs, 30000));
    }
  };

  loop();
};