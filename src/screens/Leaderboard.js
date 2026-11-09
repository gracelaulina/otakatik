import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import FadeInUp from '../components/FadeInUp';
import { useGame, levelFromXp } from '../state/GameContext';
import { fetchLeaderboard } from '../services/firebase';
import { colors, shadow } from '../theme';

const FALLBACK_RIVALS = [
  { id: 'grace@otakatik.id', email: 'grace@otakatik.id', name: 'Grace', xp: 340 },
  { id: 'ayu@otakatik.id', email: 'ayu@otakatik.id', name: 'Ayu', xp: 280 },
  { id: 'dhea@otakatik.id', email: 'dhea@otakatik.id', name: 'Dhea', xp: 210 },
  { id: 'faris@otakatik.id', email: 'faris@otakatik.id', name: 'Faris', xp: 150 },
  { id: 'nadia@otakatik.id', email: 'nadia@otakatik.id', name: 'Nadia', xp: 90 },
];

const MEDAL = ['#FFD166', '#D9E2EC', '#F4A261'];

export default function Leaderboard() {
  const { state } = useGame();
  const [cloudRows, setCloudRows] = useState(null);

  useEffect(() => {
    let active = true;
    fetchLeaderboard().then((list) => {
      if (active && list) {
        setCloudRows(list);
      }
    });
    return () => {
      active = false;
    };
  }, [state.xp]);

  const meName = state.user ? state.user.name : 'Kamu';
  const meEmail = state.user?.email ? state.user.email.toLowerCase() : 'me_local';
  const me = {
    id: meEmail,
    email: meEmail,
    name: meName,
    xp: state.xp,
    isMe: true,
  };

  // Pisahkan tiap akun berdasarkan email unik (bukan nama saja) agar akun berbeda tidak pernah menyatu
  const combinedSource = [...(cloudRows || []), ...FALLBACK_RIVALS];
  const seenEmails = new Set([meEmail]);
  const others = [];

  for (const r of combinedSource) {
    const rEmail = String(r.email || r.id || '').toLowerCase();
    if (!rEmail || seenEmails.has(rEmail)) continue;
    seenEmails.add(rEmail);
    others.push({
      id: rEmail,
      email: rEmail,
      name: r.name,
      xp: Number(r.xp || 0),
      isMe: false,
    });
  }

  const rows = [...others, me]
    .sort((a, b) => b.xp - a.xp)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <Screen padBottom={100}>
      <FadeInUp>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T weight="bold" style={{ fontSize: 40 }}>Peringkat</T>
          {cloudRows && (
            <View
              style={{
                backgroundColor: colors.mint,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Ionicons name="cloud-done" size={14} color={colors.navy} />
              <T weight="bold" style={{ fontSize: 12 }}>Firebase Live</T>
            </View>
          )}
        </View>
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
