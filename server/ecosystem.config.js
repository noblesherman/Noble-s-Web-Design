module.exports = {
  apps: [
    {
      name: "backend",
      cwd: __dirname,
      script: "index.js",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 4000,
        DATABASE_URL: process.env.DATABASE_URL,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
        SESSION_SECRET: process.env.SESSION_SECRET,
        JWT_SECRET: process.env.JWT_SECRET,
        FRONTEND_URL: process.env.FRONTEND_URL,
        ADMIN_REDIRECT: process.env.ADMIN_REDIRECT,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        SUPABASE_BUCKET: process.env.SUPABASE_BUCKET,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_SECURE: process.env.SMTP_SECURE,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM,
        ADMIN_NOTIFY_EMAIL: process.env.ADMIN_NOTIFY_EMAIL,
        VITE_DOCUSEAL_EMBED_URL: process.env.VITE_DOCUSEAL_EMBED_URL,
        VITE_API_URL: process.env.VITE_API_URL
      }
    }
  ]
}
