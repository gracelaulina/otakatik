import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import PopIn from '../components/PopIn';
import FadeInUp from '../components/FadeInUp';
import { useGame, getBadges } from '../state/GameContext';
import { colors } from '../theme';

export default function Badges() {
  const { state } = useGame();
  const badges = getBadges(state);
  const open = badges.filter((b) => b.unlocked).length;

  return (
    <Screen padBottom={100}>
      <FadeInUp>
        <T weight="bold" style={{ fontSize: 40 }}>Lencana</T>
        <T weight="semi" style={{ color: colors.slate, fontSize: 18, marginTop: 6, marginBottom: 16 }}>
          {open} dari {badges.length} lencana terbuka.
        </T>
      </FadeInUp>
      <View style={{ backgroundColor: '#fff', borderRadius: 34, padding: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
        {badges.map((b, i) => (
          <View key={b.id} style={{ width: '33.33%', padding: 8, alignItems: 'center' }}>
            <PopIn delay={120 + i * 90} style={{ width: '100%' }}>
              <Pressable onPress={() => Alert.alert(b.title, b.unlocked ? b.desc : `Terkunci: ${b.desc}`)}>
                <View style={{ width: '100%', aspectRatio: 1, borderRadius: 28, backgroundColor: b.color, opacity: b.unlocked ? 1 : 0.75, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={b.unlocked ? b.icon : 'lock-closed'} size={36} color={b.unlocked ? colors.navy : '#8A8FB5'} />
                </View>
              </Pressable>
            </PopIn>
            <T weight="bold" style={{ fontSize: 15, textAlign: 'center', marginTop: 8, color: b.unlocked ? colors.navy : '#8A8FB5' }}>{b.title}</T>
          </View>
        ))}
      </View>
    </Screen>
  );
}
