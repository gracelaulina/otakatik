import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { colors } from '../theme';

// Atik, dibuat dari View biasa (tanpa SVG) supaya tidak butuh dependency tambahan.
export default function Mascot({ size = 160, mood = 'happy', bob = true, style }) {
  const S = size;
  const float = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let l1;
    if (bob) {
      l1 = Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      l1.start();
    }
    const l2 = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
      ])
    );
    l2.start();
    return () => {
      if (l1) l1.stop();
      l2.stop();
    };
  }, [bob]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -S * 0.05] });
  const eye = S * 0.26;
  const pupil = S * 0.14;

  const Eye = ({ left }) => (
    <Animated.View
      style={{
        position: 'absolute',
        top: S * 0.26,
        left,
        width: eye,
        height: eye,
        borderRadius: eye / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scaleY: blink }],
      }}
    >
      <View style={{ width: pupil, height: pupil, borderRadius: pupil / 2, backgroundColor: colors.navy }} />
    </Animated.View>
  );

  return (
    <View style={[{ width: S, height: S * 1.3 }, style]}>
      <View
        style={{
          position: 'absolute',
          left: S * 0.14,
          bottom: 0,
          width: S * 0.72,
          height: S * 0.09,
          borderRadius: S * 0.05,
          backgroundColor: 'rgba(27,26,94,0.12)',
        }}
      />
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, width: S, height: S * 1.2, transform: [{ translateY }] }}>
        {/* antena */}
        <View style={{ position: 'absolute', top: S * 0.12, left: S / 2 - S * 0.02, width: S * 0.04, height: S * 0.1, backgroundColor: colors.navy }} />
        <View style={{ position: 'absolute', top: 0, left: S / 2 - S * 0.075, width: S * 0.15, height: S * 0.15, borderRadius: S * 0.075, backgroundColor: '#FFC247' }} />
        {/* badan */}
        <View style={{ position: 'absolute', top: S * 0.2, left: 0, width: S, height: S, borderRadius: S / 2, backgroundColor: colors.mascot }}>
          <View style={{ position: 'absolute', left: S * 0.175, top: S * 0.41, width: S * 0.65, height: S * 0.5, borderRadius: S * 0.25, backgroundColor: colors.sky }} />
          <Eye left={S * 0.17} />
          <Eye left={S * 0.57} />
          {mood === 'happy' ? (
            <View
              style={{
                position: 'absolute',
                left: S * 0.32,
                top: S * 0.58,
                width: S * 0.36,
                height: S * 0.17,
                backgroundColor: colors.navy,
                borderBottomLeftRadius: S * 0.18,
                borderBottomRightRadius: S * 0.18,
              }}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                left: S * 0.39,
                top: S * 0.62,
                width: S * 0.22,
                height: S * 0.1,
                borderTopLeftRadius: S * 0.11,
                borderTopRightRadius: S * 0.11,
                borderWidth: S * 0.03,
                borderBottomWidth: 0,
                borderColor: colors.navy,
              }}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}
