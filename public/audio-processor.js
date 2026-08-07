// PCM capture AudioWorkletProcessor.
// Runs on the audio rendering thread. Forwards incoming microphone
// Float32Array buffers to the main thread via MessagePort.
// Loaded via AudioContext.audioWorklet.addModule('/audio-processor.js').

/* global AudioWorkletProcessor, registerProcessor */

class PCMCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      // input[0] is the shared channel buffer; copy so the main thread owns it.
      const channel = input[0];
      this.port.postMessage(new Float32Array(channel));
    }
    return true;
  }
}

registerProcessor('pcm-capture-processor', PCMCaptureProcessor);
