import { Audio, AVPlaybackStatus } from 'expo-av';

// Drop your QuickTime recording here as: assets/audio/call-script.m4a
const CALL_SCRIPT = require('../assets/audio/call-script.m4a');

/**
 * Playback rate controls pitch when shouldCorrectPitch is false.
 * 1.0 = original recording
 * 0.92 = slightly deeper
 * 0.85 = noticeably deeper (also a bit slower)
 */
export const CALL_SCRIPT_PITCH_RATE = 0.88;

export class AudioService {
  private static sound: Audio.Sound | null = null;
  private static audioModeConfigured = false;

  static async configureAudioMode() {
    if (this.audioModeConfigured) return;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    this.audioModeConfigured = true;
  }

  static async playCallScript(
    onFinished?: () => void,
    pitchRate: number = CALL_SCRIPT_PITCH_RATE
  ) {
    await this.configureAudioMode();
    await this.stopAll();

    const { sound } = await Audio.Sound.createAsync(
      CALL_SCRIPT,
      { shouldPlay: false, volume: 1.0 },
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          onFinished?.();
        }
      }
    );

    this.sound = sound;

    // false = pitch drops as rate goes below 1.0
    await sound.setRateAsync(pitchRate, false);
    await sound.playAsync();

    return sound;
  }

  static async stopAll() {
    if (!this.sound) return;

    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
    } catch (error) {
      console.log('Error stopping audio:', error);
    } finally {
      this.sound = null;
    }
  }
}
