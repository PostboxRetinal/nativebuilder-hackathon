import { SpeechmaticsAdapter } from "./SpeechmaticsAdapter";
import { FishAudioTTSAdapter } from "./FishAudioTTSAdapter";

let cachedStt: SpeechmaticsAdapter | null = null;
let cachedTts: FishAudioTTSAdapter | null = null;

export function createAdapters() {
  if (!cachedStt) {
    cachedStt = new SpeechmaticsAdapter();
  }
  if (!cachedTts) {
    // reference_id is now configured as FISH_AUDIO_REFERENCE_ID secret in Supabase
    cachedTts = new FishAudioTTSAdapter("");
  }
  return { stt: cachedStt, tts: cachedTts };
}
