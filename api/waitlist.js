// POST /api/waitlist — adds a signup to the Lantern waitlist.
//
// Each signup becomes a contact on a Brevo list (so the waitlist can be emailed
// later) and triggers a notification email to the team.
//
// Environment variables (set in the Vercel project, never in this repo):
//   BREVO_API_KEY           Brevo API key (v3)
//   BREVO_WAITLIST_LIST_ID  numeric id of the Brevo contact list for the waitlist
//   WAITLIST_NOTIFY_EMAIL   where signup notifications go (optional)
//   WAITLIST_SENDER_EMAIL   verified Brevo sender, e.g. hello@lanternaero.com (optional)

const SEGMENTS = new Set([
  "Campus security",
  "Police department",
  "Construction",
  "Agriculture",
  "Mining",
  "Investor or partner",
  "Other",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function brevo(path, body, key) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: "POST",
    headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo ${path} ${res.status}: ${text.slice(0, 200)}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot: real visitors never see or fill this field.
  if (clean(body.company_site, 200)) return res.status(200).json({ ok: true });

  const email = clean(body.email, 254).toLowerCase();
  const name = clean(body.name, 100);
  const segment = SEGMENTS.has(body.segment) ? body.segment : "Other";

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_WAITLIST_LIST_ID);
  if (!key || !listId) {
    console.error("Waitlist is not configured: missing BREVO_API_KEY or BREVO_WAITLIST_LIST_ID");
    return res.status(503).json({ error: "The waitlist is not open yet. Email obi@lanternaero.com instead." });
  }

  try {
    await brevo("/contacts", {
      email,
      attributes: name ? { FIRSTNAME: name } : {},
      listIds: [listId],
      updateEnabled: true,
    }, key);
  } catch (err) {
    console.error(err.message);
    return res.status(502).json({ error: "Something went wrong. Please try again in a minute." });
  }

  const notify = process.env.WAITLIST_NOTIFY_EMAIL;
  if (notify) {
    try {
      await brevo("/smtp/email", {
        sender: { name: "Lantern website", email: process.env.WAITLIST_SENDER_EMAIL || notify },
        to: [{ email: notify }],
        replyTo: { email },
        subject: `Waitlist: ${name || email} (${segment})`,
        htmlContent:
          `<p>New Lantern waitlist signup.</p><ul>` +
          `<li><b>Name:</b> ${escapeHtml(name || "(not given)")}</li>` +
          `<li><b>Email:</b> ${escapeHtml(email)}</li>` +
          `<li><b>Interest:</b> ${escapeHtml(segment)}</li></ul>`,
      }, key);
    } catch (err) {
      // The signup is already saved; a failed notification shouldn't fail it.
      console.error(err.message);
    }
  }

  return res.status(200).json({ ok: true });
};
