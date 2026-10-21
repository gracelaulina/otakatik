import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import T from './T';
import { colors, fonts, shadow } from '../theme';

const LOOK = {
  idle: { bg: '#fff', border: 'transparent' },
  selected: { bg: colors.sky, border: colors.blue },
  correct: { bg: '#C8F2DC', border: colors.green },
  wrong: { bg: '#FDD0D0', border: colors.red },
};

export default function OptionCard({ letter, label, mono, state, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (state !== 'idle') {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.03, duration: 90, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, bounciness: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);
  const look = LOOK[state];
  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          {
            transform: [{ scale }],
            backgroundColor: look.bg,
            borderColor: look.border,
            borderWidth: 3,
            borderRadius: 26,
            paddingHorizontal: 22,
            paddingVertical: 20,
            marginBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
          },
          shadow,
        ]}
      >
        <T weight="bold" style={{ fontSize: 22, width: 34, color: colors.slate }}>{letter}</T>
        <T weight="semi" style={mono ? { fontFamily: fonts.mono, fontSize: 21, flex: 1 } : { fontSize: 19, flex: 1 }}>
          {label}
        </T>
      </Animated.View>
    </Pressable>
  );
}
