import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function Screen({ bg = colors.bg, padBottom = 0, style, children }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          backgroundColor: bg,
          paddingTop: insets.top + 8,
          paddingHorizontal: 18,
          paddingBottom: insets.bottom + 12 + padBottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
