import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from './T';
import Button3D from './Button3D';
import { colors } from '../theme';

export default function FeedbackSheet({ ok, title, text, label, onPress }) {
  const y = useRef(new Animated.Value(340)).current;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    Animated.spring(y, { toValue: 0, speed: 14, bounciness: 6, useNativeDriver: true }).start();
  }, []);
  const tone = ok ? colors.greenText : colors.redDark;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: ok ? colors.mint : colors.redBg,
        borderTopLeftRadius: 34,
        borderTopRightRadius: 34,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: insets.bottom + 16,
        transform: [{ translateY: y }],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Ionicons name={ok ? 'checkmark' : 'heart'} size={34} color={tone} />
        <T weight="bold" style={{ fontSize: 30, color: tone, marginLeft: 10 }}>{title}</T>
      </View>
      <T style={{ fontSize: 17, lineHeight: 25, marginBottom: 18 }}>{text}</T>
      <Button3D title={label} variant={ok ? 'green' : 'red'} onPress={onPress} />
    </Animated.View>
  );
}
