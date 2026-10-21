import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import T from './T';
import { colors, shadow } from '../theme';

const TABS = [
  { key: 'Home', label: 'Beranda', icon: 'home' },
  { key: 'Progress', label: 'Progres', icon: 'stats-chart' },
  { key: 'Badges', label: 'Lencana', icon: 'star' },
  { key: 'Profile', label: 'Profil', icon: 'person' },
];

function Tab({ tab, active, onPress }) {
  const s = useRef(new Animated.Value(active ? 1.15 : 1)).current;
  useEffect(() => {
    Animated.spring(s, { toValue: active ? 1.15 : 1, friction: 4, tension: 120, useNativeDriver: true }).start();
  }, [active]);
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
      <Animated.View style={{ transform: [{ scale: s }] }}>
        <Ionicons name={tab.icon} size={30} color={active ? colors.blue : colors.slate} />
      </Animated.View>
      <T weight="bold" style={{ fontSize: 14, marginTop: 4, color: active ? colors.navy : colors.slate }}>
        {tab.label}
      </T>
    </Pressable>
  );
}

export default function TabBar({ active, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: insets.bottom + 12,
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 34,
          paddingVertical: 14,
          paddingHorizontal: 10,
        },
        shadow,
      ]}
    >
      {TABS.map((t) => (
        <Tab key={t.key} tab={t} active={active === t.key} onPress={() => onChange(t.key)} />
      ))}
    </View>
  );
}
