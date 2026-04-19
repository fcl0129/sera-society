// Approve/reject access requests. Uses service role to set the user's role
// once they've signed up, and sends the approval/rejection email.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  request_id: string;
  decision: "approved" | "rejected";
  assign_role?: "organizer" | "bartender" | "guest";
  admin_notes?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is an authenticated admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: callerProfile } = await admin
      .from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
    if (!callerProfile || (callerProfile.role !== "admin" && callerProfile.role !== "host_admin")) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body.request_id || !body.decision) {
      return new Response(JSON.stringify({ error: "request_id and decision are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load the request
    const { data: request, error: reqErr } = await admin
      .from("access_requests").select("*").eq("id", body.request_id).maybeSingle();
    if (reqErr || !request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update status
    const { error: updateErr } = await admin
      .from("access_requests")
      .update({
        status: body.decision,
        admin_notes: body.admin_notes ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData.user.id,
      })
      .eq("id", body.request_id);
    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let invitedUserId: string | null = null;

    if (body.decision === "approved") {
      const targetRole = body.assign_role ?? "organizer";
      const requestEmail = String(request.email).toLowerCase();

      // Try to find an existing auth user; if none, invite by email
      const { data: existing } = await admin
        .from("profiles").select("id").eq("email", requestEmail).maybeSingle();

      if (existing?.id) {
        invitedUserId = existing.id;
        await admin.from("profiles").update({ role: targetRole }).eq("id", existing.id);
      } else {
        // Send invite via Supabase Auth
        const { data: invited, error: inviteErr } =
          await admin.auth.admin.inviteUserByEmail(requestEmail, {
            data: { full_name: request.name },
          });
        if (inviteErr) {
          // Don't fail hard — request is approved; admin can resolve manually
          console.error("invite error", inviteErr);
        } else if (invited?.user?.id) {
          invitedUserId = invited.user.id;
          // Profile is created by trigger; ensure role is set
          await admin.from("profiles")
            .upsert({ id: invited.user.id, email: requestEmail, role: targetRole, full_name: request.name },
              { onConflict: "id" });
        }
      }
    }

    // Best-effort approval/rejection email via existing send-sera-email
    try {
      const template = body.decision === "approved" ? "access_approved" : "access_rejected";
      await fetch(`${SUPABASE_URL}/functions/v1/send-sera-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
        body: JSON.stringify({
          template,
          to: request.email,
          data: { app_url: Deno.env.get("SERA_APP_URL") ?? "https://sera-society.lovable.app" },
        }),
      });
    } catch (e) { console.error("email send failed", e); }

    return new Response(JSON.stringify({ ok: true, invited_user_id: invitedUserId }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    console.error("review-access-request", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
