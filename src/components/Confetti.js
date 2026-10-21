import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

const COLORS = ['#FFB020', '#2F8EFF', '#FF6B8B', '#2EBF77', '#9B7BFF'];

export default function Confetti({ count = 20, originY = 0.33, delay = 250 }) {
  const p = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const d = 110 + Math.random() * 110;
        return {
          dx: Math.cos(a) * d,
          dy: Math.sin(a) * d - 30,
          color: COLORS[i % COLORS.length],
          size: 8 + Math.random() * 7,
          rot: (Math.random() * 2 - 1) * 360,
        };
      }),
    []
  );
  useEffect(() => {
    Animated.timing(p, { toValue: 1, duration: 1200, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, []);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {parts.map((pt, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: width / 2,
            top: height * originY,
            width: pt.size,
            height: pt.size * 0.6,
            borderRadius: 3,
            backgroundColor: pt.color,
            opacity: p.interpolate({ inputRange: [0, 0.01, 0.7, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, pt.dx] }) },
              { translateY: p.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, pt.dy, pt.dy + 70] }) },
              { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${pt.rot}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
