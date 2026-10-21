import { Platform } from 'react-native';

export const colors = {
  bg: '#E8F3FF',
  sky: '#BEE1FE',
  navy: '#1B1A5E',
  navyDark: '#0A0942',
  blue: '#2F8EFF',
  blueDark: '#1B5FC2',
  slate: '#5668A0',
  white: '#FFFFFF',
  yellow: '#FDE0A5',
  yellowDark: '#E5B95B',
  amber: '#FFB020',
  pink: '#FBC4E8',
  lavender: '#D1C4FA',
  mint: '#C8F2DC',
  green: '#2EBF77',
  greenDark: '#1F9A5C',
  greenText: '#1E8E5A',
  red: '#FF6B6B',
  redDark: '#C94545',
  redBg: '#FDCFCF',
  heart: '#FF6B8B',
  mascot: '#4DA8FF',
};

export const fonts = {
  regular: 'Outfit_400Regular',
  semi: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
};

export const shadow = {
  shadowColor: '#2F8EFF',
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};
