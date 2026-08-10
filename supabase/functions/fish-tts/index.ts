import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const fishKey = Deno.env.get("FISH_AUDIO_API_KEY");
  if (!fishKey) {
    return new Response(
      JSON.stringify({ error: "Fish Audio key not configured" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  let body: { text: string; reference_id?: string; model?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!body.text || typeof body.text !== "string") {
    return new Response(JSON.stringify({ error: "Missing text" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const selectedModel = body.model ?? "s2.1-pro-free";

  const response = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${fishKey}`,
      "Content-Type": "application/json",
      "model": selectedModel,
    },
    body: JSON.stringify({
      text: body.text.slice(0, 500),
      reference_id: body.reference_id ?? undefined,
      model: selectedModel,
      format: "mp3",
      latency: "balanced",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return new Response(
      JSON.stringify({ error: `Fish Audio error (${response.status}): ${errText.slice(0, 200)}` }),
      { status: response.status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const audioBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
  return new Response(
    JSON.stringify({ audio: base64 }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
  );
});
