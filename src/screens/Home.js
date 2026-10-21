import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import PressableScale from '../components/PressableScale';
import Button3D from '../components/Button3D';
import { useNav } from '../navigation/NavContext';
import { useGame, getResume } from '../state/GameContext';
import { colors } from '../theme';

export default function Home() {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const { stage, step } = getResume(state);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const resume = () => {
    dispatch({ type: 'SET_HEARTS', hearts: 3 });
    if (step === 'quiz') nav.push('Quiz', { stageId: stage.id });
    else nav.push('Materi', { stageId: stage.id, page: 0 });
  };

  const name = state.user ? state.user.name : 'Teman';

  return (
    <Screen padBottom={100}>
      <TopBar hearts={state.hearts} xp={state.xp} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <FadeInUp>
          <T weight="bold" style={{ fontSize: 40, marginBottom: 16 }}>Halo, {name}!</T>
        </FadeInUp>

        <FadeInUp delay={80}>
          <PressableScale onPress={resume} style={{ backgroundColor: colors.yellow, borderRadius: 28, paddingHorizontal: 22, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <T weight="bold" style={{ fontSize: 22 }}>Lanjutkan belajar</T>
              <T weight="semi" style={{ fontSize: 17, marginTop: 2 }}>
                Stage {stage.id}: {stage.title} · {step === 'quiz' ? 'Kuis' : 'Materi'}
              </T>
            </View>
            <Ionicons name="play" size={30} color={colors.navy} />
          </PressableScale>
        </FadeInUp>

        <FadeInUp delay={160}>
          <View style={{ backgroundColor: colors.sky, borderRadius: 34, paddingVertical: 28, alignItems: 'center', marginTop: 16 }}>
            <Mascot size={150} />
            <T weight="bold" style={{ fontSize: 26, marginVertical: 14 }}>Ayo Otak-Atik Kodemu!</T>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <Button3D
                variant="navy"
                radius={42}
                depth={6}
                onPress={() => nav.push('StageSelect')}
                faceStyle={{ width: 84, height: 84, paddingVertical: 0 }}
              >
                <Ionicons name="play" size={36} color="#fff" style={{ marginLeft: 4 }} />
              </Button3D>
            </Animated.View>
          </View>
        </FadeInUp>

        <FadeInUp delay={240} style={{ flexDirection: 'row', gap: 14, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <PressableScale onPress={() => nav.push('Quiz', { practice: true })} style={{ backgroundColor: colors.pink, borderRadius: 28, padding: 22 }}>
              <T weight="bold" style={{ fontSize: 22 }}>Latihan</T>
              <T weight="semi" style={{ fontSize: 16, marginTop: 4 }}>Ulangi konsep</T>
            </PressableScale>
          </View>
          <View style={{ flex: 1 }}>
            <PressableScale onPress={() => nav.push('History')} style={{ backgroundColor: colors.lavender, borderRadius: 28, padding: 22 }}>
              <T weight="bold" style={{ fontSize: 22 }}>Riwayat</T>
              <T weight="semi" style={{ fontSize: 16, marginTop: 4 }}>Percobaanmu</T>
            </PressableScale>
          </View>
        </FadeInUp>
      </ScrollView>
    </Screen>
  );
}
