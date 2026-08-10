import { SpeechmaticsAdapter } from "./SpeechmaticsAdapter";
import { FishAudioTTSAdapter } from "./FishAudioTTSAdapter";

let cachedStt: SpeechmaticsAdapter | null = null;
let cachedTts: FishAudioTTSAdapter | null = null;

export function createAdapters() {
  if (!cachedStt) {
    cachedStt = new SpeechmaticsAdapter();
  }
  if (!cachedTts) {
    const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY ?? "";
    const fishReferenceId = import.meta.env.VITE_FISH_AUDIO_REFERENCE_ID;
    cachedTts = new FishAudioTTSAdapter(fishApiKey, fishReferenceId || undefined);
  }
  return { stt: cachedStt, tts: cachedTts };
}
