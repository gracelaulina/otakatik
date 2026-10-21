import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import StatPills from './StatPills';
import { colors, shadow } from '../theme';

export function BackButton({ onPress }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.9} style={[{ width: 56, height: 56, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, shadow]}>
      <Ionicons name="chevron-back" size={28} color={colors.navy} />
    </PressableScale>
  );
}

export default function TopBar({ onBack, hearts = 3, xp = 0, showPills = true }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      {onBack ? <BackButton onPress={onBack} /> : <View />}
      {showPills ? <StatPills hearts={hearts} xp={xp} /> : <View />}
    </View>
  );
}
