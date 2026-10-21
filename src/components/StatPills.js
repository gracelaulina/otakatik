import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import { colors, shadow } from '../theme';

function Pill({ children }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10 }, shadow]}>
      {children}
    </View>
  );
}

export default function StatPills({ hearts, xp }) {
  const shake = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevH = useRef(hearts);
  const prevX = useRef(xp);

  useEffect(() => {
    if (hearts < prevH.current) {
      Animated.sequence(
        [-8, 8, -6, 6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 50, useNativeDriver: true }))
      ).start();
    }
    prevH.current = hearts;
  }, [hearts]);

  useEffect(() => {
    if (xp > prevX.current) {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 120, useNativeDriver: true }),
        Animated.spring(pulse, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
    prevX.current = xp;
  }, [xp]);

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <Pill>
          <Ionicons name="heart" size={26} color={colors.heart} />
          <T weight="bold" style={{ fontSize: 18, marginLeft: 8 }}>{hearts}/3</T>
        </Pill>
      </Animated.View>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Pill>
          <Ionicons name="flash" size={24} color={colors.amber} />
          <T weight="bold" style={{ fontSize: 18, marginLeft: 8 }}>XP {xp}</T>
        </Pill>
      </Animated.View>
    </View>
  );
}
