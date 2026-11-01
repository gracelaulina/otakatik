import React, { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame, isUnlocked } from '../state/GameContext';
import { STAGES, LEVELS } from '../data/content';
import { colors, shadow } from '../theme';
import { feedback } from '../services/feedback';

function StageCard({ stage, index, unlocked, comp, expanded, onToggle, onPickTier }) {
  const shake = useRef(new Animated.Value(0)).current;
  const done = !!comp;
  const tiersDone = comp && comp.tiers ? comp.tiers : {};

  const press = () => {
    feedback.tap();
    if (unlocked) return onToggle();
    Animated.sequence(
      [8, -8, 6, -6, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 50, useNativeDriver: true }))
    ).start();
  };

  const tone = unlocked ? colors.navy : colors.slate;

  return (
    <FadeInUp delay={100 + index * 90}>
      <Animated.View
        style={{
          transform: [{ translateX: shake }],
          backgroundColor: stage.color,
          opacity: unlocked ? 1 : 0.85,
          borderRadius: 32,
          padding: 16,
          marginBottom: 14,
        }}
      >
        <Pressable onPress={press} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              backgroundColor: unlocked ? '#fff' : 'rgba(255,255,255,0.7)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {done ? (
              <Ionicons name="checkmark" size={36} color={colors.green} />
            ) : unlocked ? (
              <T weight="bold" style={{ fontSize: 32 }}>{stage.id}</T>
            ) : (
              <Ionicons name="lock-closed" size={28} color="#7A86B5" />
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 14, marginRight: 8 }}>
            <T weight="bold" numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 23, color: tone }}>
              {stage.title}
            </T>
            <T weight="semi" style={{ fontSize: 15, color: tone, marginTop: 2 }}>
              {stage.subtitle}
            </T>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <T weight="bold" style={{ fontSize: 15, color: tone }}>
              {done ? 'Selesai' : unlocked ? 'Terbuka' : 'Terkunci'}
            </T>
            {unlocked ? (
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={tone}
                style={{ marginTop: 4 }}
              />
            ) : null}
          </View>
        </Pressable>

        {unlocked && expanded ? (
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1.5, borderTopColor: 'rgba(27,26,94,0.1)' }}>
            <T weight="bold" style={{ fontSize: 14, color: colors.navy, marginBottom: 10 }}>
              Pilih Tingkatan Materi & Latihan:
            </T>
            {LEVELS.map((lv) => {
              const isTierDone = !!tiersDone[lv.key];
              const countMateri = stage.materi.filter((m) => m.level === lv.key).length;
              const countQ = (stage.questions[lv.key] || []).length;
              return (
                <Pressable
                  key={lv.key}
                  onPress={() => {
                    feedback.tap();
                    onPickTier(lv.key);
                  }}
                  style={[
                    {
                      backgroundColor: '#fff',
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                    shadow,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: lv.bg,
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginRight: 12,
                      }}
                    >
                      <T weight="bold" style={{ fontSize: 13 }}>{lv.label}</T>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T weight="bold" style={{ fontSize: 15 }}>{lv.subtitle}</T>
                      <T weight="semi" style={{ fontSize: 13, color: colors.slate }}>
                        {countMateri} Materi · {countQ} Soal
                      </T>
                    </View>
                  </View>
                  <Ionicons
                    name={isTierDone ? 'checkmark-circle' : 'play-circle'}
                    size={26}
                    color={isTierDone ? colors.green : colors.blue}
                  />
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                feedback.tap();
                onPickTier(null);
              }}
              style={{
                backgroundColor: colors.navy,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginTop: 2,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flash" size={18} color={colors.amber} />
                <T weight="bold" style={{ fontSize: 15, color: '#fff', marginLeft: 8 }}>
                  Semua Tingkatan (Mode Adaptif)
                </T>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        ) : null}
      </Animated.View>
    </FadeInUp>
  );
}

export default function StageSelect() {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const [expandedId, setExpandedId] = useState(1);

  const openTier = (stageId, tier) => {
    dispatch({ type: 'SET_HEARTS', hearts: 3 });
    dispatch({ type: 'SET_POSITION', stageId, step: 'materi' });
    nav.push('Materi', { stageId, page: 0, tier });
  };

  return (
    <Screen padBottom={100}>
      <TopBar onBack={nav.back} hearts={state.hearts} xp={state.xp} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <FadeInUp>
          <T weight="bold" style={{ fontSize: 40 }}>Pilih Stage</T>
          <T weight="semi" style={{ color: colors.slate, fontSize: 18, marginTop: 6, marginBottom: 18, lineHeight: 26 }}>
            Ketuk stage untuk memilih tingkatan Mudah, Menengah, atau Susah.
          </T>
        </FadeInUp>
        {STAGES.map((s, i) => (
          <StageCard
            key={s.id}
            stage={s}
            index={i}
            unlocked={isUnlocked(state, s.id)}
            comp={state.completed[s.id]}
            expanded={expandedId === s.id}
            onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
            onPickTier={(tier) => openTier(s.id, tier)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}
