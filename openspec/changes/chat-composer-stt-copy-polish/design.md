## Context

The composer bar is a compact `flex` row (44px) with ModelSelector, textarea, and the mic trigger. Previously `VoiceInput` mounted the live preview and the post-STT editor wherever its trigger was placed, i.e. inside that row, so the 3-row textarea and buttons stretched the bar and misaligned the footer. The assistant copy button previously lived in a full-width trailing row, and user messages mixed with the left-aligned assistant side.

## Goals / Non-Goals

**Goals:**
- Keep the composer row fixed at 44px regardless of STT state.
- Render STT preview/editor as their own card above the composer row inside the footer.
- Provide a dedicated close affordance that fully dismisses STT back to idle and cleans up the mic.
- Position the assistant copy button flush to the bubble's bottom-right.
- Mirror user messages to the right.

**Non-Goals:**
- Changing Speechmatics/`useSpeechmatics` audio behavior.
- Streaming token-by-token rendering.
- Backend or auth changes.

## Decisions

- **State ownership: `useVoiceComposer` hook (chosen over state in `VoiceInput`).** react.dev guidance ("lifting state up", "sharing state between components") supports reporting state upward when the parent must decide the layout. `ConversationView` is the single place that knows whether to render the compact row or the editor/preview blocks, so it owns the hook; `VoiceInput` becomes a presentational mic + language trigger receiving props.
- **Editor/preview rendered above the composer row, inside the footer (`space-y-2`).** A `flex-col` block and 3-row textarea must never be a child of the horizontal composer row; otherwise they force its height. Placement in the footer keeps them semantically part of the input zone while leaving the row unbroken.
- **Close reuses the existing `reset()` cleanup.** `useVoiceComposer.reset` already stops the mic tracks and closes the AudioContext; the gap was only that no UI fired it. A close button on the editor card calls `reset()` and returns to idle.
- **Copy button inline beside the bubble.** Placing it in the same `flex items-end gap-2` row as the bubble, with the assistant bubble's `mr-auto` removed so the button sits flush against the response, satisfies "diagonal right of the response" (bottom-right of the bubble).
- **User alignment via row/meta classes.** `flex-row-reverse` for the user bubble row and `justify-end` on the user meta mirror the assistant without duplicate components.

## Risks / Trade-offs

- **`useVoiceComposer` lifts more state to `ConversationView`**, which is already large; kept acceptable by delegating to a dedicated hook and keeping `VoiceInput` thin.
- Editing text area stays controlled by the hook; closing while edited but unsubmitted discards the edit - acceptable, "discard" is the documented semantic.
- Removing `mr-auto` from the assistant bubble changes its margin so the copy button hugs it; long assistant content already caps at `max-w-[80%]`, so layout remains bounded.
