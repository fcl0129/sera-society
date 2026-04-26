// Sends branded Sera Society emails via Resend (through Lovable connector gateway).
// Templates: magic_link, access_approved, access_rejected, invitation
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

type TemplateName = "magic_link" | "access_approved" | "access_rejected" | "invitation" | "ticket_issued";

interface Payload {
  template: TemplateName;
  to: string;
  data?: Record<string, unknown>;
}

const FROM_EMAIL = Deno.env.get("SERA_FROM_EMAIL") ?? "Sera Society <onboarding@resend.dev>";

const baseStyles = `
  body { margin:0; padding:0; background:#f1ece1; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#1a2332; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 48px 32px; }
  .card { background: #fbf7ee; border: 1px solid #d8cdb6; padding: 40px 32px; }
  .label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #8a8478; margin-bottom: 14px; }
  h1 { font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-weight: 300; font-size: 32px; line-height: 1.2; color: #1a2332; margin: 0 0 18px; }
  h1 em { font-style: italic; }
  p { font-size: 15px; line-height: 1.65; color: #4a4a4a; margin: 0 0 16px; }
  .btn { display:inline-block; padding: 14px 28px; background:#1a2332; color:#fbf7ee !important; text-decoration:none; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; margin-top: 18px; }
  .btn-outline { display:inline-block; padding: 14px 28px; background:transparent; color:#1a2332 !important; text-decoration:none; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; border:1px solid #1a2332; margin-top: 18px; }
  .footer { margin-top: 32px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8a8478; text-align: center; }
  .rule { height:1px; background:#d8cdb6; margin: 24px 0; border:0; }
  .quote { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 17px; color:#7a3a3a; margin-top: 22px; }
`;

const wrap = (inner: string) => `
<!doctype html>
<html><head><meta charset="utf-8"><style>${baseStyles}</style></head>
<body><div class="wrap"><div class="card">${inner}</div>
<p class="footer">Sera Society · Better late than ordinary</p></div></body></html>`;

function render(template: TemplateName, data: Record<string, unknown>): { subject: string; html: string } {
  switch (template) {
    case "magic_link": {
      const url = String(data.action_link ?? "#");
      return {
        subject: "Your Sera Society sign-in link",
        html: wrap(`
          <p class="label">Sign in</p>
          <h1>Step inside,<br><em>your evening awaits.</em></h1>
          <p>Tap the link below to enter Sera Society. It expires in one hour.</p>
          <a class="btn" href="${url}">Sign in to Sera</a>
          <hr class="rule" />
          <p style="font-size:12px;color:#8a8478;">If you didn&rsquo;t request this, you can safely ignore the message.</p>
        `),
      };
    }
    case "access_approved":
      return {
        subject: "Welcome to Sera Society",
        html: wrap(`
          <p class="label">Access granted</p>
          <h1>Welcome to <em>Sera</em>.</h1>
          <p>Your request has been reviewed and approved. You can now sign in and begin curating evenings worthy of remembering.</p>
          <a class="btn" href="${data.app_url ?? "https://sera-society.lovable.app"}/login">Sign in</a>
          <p class="quote">Better late than ordinary.</p>
        `),
      };
    case "access_rejected":
      return {
        subject: "About your Sera Society request",
        html: wrap(`
          <p class="label">Access update</p>
          <h1>Thank you for <em>reaching out.</em></h1>
          <p>We&rsquo;ve carefully reviewed your request to join Sera Society. At this time, we&rsquo;re not able to extend an invitation.</p>
          <p>The standard remains intentionally narrow so the experience stays exceptional. We hope to welcome you in the future.</p>
        `),
      };
    case "invitation": {
      const eventTitle = String(data.event_title ?? "your evening");
      const eventDate = String(data.event_date ?? "");
      const venue = String(data.venue ?? "");
      const appUrl = String(data.app_url ?? "https://sera-society.lovable.app");
      // Prefer a direct RSVP link (with token) when provided. Fall back to /login.
      const rsvpUrl = data.rsvp_url ? String(data.rsvp_url) : `${appUrl}/login`;
      const passUrl = data.pass_url ? String(data.pass_url) : "";
      const hostName = data.host_name ? String(data.host_name) : "Your host";
      return {
        subject: `You're invited: ${eventTitle}`,
        html: wrap(`
          <p class="label">Invitation</p>
          <h1>${eventTitle}</h1>
          ${eventDate ? `<p><strong>${eventDate}</strong></p>` : ""}
          ${venue ? `<p>${venue}</p>` : ""}
          <p>${hostName} has reserved a place for you. Tap below to RSVP &mdash; no account required.</p>
          <a class="btn" href="${rsvpUrl}">RSVP now</a>
          ${passUrl ? `<p style="margin-top:18px;font-size:13px;">After you RSVP, your guest pass lives here:<br><a href="${passUrl}" style="color:#1a2332;">View your pass</a></p>` : ""}
          <hr class="rule" />
          <p style="font-size:12px;color:#8a8478;">If the button doesn&rsquo;t work, copy this link into your browser:<br><span style="word-break:break-all;">${rsvpUrl}</span></p>
        `),
      };
    }
    case "ticket_issued":
      return {
        subject: "Your Sera Society access is ready",
        html: wrap(`
          <p class="label">Tickets issued</p>
          <h1>Your service is <em>ready.</em></h1>
          <p>Your host has issued ${data.ticket_count ?? "your"} drink ticket${(data.ticket_count as number) === 1 ? "" : "s"} for ${data.event_title ?? "your evening"}.</p>
          <a class="btn" href="${data.app_url ?? "https://sera-society.lovable.app"}/ops">Open your evening</a>
        `),
      };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const body = (await req.json()) as Payload;
    if (!body.template || !body.to) {
      return new Response(JSON.stringify({ error: "template and to are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = render(body.template, body.data ?? {});

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [body.to],
        subject,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Resend error", res.status, result);
      return new Response(JSON.stringify({ error: result }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-sera-email error", error);
    const message = error instanceof Error ? error.message : "unknown";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
