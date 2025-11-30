import serverless from 'serverless-http';
import app, { ensureAppReady } from '../server/index.js';

const handler = serverless(app);

export default async function vercelHandler(req, res) {
  await ensureAppReady();
  return handler(req, res);
}
