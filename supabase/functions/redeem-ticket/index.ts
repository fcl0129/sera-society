// Server-validated drink ticket redemption.
// Calls public.redeem_ticket() RPC with the caller's auth context so RLS + row-locking apply.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Method = "nfc_tag" | "qr" | "manual" | "device_emulation";

interface Body {
  token: string;
  method: Method;
  station_label?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, code: "unauthorized", message: "Sign in required." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = (await req.json()) as Body;
    if (!body?.token || !body?.method) {
      return new Response(JSON.stringify({ ok: false, code: "invalid_input", message: "token and method are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.rpc("redeem_ticket", {
      _token: body.token,
      _method: body.method,
      _station_label: body.station_label ?? null,
    });

    if (error) {
      console.error("redeem_ticket rpc error", error);
      return new Response(JSON.stringify({ ok: false, code: "rpc_error", message: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return new Response(JSON.stringify({ ok: false, code: "exception", message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
