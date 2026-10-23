# Tolu's birthday list

Public gift list. "I'll get this" claims are stored in a Vercel Blob store, so guests need no account.

## Deploy (about 5 minutes)
1. Install the CLI: `npm i -g vercel`, then `vercel login`.
2. In this folder run `vercel` and accept the defaults (creates the project).
3. Vercel dashboard → the project → Storage → Create → Blob → connect it to this project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. Run `vercel --prod`.

Share the production URL with guests. Open `<url>/#tolu` yourself: it hides what's been claimed so you're still surprised (with a "Show what's taken" toggle).
