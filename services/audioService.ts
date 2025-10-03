import { Audio } from 'expo-av';

export class AudioService {
  private static sound: Audio.Sound | null = null;

  static async playTestVoice() {
    try {
      // For now, we'll use a simple beep sound
      // Later you can replace this with actual TTS or pre-recorded audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, volume: 0.8 }
      );
      
      this.sound = sound;
      
      // Auto-stop after 3 seconds
      setTimeout(() => {
        this.stopAll();
      }, 3000);
      
      return sound;
    } catch (error) {
      console.log('Audio playback error:', error);
      // Fallback: just log that audio would play
      console.log('Would play: "Hey, I\'m almost there. I can see the building now."');
    }
  }

  static async stopAll() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
  }

  static async playIncomingCallSound() {
    try {
      // Play a ringtone-like sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { 
          shouldPlay: true, 
          volume: 0.6,
          isLooping: true 
        }
      );
      
      this.sound = sound;
      return sound;
    } catch (error) {
      console.log('Incoming call sound error:', error);
    }
  }

  static async playCallEndSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, volume: 0.4 }
      );
      
      // Auto-stop after 1 second
      setTimeout(() => {
        this.stopAll();
      }, 1000);
      
      return sound;
    } catch (error) {
      console.log('Call end sound error:', error);
    }
  }
}
