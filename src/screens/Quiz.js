import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import TopBar from '../components/TopBar';
import FadeInUp from '../components/FadeInUp';
import CodeBlock from '../components/CodeBlock';
import AnimatedBar from '../components/AnimatedBar';
import Button3D from '../components/Button3D';
import OptionCard from '../components/OptionCard';
import MatchBoard from '../components/MatchBoard';
import FeedbackSheet from '../components/FeedbackSheet';
import LevelUpView from '../components/LevelUpView';
import GameOverView from '../components/GameOverView';
import Mascot from '../components/Mascot';
import { useNav } from '../navigation/NavContext';
import { useGame, gameReducer, getBadges, isUnlocked } from '../state/GameContext';
import { STAGES, LEVELS, flattenStage } from '../data/content';
import { colors, shadow } from '../theme';
import { feedback } from '../services/feedback';

const TOTAL = 5; // jumlah soal per sesi
const START_LEVEL = 1; // mulai dari "Sedang"

export default function Quiz({ params }) {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const { stageId, practice } = params;
  const stage = practice ? null : STAGES.find((x) => x.id === stageId);
  const title = practice ? 'Latihan' : `Stage ${stageId}: ${stage.title}`;
  const shake = useRef(new Animated.Value(0)).current;

  // bank soal untuk sesi ini
  const pool = useMemo(() => {
    if (!practice) return flattenStage(stage);
    const qs = STAGES.filter((x) => isUnlocked(state, x.id)).flatMap((x) => flattenStage(x));
    const weakQs = qs.filter((q) => state.weak.includes(q.concept));
    return weakQs.length >= 3 ? weakQs : qs;
  }, []);
  const total = Math.min(TOTAL, pool.length);

  // pilih soal yang belum dipakai, dengan tingkat paling dekat ke level sekarang
  const pickNext = (lvl, used) => {
    const unused = pool.filter((q) => !used.includes(q.id));
    const src = unused.length ? unused : pool;
    const dist = (q) => Math.abs(q.level - lvl);
    const min = Math.min(...src.map(dist));
    const cands = src.filter((q) => dist(q) === min);
    return cands[Math.floor(Math.random() * cands.length)];
  };

  const makeInitial = () => {
    const q = pickNext(START_LEVEL, []);
    return {
      level: START_LEVEL,
      q,
      used: [q.id],
      index: 0,
      selected: null,
      placed: {},
      picked: null,
      showHint: false,
      result: null,
      pending: null,
      overlay: null,
      cs: 0,
      ws: 0,
      hearts: 3,
      xp: 0,
      correct: 0,
      wrongCount: 0,
      hadStreak3: false,
      weak: [],
      cleared: [],
    };
  };
  const [s, setS] = useState(makeInitial);
  const patch = (p) => setS((prev) => ({ ...prev, ...p }));

  const confirmExit = () =>
    Alert.alert('Keluar dari kuis?', 'Progres kuis ini tidak akan disimpan.', [
      { text: 'Lanjut belajar', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => nav.back() },
    ]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit();
      return true;
    });
    return () => sub.remove();
  }, []);

  const q = s.q;
  const canSubmit =
    q.type === 'choice' ? s.selected !== null : Object.keys(s.placed).length === q.slots.length;

  const submit = () => {
    const ok =
      q.type === 'choice'
        ? s.selected === q.answer
        : q.slots.every((_, i) => s.placed[i] === q.answer[i]);
    let { cs, ws, level, hearts, xp, correct, wrongCount, hadStreak3 } = s;
    let weak = s.weak.filter((c) => c !== q.concept);
    let cleared = s.cleared.filter((c) => c !== q.concept);
    let up = false;
    let down = false;
    let streakShown = 0;

    if (ok) {
      feedback.correct();
      cs += 1;
      ws = 0;
      xp += 10;
      correct += 1;
      cleared = [...cleared, q.concept];
      streakShown = cs;
      if (cs >= 3) {
        hadStreak3 = true;
        if (level < 2) {
          up = true;
          level += 1;
        }
        cs = 0;
      }
    } else {
      feedback.wrong();
      ws += 1;
      cs = 0;
      wrongCount += 1;
      weak = [...weak, q.concept];
      if (!practice) hearts -= 1;
      if (ws >= 2) {
        if (level > 0) {
          down = true;
          level -= 1;
        }
        ws = 0;
      }
      Animated.sequence(
        [10, -10, 8, -8, 4, 0].map((v) =>
          Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true })
        )
      ).start();
    }

    let info;
    if (ok) {
      let text = q.explanation;
      if (streakShown === 3)
        text = up
          ? 'Benar 3 kali berturut-turut. Kamu siap naik tingkat!'
          : 'Benar 3 kali berturut-turut. Kamu sudah di tingkat tertinggi!';
      else if (streakShown === 2 && level < 2)
        text = 'Benar 2 kali berturut-turut. Satu lagi untuk naik tingkat.';
      info = { ok: true, title: 'Benar! +10 XP', text };
    } else {
      const extra = down
        ? ` Salah 2 kali berturut-turut: soal turun ke tingkat ${LEVELS[level].label}.`
        : '';
      info = {
        ok: false,
        title: practice ? 'Kurang tepat.' : 'Kurang tepat. Nyawa -1',
        text: q.explanation + extra,
      };
    }

    patch({
      result: info,
      pending: { up, over: !practice && hearts <= 0, from: s.level, to: level },
      cs,
      ws,
      level,
      hearts,
      xp,
      correct,
      wrongCount,
      hadStreak3,
      weak,
      cleared,
    });
  };

  const finish = () => {
    feedback.complete();
    const score = Math.round((s.correct / total) * 100);
    const xpGain = s.xp + (practice ? 0 : 20); // +20 bonus menyelesaikan stage
    const action = {
      type: 'COMPLETE',
      stageId: practice ? null : stageId,
      practice: !!practice,
      title,
      score,
      xp: xpGain,
      hearts: s.hearts,
      perfect: s.wrongCount === 0,
      streak3: s.hadStreak3,
      wrong: s.weak,
      cleared: s.cleared,
    };
    const before = getBadges(state);
    const after = getBadges(gameReducer(state, action));
    const newBadges = after.filter((b, i) => b.unlocked && !before[i].unlocked).map((b) => b.desc);
    dispatch(action);
    nav.replace('StageComplete', {
      stageId,
      practice: !!practice,
      score,
      xp: xpGain,
      hearts: s.hearts,
      weak: s.weak,
      newBadges,
    });
  };

  const advance = () => {
    if (s.index + 1 >= total) return finish();
    const next = pickNext(s.level, s.used);
    setS((prev) => ({
      ...prev,
      result: null,
      overlay: null,
      pending: null,
      q: next,
      used: [...prev.used, next.id],
      index: prev.index + 1,
      selected: null,
      placed: {},
      picked: null,
      showHint: false,
    }));
  };

  const onContinue = () => {
    const p = s.pending;
    if (p.over) {
      feedback.gameOver();
      dispatch({ type: 'GAME_OVER', title });
      patch({ result: null, overlay: 'gameover' });
    } else if (p.up) {
      feedback.levelUp();
      patch({ result: null, overlay: 'levelup' });
    } else {
      advance();
    }
  };

  const retry = () => {
    dispatch({ type: 'SET_HEARTS', hearts: 3 });
    nav.replace('Materi', { stageId, page: 0 });
  };

  // match: ketuk potongan atau seret-lepas ke kotak
  const tapPiece = (i) => {
    if (!s.result) patch({ picked: s.picked === i ? null : i });
  };
  const tapSlot = (slot) => {
    if (s.result) return;
    if (s.placed[slot] !== undefined) {
      const rest = { ...s.placed };
      delete rest[slot];
      patch({ placed: rest, picked: null });
    } else if (s.picked !== null) {
      patch({ placed: { ...s.placed, [slot]: s.picked }, picked: null });
    }
  };
  const placeDirect = (slot, pieceIdx) => {
    if (s.result) return;
    patch({ placed: { ...s.placed, [slot]: pieceIdx }, picked: null });
  };

  const toggleHint = () => {
    feedback.tap();
    patch({ showHint: !s.showHint });
  };

  const lvl = LEVELS[q.level];
  const slotOk =
    s.result && q.type === 'match' ? q.slots.map((_, i) => s.placed[i] === q.answer[i]) : null;
  const progress = Math.max(0.05, (s.index + (s.result ? 1 : 0)) / total);
  const hintText =
    q.hint ||
    `Perhatikan kembali konsep "${q.concept}" sebelum memilih jawaban yang paling tepat.`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen>
        <TopBar onBack={confirmExit} hearts={s.hearts} xp={s.xp} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AnimatedBar progress={progress} style={{ flex: 1 }} />
          <Pressable
            onPress={toggleHint}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: s.showHint ? colors.yellow : '#fff',
                borderRadius: 14,
                paddingHorizontal: 11,
                paddingVertical: 6,
              },
              shadow,
            ]}
          >
            <Ionicons name="bulb" size={16} color={colors.amber} />
            <T weight="bold" style={{ fontSize: 13, marginLeft: 4, color: colors.navy }}>
              Tanya Atik
            </T>
          </Pressable>
          <View
            style={{
              backgroundColor: lvl.bg,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 6,
            }}
          >
            <T weight="bold" style={{ fontSize: 15 }}>
              {lvl.label.toUpperCase()}
            </T>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: s.result ? 260 : 20 }}
        >
          {/* Balon Petunjuk Kontekstual dari Maskot Atik */}
          {s.showHint || (s.ws >= 1 && !s.result) ? (
            <FadeInUp>
              <View
                style={[
                  {
                    backgroundColor: colors.yellow,
                    borderRadius: 24,
                    padding: 14,
                    marginBottom: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                  shadow,
                ]}
              >
                <Mascot size={46} style={{ marginRight: 12, marginTop: -4 }} />
                <View style={{ flex: 1 }}>
                  <T weight="bold" style={{ fontSize: 14, color: colors.navy }}>
                    Petunjuk dari Atik:
                  </T>
                  <T weight="semi" style={{ fontSize: 15, lineHeight: 21, marginTop: 2 }}>
                    {hintText}
                  </T>
                </View>
              </View>
            </FadeInUp>
          ) : null}

          <Animated.View key={`${s.index}-${q.id}`} style={{ transform: [{ translateX: shake }] }}>
            <FadeInUp>
              <T weight="bold" style={{ fontSize: 28, lineHeight: 36, marginBottom: 16 }}>
                {q.prompt}
              </T>
            </FadeInUp>
            {q.code ? (
              <FadeInUp delay={60}>
                <CodeBlock code={q.code} size={18} style={{ marginBottom: 16 }} />
              </FadeInUp>
            ) : null}
            {q.type === 'choice' ? (
              q.options.map((opt, i) => {
                let st = s.selected === i ? 'selected' : 'idle';
                if (s.result)
                  st = i === q.answer ? 'correct' : i === s.selected ? 'wrong' : 'idle';
                return (
                  <FadeInUp key={i} delay={100 + i * 70} distance={12}>
                    <OptionCard
                      letter={'ABCD'[i]}
                      label={opt}
                      mono={q.mono}
                      state={st}
                      onPress={() => {
                        if (!s.result) {
                          feedback.tap();
                          patch({ selected: i });
                        }
                      }}
                    />
                  </FadeInUp>
                );
              })
            ) : (
              <MatchBoard
                pieces={q.pieces}
                slots={q.slots}
                placed={s.placed}
                picked={s.picked}
                slotOk={slotOk}
                onPiece={tapPiece}
                onSlot={tapSlot}
                onPlaceDirect={placeDirect}
              />
            )}
          </Animated.View>
        </ScrollView>

        {!s.result ? (
          <Button3D title="Periksa Jawaban" disabled={!canSubmit} onPress={submit} />
        ) : null}
      </Screen>

      {s.result ? (
        <FeedbackSheet
          ok={s.result.ok}
          title={s.result.title}
          text={s.result.text}
          label={s.result.ok ? 'Lanjut' : 'Mengerti'}
          onPress={onContinue}
        />
      ) : null}
      {s.overlay === 'levelup' ? (
        <LevelUpView from={s.pending.from} to={s.pending.to} onContinue={advance} />
      ) : null}
      {s.overlay === 'gameover' ? (
        <GameOverView onRetry={retry} onHome={() => nav.reset('Home')} />
      ) : null}
    </View>
  );
}
