import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function PopIn({ delay = 0, from = 0, style, children }) {
  const v = useRef(new Animated.Value(from)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.spring(v, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' }),
          transform: [{ scale: v }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
