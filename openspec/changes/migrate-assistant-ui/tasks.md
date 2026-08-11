## 1. Instalar assistant-ui

- [x] 1.1 Agregar `@assistant-ui/react` y `@assistant-ui/core` al proyecto
- [x] 1.2 Verificar typecheck — 0 errores

## 2. Adapters

- [x] 2.1 Crear `FishAudioSpeechAdapter` implementando `SpeechSynthesisAdapter`
- [x] 2.2 Crear `SpeechmaticsDictationAdapter` implementando `DictationAdapter`
- [x] 2.3 Tests para `FishAudioSpeechAdapter`
- [x] 2.4 Tests para `SpeechmaticsDictationAdapter`

## 3. Runtime

- [x] 3.1 Crear `useDevVoiceRuntime` con `useLocalRuntime` + adapters
- [x] 3.2 Conectar research pipeline como `ChatModelAdapter.run`

## 4. Componentes

- [x] 4.1 Crear `VoiceConversation` con `ThreadPrimitive` de assistant-ui
- [x] 4.2 Integrar `VoiceConversation` en el router/vista principal

## 5. Verificación

- [x] 5.1 Typecheck — 0 errores
- [x] 5.2 Tests — 187/187 pasan
- [x] 5.3 Coverage — sobre umbrales (64.37/56.68/66.66/66.75)
- [x] 5.4 SDD — change `migrate-assistant-ui` creado y validado

## 6. Limpieza

- [x] 6.1 Actualizar ConversationView para usar AssistantThread
- [x] 6.2 Eliminar imports no usados (ChatList, ChatMessage, ChatComposer, VoiceInput, etc.)
- [x] 6.3 Agregar ErrorBoundary para manejo de errores
- [x] 6.4 Agregar mocks de ResizeObserver y Audio en vitest.setup.ts
- [ ] 6.5 Eliminar `src/components/chat/ChatList.tsx` (pendiente - ya no se usa)
- [ ] 6.6 Eliminar `src/components/chat/ChatMessage.tsx` (pendiente - ya no se usa)
- [ ] 6.7 Eliminar `src/components/chat/ChatComposer.tsx` (pendiente - ya no se usa)
- [ ] 6.8 Eliminar `src/components/chat/TranscriptionPreview.tsx` (pendiente - ya no se usa)
- [ ] 6.9 Eliminar `src/components/chat/VoiceTranscriptEditor.tsx` (pendiente - ya no se usa)
- [ ] 6.10 Eliminar `src/hooks/useVoiceComposer.ts` (pendiente - ya no se usa en ConversationView)
