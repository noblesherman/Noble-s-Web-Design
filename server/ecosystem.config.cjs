const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const cwd = '/home/noblesherman/apps/Noble-s-Web-Design/server';
const envPath = path.join(cwd, '.env');
const parsedEnv = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};

module.exports = {
  apps: [
    {
      name: 'noble-web-design-backend',
      script: 'index.js',
      cwd,
      env_file: envPath,
      env: {
        NODE_ENV: 'production',
        PORT: '4000',
        ...parsedEnv,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      time: true,
    },
  ],
};
