# Email: @lanternaero.com

Lantern's email runs on three free services stitched together. Each person reads and
writes Lantern mail in a Gmail inbox, and recipients only ever see `@lanternaero.com`.

Public contact address: **obi@lanternaero.com**

## How it works

```
 Incoming                                         Outgoing
 ────────                                         ────────
 someone@anywhere.com                             Gmail ("Send mail as" name@lanternaero.com)
        │                                                │
        ▼                                                ▼
 MX → Cloudflare Email Routing                   Brevo SMTP relay (smtp-relay.brevo.com:587)
        │  rule: name@lanternaero.com                    │  signs with DKIM for lanternaero.com
        ▼                                                ▼
 Gmail inbox (one per person)                    recipient: SPF ✓ DKIM ✓ DMARC ✓
```

| Job | Service | Why this one |
|---|---|---|
| Receive | Cloudflare Email Routing | Free, and it's where the domain and DNS already live |
| Read and write | Gmail | Free, familiar, works on phone. Each person uses a Gmail dedicated to Lantern |
| Send as `@lanternaero.com` | Brevo SMTP | Free (300 emails/day). Signs mail so it passes SPF, DKIM and DMARC |

Verified Sept 29, 2026: a test email from obi@lanternaero.com arrived in a Gmail
**inbox** (not spam) with **SPF pass, DKIM pass (d=lanternaero.com), DMARC pass**.

## Why not a "real" mailbox provider?

We tried the usual routes first. These are the reasons they didn't fit, so nobody repeats the search:

- **Zoho Mail free:** allows only one domain per organization, and the existing
  Zoho organization's slot was already in use. A paid plan fixes this.
- **Google Workspace / Microsoft 365:** proper mailboxes, but paid per user.
- **Outlook.com free:** can't host a custom domain.
- **Brevo alone:** sends only. It has no inbox, so replies would have nowhere to land.

When the team grows past about 3–5 people, or needs shared calendars and admin controls,
move to a paid provider (Zoho Mail Lite or Google Workspace). That means changing the MX,
SPF and DKIM records to the new provider and turning off Cloudflare Email Routing.

## Adding a teammate

Example: giving a new teammate, Alex, `alex@lanternaero.com`.

**1. Inbox (Alex)**
Create a Gmail account used only for Lantern. It's cleaner than a personal inbox if he ever leaves.

**2. Receiving (admin, Cloudflare)**
1. Email Routing → **Destination addresses** → add Alex's Gmail. Alex clicks the
   verification link Cloudflare sends him.
2. **Routing rules** → **Create routing rule** → `alex` @ lanternaero.com →
   **Send to an email** → his Gmail → Save.

**3. Sending (admin, Brevo)**
1. **Senders** → add `Alex <alex@lanternaero.com>`.
2. **SMTP & API → SMTP** → **Generate a new SMTP key** named after him. One key per
   person, so access can be revoked individually.
3. Send him the SMTP login + his key through the password manager, never by plain email or chat.

**4. Gmail (Alex)**
1. Settings → **Accounts and Import** → **Send mail as** → **Add another email address**.
2. Name + `alex@lanternaero.com`, **uncheck "Treat as an alias"**.
3. SMTP server `smtp-relay.brevo.com`, port **587**, username = Brevo SMTP login,
   password = his SMTP key, **TLS**.
4. Enter the confirmation code (it arrives in the same inbox via step 2).
5. Click **make default** next to the Lantern address.
6. Add a filter: **To:** `@lanternaero.com` → **Never send it to Spam**.

## Removing someone

1. Cloudflare → Routing rules → delete their rule. Incoming mail stops immediately.
2. Brevo → SMTP & API → revoke their SMTP key. Sending stops immediately.
3. Brevo → Senders → remove their sender.

Nobody else is affected.

## Shared addresses

A Cloudflare routing rule forwards to **one** destination. For addresses like
`hello@` or `pilots@`, point the rule at whoever owns that job. The **catch-all** rule
(Routing rules → Catch-all) can forward anything not matched, including typos, to one inbox.
It's currently off, so unmatched mail is dropped.

## Limits

- **300 emails/day**, shared across everyone on the free Brevo plan.
- **Tracking:** Brevo adds an open-tracking pixel and an unsubscribe header by default,
  treating mail like marketing. For one-to-one mail, turn these off in Brevo's
  Transactional settings if available.
- **Everyone's sending runs through one Brevo account.** Keep its login in the
  password manager with two-factor on.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Mail to `@lanternaero.com` never arrives | Routing rule missing/disabled, or destination not verified | Cloudflare → Email Routing → check the rule is **Active** and the destination **Verified** |
| Arrives, but in Spam | New inbox with no history | Mark "Not spam" and add the Gmail filter above |
| Gmail "authentication failed" when adding Send mail as | Wrong username | Username is the **Brevo SMTP login**, not an email address you own |
| Gmail pre-fills `route*.mx.cloudflare.net` as SMTP server | Gmail guessing from MX | Replace with `smtp-relay.brevo.com` |
| Sent mail lands in recipients' spam | SPF/DKIM broken | Check [dns-records.md](dns-records.md); open the message → ⋮ → **Show original** and confirm SPF/DKIM/DMARC say PASS |
| Sending suddenly stops | Hit 300/day, or SMTP key revoked | Check Brevo usage; generate a new key if needed |
| Two SPF records warning | Someone added instead of edited | Merge into one `v=spf1 … ~all` record |
