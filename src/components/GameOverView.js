import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from './Screen';
import Mascot from './Mascot';
import Button3D from './Button3D';
import PopIn from './PopIn';
import T from './T';
import { colors } from '../theme';

export default function GameOverView({ onRetry, onHome }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      <Screen bg={colors.pink}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Mascot size={170} mood="sad" bob={false} />
          <T weight="bold" style={{ fontSize: 40, marginTop: 8 }}>Nyawa Habis</T>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
            {[0, 1, 2].map((i) => (
              <PopIn key={i} delay={300 + i * 150}>
                <Ionicons name="heart-outline" size={56} color="#A9C4E8" />
              </PopIn>
            ))}
          </View>
          <T style={{ color: colors.slate, fontSize: 18, textAlign: 'center', marginTop: 16, lineHeight: 26 }}>
            Tenang, stage akan diulang. Baca materinya lagi dulu, yuk.
          </T>
        </View>
        <Button3D title="Ulangi Stage" onPress={onRetry} style={{ marginBottom: 12 }} />
        <Button3D title="Kembali ke Beranda" variant="white" onPress={onHome} />
      </Screen>
    </Animated.View>
  );
}
