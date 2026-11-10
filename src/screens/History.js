import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Screen from '../components/Screen';
import T from '../components/T';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { colors } from '../theme';
import { feedback } from '../services/feedback';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (ms) => {
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'pass', label: 'Tuntas' },
  { key: 'fail', label: 'Nyawa Habis' },
];

export default function History() {
  const nav = useNav();
  const { state } = useGame();
  const [filter, setFilter] = useState('all');

  const filtered = state.history.filter((h) => {
    if (filter === 'pass') return !h.over;
    if (filter === 'fail') return !!h.over;
    return true;
  });

  return (
    <Screen>
      <TopBar onBack={nav.back} hearts={state.hearts} xp={state.xp} />
      <FadeInUp>
        <T weight="bold" style={{ fontSize: 40, marginBottom: 12 }}>Riwayat</T>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  feedback.tap();
                  setFilter(f.key);
                }}
                style={{
                  backgroundColor: active ? colors.navy : '#fff',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <T weight="bold" style={{ fontSize: 14, color: active ? '#fff' : colors.navy }}>
                  {f.label}
                </T>
              </Pressable>
            );
          })}
        </View>
      </FadeInUp>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filtered.length === 0 ? (
          <T weight="semi" style={{ color: colors.slate, fontSize: 18 }}>
            {state.history.length === 0
              ? 'Belum ada percobaan. Yuk mulai satu stage!'
              : 'Tidak ada riwayat untuk filter ini.'}
          </T>
        ) : (
          filtered.map((h, i) => (
            <FadeInUp key={h.id} delay={i * 60}>
              <View style={{ backgroundColor: h.over ? colors.redBg : '#fff', borderRadius: 24, padding: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <T weight="bold" style={{ fontSize: 19 }}>{h.title}</T>
                  <T weight="semi" style={{ color: colors.slate, fontSize: 15 }}>{fmt(h.at)}</T>
                </View>
                <T weight="bold" style={{ fontSize: 18 }}>{h.over ? 'Nyawa habis' : `Skor ${h.score} · +${h.xp} XP`}</T>
              </View>
            </FadeInUp>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
