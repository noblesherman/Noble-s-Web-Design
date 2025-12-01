const path = require('path');
const dotenv = require('dotenv');

const serverDir = '/home/noblesherman/apps/Noble-s-Web-Design/server';
const envPath = path.join(serverDir, '.env');

const envConfig = dotenv.config({ path: envPath }).parsed || {};

module.exports = {
  apps: [
    {
      name: 'noble-web-design-backend',
      script: 'index.js',
      cwd: serverDir,
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        ...envConfig,
      },
      env_production: {
        ...envConfig,
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
