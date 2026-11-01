import React from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import FadeInUp from '../components/FadeInUp';
import { useGame, levelFromXp } from '../state/GameContext';
import { colors, shadow } from '../theme';

// shortcut: data rival statis di memori sampai endpoint CRUD MySQL/Firestore untuk leaderboard kelas disambungkan
const RIVALS = [
  { id: 'r1', name: 'Grace', xp: 340 },
  { id: 'r2', name: 'Ayu', xp: 280 },
  { id: 'r3', name: 'Dhea', xp: 210 },
  { id: 'r4', name: 'Faris', xp: 150 },
  { id: 'r5', name: 'Nadia', xp: 90 },
];

const MEDAL = ['#FFD166', '#D9E2EC', '#F4A261'];

export default function Leaderboard() {
  const { state } = useGame();
  const me = {
    id: 'me',
    name: state.user ? state.user.name : 'Kamu',
    xp: state.xp,
    isMe: true,
  };

  const rows = [...RIVALS.filter((r) => r.name.toLowerCase() !== me.name.toLowerCase()), me]
    .sort((a, b) => b.xp - a.xp)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <Screen padBottom={100}>
      <FadeInUp>
        <T weight="bold" style={{ fontSize: 40 }}>Peringkat</T>
        <T weight="semi" style={{ color: colors.slate, fontSize: 18, marginTop: 4, marginBottom: 16 }}>
          Peringkatmu: #{rows.find((r) => r.isMe)?.rank} dengan {me.xp} XP
        </T>
      </FadeInUp>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {rows.map((item, i) => (
          <FadeInUp key={item.id} delay={60 * i}>
            <View
              style={[
                {
                  backgroundColor: item.isMe ? colors.sky : '#fff',
                  borderColor: item.isMe ? colors.blue : 'transparent',
                  borderWidth: item.isMe ? 2.5 : 0,
                  borderRadius: 24,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
                shadow,
              ]}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: MEDAL[i] || colors.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                {i < 3 ? (
                  <Ionicons name="trophy" size={20} color={colors.navy} />
                ) : (
                  <T weight="bold" style={{ fontSize: 17 }}>{item.rank}</T>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <T weight="bold" style={{ fontSize: 19 }}>
                  {item.name} {item.isMe ? '(Kamu)' : ''}
                </T>
                <T weight="semi" style={{ fontSize: 14, color: colors.slate }}>
                  Level {levelFromXp(item.xp)}
                </T>
              </View>

              <T weight="bold" style={{ fontSize: 18, color: colors.blueDark }}>
                {item.xp} XP
              </T>
            </View>
          </FadeInUp>
        ))}
      </ScrollView>
    </Screen>
  );
}
