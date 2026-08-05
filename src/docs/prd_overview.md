# DevVoice – Voice-Powered Developer Research Assistant

## Description

DevVoice is a voice-first developer research tool. A developer speaks a technical question aloud, the app transcribes it in real time, researches the answer across the open web, and displays a synthesized answer with citations — all without touching the keyboard. The app persists conversation history so users can follow up with context-aware questions.

Built for the native.builder hackathon, targeting developers working across any programming language, framework, or tool.

## Goals

- **Hands-free Q&A** — Developers can ask technical questions by speaking, with real-time transcription feedback.
- **Intelligent research** — The app autonomously decides what to search for, where to look, and how to synthesize an answer from scraped sources.
- **Persistent context** — Conversation history is saved so follow-up questions build on prior context.
- **Trust through transparency** — Answers include citations linking back to source pages.

## User Stories

- As a developer with my hands on the keyboard, I want to ask a question by voice so I can stay in flow without switching contexts.
- As a developer researching a bug, I want to ask follow-up questions that reference earlier answers so I can dig deeper iteratively.
- As a developer evaluating an answer, I want to see which sources the answer drew from so I can verify accuracy.

## User Flows

### Happy Path: Ask a question and get an answer

1. User opens the app and signs in (or signs up).
2. User sees their conversation history (empty if new user) and selects or starts a new conversation.
3. User taps the **Record** button and speaks their question (e.g., "How do I deploy a Next.js app to AWS Lambda?").
4. Real-time partial transcription appears on screen as the user speaks.
5. User taps **Stop** when done speaking.
6. The final transcript appears as a user message.
7. The app shows a "Researching…" loading state.
8. After research completes, the synthesized answer appears with source citations.
9. The conversation is saved and appears in the sidebar.

### Alternate Flows

- **Follow-up question**: User records a follow-up in the same conversation. The AI has full context from prior messages and can refine or drill deeper.
- **No results**: If research finds nothing useful, the app displays a "No relevant sources found" message and suggests rephrasing.
- **Transcription error recovery**: User can edit the transcribed text before it's submitted if the ASR misheard something.
- **Unauthenticated user**: Redirected to sign-in/sign-up before accessing the app.

## Design & UX

- **Single-page layout**: Conversation sidebar (left) + main chat area (center).
- **Record button**: Large, prominent microphone button in the chat input area. Red pulsing while recording, with real-time transcription text streaming above it.
- **Message bubbles**: User messages on the right, assistant (research) responses on the left with source links.
- **Loading state**: Assistant bubble shows animated "Researching…" with a pulsing indicator while research is in progress.
- **Conversation list**: Sidebar shows conversation titles (auto-generated from first question) with timestamps.
- **Transcription edit**: Before submission, the transcribed text appears in an editable text area so users can correct ASR errors.

## Integrations

### Speechmatics (Real-time Speech-to-Text)

- **Purpose**: Real-time microphone transcription via WebSocket.
- **Credentials**:
  - `SPEECHMATICS_API_KEY` — **SECRET** (stored in Supabase Secret Manager, read only inside the `speechmatics-token` Edge Function).
- **Where code runs**:
  - `speechmatics-token` Edge Function: **server-side only** — mints short-lived JWTs using the secret API key.
  - Client: **browser-side** — calls the Edge Function for a token, then opens a WebSocket directly to Speechmatics.
- **Transport**: WebSocket (`wss://eu.rt.speechmatics.com/v2?jwt=<token>`).
- **Protocol**: Edge Function mints a 60-second TTL JWT via `POST https://mp.speechmatics.com/v1/api_keys?type=rt`. The client uses the JWT to open the WebSocket. Real-time `AddPartialTranscript` and `AddTranscript` messages are rendered as the user speaks.
- **Constraints**: The `SPEECHMATICS_API_KEY` is never sent to the browser — only a short-lived JWT derived from it reaches the client.

### Bright Data (Web Research — SERP + Scraping)

- **Purpose**: Search the web and scrape target pages to gather research sources for the LLM.
- **Credentials**:
  - `BRIGHTDATA_API_KEY` — **SECRET** (stored in Supabase Secret Manager, read only inside the `research` Edge Function).
- **Where code runs**: All Bright Data calls happen inside the `research` Edge Function — **server-side only**. The API key never reaches the browser.
- **Transport**: REST (`POST https://api.brightdata.com/request`).
- **APIs used**:
  - **SERP**: `zone: "serp_api1"`, `url: "https://www.google.com/search?q=<query>"`, `format: "json"`.
  - **Web Unlocker**: `zone: "web_unlocker1"`, `url: "<page_url>"`, `format: "raw"` — returns page HTML.
- **Auth**: `Authorization: Bearer <BRIGHTDATA_API_KEY>` header on every request.
- **Constraints**: The `BRIGHTDATA_API_KEY` is never sent to the browser.

### AI/ML API (Research Orchestration & Answer Synthesis)

- **Purpose**: The LLM acts as an agent with tools — it analyzes the user's question, decides what to search, calls tools (backed by Bright Data), and synthesizes a final answer with citations.
- **Credentials**:
  - `AIML_API_KEY` — **SECRET** (stored in Supabase Secret Manager, read only inside the `research` Edge Function).
- **Where code runs**: Entirely inside the `research` Edge Function — **server-side only**. The API key never reaches the browser.
- **Transport**: REST — `POST https://api.aimlapi.com/v1/chat/completions`.
- **Auth**: `Authorization: Bearer <AIML_API_KEY>` header.
- **Tool calling**: The Edge Function defines two tools for the model — `search_web(query)` and `scrape_page(url)`. Internally these call Bright Data SERP and Web Unlocker respectively. The Edge Function runs a tool-calling loop: send the conversation to the LLM → LLM requests tool calls → Edge Function executes them and returns results → LLM either calls more tools or produces a final answer.
- **Model**: Recommend a model that supports tool calling (the API is OpenAI-compatible, so models like GPT-4o, Claude Sonnet, or Meta Llama 4 via AI/ML API will work). Model selection is specified in the request body: `"model": "<model-id>"`.
- **Constraints**: The `AIML_API_KEY` is never sent to the browser. The tool-calling loop must have a budget cap (max 3 search + 5 scrape tool calls per question) to prevent runaway usage.

### Supabase (Auth, Database, Secrets)

- **Purpose**: User authentication, conversation/message persistence, Edge Function hosting, secret storage.
- **Credentials**: Supabase project URL and publishable (anon) key — **PUBLISHABLE** (used in client code). Service role key is never referenced on the client.
- **Tables**: `conversations`, `messages` (see Implementation Notes).
- **Auth**: Supabase Auth with email/password. Auth redirect URLs must include preview environment wildcards (`https://*.nativelyai.app/**`, `https://**.webcontainer-api.io/**`).

## Acceptance Criteria

1. User can sign up, sign in, and sign out via Supabase Auth.
2. User can start a recording, see real-time partial transcription, and stop recording to finalize.
3. Final transcript is displayed as a user message in the conversation.
4. The app researches the question and displays a synthesized answer with source links.
5. Conversations persist across page refreshes and sessions.
6. User can view past conversations and continue them with follow-up questions.
7. Follow-up questions retain context from the full conversation history.
8. No secrets (Speechmatics, Bright Data, or AI/ML API keys) are ever exposed to the browser.

## Out of Scope

- Text-to-speech (TTS) — answers are displayed as text only.
- Mobile app — web-only React app.
- Voice activity detection (auto-stop) — user manually stops recording.
- Multi-language support — English only for MVP.
- Pre-configured source lists — the AI decides sources dynamically via tool calling.
- Streaming the answer (token-by-token) — the full answer appears when research completes.

## Open Questions

1. **AI/ML API model selection**: Which specific model to use? Needs to support tool calling. AI/ML API has many models — recommend picking one that balances quality with the $10 coupon budget (e.g., a GPT-4o or Claude-equivalent model).

2. **How many search/scrape iterations?** The LLM agent loop needs a budget to avoid runaway costs. Suggested default: max 3 search + 5 scrape tool calls per question. Confirm this is acceptable.

3. **Conversation title generation**: Auto-generate from the first question (e.g., "How do I deploy Next.js to…") or manual? Recommended: auto-generate with an inline edit option.

## Implementation Notes

### Database Schema

```sql
-- conversations: one per user session/thread
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz DEFAULT now()
);

-- messages: each question/answer pair
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('user', 'assistant')) NOT NULL,
  content text NOT NULL,
  sources jsonb DEFAULT '[]', -- array of {url, title, snippet} for assistant messages
  created_at timestamptz DEFAULT now()
);
```

### RLS Policies
- `conversations`: `user_id = auth.uid()` for SELECT, INSERT, UPDATE, DELETE.
- `messages`: user can only read/write messages whose `conversation_id` belongs to a conversation they own.

### Edge Functions

1. **`speechmatics-token`**
   - `GET` — returns `{ token: "<jwt>" }`.
   - Requires authenticated user (JWT verification enabled).
   - CORS-enabled: responds to `OPTIONS` with appropriate headers.

2. **`research`**
   - `POST { question: string, conversationId: string, history: Array<{role, content}> }`
   - Runs the AI/ML API tool-calling loop with Bright Data-backed tools.
   - Inserts the assistant message (with sources) into the `messages` table.
   - Returns `{ answer: string, sources: Array<{url, title, snippet}> }`.
   - Requires authenticated user.
   - CORS-enabled.
   - Budget cap: max 8 tool calls total per invocation.

### Frontend Component Tree (Suggested)

```
App
├── AuthProvider (Supabase session context)
├── AuthenticatedApp
│   ├── ConversationSidebar
│   │   ├── NewConversationButton
│   │   └── ConversationList (scrollable)
│   └── ConversationView
│       ├── MessageList
│       │   ├── UserMessage
│       │   └── AssistantMessage (with source links)
│       └── VoiceInput
│           ├── RecordButton
│           ├── TranscriptionPreview
│           └── EditTextArea
└── AuthScreen (sign in / sign up)
```

### Dependencies
- `@supabase/supabase-js` — Supabase client (auth + data)
- React Router (or equivalent) for routing auth vs app views
- No additional npm packages needed for Speechmatics, Bright Data, or AI/ML API — all called via `fetch` in Edge Functions or the browser.
