<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Noble Web Designs – Admin & Client Portal

A full-stack dashboard and client portal for a boutique web studio. Admins manage leads, clients, projects, uptime, contracts, and support; clients sign in to review projects, files, contracts (DocuSeal), tickets, and team info.

## Stack

- Frontend: React + TypeScript, Vite, Tailwind utility classes, Framer Motion, custom UI kit.
- Backend: Node/Express, Prisma ORM, PostgreSQL.
- Auth: GitHub OAuth for admins (sessions), invite/PIN + password for clients (JWT).
- Storage/Infra: Supabase for file uploads; DocuSeal embed for contracts; Uptime monitor loop with email alerts.

## Features

### Admin Console
- Dashboard: KPI cards and quick client invite issuance (name + email, PIN lifecycle).
- Leads: Filter by query/status, reply via mailto, mark replied, delete.
- Clients: Invite/resend PIN, status chips, upload files (optional project link), view client team members.
- Projects: Create/assign projects, edit metadata (status, timelines, URLs, budget), add activities and documents.
- Contracts: Create contract records, accept DocuSeal embeds/template IDs, assign to clients, track signed/pending, delete with assignments.
- Uptime: Create/update/delete monitors, view logs, status messaging, alert thresholds, test alerts.
- Tickets: Filter/search tickets, update status.
- Settings: Alert settings for uptime.

### Client Portal
- Login: Returning (email/password) and first-time (email + PIN -> password).
- Dashboard: Project status, recent activity, grouped files, quick ticket submission, team listing, contract summary.
- Contracts: View/sign via DocuSeal iframe; status and PDFs where available.
- Files: Download grouped by project.
- Tickets: Create and view statuses/admin notes.
- Team: Submit team members (if feature flag enabled).

## API (selected)
- Admin: `/api/admin/me`, `/api/admin/clients`, `/api/admin/clients/issue-pin`, `/api/admin/projects`, `/api/admin/contracts`, `/api/admin/leads`, `/api/admin/tickets`, `/api/admin/uptime`, `/api/admin/settings/alerts`, uploads at `/api/admin/files/upload`.
- Client: `/api/client/auth/start|complete`, `/api/client/login`, `/api/client/me`, `/api/client/projects`, `/api/client/files`, `/api/client/contracts`, `/api/client/tickets`, `/api/client/team`.

## Data Models (Prisma)
- Core: User (roles ADMIN/CLIENT), Client.
- Projects: Project, ProjectAssignment, ProjectActivity, ProjectDocument.
- Contracts: Contract, ContractAssignment, ContractSignature.
- Leads, Tickets, TeamMember, ClientFile (FileAttachment), UptimeTarget, UptimeLog, SiteSettings.

## Environment
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `JWT_SECRET`, `FRONTEND_URL`, `GITHUB_*` (OAuth), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET`, SMTP vars for mail, optional uptime intervals and PIN expiry.
- Feature flags: `VITE_FEATURE_TEAM_ENABLED`, `VITE_FEATURE_TICKETS_ENABLED`, `VITE_DOCUSEAL_EMBED_URL`, `VITE_API_URL`.

## Scripts
- `npm install` – install deps.
- `npm run dev` – start Vite dev server.
- `npm run build` – production build.
- `npm run preview` – preview built app.
- `npx prisma migrate dev --name <name>` – create/apply migrations (interactive).
- `npx prisma migrate deploy` – apply migrations in deploy.
- `npx prisma studio` – inspect data.

## Auth Flows
- Admin: `/auth/github` → session cookie → `/api/admin/*` with credentials.
- Client first-time: `/api/client/auth/start` (email+PIN) → `/api/client/auth/complete` (set password) → JWT.
- Client returning: `/api/client/login` → JWT stored in `localStorage`.

## File/Contract Handling
- Uploads stored in Supabase bucket (`client-documents` by default); file metadata saved as `ClientFile`.
- Contracts store DocuSeal embed URLs or constructed links from template IDs; signing tracked via ContractSignature/Assignment and optional Supabase PDF storage.

## Monitoring/Alerts
- Uptime loop polls targets; alert thresholds and emails from SiteSettings. Test alerts via `/api/admin/settings/alerts/test`.

## Getting Started Quickly
1) Set env vars (DB, OAuth, JWT, Supabase, SMTP, `VITE_API_URL`, `VITE_DOCUSEAL_EMBED_URL`).
2) Run migrations: `npx prisma migrate dev --name init`.
3) `npm run dev` and open the frontend (`/admin` for GitHub login, `/client` for portal).
4) Issue a client invite in Admin → use PIN to activate in Client portal.

## Notes
- Keep `credentials: "include"` for admin fetches (session cookies).
- Client JWT lives in `localStorage` as `client_token`.
- DocuSeal embeds must be valid iframe src/share URLs or template IDs.
- Uptime requires SMTP if you want alert emails; otherwise logs still record status.

Enjoy!

