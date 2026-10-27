import React from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import MemorySim from '../components/MemorySim';
import AnimatedBar from '../components/AnimatedBar';
import Button3D from '../components/Button3D';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { STAGES } from '../data/content';
import { colors, shadow } from '../theme';
import { feedback } from '../services/feedback';

export default function Materi({ params }) {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const { stageId, page } = params;
  const stage = STAGES.find((s) => s.id === stageId);
  const item = stage.materi[page];
  const last = page === stage.materi.length - 1;

  const prev = () => {
    feedback.tap();
    if (page > 0) {
      nav.replace('Materi', { stageId, page: page - 1 });
    } else {
      nav.back();
    }
  };

  const next = () => {
    feedback.tap();
    if (last) {
      dispatch({ type: 'SET_POSITION', stageId, step: 'quiz' });
      nav.replace('Quiz', { stageId });
    } else {
      nav.replace('Materi', { stageId, page: page + 1 });
    }
  };

  return (
    <Screen>
      <TopBar onBack={prev} hearts={state.hearts} xp={state.xp} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {stage.materi.map((_, i) => (
          <AnimatedBar key={i} progress={i <= page ? 1 : 0} height={8} style={{ flex: 1 }} />
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <FadeInUp>
          <T weight="bold" style={{ color: colors.slate, fontSize: 17 }}>
            Stage {stage.id} · Materi {page + 1} dari {stage.materi.length}
          </T>
          <T weight="bold" style={{ fontSize: 34, marginTop: 6, marginBottom: 12, lineHeight: 40 }}>
            {item.title}
          </T>
        </FadeInUp>

        <FadeInUp delay={80}>
          <T weight="semi" style={{ fontSize: 18, lineHeight: 28, marginBottom: 16 }}>
            {item.body}
          </T>
        </FadeInUp>

        <FadeInUp delay={150}>
          <MemorySim code={item.code} sim={item.sim} />
        </FadeInUp>

        {item.tip ? (
          <FadeInUp delay={220}>
            <View style={{ backgroundColor: colors.yellow, borderRadius: 24, padding: 18, marginTop: 16 }}>
              <T weight="semi" style={{ fontSize: 17, lineHeight: 25 }}>
                <T weight="bold">Tips:</T> {item.tip}
              </T>
            </View>
          </FadeInUp>
        ) : null}

        {item.summary ? (
          <FadeInUp delay={290}>
            <View
              style={[
                {
                  backgroundColor: '#fff',
                  borderRadius: 26,
                  padding: 20,
                  marginTop: 16,
                  borderWidth: 2,
                  borderColor: stage.color,
                },
                shadow,
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="bookmark" size={22} color={colors.blue} />
                <T weight="bold" style={{ fontSize: 19, marginLeft: 8 }}>
                  Rangkuman Stage {stage.id}
                </T>
              </View>
              {item.summary.map((point, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.green} style={{ marginTop: 2, marginRight: 10 }} />
                  <T weight="semi" style={{ fontSize: 16, lineHeight: 23, flex: 1 }}>
                    {point}
                  </T>
                </View>
              ))}
            </View>
          </FadeInUp>
        ) : null}
      </ScrollView>

      <Button3D title={last ? 'Lanjut ke Kuis' : 'Lanjut'} onPress={next} />
    </Screen>
  );
}
