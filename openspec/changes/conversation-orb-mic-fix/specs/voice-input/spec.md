## ADDED Requirements

### Requirement: Microphone stream cleanup on stop

The SpeechmaticsAdapter SHALL properly close the microphone stream and AudioContext when stopping recognition. Calling `stop()` SHALL stop all MediaStream tracks and close the AudioContext to release hardware resources.

#### Scenario: Stop closes microphone
- **WHEN** the user taps the orb to stop listening
- **THEN** `SpeechmaticsAdapter.stop()` calls `track.stop()` on all MediaStream tracks and `AudioContext.close()`

#### Scenario: Multiple stop calls are safe
- **WHEN** `stop()` is called multiple times
- **THEN** no error is thrown (null checks protect against double-close)

### Requirement: TTS completion returns to listening state

After TTS playback completes, `useVoiceAgent` SHALL set state to "listening" (not "idle"). This ensures the orb shows mic activity and the user can continue speaking without re-tapping start.

#### Scenario: TTS completes successfully
- **WHEN** `ttsAdapter.speak()` resolves
- **THEN** state transitions to "listening" (the `finally` block sets this)

#### Scenario: TTS fails
- **WHEN** `ttsAdapter.speak()` throws an error
- **THEN** state transitions to "listening" (the `finally` block runs regardless)
