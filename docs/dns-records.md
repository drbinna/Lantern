# DNS records: lanternaero.com

Managed in **Cloudflare → lanternaero.com → DNS → Records**. All records are
**DNS only** (grey cloud). DNS is public by nature, so nothing here is secret.

Last checked: Sept 29, 2026.

## Website

| Type | Name | Value | Purpose |
|---|---|---|---|
| A | `@` | `76.76.21.21` | Points the root domain at Vercel |
| CNAME | `www` | `cname.vercel-dns.com` | Points `www` at Vercel (which redirects to the root) |

## Email: receiving (Cloudflare Email Routing)

| Type | Name | Value | Purpose |
|---|---|---|---|
| MX | `@` | `route1.mx.cloudflare.net` (68) | Incoming mail goes to Cloudflare |
| MX | `@` | `route2.mx.cloudflare.net` (39) | 〃 |
| MX | `@` | `route3.mx.cloudflare.net` (92) | 〃 |
| TXT | `cf2024-1._domainkey` | `v=DKIM1; h=sha256; k=rsa; p=…` | Cloudflare's signing key for forwarded mail |

The MX and Cloudflare DKIM records are **locked** by Email Routing. Cloudflare adds
and manages them, and they can't be edited while routing is enabled.

## Email: sending (Brevo)

| Type | Name | Value | Purpose |
|---|---|---|---|
| TXT | `@` | `brevo-code:…` | Proves to Brevo that we own the domain |
| CNAME | `brevo1._domainkey` | `b1.lanternaero-com.dkim.brevo.com` | DKIM signing key #1 |
| CNAME | `brevo2._domainkey` | `b2.lanternaero-com.dkim.brevo.com` | DKIM signing key #2 |
| CNAME | `img` | `lanternaero-com.img.brand.brevosend.com` | Brevo branded images (marketing only) |
| CNAME | `r` | `lanternaero-com.r.brand.brevosend.com` | Brevo branded tracking links (marketing only) |

## Email: authentication

| Type | Name | Value | Purpose |
|---|---|---|---|
| TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com ~all` | SPF: which servers may send as `@lanternaero.com` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` | DMARC policy + reports to Brevo |

### Rules for editing

- **Only one SPF record.** There must be exactly one TXT record on `@` starting with
  `v=spf1`. If you add a new sending service, *edit* this record and add another
  `include:`. Two SPF records make both invalid and mail will start failing.
- **Don't proxy mail records.** MX and DKIM records must stay DNS only.
- **DMARC is `p=none`** (monitor only). Once reports show all legitimate mail passing
  for a few weeks, it can be tightened to `p=quarantine`.

## Checking records from a terminal

```
dig +short MX lanternaero.com
dig +short TXT lanternaero.com
dig +short TXT _dmarc.lanternaero.com
```

Or in a browser: `https://dns.google/resolve?name=lanternaero.com&type=TXT`
