import React from 'react';
import { ScrollView, View } from 'react-native';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import AnimatedBar from '../components/AnimatedBar';
import FadeInUp from '../components/FadeInUp';
import { useGame, levelFromXp, xpForNext } from '../state/GameContext';
import { STAGES } from '../data/content';
import { colors } from '../theme';

const BAR_COLORS = [colors.blue, '#A78BFA', '#F472B6'];

export default function Progress() {
  const { state } = useGame();
  const lvl = levelFromXp(state.xp);
  const next = xpForNext(state.xp);
  const inLevel = state.xp - (lvl - 1) * 100;

  return (
    <Screen padBottom={100}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <FadeInUp>
          <T weight="bold" style={{ fontSize: 40, marginBottom: 16 }}>Progres Saya</T>
        </FadeInUp>
        <FadeInUp delay={80}>
          <View style={{ backgroundColor: colors.sky, borderRadius: 30, padding: 22, flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <T weight="bold" style={{ fontSize: 30 }}>Level {lvl}</T>
              <T weight="semi" style={{ fontSize: 17, marginBottom: 10 }}>{state.xp} / {next} XP</T>
              <AnimatedBar progress={inLevel / 100} height={10} />
            </View>
            <Mascot
  size={74}
  style={{ marginLeft: 16 }}
  mascotColor={state.mascot?.color}
  hair={state.mascot?.hair}
  hairColor={state.mascot?.hairColor}
  hat={state.mascot?.hat}
  outfit={state.mascot?.outfit}
  outfitColor={state.mascot?.outfitColor}
  faceAccessory={state.mascot?.faceAccessory}
  extraAccessory={state.mascot?.extraAccessory}
/>
          </View>
        </FadeInUp>
        {STAGES.map((s, i) => {
          const pct = state.completed[s.id] ? state.completed[s.id].score : 0;
          return (
            <FadeInUp key={s.id} delay={160 + i * 80}>
              <View style={{ backgroundColor: '#fff', borderRadius: 26, padding: 20, marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <T weight="bold" style={{ fontSize: 20 }}>Stage {s.id}: {s.title}</T>
                  <T weight="bold" style={{ fontSize: 20 }}>{pct}%</T>
                </View>
                <AnimatedBar progress={pct / 100} color={BAR_COLORS[i]} track={colors.bg} height={16} />
              </View>
            </FadeInUp>
          );
        })}
<FadeInUp delay={420}>
  <View
    style={{
      backgroundColor: '#FCE7F3',
      borderRadius: 22,
      padding: 18,
      marginTop: 8,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
    }}
  >
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#F9B8DC',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T style={{ fontSize: 23 }}>💡</T>
    </View>

    <View style={{ flex: 1 }}>
      <T weight="bold" style={{ fontSize: 18 }}>
        Rekomendasi Belajar
      </T>

      <T
        weight="semi"
        style={{ fontSize: 14, marginTop: 5, color: '#80516F' }}
      >
        {state.weak.length
          ? 'Materi yang perlu kamu ulang:'
          : 'Hebat! Belum ada materi yang perlu diulang.'}
      </T>

      {state.weak.length > 0 && (
        <T
          weight="bold"
          style={{ fontSize: 16, marginTop: 5 }}
        >
          {state.weak.join(', ')}
        </T>
      )}
    </View>
  </View>
</FadeInUp>
      </ScrollView>
    </Screen>
  );
}
