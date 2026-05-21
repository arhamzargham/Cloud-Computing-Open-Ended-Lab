# Campus Notice Board

A Vite + React + Supabase app for Lab 10A. Visitors can read notices, filter them by category, and see realtime updates. Signed-in users can post notices and delete only their own notices.

## Local setup

Create `.env.local` with:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Install and run:

```bash
npm install
npm run dev
```

## Supabase setup

Run `supabase-setup.sql` in the Supabase SQL Editor. It creates:

- `profiles` and `notices` tables
- required RLS policies
- signup trigger for profile creation
- realtime publication for `notices`

In Supabase Authentication settings, keep email signup enabled and turn email confirmations off for quick lab testing.

## Deployment checklist

- Confirm `.env.local` and `node_modules` are ignored before committing.
- Push at least 3 meaningful commits to the public GitHub repo.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project environment variables.
- Set the Vercel URL as Supabase Auth Site URL and Redirect URL.
