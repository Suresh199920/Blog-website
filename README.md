# Blog Website

A blog with a photo gallery, a YouTube video library and an admin panel for
publishing. Built with Next.js 16 (App Router), TypeScript and Tailwind CSS v4.
Supabase provides Postgres, authentication and image storage.

## Features

**Public**

- Home page with featured and recent posts
- Blog index with search, category and tag filters, plus pagination
- Post pages rendered from sanitised Markdown, with related posts
- Photo gallery with albums and a keyboard-navigable lightbox
- Video library with a playlist player; paste any YouTube link
- About and Contact pages, with a working contact form
- Dynamic sitemap and robots.txt, per-page metadata

**Admin** (everything under `/admin`)

- Sign in with email and password, restricted to the `admin` role
- Posts: create, edit, publish, feature, upload cover images
- Photos: upload to Supabase Storage, organise into albums, edit captions
- Videos: add by pasting a YouTube link, edit or remove
- Messages: read and reply to contact form submissions
- Settings: site title, tagline, meta description, about text, contact email

## Requirements

- Node.js 20.9 or newer
- A Supabase project (free tier is enough to start)

## Getting started

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with the values from your Supabase project, under
**Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then run the migration and start the dev server:

```bash
# In the Supabase SQL editor, paste and run:
supabase/migrations/001_initial_schema.sql

npm run dev
```

Open http://localhost:3000. Without Supabase keys the site still renders and
shows setup guidance instead of content.

## Making yourself admin

The migration creates a profile row for every new user with the role `editor`,
which is read-only by design. To promote your own account:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

Sign out, sign in again, and the admin area unlocks at `/admin`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |

> On Windows PowerShell, use `npm.cmd` instead of `npm`, which is blocked by
> the default execution policy.

## Project layout

```
src/
  app/
    (public pages)    home, blog, gallery, videos, about, contact
    admin/            dashboard, posts, photos, videos, messages, settings
    api/contact/      contact form endpoint
    sitemap.ts        generated from published posts
    robots.ts
  components/         ui primitives, layout, blog, gallery, video
  lib/                supabase clients, queries, storage, markdown, youtube
  proxy.ts            refreshes auth cookies for /admin
  types/database.ts   generated Supabase types
supabase/migrations/  schema, RLS policies and storage buckets
```

## Notes on security

Every server action re-checks `requireAdmin()` itself. `proxy.ts` only
improves navigation UX for browser requests — server actions POST directly and
never pass through it, so treating the proxy as the only gate would leave the
admin area open.

Content is sanitised with `sanitize-html` before rendering, and images are
restricted by MIME type and a 10 MB size cap. The admin area is excluded from
indexing via `robots.txt` and `noindex` metadata.

## Deploying

Set the same three environment variables in your host's dashboard, then deploy.
On Vercel this works with no changes: `next build` on push.