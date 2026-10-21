import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { colors } from '../theme';

export default function AnimatedBar({ progress, color = colors.blue, track = '#fff', height = 14, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: progress, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [progress]);
  const w = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }, style]}>
      <Animated.View style={{ width: w, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}
