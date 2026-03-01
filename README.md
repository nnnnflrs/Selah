# Bulong

A global anonymous audio-sharing platform. Record your feelings, pin them to the map, and listen to the world.

Built with Next.js 14, Supabase, Mapbox GL JS, Zustand, and TailwindCSS.

## Features

- **Anonymous audio recording** — record voice messages directly in the browser
- **Interactive 3D globe** — recordings appear as glowing markers on a Mapbox globe
- **Emotion tagging** — tag recordings with emotions (happy, sad, anxious, grateful, frustrated, sleepless, hopeful, nostalgic)
- **Location autocomplete** — search for places via Mapbox Geocoding API or use GPS
- **Comments** — leave anonymous comments on recordings with real-time updates
- **Date filtering** — filter the map to show recordings from a specific day
- **Random listen** — discover recordings randomly from anywhere in the world
- **Reporting & moderation** — report inappropriate content, auto-hide after threshold
- **Rate limiting** — 1 recording per hour per device

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL + Storage + Auth) |
| Map | Mapbox GL JS via react-map-gl |
| State | Zustand |
| Styling | TailwindCSS |
| Validation | Zod |
| Toasts | Sileo |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- A [Supabase](https://supabase.com/) project
- A [Mapbox](https://www.mapbox.com/) account with a public token

### 1. Clone the repo

```bash
git clone https://github.com/nnnnflrs/Bulong.git
cd Bulong
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-public-token
NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/your-username/your-style-id
DISABLE_RATE_LIMIT=false
```

### 4. Set up the database

Run the SQL migrations in order in your Supabase SQL Editor:

```
supabase/migrations/00001_create_schema.sql
supabase/migrations/00002_daily_rate_limit.sql
supabase/migrations/00003_device_id_auth.sql
supabase/migrations/00004_hourly_rate_limit.sql
supabase/migrations/00005_fix_rls_policies.sql
supabase/migrations/00006_comment_rate_limit.sql
```

Also create a **public** storage bucket called `recordings` in Supabase Storage.

### 5. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/recordings/     # REST API for recordings, comments, reports
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main map page
├── components/
│   ├── comments/           # CommentForm, CommentItem, CommentsList
│   ├── layout/             # Header, DatePicker, FAB, RandomListenButton
│   ├── map/                # MapView (globe), MapControls, dynamic loader
│   ├── modals/             # UploadModal, RecordingModal, ConfirmDialog
│   ├── recording/          # AudioPlayer, EmotionSelector, LocationAutocomplete, Waveform
│   └── ui/                 # Button, Input, Textarea, Modal, Badge, Spinner, IconButton
├── hooks/                  # Custom React hooks (media recorder, geolocation, comments, etc.)
├── lib/
│   ├── constants.ts        # App-wide constants (emotions, limits, map defaults)
│   ├── supabase/           # Supabase client configs (admin, client, server, middleware)
│   ├── utils/              # Utility functions (audio, fingerprint, names, sanitize, time)
│   └── validators.ts       # Zod schemas for API validation
├── providers/              # React context providers
├── stores/                 # Zustand stores (map, recordings, recorder, auth)
└── types/                  # TypeScript type definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun run lint` | Run ESLint |

## License

MIT
