import { SpeechmaticsAdapter } from "./SpeechmaticsAdapter";
import { FishAudioTTSAdapter } from "./FishAudioTTSAdapter";

let cachedStt: SpeechmaticsAdapter | null = null;
let cachedTts: FishAudioTTSAdapter | null = null;

export function createAdapters() {
  if (!cachedStt) {
    cachedStt = new SpeechmaticsAdapter();
  }
  if (!cachedTts) {
    const fishReferenceId = import.meta.env.VITE_FISH_AUDIO_REFERENCE_ID;
    cachedTts = new FishAudioTTSAdapter("", fishReferenceId || undefined);
  }
  return { stt: cachedStt, tts: cachedTts };
}
