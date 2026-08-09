// delete-account Edge Function
//
// Permanently deletes the calling user's account and all of their data.
// Runs with the service role key (never exposed to the browser). The caller
// must present a valid authenticated-user JWT; anon and unauthorized requests
// are rejected before anything is deleted.
//
// Data model note: the only FK is messages.conversation_id -> conversations
// (CASCADE). conversations.user_id has NO FK to auth.users, so deleting the
// auth user does not cascade to their data. We delete the user's conversations
// first (messages follow via CASCADE), then delete the auth user.
//
// Deploy (done 2026-08-08 via Supabase MCP, verify_jwt=true):
//   supabase functions deploy delete-account --no-verify-jwt
// Secrets required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and a project ref.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Browser CORS preflight. The edge runtime does not short-circuit OPTIONS
  // before user code here, so answer the preflight ourselves BEFORE any auth
  // check — a preflight carries no credentials and must not be rejected.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Only accept the request if it carries a valid authenticated-user JWT.
  const authHeader = req.headers.get("Authorization");
  if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing authorization header" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (supabaseUrl === "" || serviceRoleKey === "") {
    return new Response(
      JSON.stringify({ error: "Function misconfigured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // resolve the caller from the bearer token; rejects anon / invalid tokens.
  const { data: { user }, error: userError } = await admin.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (userError != null || user == null) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }

  const uid = user.id;

  // 1. Delete the caller's conversations; messages cascade via the FK.
  const { error: deleteError } = await admin
    .from("conversations")
    .delete()
    .eq("user_id", uid);
  if (deleteError != null) {
    return new Response(
      JSON.stringify({ error: "Failed to delete conversations" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }

  // 2. Delete the auth user.
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(uid);
  if (deleteUserError != null) {
    return new Response(
      JSON.stringify({ error: "Failed to delete account" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
  );
});
