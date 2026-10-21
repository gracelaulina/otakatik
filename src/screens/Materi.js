import React from 'react';
import { ScrollView, View } from 'react-native';
import Screen from '../components/Screen';
import T from '../components/T';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import CodeBlock from '../components/CodeBlock';
import AnimatedBar from '../components/AnimatedBar';
import Button3D from '../components/Button3D';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { STAGES } from '../data/content';
import { colors } from '../theme';

export default function Materi({ params }) {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const { stageId, page } = params;
  const stage = STAGES.find((s) => s.id === stageId);
  const item = stage.materi[page];
  const last = page === stage.materi.length - 1;

  const next = () => {
    if (last) {
      dispatch({ type: 'SET_POSITION', stageId, step: 'quiz' });
      nav.replace('Quiz', { stageId });
    } else {
      nav.replace('Materi', { stageId, page: page + 1 });
    }
  };

  return (
    <Screen>
      <TopBar onBack={nav.back} hearts={state.hearts} xp={0} />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {stage.materi.map((_, i) => (
          <AnimatedBar key={i} progress={i <= page ? 1 : 0} height={8} style={{ flex: 1 }} />
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <FadeInUp>
          <T weight="bold" style={{ color: colors.slate, fontSize: 18 }}>
            Stage {stage.id} · Materi {page + 1} dari {stage.materi.length}
          </T>
          <T weight="bold" style={{ fontSize: 38, marginTop: 8, marginBottom: 14 }}>{item.title}</T>
        </FadeInUp>
        <FadeInUp delay={90}>
          <T weight="semi" style={{ fontSize: 20, lineHeight: 32, marginBottom: 18 }}>{item.body}</T>
        </FadeInUp>
        <FadeInUp delay={180}>
          <CodeBlock code={item.code} size={21} />
        </FadeInUp>
        <FadeInUp delay={270}>
          <View style={{ backgroundColor: colors.yellow, borderRadius: 26, padding: 20, marginTop: 18 }}>
            <T weight="semi" style={{ fontSize: 18, lineHeight: 26 }}>
              <T weight="bold">Tips:</T> {item.tip}
            </T>
          </View>
        </FadeInUp>
      </ScrollView>
      <Button3D title={last ? 'Lanjut ke Kuis' : 'Lanjut'} onPress={next} />
    </Screen>
  );
}
