// server/index.js
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import { generateContractPdf, generateContractPdfFromTemplate } from './contractPdf.js';
import { startUptimeMonitor, calculateUptimePercentage } from './uptimeService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || (isProd ? 'https://noblesweb.design' : 'http://localhost:5173');
const API_URL = process.env.VITE_API_URL || process.env.API_URL || 'https://api.noblesweb.design';
const ADMIN_REDIRECT = process.env.ADMIN_REDIRECT || `${FRONTEND_URL.replace(/\/$/, '')}/admin`;
const SESSION_SECRET = process.env.SESSION_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const PIN_EXP_MINUTES = Number(process.env.PIN_EXP_MINUTES || 30);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'client-documents';
const UPTIME_TIMEOUT_MS = Number(process.env.UPTIME_TIMEOUT_MS || 10000);
const UPTIME_POLL_MS = Number(process.env.UPTIME_POLL_MS || 30000);
const VALID_CHECK_INTERVALS = [1, 5, 15, 60];
const TICKET_STATUSES = ['Open', 'In Progress', 'Closed'];
const INVITE_TOKEN_TTL_MINUTES = Number(process.env.INVITE_TOKEN_TTL_MINUTES || 30);
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'https://api.noblesweb.design/auth/github/callback';
const REQUIRED_ENV = ['DATABASE_URL', 'SESSION_SECRET', 'JWT_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];
const normalizeOrigin = (value) => {
  if (!value) return null;
  try {
    return new URL(value).origin.replace(/\/$/, '');
  } catch {
    return String(value).replace(/\/$/, '');
  }
};
const allowedOrigins = Array.from(new Set([
  FRONTEND_URL,
  API_URL,
  ADMIN_REDIRECT,
  'https://noblesweb.design',
  'https://api.noblesweb.design',
  ...(isProd ? [] : ['http://localhost:3000']),
].map(normalizeOrigin).filter(Boolean)));

const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL },
  },
});
const app = express();
app.set('trust proxy', 1);

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

const ok = (res, payload = {}) => res.json({ success: true, ...payload, data: payload.data ?? payload });
const fail = (res, status, error) => res.status(status).json({ success: false, error });

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (Array.isArray(forwarded) && forwarded.length) return forwarded[0];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || '';
};

const uploadToSupabase = async ({ path, buffer, contentType }) => {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(error.message);
  const { data: publicData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return publicData.publicUrl;
};

const uploadSignatureImage = async ({ userId, contractId, signatureDataUrl }) => {
  const base64 = signatureDataUrl?.split(',')[1];
  if (!base64) throw new Error('Invalid signature image');
  const fileBuffer = Buffer.from(base64, 'base64');
  const path = `contracts/${userId}/${contractId}/signature-${Date.now()}.png`;

  const signatureUrl = await uploadToSupabase({
    path,
    buffer: fileBuffer,
    contentType: 'image/png',
  });

  return { signatureUrl };
};

const uploadPdfDocument = async ({ userId, contractId, pdfBytes, signatureUuid }) => {
  const fileBuffer = Buffer.isBuffer(pdfBytes) ? pdfBytes : Buffer.from(pdfBytes);
  const path = `contracts/${userId}/${contractId}/signed-${signatureUuid || Date.now()}.pdf`;

  const pdfUrl = await uploadToSupabase({
    path,
    buffer: fileBuffer,
    contentType: 'application/pdf',
  });

  return { pdfUrl };
};

const uploadContractTemplate = async ({ contractId, pdfBase64 }) => {
  const cleanBase64 = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
  const fileBuffer = Buffer.from(cleanBase64, 'base64');
  const path = `contracts/templates/${contractId}.pdf`;

  const publicUrl = await uploadToSupabase({
    path,
    buffer: fileBuffer,
    contentType: 'application/pdf',
  });

  return { templateUrl: publicUrl, templatePath: path };
};

const signSupabasePath = async (path) => {
  if (!supabase || !path) return null;
  try {
    const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).createSignedUrl(path, 60 * 60);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch (err) {
    console.error('signSupabasePath error', err);
    return null;
  }
};

const extractDocusealEmbedUrl = (raw, templateId) => {
  const candidate = raw ?? templateId;
  if (!candidate || typeof candidate !== 'string') return null;
  const trimmed = candidate.trim();
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match && match[1]) return match[1];

  const idOnly = trimmed.match(/^[A-Za-z0-9_-]+$/);
  if (idOnly) return `https://docuseal.com/d/${trimmed}`;

  return trimmed;
};

const uploadHeadshotImage = async ({ userId, imageBase64 }) => {
  if (!supabase) throw new Error('Supabase not configured');
  if (!imageBase64) throw new Error('Invalid image');
  const clean = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const buffer = Buffer.from(clean, 'base64');
  const path = `team/headshots/${userId}-${Date.now()}.png`;
  const url = await uploadToSupabase({
    path,
    buffer,
    contentType: 'image/png',
  });
  return { headshotUrl: url };
};

/* EMAIL CONFIG (PRETTY + DOMAIN SENDER) */
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'no-reply@noblesweb.design';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || SMTP_FROM;

const mailer = SMTP_HOST && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      service: SMTP_HOST.includes('gmail') ? 'gmail' : undefined,
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE || SMTP_PORT === 465,
      requireTLS: !(SMTP_SECURE || SMTP_PORT === 465),
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      pool: false,
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      tls: { servername: SMTP_HOST },
    })
  : null;

const ensureSiteSettings = async () => {
  return prisma.siteSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      alertThreshold: 2,
    },
  });
};

const isRecordNotFoundError = (err) => {
  const message = err?.message || '';
  return err?.code === 'P2025' || /Record (to )?update not found/i.test(message);
};

const resolveSessionExpiration = (session) => {
  const expires = session?.cookie?.expires;
  if (expires) return new Date(expires);
  const maxAge = session?.cookie?.originalMaxAge;
  if (typeof maxAge === 'number') return new Date(Date.now() + maxAge);
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
};

class SafePrismaSessionStore extends PrismaSessionStore {
  async safeCreateSessionRecord(sid, session) {
    try {
      const expiresAt = resolveSessionExpiration(session);
      let dataString;
      try {
        dataString = this.serializer.stringify(session);
      } catch (err) {
        console.error('Session serialize failed', err);
        dataString = JSON.stringify(session || {});
      }

      const createData = { sid, expiresAt, data: dataString };
      if (this.dbRecordIdIsSessionId) {
        createData.id = sid;
      } else if (typeof this.dbRecordIdFunction === 'function') {
        const generated = this.dbRecordIdFunction(sid);
        if (generated) createData.id = generated;
      }

      await this.prisma[this.sessionModelName].create({ data: createData });
    } catch (err) {
      console.error('Session recreate failed', err);
    }
  }

  async set(sid, session, callback) {
    try {
      return await super.set(sid, session, callback);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        await this.safeCreateSessionRecord(sid, session);
        if (callback) callback();
        return;
      }
      throw err;
    }
  }

  async touch(sid, session, callback) {
    try {
      return await super.touch(sid, session, callback);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        await this.safeCreateSessionRecord(sid, session);
        if (callback) callback();
        return;
      }
      throw err;
    }
  }
}

const sendEmail = async ({ to, subject, html }) => {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!mailer || !recipients.length) return;

  try {
    await Promise.race([
      mailer.sendMail({ from: SMTP_FROM, to: recipients, subject, html }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('email timeout')), 10000)),
    ]);
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

const sendInviteEmail = async ({ to, pin, name }) => {
  if (!mailer || !to) return;

  const portalUrl = `${FRONTEND_URL}/client`;

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; background:#f8f9fc; padding:40px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 4px 16px rgba(0,0,0,0.06); border:1px solid #e8e8e8;">
        
        <h2 style="margin:0 0 12px 0; color:#111111; font-size:24px; font-weight:600;">
          Welcome${name ? `, ${name}` : ''}
        </h2>

        <p style="margin:0 0 16px 0; color:#444; font-size:15px; line-height:1.5;">
          You now have access to the 
          <strong>Noble Web Designs Client Portal.</strong>
        </p>

        <div style="padding:18px; background:#f0f4ff; border-radius:8px; margin:20px 0; text-align:center;">
          <p style="margin:0; color:#3b4cca; font-size:16px; font-weight:500;">
            Temporary PIN:
          </p>
          <div style="margin-top:8px; font-size:32px; font-weight:700; color:#1d42ff; letter-spacing:4px;">
            ${pin}
          </div>
        </div>

        <p style="margin:0 0 10px 0; color:#444; font-size:15px;">
          Log in using the link below:
        </p>

        <a href="${portalUrl}" 
           style="display:inline-block; margin:16px 0; padding:12px 20px;
                  background:#1d42ff; color:white; font-size:15px; font-weight:600;
                  border-radius:6px; text-decoration:none;">
          Open Client Portal
        </a>

        <p style="margin:24px 0 0 0; color:#777; font-size:13px; line-height:1.5;">
          Your PIN expires in ${PIN_EXP_MINUTES} minutes.  
          If you didn’t request this, ignore this email.
        </p>

      </div>

      <p style="text-align:center; margin-top:20px; font-size:12px; color:#999;">
        Noble Web Designs • Client Portal
      </p>
    </div>
  `;

  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to,
      subject: 'Your Noble Web Designs Client Portal PIN',
      html,
    });
    console.log('EMAIL SENT SUCCESSFULLY');
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

const ensureClientRecord = async ({ userId, name, company }) => {
  if (!userId) return null;
  return prisma.client.upsert({
    where: { userId },
    update: {
      company: company || undefined,
    },
    create: {
      userId,
      company: company || name || undefined,
    },
  });
};

const generateClientToken = (userId, role = 'CLIENT') => {
  return jwt.sign(
    { sub: userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const buildClientUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

const handleClientAuthStart = async (req, res) => {
  try {
    const { email, pin } = req.body || {};
    if (!email || !pin) return fail(res, 400, 'Email and PIN required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.tempPinHash) return fail(res, 404, 'Client not found for that PIN');
    if (user.tempPinExpiresAt && user.tempPinExpiresAt.getTime() < Date.now()) {
      return fail(res, 401, 'PIN expired. Ask your admin to regenerate.');
    }

    const validPin = await bcrypt.compare(pin, user.tempPinHash);
    if (!validPin) return fail(res, 401, 'Client not found for that PIN');

    const inviteToken = jwt.sign(
      { sub: user.id, role: user.role, type: 'invite' },
      JWT_SECRET,
      { expiresIn: `${INVITE_TOKEN_TTL_MINUTES}m` }
    );

    ok(res, {
      message: 'PIN verified. Create your password next.',
      inviteToken,
      expiresAt: user.tempPinExpiresAt,
    });
  } catch (err) {
    console.error('auth start error', err);
    fail(res, 500, 'Unable to verify PIN');
  }
};

const handleClientAuthComplete = async (req, res) => {
  try {
    const { inviteToken, password, email, pin, name } = req.body || {};
    if (!password) return fail(res, 400, 'Password is required');

    let user;
    if (inviteToken) {
      try {
        const payload = jwt.verify(inviteToken, JWT_SECRET);
        if (payload?.type !== 'invite' || !payload?.sub) return fail(res, 401, 'Invalid invite token');
        user = await prisma.user.findUnique({ where: { id: payload.sub } });
      } catch (err) {
        return fail(res, 401, err?.message || 'Invalid invite token');
      }
    } else {
      if (!email || !pin) return fail(res, 400, 'Email and PIN required');
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) return fail(res, 404, 'Client not found for that PIN');
      if (user.tempPinExpiresAt && user.tempPinExpiresAt.getTime() < Date.now()) {
        return fail(res, 401, 'PIN expired. Ask your admin to regenerate.');
      }
      const validPin = user.tempPinHash ? await bcrypt.compare(pin, user.tempPinHash) : false;
      if (!validPin) return fail(res, 401, 'Client not found for that PIN');
    }

    if (!user) return fail(res, 404, 'Client not found');

    const passwordHash = await bcrypt.hash(password, 12);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        tempPinHash: null,
        tempPinExpiresAt: null,
        name: user.name || name || undefined,
      },
    });

    await ensureClientRecord({ userId: updated.id, name: updated.name });

    const token = generateClientToken(updated.id, updated.role);

    ok(res, {
      token,
      user: buildClientUser(updated),
      message: 'Account activated',
    });
  } catch (err) {
    console.error('auth complete error', err);
    fail(res, 500, 'Unable to complete invite');
  }
};

// BASIC MIDDLEWARE
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalized)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

// SESSION + PASSPORT
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: isProd,
    cookie: {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      httpOnly: true,
      domain: isProd ? '.noblesweb.design' : undefined,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: new SafePrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: false,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// PASSPORT SERIALIZATION
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: String(id) } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GITHUB STRATEGY
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        const user = await prisma.user.upsert({
          where: { githubId: profile.id },
          update: {
            name: profile.displayName || profile.username,
            email,
            role: 'ADMIN',
          },
          create: {
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email,
            role: 'ADMIN',
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// GITHUB AUTH ROUTES
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${FRONTEND_URL}/admin/login`,
    session: true,
  }),
  (_req, res) => {
    res.redirect(ADMIN_REDIRECT);
  }
);

// ADMIN AUTH GUARD
const requireAdmin = (req, res, next) => {
  if (req.isAuthenticated?.() && req.user?.role === 'ADMIN') return next();
  return res.status(401).json({ error: 'Unauthorized' });
};

// ADMIN CURRENT USER
app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// ADMIN LOGOUT
app.post('/logout', (req, res) => {
  req.logout?.(() => {});
  req.session?.destroy(() => {});
  res.clearCookie('connect.sid');
  res.json({ ok: true });
});

// CLIENT JWT AUTH GUARD
const requireClient = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.clientId = payload.sub;
    req.clientRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// CLIENT REGISTRATION IS INVITE-ONLY
app.post('/api/clients/register', (_req, res) => {
  return res.status(403).json({ error: 'Registration is invite-only' });
});

// CLIENT LOGIN (EMAIL + PASSWORD)
app.post('/api/clients/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateClientToken(user.id, user.role);
    ok(res, { token, user: buildClientUser(user) });
  } catch (err) {
    console.error('client login error', err);
    res.status(500).json({ error: 'Unable to login' });
  }
});

// CLIENT REQUEST PIN
app.post('/api/clients/request-pin', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Client not found' });
    if (user.role !== 'CLIENT') return res.status(403).json({ error: 'Not a client account' });

    const pin = `${Math.floor(100000 + Math.random() * 900000)}`;
    const tempPinHash = await bcrypt.hash(pin, 12);
    const tempPinExpiresAt = new Date(Date.now() + PIN_EXP_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { tempPinHash, tempPinExpiresAt },
    });

    await sendInviteEmail({ to: email, pin, name: user.name || email });

    ok(res, { message: 'PIN sent' });
  } catch (err) {
    console.error('request pin error', err);
    res.status(500).json({ error: 'Unable to send PIN' });
  }
});

// CLIENT VERIFY PIN
app.post('/api/clients/verify-pin', handleClientAuthStart);

// CLIENT COMPLETE INVITE (PASSWORD SET)
app.post('/api/clients/complete', handleClientAuthComplete);

// CLIENT: GET PROJECTS
app.get('/api/client/projects', requireClient, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { assignments: { some: { userId: req.clientId } } },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
      activities: { orderBy: { occurredAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });

  ok(res, { projects });
});

// CLIENT: PROJECT DETAILS
app.get('/api/client/projects/:id', requireClient, async (req, res) => {
  const { id } = req.params;
  const project = await prisma.project.findFirst({
    where: {
      id,
      assignments: { some: { userId: req.clientId } },
    },
    include: {
      assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
      activities: { orderBy: { occurredAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!project) return res.status(404).json({ error: 'Project not found' });
  ok(res, { project });
});

// CLIENT: UPLOAD FILE
app.post('/api/client/files/upload', requireClient, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Storage not configured' });
  const { projectId, name: fileName, fileBase64 } = req.body;
  if (!fileName || !fileBase64) return res.status(400).json({ error: 'fileName and fileBase64 required' });

  try {
    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const path = `${req.clientId}/${Date.now()}-${fileName}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: true,
      });

    if (error) return res.status(500).json({ error: error.message });

    const { data: publicData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    const fileUrl = publicData.publicUrl;

    const created = await prisma.clientFile.create({
      data: {
        userId: req.clientId,
        projectId: projectId || null,
        name: fileName,
        fileUrl,
        fileType: fileName.split('.').pop() || '',
      },
    });

    res.json({ file: created });
  } catch (err) {
    res.status(500).json({ error: 'Unable to upload file' });
  }
});

// CLIENT: LIST FILES
app.get('/api/client/files', requireClient, async (req, res) => {
  const files = await prisma.clientFile.findMany({
    where: { userId: req.clientId },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, { files });
});

// CLIENT: CREATE TICKET
app.post('/api/client/tickets', requireClient, async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'title and description required' });

    const ticket = await prisma.ticket.create({
      data: {
        userId: req.clientId,
        title,
        description,
        priority: priority || 'Medium',
        category: category || 'General',
      },
    });

    ok(res, { ticket });
  } catch (err) {
    res.status(500).json({ error: 'Unable to create ticket' });
  }
});

// CLIENT: LIST TICKETS
app.get('/api/client/tickets', requireClient, async (req, res) => {
  const tickets = await prisma.ticket.findMany({
    where: { userId: req.clientId },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, { tickets });
});

// CLIENT: GET CONTRACTS
app.get('/api/client/contracts', requireClient, async (req, res) => {
  const assignments = await prisma.contractAssignment.findMany({
    where: { userId: req.clientId },
    include: {
      contract: true,
      signature: true,
    },
  });
  ok(res, { assignments });
});

// CLIENT: SIGN CONTRACT
app.post('/api/client/contracts/:assignmentId/sign', requireClient, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { typedName, signatureDataUrl, pdfBase64, contractVersion } = req.body;

    const assignment = await prisma.contractAssignment.findFirst({
      where: { id: assignmentId, userId: req.clientId },
      include: { contract: true, signature: true },
    });

    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (!typedName) return res.status(400).json({ error: 'typedName required' });

    const signatureUuid = randomUUID();

    let signatureUrl = assignment.signature?.signatureUrl;
    let pdfUrl = assignment.signature?.pdfUrl;

    if (signatureDataUrl) {
      const { signatureUrl: uploaded } = await uploadSignatureImage({
        userId: req.clientId,
        contractId: assignment.contractId,
        signatureDataUrl,
      });
      signatureUrl = uploaded;
    }

    if (pdfBase64) {
      const pdfBytes = Buffer.from(pdfBase64.split(',')[1] || pdfBase64, 'base64');
      const { pdfUrl: uploadedPdf } = await uploadPdfDocument({
        userId: req.clientId,
        contractId: assignment.contractId,
        pdfBytes,
        signatureUuid,
      });
      pdfUrl = uploadedPdf;
    } else if (assignment.contract?.body) {
      const pdfBuffer = await generateContractPdf({
        body: assignment.contract.body,
        title: assignment.contract.title,
        signedName: typedName,
        contractVersion: contractVersion || assignment.contract.version,
        contractId: assignment.contractId,
        userName: assignment.user?.name,
      });
      const { pdfUrl: uploadedPdf } = await uploadPdfDocument({
        userId: req.clientId,
        contractId: assignment.contractId,
        pdfBytes: pdfBuffer,
        signatureUuid,
      });
      pdfUrl = uploadedPdf;
    }

    const signature = await prisma.contractSignature.create({
      data: {
        contractId: assignment.contractId,
        userId: req.clientId,
        typedName,
        email: assignment.user?.email || '',
        signedAt: new Date(),
        signedIp: getClientIp(req),
        signatureUrl,
        pdfUrl,
        contractVersion: contractVersion || assignment.contract?.version || '1.0',
        signatureUuid,
      },
    });

    await prisma.contractAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'signed',
        signatureId: signature.id,
      },
    });

    ok(res, { signature });
  } catch (err) {
    console.error('sign contract error', err);
    res.status(500).json({ error: 'Unable to sign contract' });
  }
});

// CLIENT: INVITE TEAM MEMBER
app.post('/api/client/team/invite', requireClient, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });

    const existing = await prisma.teamMember.findFirst({
      where: { userId: req.clientId, email },
    });
    if (existing) return res.status(400).json({ error: 'Team member already invited' });

    const member = await prisma.teamMember.create({
      data: {
        userId: req.clientId,
        name,
        email,
        role: role || 'Member',
        status: 'Pending',
      },
    });

    ok(res, { member });
  } catch (err) {
    res.status(500).json({ error: 'Unable to invite team member' });
  }
});

// CLIENT: LIST TEAM
app.get('/api/client/team', requireClient, async (req, res) => {
  const members = await prisma.teamMember.findMany({
    where: { userId: req.clientId },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, { members });
});

// CLIENT: VIEW FILES FOR PROJECT
app.get('/api/client/projects/:projectId/files', requireClient, async (req, res) => {
  const { projectId } = req.params;
  const files = await prisma.clientFile.findMany({
    where: { projectId, userId: req.clientId },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, { files });
});

// CLIENT: VIEW TICKETS
app.get('/api/client/projects/:projectId/tickets', requireClient, async (req, res) => {
  const { projectId } = req.params;
  const tickets = await prisma.ticket.findMany({
    where: { projectId, userId: req.clientId },
    orderBy: { createdAt: 'desc' },
  });
  ok(res, { tickets });
});

// CLIENT: DOCUSEAL SIGNATURE CALLBACK (WEBHOOK)
app.post('/api/client/docuseal/callback', async (req, res) => {
  // This could be implemented if needed; placeholder to avoid 404.
  res.json({ ok: true });
});

// ADMIN: CREATE TEMP PIN FOR CLIENT
app.post('/api/admin/clients/:id/pin', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const pin = `${Math.floor(100000 + Math.random() * 900000)}`;
    const tempPinHash = await bcrypt.hash(pin, 12);
    const tempPinExpiresAt = new Date(Date.now() + PIN_EXP_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id },
      data: { tempPinHash, tempPinExpiresAt },
    });

    if (user.email) {
      await sendInviteEmail({ to: user.email, pin, name: user.name || user.email });
    }

    ok(res, { pinSent: !!user.email, pin });
  } catch (err) {
    console.error('admin create pin error', err);
    res.status(500).json({ error: 'Unable to create PIN' });
  }
});

// ADMIN: LIST TICKETS
app.get('/api/admin/tickets', requireAdmin, async (_req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    ok(res, { tickets });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load tickets' });
  }
});

// ADMIN: ADD ADMIN MESSAGE TO TICKET
app.post('/api/admin/tickets/:ticketId/message', requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { adminMessage } = req.body || {};
    if (!adminMessage) return res.status(400).json({ error: 'adminMessage required' });

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { adminMessage },
    });

    res.json({ ticket });
  } catch (err) {
    console.error('admin ticket message error', err);
    res.status(500).json({ error: 'Unable to update ticket' });
  }
});

// ADMIN: update ticket status
app.post('/api/admin/tickets/:ticketId/status', requireAdmin, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body || {};
    if (!status || !TICKET_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status, closedAt: status === 'Closed' ? new Date() : null },
    });
    res.json({ ticket: updated });
  } catch (err) {
    console.error('admin ticket status error', err);
    res.status(500).json({ error: 'Unable to update ticket' });
  }
});

// ADMIN: LIST CLIENTS
app.get('/api/admin/clients', requireAdmin, async (_req, res) => {
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tempPinExpiresAt: true,
      tempPinHash: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  const mapped = clients.map(c => ({
    ...c,
    hasPassword: !!c.passwordHash,
    hasActivePin: !!(c.tempPinHash && c.tempPinExpiresAt && c.tempPinExpiresAt.getTime() > Date.now()),
  }));

  ok(res, { clients: mapped });
});

// ADMIN: CONTRACTS LIST
app.get('/api/admin/contracts', requireAdmin, async (_req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            signature: true,
          }
        },
        signatures: true,
      },
    });
    ok(res, { contracts });
  } catch (err) {
    console.error('admin contracts list error', err);
    fail(res, 500, 'Unable to load contracts');
  }
});

// ADMIN: CREATE CONTRACT
app.post('/api/admin/contracts', requireAdmin, async (req, res) => {
  try {
    const { title, version, body, templateBase64, signaturePlacements, docusealEmbedUrl, docusealTemplateId } = req.body;
    if (!title || !version || !body) {
      return fail(res, 400, 'title, version, and body are required');
    }

    if (templateBase64 && !supabase) {
      return fail(res, 500, 'Supabase not configured for template uploads');
    }

    let placementJson = null;
    if (signaturePlacements) {
      try {
        placementJson = typeof signaturePlacements === 'string'
          ? JSON.parse(signaturePlacements)
          : signaturePlacements;
      } catch {
        return fail(res, 400, 'signaturePlacements must be valid JSON');
      }
    }

    const embedUrl = extractDocusealEmbedUrl(docusealEmbedUrl, docusealTemplateId);

    let contract = await prisma.contract.create({
      data: { title, version, body, signaturePlacements: placementJson || undefined, docusealEmbedUrl: embedUrl || undefined },
    });

    if (templateBase64) {
      const { templateUrl, templatePath } = await uploadContractTemplate({
        contractId: contract.id,
        pdfBase64: templateBase64,
      });
      contract = await prisma.contract.update({
        where: { id: contract.id },
        data: { templatePdfUrl: templateUrl, templatePath },
      });
    }

    ok(res, { contract });
  } catch (err) {
    console.error('admin create contract error', err);
    fail(res, 500, 'Unable to create contract');
  }
});

// ADMIN: DELETE CONTRACT
app.delete('/api/admin/contracts/:contractId', requireAdmin, async (req, res) => {
  try {
    const { contractId } = req.params;
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      select: { id: true, templatePath: true },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    await prisma.contractSignature.deleteMany({ where: { contractId } });
    await prisma.contractAssignment.deleteMany({ where: { contractId } });
    await prisma.contract.delete({ where: { id: contractId } });

    if (supabase && contract.templatePath) {
      try {
        await supabase.storage.from(SUPABASE_BUCKET).remove([contract.templatePath]);
      } catch (err) {
        console.error('supabase template delete error', err);
      }
    }

    ok(res, { status: 'deleted' });
  } catch (err) {
    console.error('admin delete contract error', err);
    fail(res, 500, 'Unable to delete contract');
  }
});

// ADMIN: ASSIGN CONTRACT TO CLIENT
app.post('/api/admin/contracts/:contractId/assign', requireAdmin, async (req, res) => {
  try {
    const { contractId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const contract = await prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    const assignment = await prisma.contractAssignment.upsert({
      where: { contractId_userId: { contractId, userId } },
      update: { status: 'pending' },
      create: { contractId, userId, status: 'pending' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        signature: true,
      },
    });

    ok(res, { assignment, message: 'Assigned contract' });
  } catch (err) {
    console.error('admin assign contract error', err);
    fail(res, 500, 'Unable to assign contract');
  }
});

// PROJECT CRUD (lightweight)
app.get('/api/admin/projects', requireAdmin, async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignments: {
        include: { user: { select: { id: true, name: true, email: true } } }
      },
      activities: { orderBy: { occurredAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    }
  });
  ok(res, { projects });
});

app.post('/api/admin/projects', requireAdmin, async (req, res) => {
  const { name, description, status } = req.body;
  if (!name) return fail(res, 400, 'Name required');
  const project = await prisma.project.create({
    data: { name, description, status: status || 'active' },
  });
  ok(res, { project });
});

app.post('/api/admin/projects/:projectId/assign', requireAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;
  if (!userId) return fail(res, 400, 'userId required');

  const assignment = await prisma.projectAssignment.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: { role },
    create: { projectId, userId, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  ok(res, { assignment });
});

app.post('/api/admin/projects/:projectId/status', requireAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
  ok(res, { project });
});

app.post('/api/admin/projects/:projectId/details', requireAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { statusBadge, timelineLabel, nextMilestone, launchDate, budgetUsed, stagingUrl, designSystemUrl, description } = req.body;
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      statusBadge,
      timelineLabel,
      nextMilestone,
      launchDate: launchDate ? new Date(launchDate) : null,
      budgetUsed: budgetUsed === "" || budgetUsed === undefined ? null : Number(budgetUsed),
      stagingUrl,
      designSystemUrl,
      description,
    },
    include: {
      assignments: true,
      activities: { orderBy: { occurredAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
    }
  });
  ok(res, { project });
});

app.post('/api/admin/projects/:projectId/activity', requireAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { title, category, occurredAt } = req.body;
  if (!title) return fail(res, 400, 'Title required');
  const activity = await prisma.projectActivity.create({
    data: {
      projectId,
      title,
      category,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    },
  });
  ok(res, { activity });
});

app.post('/api/admin/projects/:projectId/documents', requireAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { title, status, amount, dueDate, url } = req.body;
  if (!title) return fail(res, 400, 'Title required');
  const doc = await prisma.projectDocument.create({
    data: {
      projectId,
      title,
      status,
      amount: amount ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      url,
    },
  });
  ok(res, { document: doc });
});

// ADMIN FILE UPLOAD (base64 to Supabase)
app.post('/api/admin/files/upload', requireAdmin, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  const { userId, fileName, fileBase64, projectId } = req.body;
  if (!userId || !fileName || !fileBase64) return res.status(400).json({ error: 'userId, fileName, and fileBase64 required' });

  try {
    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const path = `${userId}/${Date.now()}-${fileName}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: true,
      });

    if (error) return res.status(500).json({ error: error.message });

    const { data: publicData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    const fileUrl = publicData.publicUrl;

    const created = await prisma.clientFile.create({
      data: {
        userId,
        projectId: projectId || null,
        name: fileName,
        fileUrl,
        fileType: fileName.split('.').pop() || '',
      },
    });

    res.json({ file: created });
  } catch (err) {
    res.status(500).json({ error: 'Unable to upload file' });
  }
});

// ADMIN: LIST LEADS
app.get('/api/admin/leads', requireAdmin, async (req, res) => {
  try {
    const { status, search, q } = req.query;
    const query = typeof q === 'string' && q ? q : typeof search === 'string' ? search : '';
    const filters = {};
    if (status === 'new') filters.replied = false;
    if (status === 'replied') filters.replied = true;
    if (query) {
      filters.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { projectType: { contains: query, mode: 'insensitive' } },
        { notes: { contains: query, mode: 'insensitive' } },
      ];
    }
    const leads = await prisma.lead.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' }
    });
    ok(res, { leads });
  } catch (err) {
    fail(res, 500, 'Unable to load leads');
  }
});

// ADMIN: DELETE LEAD
app.delete('/api/admin/leads/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({ where: { id } });
    ok(res, { ok: true });
  } catch (err) {
    fail(res, 500, 'Unable to delete lead');
  }
});

// ADMIN: MARK LEAD REPLIED
app.post('/api/admin/leads/:id/replied', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.update({
      where: { id },
      data: { replied: true, repliedAt: new Date() },
    });
    ok(res, { lead });
  } catch (err) {
    fail(res, 500, 'Unable to update lead');
  }
});

// ADMIN: ALERT SETTINGS
app.get('/api/admin/settings/alerts', requireAdmin, async (_req, res) => {
  try {
    const settings = await ensureSiteSettings();
    ok(res, { settings });
  } catch (err) {
    fail(res, 500, 'Unable to load settings');
  }
});

app.post('/api/admin/settings/alerts', requireAdmin, async (req, res) => {
  try {
    const { primaryAlertEmail, secondaryAlertEmail, alertThreshold } = req.body;
    const parsedThreshold = Math.max(1, Math.round(Number(alertThreshold) || 2));
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'global' },
      update: {
        primaryAlertEmail: primaryAlertEmail || null,
        secondaryAlertEmail: secondaryAlertEmail || null,
        alertThreshold: parsedThreshold,
      },
      create: {
        id: 'global',
        primaryAlertEmail: primaryAlertEmail || null,
        secondaryAlertEmail: secondaryAlertEmail || null,
        alertThreshold: parsedThreshold,
      },
    });
    ok(res, { settings });
  } catch (err) {
    fail(res, 500, 'Unable to save settings');
  }
});

app.post('/api/admin/settings/alerts/test', requireAdmin, async (_req, res) => {
  try {
    if (!mailer) return res.status(500).json({ error: 'Mailer not configured' });
    const settings = await ensureSiteSettings();
    const recipients = [settings.primaryAlertEmail, settings.secondaryAlertEmail].filter(Boolean);
    if (!recipients.length) return res.status(400).json({ error: 'No alert email configured' });

    await sendEmail({
      to: recipients,
      subject: 'Uptime monitoring test alert',
      html: `
        <div style="font-family:Arial,sans-serif;color:#0f172a">
          <h2 style="margin:0 0 12px 0;">This is a test alert from Noble Web Designs</h2>
          <p style="margin:0 0 8px 0;">Your uptime alert configuration is working.</p>
          <p style="margin:0 0 8px 0;">Sent at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    ok(res, { ok: true });
  } catch (err) {
    fail(res, 500, 'Unable to send test alert');
  }
});

// ADMIN: UPTIME MONITORING
app.get('/api/admin/uptime', requireAdmin, async (_req, res) => {
  try {
    const targets = await prisma.uptimeTarget.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const withStats = await Promise.all(
      targets.map(async (target) => {
        const logs = await prisma.uptimeLog.findMany({
          where: { targetId: target.id },
          orderBy: { timestamp: 'desc' },
          take: 50,
          select: { passed: true },
        });
        return {
          ...target,
          averageUptime: calculateUptimePercentage(logs),
        };
      })
    );

    ok(res, { targets: withStats });
  } catch (err) {
    fail(res, 500, 'Unable to load uptime targets');
  }
});

app.get('/api/admin/uptime/logs/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await prisma.uptimeLog.findMany({
      where: { targetId: id },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    ok(res, { logs });
  } catch (err) {
    fail(res, 500, 'Unable to load logs');
  }
});

app.post('/api/admin/uptime', requireAdmin, async (req, res) => {
  try {
    const { id, url, checkInterval } = req.body;
    if (!url || !checkInterval) return fail(res, 400, 'url and checkInterval required');
    const interval = Number(checkInterval);
    if (!VALID_CHECK_INTERVALS.includes(interval)) {
      return fail(res, 400, 'Invalid interval');
    }

    const normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      return fail(res, 400, 'URL must include protocol (http/https)');
    }

    let target;
    if (id) {
      target = await prisma.uptimeTarget.update({
        where: { id },
        data: {
          url: normalizedUrl,
          checkInterval: interval,
          lastChecked: null,
          consecutiveFailures: 0,
          alertActive: false,
        },
      });
    } else {
      target = await prisma.uptimeTarget.create({
        data: {
          url: normalizedUrl,
          checkInterval: interval,
          ownerUserId: req.user.id,
        },
      });
    }

    ok(res, { target });
  } catch (err) {
    fail(res, 500, 'Unable to save uptime target');
  }
});

app.delete('/api/admin/uptime/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.uptimeLog.deleteMany({ where: { targetId: id } });
    await prisma.uptimeTarget.delete({ where: { id } });
    ok(res, { ok: true });
  } catch (err) {
    fail(res, 500, 'Unable to delete target');
  }
});

// CONTACT FORM SUBMISSION
app.post('/api/contact', async (req, res) => {
  const { name, businessName, email, projectType, priority, scope, timeline, budget, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  try {
    const lead = await prisma.lead.create({
      data: { name, businessName, email, projectType, priority, scope, timeline, budget, notes },
    });

    let emailed = false;
    if (mailer) {
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111;">
          <h2>New Project Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Business:</strong> ${businessName || '—'}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Project Type:</strong> ${projectType || '—'}</p>
          <p><strong>Priority:</strong> ${priority || '—'}</p>
          <p><strong>Scope:</strong> ${scope || '—'}</p>
          <p><strong>Timeline:</strong> ${timeline || '—'}</p>
          <p><strong>Budget:</strong> ${budget || '—'}</p>
          <p><strong>Notes:</strong><br/>${notes || '—'}</p>
        </div>
      `;
      console.log('Sending lead email to', SMTP_USER, 'via', SMTP_HOST, 'port', SMTP_PORT, 'secure', SMTP_SECURE || SMTP_PORT === 465);
      try {
        await Promise.race([
          mailer.sendMail({
            from: SMTP_FROM,
            to: SMTP_USER,
            subject: 'New Start a Project submission',
            html,
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Email timeout')), 15000)),
        ]);
        emailed = true;
      } catch (err) {
        console.error('Lead email failed', err);
      }
    } else {
      console.warn('Mailer not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS.');
    }

    res.json({ ok: true, leadId: lead.id, emailed });
  } catch (err) {
    res.status(500).json({ error: 'Unable to save lead' });
  }
});

// HEALTH CHECK
app.get('/health', async (_req, res) => {
  const now = Date.now();
  let dbStatus = 'ok';
  let dbLatencyMs = null;

  try {
    const started = Date.now();
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('db timeout')), 1000)),
    ]);
    dbLatencyMs = Date.now() - started;
  } catch (err) {
    dbStatus = 'error';
    console.error('Health check DB error', err?.message || err);
  }

  res.json({
    status: 'ok',
    time: new Date(now).toISOString(),
    uptimeMs: Math.round(process.uptime() * 1000),
    db: dbStatus,
    dbLatencyMs,
  });
});

// 404 + ERROR HANDLING
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// START SERVER AFTER PRISMA IS READY
const startServer = async () => {
  try {
    await prisma.$connect();
    await ensureSiteSettings();

    try {
      startUptimeMonitor({
        prisma,
        mailer,
        loadSettings: ensureSiteSettings,
        smtpFrom: SMTP_FROM,
        timeoutMs: UPTIME_TIMEOUT_MS,
        pollFrequencyMs: UPTIME_POLL_MS,
      });
    } catch (err) {
      console.error('Failed to start uptime monitor', err);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

startServer();
