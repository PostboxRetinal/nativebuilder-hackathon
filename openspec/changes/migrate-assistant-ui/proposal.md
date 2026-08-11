## Why

Los componentes custom de chat (ChatList, ChatMessage, ConversationModeView, useVoiceAgent) son difíciles de mantener y carecen de features production-ready (streaming, retries, branching, accessibility). assistant-ui provee estos componentes como primitivas componibles con TypeScript end-to-end, accesibles por defecto, y con soporte para streaming y adapters.

## What Changes

- Reemplazar ChatList/ChatMessage/ChatComposer con ThreadPrimitive/ComposerPrimitive de assistant-ui
- Crear FishAudioSpeechAdapter (TTS) implementando SpeechSynthesisAdapter
- Crear SpeechmaticsDictationAdapter (STT) implementando DictationAdapter
- Crear useDevVoiceRuntime con useLocalRuntime + adapters + streaming via async generator
- Agregar ErrorBoundary para manejo de errores graceful
- Agregar accessibility: aria-live, focus-visible, keyboard navigation, ResizeObserver mock para tests
- Actualizar VoiceConversation con ThreadPrimitive

## Capabilities

### Modified Capabilities

- **voice-input**: STT via SpeechmaticsDictationAdapter (assistant-ui), TTS via FishAudioSpeechAdapter
- **conversation-management**: Chat UI usa ThreadPrimitive/ComposerPrimitive con runtime local
- **error-handling**: ErrorBoundary para captura de errores, mensajes de error graceful

## Impact

- `src/adapters/FishAudioSpeechAdapter.ts`: nuevo adapter TTS
- `src/adapters/SpeechmaticsDictationAdapter.ts`: nuevo adapter STT
- `src/runtime/devvoice-runtime.ts`: runtime custom con research pipeline + streaming
- `src/components/assistant/AssistantThread.tsx`: componente de chat con ThreadPrimitive
- `src/components/assistant/ErrorBoundary.tsx`: boundary de errores
- `src/components/VoiceConversation.tsx`: actualizado con ThreadPrimitive
- `src/components/ConversationView.tsx`: actualizado para usar AssistantThread
- `vitest.setup.ts`: mocks de ResizeObserver, Audio, URL.createObjectURL
- Sin cambios en APIs externas, base de datos, ni dependencias de backend
