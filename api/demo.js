// POST /api/demo — handles "Request a demo" submissions from the landing page.
//
// Each request becomes a contact on a Brevo list (so leads can be emailed later)
// and sends the team a notification with everything they filled in. Replying to
// that notification replies straight to the person who asked.
//
// Environment variables (set in the Vercel project, never in this repo):
//   BREVO_API_KEY         Brevo API key (v3)
//   BREVO_DEMO_LIST_ID    numeric id of the Brevo "Demo requests" list
//   DEMO_NOTIFY_EMAIL     where requests are sent
//   DEMO_SENDER_EMAIL     verified Brevo sender for the notification (optional)

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

  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const organization = clean(body.organization, 150);
  const role = clean(body.role, 100);
  const message = clean(body.message, 2000);
  const segment = SEGMENTS.has(body.segment) ? body.segment : "Other";

  if (!name) return res.status(400).json({ error: "Please enter your name." });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (!organization) return res.status(400).json({ error: "Please enter your organization." });

  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_DEMO_LIST_ID);
  const notify = process.env.DEMO_NOTIFY_EMAIL;
  if (!key || !listId || !notify) {
    console.error("Demo requests are not configured: missing BREVO_API_KEY, BREVO_DEMO_LIST_ID or DEMO_NOTIFY_EMAIL");
    return res.status(503).json({ error: "Requests aren't open yet. Email obi@lanternaero.com instead." });
  }

  // The notification is the part that matters most, so it goes first.
  const rows = [
    ["Name", name],
    ["Email", email],
    ["Organization", organization],
    ["Role", role || "(not given)"],
    ["Site type", segment],
  ];
  try {
    await brevo("/smtp/email", {
      sender: { name: "Lantern website", email: process.env.DEMO_SENDER_EMAIL || notify },
      to: [{ email: notify }],
      replyTo: { email, name },
      subject: `Demo request: ${organization} (${segment})`,
      htmlContent:
        `<p><b>New demo request from lanternaero.com.</b> Reply to this email to respond to ${escapeHtml(name)} directly.</p>` +
        `<table cellpadding="6" style="border-collapse:collapse">` +
        rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`).join("") +
        `</table>` +
        (message ? `<p><b>What they'd like to see:</b></p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>` : ""),
    }, key);
  } catch (err) {
    console.error(err.message);
    return res.status(502).json({ error: "Something went wrong. Please try again, or email obi@lanternaero.com." });
  }

  try {
    await brevo("/contacts", {
      email,
      attributes: { FIRSTNAME: name },
      listIds: [listId],
      updateEnabled: true,
    }, key);
  } catch (err) {
    // The team already has the request by email; a failed list add shouldn't fail it.
    console.error(err.message);
  }

  return res.status(200).json({ ok: true });
};
