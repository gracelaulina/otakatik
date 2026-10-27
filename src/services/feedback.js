import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

let feedbackEnabled = true;

export const setSoundEnabled = (val) => {
  feedbackEnabled = !!val;
};

export const isSoundEnabled = () => feedbackEnabled;

const safeVibrate = (pattern) => {
  try {
    if (Platform.OS !== 'web') {
      Vibration.vibrate(pattern);
    }
  } catch {}
};

export const feedback = {
  tap() {
    if (!feedbackEnabled || Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {
      safeVibrate(15);
    });
  },
  correct() {
    if (!feedbackEnabled || Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
      safeVibrate(40);
    });
  },
  wrong() {
    if (!feedbackEnabled || Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {
      safeVibrate([0, 70, 50, 70]);
    });
  },
  levelUp() {
    if (!feedbackEnabled || Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
      safeVibrate([0, 50, 60, 90]);
    });
  },
  complete() {
    if (!feedbackEnabled || Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
      safeVibrate([0, 60, 50, 60, 50, 100]);
    });
  },
  gameOver() {
    if (!feedbackEnabled || Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
      safeVibrate([0, 120, 80, 150]);
    });
  },
};
