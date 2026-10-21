import React from 'react';
import { ScrollView, View } from 'react-native';
import Screen from '../components/Screen';
import T from '../components/T';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { colors } from '../theme';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (ms) => {
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function History() {
  const nav = useNav();
  const { state } = useGame();
  return (
    <Screen>
      <TopBar onBack={nav.back} hearts={state.hearts} xp={state.xp} />
      <FadeInUp>
        <T weight="bold" style={{ fontSize: 40, marginBottom: 16 }}>Riwayat</T>
      </FadeInUp>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {state.history.length === 0 ? (
          <T weight="semi" style={{ color: colors.slate, fontSize: 18 }}>Belum ada percobaan. Yuk mulai satu stage!</T>
        ) : (
          state.history.map((h, i) => (
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
