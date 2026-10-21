import React from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import PopIn from '../components/PopIn';
import FadeInUp from '../components/FadeInUp';
import CountUp from '../components/CountUp';
import Confetti from '../components/Confetti';
import Button3D from '../components/Button3D';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { STAGES } from '../data/content';
import { colors } from '../theme';

function Star({ filled, size, delay, style }) {
  return (
    <PopIn delay={delay} style={style}>
      <Ionicons name="star" size={size} color={filled ? colors.amber : '#D3E1F3'} />
    </PopIn>
  );
}

function Stat({ children, label }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 26, paddingVertical: 18, alignItems: 'center' }}>
      {children}
      <T weight="semi" style={{ color: colors.slate, fontSize: 16 }}>{label}</T>
    </View>
  );
}

export default function StageComplete({ params }) {
  const nav = useNav();
  const { dispatch } = useGame();
  const { stageId, practice, score, xp, hearts, weak, newBadges } = params;
  const stars = score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0;
  const hasNext = !practice && STAGES.some((s) => s.id === stageId + 1);

  const goStage = (id) => {
    dispatch({ type: 'SET_HEARTS', hearts: 3 });
    nav.replace('Materi', { stageId: id, page: 0 });
  };

  const primary = practice
    ? { label: 'Latihan Lagi', onPress: () => nav.replace('Quiz', { practice: true }) }
    : hasNext
    ? { label: 'Stage Berikutnya', onPress: () => goStage(stageId + 1) }
    : { label: 'Kembali ke Beranda', onPress: () => nav.reset('Home') };
  const secondary = practice
    ? { label: 'Kembali ke Beranda', onPress: () => nav.reset('Home') }
    : { label: 'Ulangi Stage', onPress: () => goStage(stageId) };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 8 }}>
            <Star filled={stars >= 1} size={64} delay={200} style={{ marginTop: 28 }} />
            <Star filled={stars >= 2} size={92} delay={400} />
            <Star filled={stars >= 3} size={64} delay={600} style={{ marginTop: 28 }} />
          </View>
          <FadeInUp delay={300}>
            <T weight="bold" style={{ fontSize: 40, textAlign: 'center', marginVertical: 16 }}>{practice ? 'Latihan Selesai!' : 'Stage Selesai!'}</T>
          </FadeInUp>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Stat label="Skor"><CountUp to={score} style={{ fontSize: 36 }} /></Stat>
            <Stat label="XP"><CountUp to={xp} prefix="+" style={{ fontSize: 36, color: '#E08A00' }} /></Stat>
            <Stat label="Nyawa"><T weight="bold" style={{ fontSize: 36, color: '#E0506A' }}>{hearts}/3</T></Stat>
          </View>
          <FadeInUp delay={700}>
            {weak.length ? (
              <View style={{ backgroundColor: colors.lavender, borderRadius: 26, padding: 20, marginTop: 16 }}>
                <T weight="bold" style={{ fontSize: 18 }}>Perlu diulang</T>
                <T weight="semi" style={{ fontSize: 20, marginTop: 4 }}>{weak.join(', ')}</T>
              </View>
            ) : (
              <View style={{ backgroundColor: colors.mint, borderRadius: 26, padding: 20, marginTop: 16 }}>
                <T weight="bold" style={{ fontSize: 18 }}>Mantap!</T>
                <T weight="semi" style={{ fontSize: 20, marginTop: 4 }}>Semua konsep sudah aman</T>
              </View>
            )}
          </FadeInUp>
          {newBadges.length ? (
            <FadeInUp delay={850}>
              <View style={{ backgroundColor: colors.yellow, borderRadius: 26, padding: 20, marginTop: 14 }}>
                <T weight="bold" style={{ fontSize: 18 }}>Pencapaian baru</T>
                {newBadges.map((b) => (
                  <T key={b} weight="semi" style={{ fontSize: 20, marginTop: 4 }}>{b}</T>
                ))}
              </View>
            </FadeInUp>
          ) : null}
        </ScrollView>
        <Button3D title={primary.label} onPress={primary.onPress} style={{ marginBottom: 12 }} />
        <Button3D title={secondary.label} variant="white" onPress={secondary.onPress} />
      </Screen>
      {stars >= 2 ? <Confetti originY={0.17} /> : null}
    </View>
  );
}
