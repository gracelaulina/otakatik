import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOUND_PREF_KEY = '@otakatik_sound_enabled_v1';
let feedbackEnabled = true;

AsyncStorage.getItem(SOUND_PREF_KEY)
  .then((v) => {
    if (v !== null) feedbackEnabled = v !== 'false';
  })
  .catch(() => {});

export const setSoundEnabled = (val) => {
  feedbackEnabled = !!val;
  AsyncStorage.setItem(SOUND_PREF_KEY, String(feedbackEnabled)).catch(() => {});
};

export const isSoundEnabled = () => feedbackEnabled;

// Synthesizer nada efek suara ringan (tanpa file MP3 eksternal & aman di Expo SDK 58)
let audioCtx = null;
function playTones(notes = []) {
  if (!feedbackEnabled) return;
  try {
    const Ctx =
      typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    let startOffset = audioCtx.currentTime;
    for (const [freq, durMs, type = 'sine', vol = 0.14] of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startOffset);

      const durSec = durMs / 1000;
      gain.gain.setValueAtTime(vol, startOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, startOffset + durSec);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startOffset);
      osc.stop(startOffset + durSec);
      startOffset += durSec * 0.85;
    }
  } catch {}
}

const safeVibrate = (pattern) => {
  try {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(pattern);
    }
  } catch {}
};

export const feedback = {
  tap() {
    if (!feedbackEnabled) return;
    playTones([[520, 45, 'sine', 0.08]]);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => safeVibrate(15));
    }
  },
  correct() {
    if (!feedbackEnabled) return;
    // Nada ceria naik (C5 -> E5 -> G5)
    playTones([
      [523.25, 90, 'triangle', 0.16],
      [659.25, 90, 'triangle', 0.16],
      [783.99, 170, 'triangle', 0.18],
    ]);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() =>
        safeVibrate(40)
      );
    }
  },
  wrong() {
    if (!feedbackEnabled) return;
    // Nada rendah turun (buzz salah)
    playTones([
      [220, 120, 'sawtooth', 0.12],
      [174.61, 180, 'sawtooth', 0.12],
    ]);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() =>
        safeVibrate([0, 70, 50, 70])
      );
    }
  },
  levelUp() {
    if (!feedbackEnabled) return;
    // Arpeggio naik level (C5 -> E5 -> G5 -> C6)
    playTones([
      [523.25, 85, 'triangle', 0.16],
      [659.25, 85, 'triangle', 0.16],
      [783.99, 85, 'triangle', 0.16],
      [1046.5, 220, 'triangle', 0.2],
    ]);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() =>
        safeVibrate([0, 50, 60, 90])
      );
    }
  },
  complete() {
    if (!feedbackEnabled) return;
    // Fanfare stage selesai
    playTones([
      [523.25, 80, 'triangle', 0.16],
      [659.25, 80, 'triangle', 0.16],
      [783.99, 80, 'triangle', 0.16],
      [1046.5, 110, 'triangle', 0.18],
      [783.99, 80, 'triangle', 0.16],
      [1046.5, 260, 'triangle', 0.22],
    ]);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() =>
        safeVibrate([0, 60, 50, 60, 50, 100])
      );
    }
  },
  gameOver() {
    if (!feedbackEnabled) return;
    // Nada sedih turun (G4 -> F4 -> E4 -> C4)
    playTones([
      [392.0, 130, 'sine', 0.15],
      [349.23, 130, 'sine', 0.15],
      [329.63, 130, 'sine', 0.15],
      [261.63, 280, 'sine', 0.16],
    ]);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() =>
        safeVibrate([0, 120, 80, 150])
      );
    }
  },
};
