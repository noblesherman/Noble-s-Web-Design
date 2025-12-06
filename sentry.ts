import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://3b84f42ddc65438ec923b445d9f5a7e7@o4510477363576832.ingest.us.sentry.io/4510477388021761",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});
