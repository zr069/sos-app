# HantaMap.ai

Real-time outbreak tracking with verified sources.

## Overview

HantaMap.ai is a public health intelligence platform that presents outbreak data from official sources with clear verification status, source attribution and calm preparedness guidance.

- Public website: global outbreak map, verified updates, preparedness guidance
- Logged-in area: personal dashboard, saved regions, travel plans, preparedness checklist, AI advisor
- Admin area: create and manage outbreaks, reports, sources and updates with verification workflow
- PWA: installable mobile experience

## Tech stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL)
- Leaflet with OpenStreetMap (default) or Mapbox (optional)
- Zod for validation
- PWA with service worker

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd hantamap.ai
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - your Supabase service role key (server-side only)
- `NEXT_PUBLIC_SITE_URL` - your site URL (http://localhost:3000 for local dev)

Optional:
- `OPENAI_API_KEY` - enables the AI advisor feature
- `NEXT_PUBLIC_MAPBOX_TOKEN` - not used in MVP, Leaflet/OSM is the default

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Create an admin user

1. Register a new account through the UI at /login
2. In Supabase SQL Editor, set the user as admin:

```sql
UPDATE profiles SET role = 'admin' WHERE user_id = '<your-user-id>';
```

3. Access the admin area at /admin

## Adding outbreak data

All public outbreak data is managed through the admin area at /admin.

Workflow:
1. **Add sources** first (Admin > Sources > Add source). Each source needs a title, publisher, URL and type.
2. **Add locations** (Admin > Locations). Each location needs at least a country, plus optional region, city, lat/lng.
3. **Create an outbreak** (Admin > Outbreaks > Create). Fill in name, slug, pathogen, summary, status.
4. **Create reports** (Admin > Reports > Create). Link to an outbreak and location. Attach sources. Set verification status.
5. **Create updates** (Admin > Updates > Create). Link to outbreak, attach sources.
6. **Publish**: Check "Published" on outbreaks, reports and updates. Publishing requires at least one source.

Important rules:
- Never publish data without a verifiable source
- Use verification statuses accurately: Verified, Probable, Suspected, Disputed, Retracted
- Leave case counts empty (Unknown) when data is not available, do not enter 0
- 0 means verified zero, empty/null means unknown

## Deployment on Vercel

1. Push to GitHub
2. Import the repository in Vercel
3. Add environment variables in the Vercel project settings
4. Deploy

The build command is `next build` (default).

## Routes

### Public (no login required)
- `/` - homepage with map, metrics, updates
- `/map` - full-page interactive outbreak map
- `/outbreaks/[slug]` - outbreak detail page
- `/updates` - verified update feed
- `/preparedness` - preparedness guidance and product recommendations
- `/about` - about, verification methodology, editorial policy
- `/demo` - demo page with fictional data (clearly labeled)
- `/login` - sign in, create account, magic link

### Logged-in (/app)
- `/app` - personal dashboard
- `/app/profile` - user profile
- `/app/regions` - saved regions for monitoring
- `/app/travel` - travel plans with outbreak context
- `/app/preparedness` - personal preparedness checklist
- `/app/advisor` - AI advisor (requires OPENAI_API_KEY)
- `/app/alerts` - notification preferences

### Admin (/admin)
- `/admin` - admin dashboard
- `/admin/outbreaks` - manage outbreaks
- `/admin/reports` - manage location reports
- `/admin/updates` - manage verified updates
- `/admin/sources` - manage data sources
- `/admin/locations` - manage locations
- `/admin/products` - manage preparedness products

## Data integrity

- No fabricated outbreak data appears on public pages
- Every published report requires at least one source with URL
- Unknown values are shown as "Unknown", never as 0
- Conflicting data is marked as "Disputed"
- All public data includes verification status and source attribution

## Contact

- Corrections: corrections@hantamap.ai
- Press: press@hantamap.ai
