import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_ITERATIONS = 5;
const AIML_API_URL = "https://api.aimlapi.com/v1/chat/completions";
const BRIGHTDATA_API_URL = "https://api.brightdata.com/request";
const DEFAULT_MODEL = "openai/gpt-5.6-luna";
const SERP_ZONE = "serp_api1";
const UNLOCKER_ZONE = "web_unlocker1";

const SYSTEM_PROMPT = `You are a thorough web research assistant. Your job is to answer the user's question by searching the web and reading relevant pages.

Follow this process:
1. Break the question down into 2-3 targeted Google searches using the search_web tool.
2. Review the search results and identify the most promising pages.
3. Use fetch_page on those URLs to read the actual content.
4. Synthesize your findings into a clear, well-organized answer.
5. Always end your final answer with a "Sources" section listing the URLs you used, with a brief label for each.

Rules:
- Never guess or fabricate information. If you cannot find an answer, say so honestly.
- Prefer authoritative sources (official docs, reputable publications, research papers).
- Keep your final answer concise but comprehensive.
- When citing statistics or claims, mention which source they came from.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_web",
      description:
        "Search Google and return the raw results page. Use this to find relevant pages for a query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The Google search query",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_page",
      description:
        "Fetch the content of a specific web page by URL. Use this to read a page found via search_web.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description:
              "The full URL of the page to fetch (e.g. https://example.com/article)",
          },
        },
        required: ["url"],
      },
    },
  },
];

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface ResearchRequest {
  query: string;
  context?: string;
  model?: string;
}

interface ResearchResponse {
  answer: string;
  sources: { title: string; url: string }[];
  iterations: number;
}

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

  const aimlKey = Deno.env.get("AIML_API_KEY");
  const brightdataKey = Deno.env.get("BRIGHTDATA_API_KEY");

  if (!aimlKey) {
    return new Response(
      JSON.stringify({ error: "AI/ML API key not configured" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  if (!brightdataKey) {
    return new Response(
      JSON.stringify({ error: "Bright Data API key not configured" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  let body: ResearchRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!body.query || typeof body.query !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'query' field" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const result = await runAgentLoop(
      aimlKey,
      brightdataKey,
      body.query,
      body.context,
      body.model,
    );
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Research agent error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

async function runAgentLoop(
  aimlKey: string,
  brightdataKey: string,
  query: string,
  context?: string,
  model?: string,
): Promise<ResearchResponse> {
  const activeModel = model || DEFAULT_MODEL;
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  let userMessage = query;
  if (context) {
    userMessage = `Context (previous conversation summary): ${context}\n\nQuestion: ${query}`;
  }
  messages.push({ role: "user", content: userMessage });

  const fetchedUrls: Set<string> = new Set();

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await fetch(AIML_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aimlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: activeModel,
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI/ML API error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error("AI/ML API returned empty response");
    }

    const finishReason = choice.finish_reason;
    const assistantMsg = choice.message;

    if (finishReason === "stop") {
      const answer = assistantMsg.content || "";
      return {
        answer,
        sources: extractSources(answer, fetchedUrls),
        iterations: i + 1,
      };
    }

    if (finishReason === "tool_calls" || assistantMsg.tool_calls) {
      const toolCalls: ToolCall[] = assistantMsg.tool_calls || [];

      messages.push({
        role: "assistant",
        content: assistantMsg.content || "",
        tool_calls: toolCalls,
      });

      for (const tc of toolCalls) {
        const funcName = tc.function.name;
        const funcArgs = JSON.parse(tc.function.arguments || "{}");

        let toolResult: string;
        try {
          if (funcName === "search_web") {
            toolResult = await searchWeb(brightdataKey, funcArgs.query);
          } else if (funcName === "fetch_page") {
            fetchedUrls.add(funcArgs.url);
            toolResult = await fetchPage(brightdataKey, funcArgs.url);
          } else {
            toolResult = `Error: Unknown function "${funcName}"`;
          }
        } catch (err) {
          toolResult = `Error executing ${funcName}: ${err instanceof Error ? err.message : "unknown error"}`;
        }

        const truncated = toolResult.length > 8000
          ? toolResult.slice(0, 8000) + "\n\n[Content truncated...]"
          : toolResult;

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: truncated,
        });
      }

      continue;
    }

    return {
      answer: assistantMsg.content || "I couldn't complete the research.",
      sources: extractSources(assistantMsg.content || "", fetchedUrls),
      iterations: i + 1,
    };
  }

  messages.push({
    role: "user",
    content:
      "Please provide your best answer now based on the information gathered so far. Include a Sources section.",
  });

  const finalResp = await fetch(AIML_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aimlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: activeModel,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (finalResp.ok) {
    const finalData = await finalResp.json();
    const answer = finalData.choices?.[0]?.message?.content || "";
    return { answer, sources: extractSources(answer, fetchedUrls), iterations: MAX_ITERATIONS };
  }

  return {
    answer: "I gathered information but was unable to synthesize a final answer.",
    sources: [...fetchedUrls].map((url) => ({ title: url, url })),
    iterations: MAX_ITERATIONS,
  };
}

async function searchWeb(apiKey: string, query: string): Promise<string> {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.google.com/search?q=${encodedQuery}`;

  const response = await fetch(BRIGHTDATA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      zone: SERP_ZONE,
      url,
      format: "raw",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Bright Data SERP error (${response.status}): ${errText.slice(0, 200)}`);
  }

  return await response.text();
}

async function fetchPage(apiKey: string, url: string): Promise<string> {
  const response = await fetch(BRIGHTDATA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      zone: UNLOCKER_ZONE,
      url,
      format: "raw",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Bright Data Unlocker error (${response.status}): ${errText.slice(0, 200)}`);
  }

  return await response.text();
}

function extractSources(
  answer: string,
  fetchedUrls: Set<string>,
): { title: string; url: string }[] {
  const urlRegex = /https?:\/\/[^\s)\]]+/g;
  const foundUrls = new Set<string>();
  let match;
  while ((match = urlRegex.exec(answer)) !== null) {
    foundUrls.add(match[0]);
  }

  for (const url of fetchedUrls) {
    foundUrls.add(url);
  }

  return [...foundUrls].map((url) => ({
    title: url.replace(/^https?:\/\//, "").split("/")[0] || url,
    url,
  }));
}
