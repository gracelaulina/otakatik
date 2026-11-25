import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
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

// Aset efek suara lokal (.wav) untuk Android / iOS via expo-audio
const SOUND_SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  levelup: require('../../assets/sounds/levelup.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  gameover: require('../../assets/sounds/gameover.wav'),
};

const players = {};
let audioConfigured = false;

function playNativeSound(key, volume = 0.85) {
  if (!feedbackEnabled || Platform.OS === 'web') return;
  try {
    if (!audioConfigured) {
      audioConfigured = true;
      setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'mixWithOthers',
      }).catch(() => {});
    }
    if (!players[key]) {
      players[key] = createAudioPlayer(SOUND_SOURCES[key]);
    }
    const player = players[key];
    player.volume = volume;
    Promise.resolve(player.seekTo(0))
      .then(() => player.play())
      .catch(() => {
        try {
          player.play();
        } catch {}
      });
  } catch {}
}

// Synthesizer nada untuk Web Browser
let audioCtx = null;
function playWebTones(notes = []) {
  if (!feedbackEnabled || Platform.OS !== 'web') return;
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

// Getaran langsung ke motor getar Android + Haptics iOS/Android
function triggerVibrate(pattern, hapticFn) {
  if (!feedbackEnabled || Platform.OS === 'web') return;
  try {
    Vibration.vibrate(pattern);
  } catch {}
  try {
    if (hapticFn) hapticFn().catch(() => {});
  } catch {}
}

export const feedback = {
  tap() {
    if (!feedbackEnabled) return;
    playNativeSound('tap', 0.6);
    playWebTones([[520, 45, 'sine', 0.08]]);
    triggerVibrate(18, () => Haptics.selectionAsync());
  },
  correct() {
    if (!feedbackEnabled) return;
    playNativeSound('correct', 0.95);
    playWebTones([
      [523.25, 90, 'triangle', 0.16],
      [659.25, 90, 'triangle', 0.16],
      [783.99, 170, 'triangle', 0.18],
    ]);
    triggerVibrate(45, () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    );
  },
  wrong() {
    if (!feedbackEnabled) return;
    playNativeSound('wrong', 0.9);
    playWebTones([
      [220, 120, 'sawtooth', 0.12],
      [174.61, 180, 'sawtooth', 0.12],
    ]);
    triggerVibrate([0, 75, 55, 85], () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    );
  },
  levelUp() {
    if (!feedbackEnabled) return;
    playNativeSound('levelup', 1.0);
    playWebTones([
      [523.25, 85, 'triangle', 0.16],
      [659.25, 85, 'triangle', 0.16],
      [783.99, 85, 'triangle', 0.16],
      [1046.5, 220, 'triangle', 0.2],
    ]);
    triggerVibrate([0, 50, 60, 95], () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    );
  },
  complete() {
    if (!feedbackEnabled) return;
    playNativeSound('complete', 1.0);
    playWebTones([
      [523.25, 80, 'triangle', 0.16],
      [659.25, 80, 'triangle', 0.16],
      [783.99, 80, 'triangle', 0.16],
      [1046.5, 110, 'triangle', 0.18],
      [783.99, 80, 'triangle', 0.16],
      [1046.5, 260, 'triangle', 0.22],
    ]);
    triggerVibrate([0, 60, 50, 60, 50, 110], () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    );
  },
  gameOver() {
    if (!feedbackEnabled) return;
    playNativeSound('gameover', 0.95);
    playWebTones([
      [392.0, 130, 'sine', 0.15],
      [349.23, 130, 'sine', 0.15],
      [329.63, 130, 'sine', 0.15],
      [261.63, 280, 'sine', 0.16],
    ]);
    triggerVibrate([0, 120, 80, 160], () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    );
  },
};
