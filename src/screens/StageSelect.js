import React, { useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame, isUnlocked } from '../state/GameContext';
import { STAGES } from '../data/content';
import { colors } from '../theme';

function StageCard({ stage, index, unlocked, done, onOpen }) {
  const shake = useRef(new Animated.Value(0)).current;
  const press = () => {
    if (unlocked) return onOpen();
    Animated.sequence([8, -8, 6, -6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 50, useNativeDriver: true }))).start();
  };
  const tone = unlocked ? colors.navy : colors.slate;
  return (
    <FadeInUp delay={100 + index * 90}>
      <Pressable onPress={press}>
        <Animated.View
          style={{
            transform: [{ translateX: shake }],
            backgroundColor: stage.color,
            opacity: unlocked ? 1 : 0.85,
            borderRadius: 32,
            padding: 16,
            marginBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: unlocked ? '#fff' : 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' }}>
            {done ? (
              <Ionicons name="checkmark" size={38} color={colors.green} />
            ) : unlocked ? (
              <T weight="bold" style={{ fontSize: 34 }}>{stage.id}</T>
            ) : (
              <Ionicons name="lock-closed" size={30} color="#7A86B5" />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <T weight="bold" style={{ fontSize: 26, color: tone }}>{stage.title}</T>
            <T weight="semi" style={{ fontSize: 17, color: tone }}>{stage.subtitle}</T>
          </View>
          <T weight="bold" style={{ fontSize: 17, color: tone, marginRight: 8 }}>{done ? 'Selesai' : unlocked ? 'Terbuka' : 'Terkunci'}</T>
        </Animated.View>
      </Pressable>
    </FadeInUp>
  );
}

export default function StageSelect() {
  const nav = useNav();
  const { state, dispatch } = useGame();

  const open = (stageId) => {
    dispatch({ type: 'SET_HEARTS', hearts: 3 });
    dispatch({ type: 'SET_POSITION', stageId, step: 'materi' });
    nav.push('Materi', { stageId, page: 0 });
  };

  return (
    <Screen padBottom={100}>
      <TopBar onBack={nav.back} hearts={state.hearts} xp={state.xp} />
      <FadeInUp>
        <T weight="bold" style={{ fontSize: 40 }}>Pilih Stage</T>
        <T weight="semi" style={{ color: colors.slate, fontSize: 18, marginTop: 6, marginBottom: 18, lineHeight: 26 }}>
          Selesaikan satu stage untuk membuka berikutnya.
        </T>
      </FadeInUp>
      {STAGES.map((s, i) => (
        <StageCard key={s.id} stage={s} index={i} unlocked={isUnlocked(state, s.id)} done={!!state.completed[s.id]} onOpen={() => open(s.id)} />
      ))}
    </Screen>
  );
}
