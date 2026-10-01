# Infrastructure

How lanternaero.com is put together: the domain, the website, and email.

> This repo is public. These docs describe the setup without personal
> addresses, account names, logins, or keys. Those live in the team's
> password manager, never in this repo.

## At a glance

| Piece | Service | Notes |
|---|---|---|
| Domain `lanternaero.com` | Cloudflare Registrar | Registered Sept 29, 2026. Auto-renews each year at cost (about $10.46/yr). |
| DNS | Cloudflare | All records listed in [dns-records.md](dns-records.md). |
| Website | Vercel | Static site deployed from this repo's `main` branch. |
| Receiving email | Cloudflare Email Routing | Forwards each `@lanternaero.com` address to a Gmail inbox. |
| Sending email | Brevo (SMTP relay) | Gmail sends *as* `@lanternaero.com` through Brevo. |

Details for email: [email.md](email.md).

## Website

- **Source:** this repository. `index.html` is the whole landing page, with no build step.
- **Hosting:** Vercel project `lantern`, connected to GitHub. Every push to `main`
  deploys to production within about 10 seconds.
- **Domains on the Vercel project:**
  - `lanternaero.com`: the primary domain
  - `www.lanternaero.com`: redirects (308) to `lanternaero.com`
- **SSL:** issued and renewed automatically by Vercel.
- **Cloudflare proxy is off** ("DNS only", grey cloud) for the website records. Vercel already
  provides a CDN, DDoS protection and SSL; putting Cloudflare's proxy in front
  duplicates that and can break Vercel's certificate renewals. Don't turn it on.

### Changing the site

1. Edit `index.html` (or files in `assets/`).
2. Push to `main`, and Vercel deploys automatically.
3. Check https://lanternaero.com.

### Waitlist

The "Join the waitlist" form (`#waitlist` in `index.html`) posts to `api/waitlist.js`, a
Vercel serverless function. Each signup is added as a contact to a Brevo list (so the
waitlist can be emailed later) and, if configured, sends the team a notification email.
A hidden honeypot field drops most bot submissions.

Set these in the Vercel project's environment variables (never in this repo):

| Variable | What it is |
|---|---|
| `BREVO_API_KEY` | Brevo API key (v3). Brevo → SMTP & API → API keys |
| `BREVO_WAITLIST_LIST_ID` | Numeric id of the "Waitlist" list in Brevo → Contacts → Lists |
| `WAITLIST_NOTIFY_EMAIL` | Optional. Where signup notifications go |
| `WAITLIST_SENDER_EMAIL` | Optional. Verified Brevo sender for those notifications |

Without the first two, the form shows a message pointing people to email instead.

### Hero video

`assets/lantern-hero.mp4` is a 12-second rendered loop of the Lantern system: a camera
station flags activity, the dock opens, the drone investigates and returns.
`assets/lantern-hero-poster.jpg` is a still from the same render. It shows while the video loads.

The scene lives in `tools/hero-render.html` (three.js). To re-render:

1. Serve the repo locally, e.g. `python3 -m http.server`, and open `tools/hero-render.html`.
2. The page exposes `renderAt(seconds)`. Step it at 30 fps for 12 s, screenshot each
   frame (e.g. with Playwright at 1600×900).
3. Encode:
   ```
   ffmpeg -framerate 30 -i f%04d.png -c:v libx264 -preset slow -crf 24 \
     -pix_fmt yuv420p -movflags +faststart -an assets/lantern-hero.mp4
   ```

This is a concept render. Replace it with real footage once the product drone and dock fly.

## Renewals and ownership

| Item | Renews | Owner |
|---|---|---|
| `lanternaero.com` | Sept 2027, auto-renew on | Founder's Cloudflare account |
| Vercel project | Free (Hobby) | Founder's Vercel account |
| Brevo | Free plan | Founder's Brevo account |

If a renewal payment fails, the domain can lapse and be taken by someone else. Keep
the card on the Cloudflare account current.
