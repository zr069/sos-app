hantamap_cron_7Yx9_Kp4QzR8mV2nL6tB0sXeWq3AaJdHf92L

Stop and fix the product properly.

The current frontend is unacceptable because it looks like a static black design mockup. The map section appears to use or reference "outbreak-intelligence-layer.svg" and fake visual nodes. That is not a real data-driven map.

I do not want a decorative SVG.
I do not want fake signal points.
I do not want mock dashboard data.
I do not want a black redesign with no real data.

I want the actual public product to show real Supabase-backed data.

Use Claude Code Auto Mode if available so you do not ask me for every small approval. Do not use --dangerously-skip-permissions.

Autonomy rules:
You may proceed without asking for routine coding, file edits, lint, build, safe migrations, UI improvements and production deploys.
You must stop and ask before:
- exposing or printing secrets
- deleting production data
- dropping tables
- disabling RLS
- connecting hantamap.ai domain
- using service role keys in client code
- publishing unsourced data
- using fake outbreak numbers
- running destructive commands
- using --force, --skip-checks, --no-verify or similar bypass flags
- uploading code or data to external services

Mission:
When I open https://hantamapai.vercel.app as a normal public user, I must see a real HantaMap product:
- a real interactive map
- real markers from Supabase published reports or media-monitoring reports
- real source links
- real timestamps
- real status cards
- no fake SVG nodes
- no mock map section
- no fake data
- no empty dead state if recent media monitoring exists

PART 1: Remove fake map/mockup

Find and remove or replace any static fake map assets or mockup components, including:
- outbreak-intelligence-layer.svg
- hardcoded world map signal dots
- fake countries
- fake CFR numbers
- fake severity lists
- fake "Brazil, United States, Chile, Argentina" map cards
- any hardcoded "interactive map of every signal we track" mockup that is not backed by Supabase data

The public /map and homepage map preview must use the real map component only.

PART 2: Real data-driven map

The map must read from Supabase:
- published reports
- published media-monitoring reports if implemented
- published updates where relevant
- linked sources
- locations with latitude and longitude
- verification status
- location precision

No source_candidates may be visible publicly.

The real map must render markers based on database rows only.

If zero official published reports exist but recent media monitoring exists, show media-monitoring markers clearly labeled:
"Media reported, awaiting official confirmation."

If zero official and zero media-monitoring records exist, show:
"No Hantavirus reports published yet."
and:
"Monitoring official and recent media sources."

PART 3: Make MV Hondius visible tonight

Use the existing source-backed MV Hondius seed or bootstrap logic.

Ensure the following exists in Supabase:
- outbreak: MV Hondius Andes-Hantavirus outbreak
- pathogen: Andes virus
- location: MV Hondius cruise ship
- location precision: approximate
- report with linked WHO/ECDC sources
- update with linked WHO/ECDC sources if available

Publish the MV Hondius outbreak/report/update only if:
- source is WHO or ECDC
- source URL is present
- report has coordinates
- report has verification_status
- last_reviewed_at is set
- editor note says: "Approximate marker, not verified vessel position."

Do not invent exact vessel coordinates.
Use approximate marker only.

If the seed has source-backed counts, display:
- confirmed cases: 5
- deaths: 3
If any field is ambiguous, display Unknown, not 0.

PART 4: Recent media fallback, last 10 days only

If there are no official WHO/ECDC/CDC source candidates for Hantavirus, add a recent media monitoring layer.

Use only Hantavirus / Andes / MV Hondius related media from the last 10 days.

Allowed search queries:
- hantavirus
- hanta virus
- Andes virus
- Andes hantavirus
- MV Hondius hantavirus
- Hondius hantavirus
- hantavirus cruise ship
- Andes virus cruise ship

Hard rules:
- Do not import anything older than 10 days
- Do not import if no reliable published date exists
- Do not import general outbreak topics
- Do not mark media as verified
- Do not count media reports as confirmed cases
- Do not count media deaths as verified deaths
- Do not infer case numbers
- Do not infer transmission
- Do not show media as official

Media markers must show:
- badge: Media reported
- publisher
- source URL
- published date
- last checked
- extracted location if available
- "Awaiting official confirmation"
- "Case counts: Unknown" unless clearly stated and labeled as media-reported

PART 5: Modern signal map, but real

Make the map look like a serious live intelligence map.

Design:
- dark operational map interface
- real interactive Leaflet or Mapbox map
- pulsing marker rings
- verified official markers: restrained red
- probable markers: orange
- media reported markers: amber or grey
- approximate markers: dotted ring or approx badge
- no fake decorative dots
- no fake mock SVG
- no generic AI graphics
- no colorful box shadows
- no emoji
- no em dashes
- no panic language

Map UI must include:
- layer toggle: Official, Media monitoring, All
- legend: Verified, Probable, Media reported, Approximate
- metrics panel:
  Official verified reports
  Media reports last 10 days
  Confirmed cases from official reports only
  Deaths from official reports only
  Last checked
- right-side or bottom-sheet details panel on marker click:
  outbreak name
  pathogen
  location
  precision note
  verification badge
  confirmed cases or Unknown
  deaths or Unknown
  source links
  last reviewed
  view outbreak page

PART 6: Homepage must show real status

Homepage must show:
- real map preview using same data source as /map
- real Hantavirus status cards
- official verified reports count
- media monitoring count
- last checked timestamp
- latest official or media-monitored source items
- if MV Hondius is published, show it visibly

Do not use hardcoded metrics.
Do not use source_candidates as public metrics.

PART 7: Updates page

/updates must show:
- official published updates
- media monitoring updates separately
- all media items clearly labeled "Media reported"
- no older than 10 days in media section
- no fake updates

PART 8: Admin and cron

Keep:
- source_candidates private
- admin protected
- RLS active
- source requirement before publishing
- cron protected by CRON_SECRET

Run ingestion once after deploy:
- official ingestion
- media monitoring ingestion if implemented
- safe promotion if implemented

Do not expose CRON_SECRET.
Do not print secrets.

PART 9: Acceptance tests

Before you say done, verify all of this as a public user:

1. https://hantamapai.vercel.app loads
2. Homepage map preview shows real DB-backed marker or real monitoring empty state
3. https://hantamapai.vercel.app/map shows real interactive map
4. No fake SVG map dots are visible
5. No fake Brazil/US/Chile/Argentina CFR data is visible
6. If MV Hondius is published, marker is visible
7. Marker popup shows source links
8. Media items, if visible, are labeled media reported and are not counted as confirmed
9. No item older than 10 days is visible in media monitoring
10. /admin remains protected
11. source_candidates remain private
12. no fake public data
13. no em dashes
14. no secrets exposed

PART 10: Commands

Run:
npm run lint
npm run build

Commit:
git add .
git commit -m "fix: replace mock map with real hanta data map"

Deploy:
vercel --prod

Return only:
1. Commit hash
2. Production URL
3. Number of real official map markers
4. Number of real media-monitoring markers
5. Whether MV Hondius is visible: yes/no
6. Whether fake SVG/mock map was removed: yes/no
7. Whether homepage uses real Supabase data: yes/no
8. Whether /map uses real Supabase data: yes/no
9. Whether source_candidates are still private: yes/no
10. Any blocker


Number of real official map markers: 1
Number of real media-monitoring markers: X
Fake SVG/mock map removed: yes
/map uses Supabase data: yes

Use Auto Mode for this session. Do not ask me for routine file edits, builds, linting, safe migrations or deploys. Only stop for secrets, destructive database actions, domain changes, RLS disabling, production data deletion or anything that could expose credentials.