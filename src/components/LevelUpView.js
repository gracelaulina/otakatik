import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Screen from './Screen';
import Mascot from './Mascot';
import Confetti from './Confetti';
import Button3D from './Button3D';
import T from './T';
import { LEVELS } from '../data/content';
import { colors } from '../theme';

export default function LevelUpView({ from, to, onContinue }) {
  const fade = useRef(new Animated.Value(0)).current;
  const jump = useRef(new Animated.Value(0.4)).current;
  const arrow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    Animated.spring(jump, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrow, { toValue: 8, duration: 500, useNativeDriver: true }),
        Animated.timing(arrow, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      <Screen bg={colors.sky}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ transform: [{ scale: jump }] }}>
            <Mascot size={190} />
          </Animated.View>
          <T weight="bold" style={{ fontSize: 42, marginTop: 8 }}>Naik Tingkat!</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
            <View style={{ backgroundColor: LEVELS[from].bg, borderRadius: 18, paddingHorizontal: 22, paddingVertical: 12 }}>
              <T weight="bold" style={{ fontSize: 20 }}>{LEVELS[from].label}</T>
            </View>
            <Animated.View style={{ transform: [{ translateX: arrow }], marginHorizontal: 14 }}>
              <T style={{ fontSize: 30 }}>→</T>
            </Animated.View>
            <View style={{ backgroundColor: LEVELS[to].bg, borderRadius: 18, paddingHorizontal: 22, paddingVertical: 12 }}>
              <T weight="bold" style={{ fontSize: 20 }}>{LEVELS[to].label}</T>
            </View>
          </View>
          <T style={{ color: colors.slate, fontSize: 18, textAlign: 'center', marginTop: 18, lineHeight: 26 }}>
            Kamu menjawab benar 3 kali berturut-turut.{'\n'}Soal berikutnya sedikit lebih menantang.
          </T>
        </View>
        <Button3D title="Lanjutkan" onPress={onContinue} />
      </Screen>
      <Confetti originY={0.3} />
    </Animated.View>
  );
}
