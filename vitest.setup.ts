import '@testing-library/jest-dom/vitest'

// jsdom does not implement Element.prototype.scrollIntoView.
// MessageList calls it in a layout effect, so stub it for every test.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// jsdom does not implement ResizeObserver.
// assistant-ui (Radix-based) uses it for viewport auto-scroll.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock

// jsdom does not implement URL.createObjectURL.
// FishAudioSpeechAdapter uses it for audio blob playback.
if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:mock-url"
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => {}
}

// jsdom does not implement HTMLAudioElement.play.
// Mock it for TTS adapter tests.
;(globalThis as any).Audio = class MockAudio {
  src = ""
  onended: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  play() {
    return Promise.resolve()
  }
  pause() {}
}
