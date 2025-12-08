const path = require('path');
require('dotenv').config({ path: '/home/noblesherman/apps/Noble-s-Web-Design/server/.env' });

module.exports = {
  apps: [
    {
      name: 'noble-web-design-backend',
      script: 'index.js',
      cwd: '/home/noblesherman/apps/Noble-s-Web-Design/server',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        DATABASE_URL: process.env.DATABASE_URL,
        SESSION_SECRET: process.env.SESSION_SECRET,
        JWT_SECRET: process.env.JWT_SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
      }
    }
  ]
};