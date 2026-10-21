import React, { useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import T from './T';
import { colors } from '../theme';

const VARIANTS = {
  navy: { bg: colors.navy, shadow: colors.navyDark, text: '#fff' },
  blue: { bg: colors.blue, shadow: colors.blueDark, text: '#fff' },
  green: { bg: colors.green, shadow: colors.greenDark, text: '#fff' },
  red: { bg: colors.red, shadow: colors.redDark, text: '#fff' },
  white: { bg: '#fff', shadow: '#CFE3F5', text: colors.navy },
};

export default function Button3D({
  title,
  children,
  onPress,
  variant = 'navy',
  disabled,
  radius = 26,
  depth = 5,
  faceStyle,
  style,
  fontSize = 20,
}) {
  const press = useRef(new Animated.Value(0)).current;
  const v = VARIANTS[variant];
  const to = (val) => Animated.spring(press, { toValue: val, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  return (
    <Pressable
      onPressIn={() => to(1)}
      onPressOut={() => to(0)}
      onPress={onPress}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.45 : 1 }, style]}
    >
      <View style={{ backgroundColor: v.shadow, borderRadius: radius, paddingBottom: depth }}>
        <Animated.View
          style={[
            {
              backgroundColor: v.bg,
              borderRadius: radius,
              paddingVertical: 20,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, depth - 1] }) }],
            },
            faceStyle,
          ]}
        >
          {children || (
            <T weight="bold" style={{ color: v.text, fontSize }}>
              {title}
            </T>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}
