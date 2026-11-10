import React, { useEffect, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import FadeInUp from '../components/FadeInUp';
import { useGame, levelFromXp } from '../state/GameContext';
import { fetchLeaderboard } from '../services/firebase';
import { colors, fonts, shadow } from '../theme';

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
  const [query, setQuery] = useState('');

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
  }, [state.xp, state.user?.name]);

  const meName = state.user ? state.user.name : 'Kamu';
  const meEmail = state.user?.email ? state.user.email.toLowerCase() : 'me_local';
  const me = {
    id: meEmail,
    email: meEmail,
    name: meName,
    xp: state.xp,
    isMe: true,
  };

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

  const sorted = [...others, me].sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
  const rows = [];
  for (let idx = 0; idx < sorted.length; idx++) {
    const item = sorted[idx];
    const rank = idx > 0 && item.xp === sorted[idx - 1].xp ? rows[idx - 1].rank : idx + 1;
    rows.push({ ...item, rank });
  }

  const qLower = query.trim().toLowerCase();
  const visibleRows = qLower
    ? rows.filter((r) => r.name.toLowerCase().includes(qLower))
    : rows;

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
        <T weight="semi" style={{ color: colors.slate, fontSize: 17, marginTop: 4, marginBottom: 12 }}>
          Peringkatmu: #{rows.find((r) => r.isMe)?.rank} dengan {me.xp} XP
        </T>

        {/* Pencarian Siswa */}
        <View
          style={[
            {
              backgroundColor: '#fff',
              borderRadius: 20,
              height: 46,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 14,
            },
            shadow,
          ]}
        >
          <Ionicons name="search" size={18} color={colors.slate} />
          <TextInput
            placeholder="Cari nama siswa..."
            placeholderTextColor={colors.slate}
            value={query}
            onChangeText={setQuery}
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 16,
              fontFamily: fonts.semi,
              color: colors.navy,
            }}
          />
        </View>
      </FadeInUp>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {visibleRows.map((item, i) => (
          <FadeInUp key={item.id} delay={50 * i}>
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
                  backgroundColor: MEDAL[item.rank - 1] || colors.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                {item.rank <= 3 ? (
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
