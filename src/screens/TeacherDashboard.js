import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import Button3D from '../components/Button3D';
import FadeInUp from '../components/FadeInUp';
import { BackButton } from '../components/TopBar';
import { useNav } from '../navigation/NavContext';
import { levelFromXp } from '../state/GameContext';
import {
  STAGES,
  LEVELS,
  DEFAULT_QUESTION_BANK,
  getQuestionBank,
  applyQuestionBank,
} from '../data/content';
import {
  loadQuestionBank,
  saveQuestionBank,
  fetchLeaderboard,
} from '../services/firebase';
import { colors, fonts, shadow } from '../theme';
import { feedback } from '../services/feedback';

const webNoOutline = Platform.OS === 'web' ? { outlineStyle: 'none' } : {};
const DATA_TYPES = ['String', 'Integer', 'Boolean'];

const emptyStep = (idx = 0) => ({
  line: idx,
  desc: '',
  output: '',
  boxes: [{ name: '', value: '', prevValue: '', type: 'String', updated: true }],
});

export default function TeacherDashboard() {
  const nav = useNav();
  const [activeTab, setActiveTab] = useState('materi'); // 'materi' | 'questions' | 'students'
  const [stageId, setStageId] = useState(1);
  const [tierKey, setTierKey] = useState('mudah');
  const [bank, setBank] = useState(() => getQuestionBank());
  const [syncMsg, setSyncMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // State Modal Materi + Simulasi Manual
  const [materiModalOpen, setMateriModalOpen] = useState(false);
  const [editMateriIdx, setEditMateriIdx] = useState(null);
  const [mTitle, setMTitle] = useState('');
  const [mBody, setMBody] = useState('');
  const [mCode, setMCode] = useState('');
  const [mTip, setMTip] = useState('');
  const [useSim, setUseSim] = useState(false);
  const [simTitle, setSimTitle] = useState('Simulasi Kotak Memori');
  const [simSteps, setSimSteps] = useState([emptyStep(0)]);
  const [materiFormError, setMateriFormError] = useState('');

  // State Modal Soal (Pilihan Ganda & Drag-and-Drop Pasangan)
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [qType, setQType] = useState('choice');
  const [concept, setConcept] = useState('');
  const [prompt, setPrompt] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOpt, setCorrectOpt] = useState(0);
  const [matchPairs, setMatchPairs] = useState([
    { slot: 'Baris 1', piece: '' },
    { slot: 'Baris 2', piece: '' },
  ]);
  const [hint, setHint] = useState('');
  const [explanation, setExplanation] = useState('');
  const [formError, setFormError] = useState('');

  // State Rekap Siswa
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    loadQuestionBank().then((cloudBank) => {
      if (mounted && cloudBank) {
        applyQuestionBank(cloudBank);
        setBank(getQuestionBank());
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      setLoadingStudents(true);
      fetchLeaderboard()
        .then((list) => {
          if (list) setStudents(list);
        })
        .finally(() => setLoadingStudents(false));
    }
  }, [activeTab]);

  const currentStage = STAGES.find((s) => s.id === stageId) || STAGES[0];
  const allStageMateri = bank[String(stageId)]?.materi || [];
  const currentTierMateri = allStageMateri
    .map((m, realIdx) => ({ ...m, realIdx }))
    .filter((m) => (m.level || 'mudah') === tierKey);
  const currentQuestions = bank[String(stageId)]?.[tierKey] || [];

  const persistBank = async (nextBank, msg = 'Tersimpan ke Firebase!') => {
    setSaving(true);
    setBank(nextBank);
    applyQuestionBank(nextBank);
    try {
      await saveQuestionBank(nextBank);
      feedback.correct();
      setSyncMsg(msg);
      setTimeout(() => setSyncMsg(''), 2600);
    } catch {
      setSyncMsg('Tersimpan di perangkat.');
    } finally {
      setSaving(false);
    }
  };

  // === HANDLER MATERI & SIMULASI ===
  const openAddMateriModal = () => {
    feedback.tap();
    setEditMateriIdx(null);
    setMTitle('');
    setMBody('');
    setMCode('');
    setMTip('');
    setUseSim(false);
    setSimTitle('Simulasi Kotak Memori');
    setSimSteps([emptyStep(0)]);
    setMateriFormError('');
    setMateriModalOpen(true);
  };

  const openEditMateriModal = (m) => {
    feedback.tap();
    setEditMateriIdx(m.realIdx);
    setMTitle(m.title || '');
    setMBody(m.body || '');
    setMCode(m.code || '');
    setMTip(m.tip || '');
    if (m.sim && Array.isArray(m.sim.steps) && m.sim.steps.length > 0) {
      setUseSim(true);
      setSimTitle(m.sim.title || 'Simulasi Kotak Memori');
      setSimSteps(
        m.sim.steps.map((st) => ({
          line: typeof st.line === 'number' ? st.line : 0,
          desc: st.desc || '',
          output: st.output || '',
          boxes:
            Array.isArray(st.boxes) && st.boxes.length > 0
              ? st.boxes.map((b) => ({
                  name: b.name || '',
                  value: b.value || '',
                  prevValue: b.prevValue || '',
                  type: b.type || 'String',
                  updated: !!b.updated,
                }))
              : [{ name: '', value: '', prevValue: '', type: 'String', updated: true }],
        }))
      );
    } else {
      setUseSim(false);
      setSimTitle('Simulasi Kotak Memori');
      setSimSteps([emptyStep(0)]);
    }
    setMateriFormError('');
    setMateriModalOpen(true);
  };

  const updateStepField = (sIdx, key, val) => {
    setSimSteps((prev) => prev.map((st, i) => (i === sIdx ? { ...st, [key]: val } : st)));
  };

  const updateBoxField = (sIdx, bIdx, key, val) => {
    setSimSteps((prev) =>
      prev.map((st, i) =>
        i === sIdx
          ? {
              ...st,
              boxes: st.boxes.map((bx, j) => (j === bIdx ? { ...bx, [key]: val } : bx)),
            }
          : st
      )
    );
  };

  const addBoxToStep = (sIdx) => {
    setSimSteps((prev) =>
      prev.map((st, i) =>
        i === sIdx
          ? {
              ...st,
              boxes: [
                ...st.boxes,
                { name: '', value: '', prevValue: '', type: 'String', updated: true },
              ],
            }
          : st
      )
    );
  };

  const removeBoxFromStep = (sIdx, bIdx) => {
    setSimSteps((prev) =>
      prev.map((st, i) =>
        i === sIdx && st.boxes.length > 1
          ? { ...st, boxes: st.boxes.filter((_, j) => j !== bIdx) }
          : st
      )
    );
  };

  const handleDeleteMateri = async (realIdx) => {
    if (currentTierMateri.length <= 1) {
      setSyncMsg('Minimal 1 materi harus tersisa di tingkat ini.');
      return;
    }
    feedback.wrong();
    const nextBank = JSON.parse(JSON.stringify(bank));
    nextBank[String(stageId)].materi.splice(realIdx, 1);
    await persistBank(nextBank, 'Materi dihapus.');
  };

  const handleSaveMateri = async () => {
    if (!mTitle.trim() || !mBody.trim()) {
      setMateriFormError('Judul dan penjelasan materi wajib diisi.');
      return;
    }
    if (useSim && !mCode.trim()) {
      setMateriFormError('Isi Contoh Kode terlebih dahulu jika mengaktifkan Simulasi.');
      return;
    }

    let builtSim = undefined;
    if (useSim) {
      const cleanedSteps = simSteps
        .map((st, idx) => {
          const validBoxes = st.boxes
            .filter((b) => b.name.trim() !== '')
            .map((b) => {
              const bx = {
                name: b.name.trim(),
                value: b.value.trim(),
                type: b.type || 'String',
                updated: !!b.updated,
              };
              if (b.prevValue && b.prevValue.trim()) bx.prevValue = b.prevValue.trim();
              return bx;
            });
          if (validBoxes.length === 0 && !st.desc.trim() && !st.output.trim()) return null;
          const stepObj = {
            line: Math.max(0, Number(st.line) || 0),
            desc: st.desc.trim() || `Eksekusi langkah ${idx + 1}`,
            boxes: validBoxes,
          };
          if (st.output && st.output.trim()) stepObj.output = st.output.trim();
          return stepObj;
        })
        .filter(Boolean);

      if (cleanedSteps.length === 0) {
        setMateriFormError('Isi minimal 1 kotak variabel pada langkah simulasi.');
        return;
      }
      builtSim = {
        title: simTitle.trim() || 'Simulasi Kotak Memori',
        steps: cleanedSteps,
      };
    }

    const nextBank = JSON.parse(JSON.stringify(bank));
    const list = nextBank[String(stageId)].materi || [];
    const existing = editMateriIdx !== null ? list[editMateriIdx] : {};

    const builtMateri = {
      ...existing,
      level: tierKey,
      title: mTitle.trim(),
      body: mBody.trim(),
      code: mCode.trim() || undefined,
      tip: mTip.trim() || undefined,
      sim: builtSim,
    };
    if (!builtSim) delete builtMateri.sim;

    if (editMateriIdx !== null) {
      list[editMateriIdx] = builtMateri;
    } else {
      list.push(builtMateri);
    }
    nextBank[String(stageId)].materi = list;
    setMateriModalOpen(false);
    await persistBank(nextBank, editMateriIdx !== null ? 'Materi diperbarui!' : 'Materi ditambahkan!');
  };

  // === HANDLER SOAL (PG & DRAG-AND-DROP) ===
  const openAddModal = () => {
    feedback.tap();
    setEditIdx(null);
    setQType('choice');
    setConcept(`Konsep ${currentStage.title}`);
    setPrompt('');
    setCodeSnippet('');
    setOptions(['', '', '', '']);
    setCorrectOpt(0);
    setMatchPairs([
      { slot: 'Baris 1', piece: '' },
      { slot: 'Baris 2', piece: '' },
      { slot: 'Baris 3', piece: '' },
    ]);
    setHint('');
    setExplanation('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (q, idx) => {
    feedback.tap();
    setEditIdx(idx);
    setQType(q.type || 'choice');
    setConcept(q.concept || '');
    setPrompt(q.prompt || '');
    setCodeSnippet(q.code || '');
    if (q.type === 'match' && Array.isArray(q.pieces) && Array.isArray(q.answer)) {
      const pairs = (q.slots || []).map((slotLabel, sIdx) => ({
        slot: slotLabel,
        piece: q.pieces[q.answer[sIdx]] || '',
      }));
      setMatchPairs(
        pairs.length >= 2
          ? pairs
          : [
              { slot: 'Baris 1', piece: '' },
              { slot: 'Baris 2', piece: '' },
            ]
      );
      setOptions(['', '', '', '']);
      setCorrectOpt(0);
    } else {
      const opts = Array.isArray(q.options) ? [...q.options] : ['', '', '', ''];
      while (opts.length < 4) opts.push('');
      setOptions(opts.slice(0, 4));
      setCorrectOpt(typeof q.answer === 'number' ? q.answer : 0);
      setMatchPairs([
        { slot: 'Baris 1', piece: '' },
        { slot: 'Baris 2', piece: '' },
      ]);
    }
    setHint(q.hint || '');
    setExplanation(q.explanation || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleDeleteQuestion = async (idx) => {
    if (currentQuestions.length <= 1) {
      setSyncMsg('Minimal 1 soal harus tersisa di tingkat ini.');
      return;
    }
    feedback.wrong();
    const nextBank = JSON.parse(JSON.stringify(bank));
    nextBank[String(stageId)][tierKey].splice(idx, 1);
    await persistBank(nextBank, 'Soal dihapus.');
  };

  const handleSaveQuestion = async () => {
    if (!prompt.trim()) {
      setFormError('Pertanyaan soal wajib diisi.');
      return;
    }

    const existingQ = editIdx !== null ? currentQuestions[editIdx] : null;
    const newId = existingQ?.id || `g_${stageId}_${tierKey}_${Date.now().toString(36)}`;
    let builtQuestion = {
      id: newId,
      concept: concept.trim() || `Konsep ${currentStage.title}`,
      type: qType,
      prompt: prompt.trim(),
      hint: hint.trim() || 'Perhatikan kembali materi pada stage ini.',
      explanation: explanation.trim() || 'Jawaban ini sesuai dengan aturan dasar pemrograman.',
    };

    if (codeSnippet.trim()) {
      builtQuestion.code = codeSnippet.trim();
    }

    if (qType === 'choice') {
      const cleanOpts = options.map((o) => o.trim());
      if (cleanOpts.some((o) => !o)) {
        setFormError('Keempat pilihan jawaban (A, B, C, D) wajib diisi.');
        return;
      }
      builtQuestion.options = cleanOpts;
      builtQuestion.answer = correctOpt;
    } else {
      const validPairs = matchPairs
        .map((p, i) => ({
          slot: p.slot.trim() || `Baris ${i + 1}`,
          piece: p.piece.trim(),
        }))
        .filter((p) => p.piece.length > 0);

      if (validPairs.length < 2) {
        setFormError('Isi minimal 2 pasangan slot & potongan jawaban.');
        return;
      }

      // Acak urutan potongan (pieces) agar tidak langsung urut saat tampil di siswa
      const indexed = validPairs.map((item, origIdx) => ({ text: item.piece, origIdx }));
      const shuffled = [...indexed].sort((a, b) => a.text.localeCompare(b.text));
      if (shuffled.every((item, i) => item.origIdx === i) && shuffled.length > 1) {
        const tmp = shuffled[0];
        shuffled[0] = shuffled[1];
        shuffled[1] = tmp;
      }

      builtQuestion.slots = validPairs.map((p) => p.slot);
      builtQuestion.pieces = shuffled.map((item) => item.text);
      builtQuestion.answer = validPairs.map((_, origIdx) =>
        shuffled.findIndex((item) => item.origIdx === origIdx)
      );
    }

    const nextBank = JSON.parse(JSON.stringify(bank));
    const list = nextBank[String(stageId)][tierKey];
    if (editIdx !== null) {
      list[editIdx] = builtQuestion;
    } else {
      list.push(builtQuestion);
    }

    setModalOpen(false);
    await persistBank(nextBank, editIdx !== null ? 'Soal diperbarui!' : 'Soal ditambahkan!');
  };

  const handleResetDefault = async () => {
    const cleanDefault = JSON.parse(JSON.stringify(DEFAULT_QUESTION_BANK));
    await persistBank(cleanDefault, 'Dikembalikan ke bawaan asli.');
  };

  const filteredStudents = students.filter((st) => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (st.name || '').toLowerCase().includes(q) ||
      (st.email || '').toLowerCase().includes(q)
    );
  });

  const inputStyle = [
    {
      backgroundColor: colors.bg,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 9,
      fontSize: 14,
      fontFamily: fonts.semi,
      color: colors.navy,
      width: '100%',
      minWidth: 0,
      marginBottom: 10,
    },
    webNoOutline,
  ];

  // Pemilih Stage & Tingkat yang bersih tanpa label teks berlebih
  const renderStageAndTierPicker = (isMateriTab) => (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
        {STAGES.map((st) => {
          const active = stageId === st.id;
          return (
            <Pressable
              key={st.id}
              onPress={() => {
                feedback.tap();
                setStageId(st.id);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: active ? colors.blue : '#fff',
                borderRadius: 16,
                paddingVertical: 10,
                paddingHorizontal: 6,
                alignItems: 'center',
              }}
            >
              <T
                weight="bold"
                style={{ fontSize: 13, color: active ? '#fff' : colors.navy }}
                numberOfLines={1}
              >
                {st.id}. {st.title}
              </T>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {LEVELS.map((lv) => {
          const active = tierKey === lv.key;
          const count = isMateriTab
            ? (bank[String(stageId)]?.materi || []).filter((m) => (m.level || 'mudah') === lv.key)
                .length
            : bank[String(stageId)]?.[lv.key]?.length || 0;
          return (
            <Pressable
              key={lv.key}
              onPress={() => {
                feedback.tap();
                setTierKey(lv.key);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: active ? lv.bg : '#fff',
                borderWidth: active ? 2 : 0,
                borderColor: colors.navy,
                borderRadius: 14,
                paddingVertical: 8,
                paddingHorizontal: 6,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <T weight="bold" style={{ fontSize: 13 }} numberOfLines={1}>
                {lv.label}
              </T>
              <T weight="semi" style={{ fontSize: 11, color: colors.slate }}>
                ({count})
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Screen padBottom={20}>
      {/* Header Minimalis */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <BackButton
          onPress={() => {
            feedback.tap();
            nav.back();
          }}
        />
        <T weight="bold" style={{ fontSize: 22, flex: 1 }} numberOfLines={1}>
          Kelola Materi & Soal
        </T>
      </View>

      {/* 3 Tab Switcher */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 4,
          marginBottom: 12,
        }}
      >
        {[
          { key: 'materi', label: 'Materi', icon: 'book-outline' },
          { key: 'questions', label: 'Soal Kuis', icon: 'help-circle-outline' },
          { key: 'students', label: 'Siswa', icon: 'people-outline' },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                feedback.tap();
                setActiveTab(tab.key);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: active ? colors.navy : 'transparent',
                borderRadius: 16,
                paddingVertical: 9,
                paddingHorizontal: 4,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Ionicons name={tab.icon} size={15} color={active ? '#fff' : colors.navy} />
              <T
                weight="bold"
                style={{ fontSize: 13, color: active ? '#fff' : colors.navy }}
                numberOfLines={1}
              >
                {tab.label}
              </T>
            </Pressable>
          );
        })}
      </View>

      {syncMsg ? (
        <View
          style={{
            backgroundColor: colors.mint,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 7,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="cloud-done" size={15} color={colors.greenDark} />
          <T weight="bold" style={{ fontSize: 12, color: colors.greenDark, flex: 1 }}>
            {syncMsg}
          </T>
        </View>
      ) : null}

      {activeTab === 'materi' ? (
        /* TAB 1: MATERI (KARTU MINIMALIS) */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {renderStageAndTierPicker(true)}

          <Pressable
            onPress={openAddMateriModal}
            style={{
              backgroundColor: colors.blue,
              paddingVertical: 11,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 12,
            }}
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <T weight="bold" style={{ fontSize: 14, color: '#fff' }}>
              Tambah Materi
            </T>
          </Pressable>

          {currentTierMateri.map((m, idx) => (
            <FadeInUp key={m.realIdx} delay={idx * 35}>
              <Pressable
                onPress={() => openEditMateriModal(m)}
                style={[
                  {
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 14,
                    marginBottom: 10,
                  },
                  shadow,
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <View
                        style={{
                          backgroundColor: colors.sky,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 8,
                        }}
                      >
                        <T weight="bold" style={{ fontSize: 11, color: colors.blueDark }}>
                          #{idx + 1}
                        </T>
                      </View>
                      {m.code ? (
                        <View
                          style={{
                            backgroundColor: colors.bg,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderRadius: 8,
                          }}
                        >
                          <T weight="bold" style={{ fontSize: 10, color: colors.slate }}>
                            Kode
                          </T>
                        </View>
                      ) : null}
                      {m.sim ? (
                        <View
                          style={{
                            backgroundColor: colors.mint,
                            paddingHorizontal: 7,
                            paddingVertical: 2,
                            borderRadius: 8,
                          }}
                        >
                          <T weight="bold" style={{ fontSize: 10, color: colors.greenText }}>
                            Simulasi ({m.sim.steps?.length || 0})
                          </T>
                        </View>
                      ) : null}
                    </View>

                    <T weight="bold" style={{ fontSize: 16 }} numberOfLines={1}>
                      {m.title}
                    </T>
                    <T
                      weight="semi"
                      style={{ fontSize: 13, color: colors.slate, marginTop: 2 }}
                      numberOfLines={2}
                    >
                      {m.body}
                    </T>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, flexShrink: 0 }}>
                    <Pressable
                      onPress={() => openEditMateriModal(m)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: colors.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="pencil" size={15} color={colors.blue} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteMateri(m.realIdx)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: colors.redBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.redDark} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </FadeInUp>
          ))}

          <Pressable
            onPress={handleResetDefault}
            disabled={saving}
            style={{ alignItems: 'center', paddingVertical: 12, marginTop: 4 }}
          >
            <T weight="bold" style={{ fontSize: 12, color: colors.slate }}>
              Reset ke Bawaan Asli
            </T>
          </Pressable>
        </ScrollView>
      ) : activeTab === 'questions' ? (
        /* TAB 2: SOAL KUIS (KARTU MINIMALIS) */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {renderStageAndTierPicker(false)}

          <Pressable
            onPress={openAddModal}
            style={{
              backgroundColor: colors.blue,
              paddingVertical: 11,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 12,
            }}
          >
            <Ionicons name="add-circle" size={18} color="#fff" />
            <T weight="bold" style={{ fontSize: 14, color: '#fff' }}>
              Tambah Soal
            </T>
          </Pressable>

          {currentQuestions.map((q, idx) => (
            <FadeInUp key={q.id || idx} delay={idx * 35}>
              <Pressable
                onPress={() => openEditModal(q, idx)}
                style={[
                  {
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 14,
                    marginBottom: 10,
                  },
                  shadow,
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <View
                        style={{
                          backgroundColor: q.type === 'match' ? colors.yellow : colors.sky,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 8,
                        }}
                      >
                        <T weight="bold" style={{ fontSize: 11, color: colors.navy }}>
                          #{idx + 1} • {q.type === 'match' ? 'Drag & Drop' : 'Pilihan Ganda'}
                        </T>
                      </View>
                      <T
                        weight="semi"
                        style={{ fontSize: 11, color: colors.slate, flex: 1 }}
                        numberOfLines={1}
                      >
                        {q.concept}
                      </T>
                    </View>

                    <T weight="bold" style={{ fontSize: 15, lineHeight: 20 }} numberOfLines={2}>
                      {q.prompt}
                    </T>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, flexShrink: 0 }}>
                    <Pressable
                      onPress={() => openEditModal(q, idx)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: colors.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="pencil" size={15} color={colors.blue} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteQuestion(idx)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: colors.redBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.redDark} />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </FadeInUp>
          ))}

          <Pressable
            onPress={handleResetDefault}
            disabled={saving}
            style={{ alignItems: 'center', paddingVertical: 12, marginTop: 4 }}
          >
            <T weight="bold" style={{ fontSize: 12, color: colors.slate }}>
              Reset ke Bawaan Asli
            </T>
          </Pressable>
        </ScrollView>
      ) : (
        /* TAB 3: REKAP SISWA */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <View
              style={[
                { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 14, alignItems: 'center' },
                shadow,
              ]}
            >
              <T weight="bold" style={{ fontSize: 24, color: colors.blue }}>
                {students.length}
              </T>
              <T weight="semi" style={{ fontSize: 12, color: colors.slate }}>
                Siswa
              </T>
            </View>
            <View
              style={[
                { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 14, alignItems: 'center' },
                shadow,
              ]}
            >
              <T weight="bold" style={{ fontSize: 24, color: colors.greenDark }}>
                {students.length
                  ? Math.round(
                      students.reduce((acc, s) => acc + Number(s.xp || 0), 0) / students.length
                    )
                  : 0}{' '}
                XP
              </T>
              <T weight="semi" style={{ fontSize: 12, color: colors.slate }}>
                Rata-rata
              </T>
            </View>
          </View>

          <View
            style={[
              {
                backgroundColor: '#fff',
                borderRadius: 18,
                height: 44,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              },
              shadow,
            ]}
          >
            <Ionicons name="search" size={16} color={colors.slate} />
            <TextInput
              placeholder="Cari siswa..."
              placeholderTextColor={colors.slate}
              value={studentQuery}
              onChangeText={setStudentQuery}
              style={[
                {
                  flex: 1,
                  minWidth: 0,
                  marginLeft: 8,
                  fontSize: 14,
                  fontFamily: fonts.semi,
                  color: colors.navy,
                },
                webNoOutline,
              ]}
            />
          </View>

          {loadingStudents ? (
            <T weight="semi" style={{ textAlign: 'center', color: colors.slate, marginTop: 20 }}>
              Memuat data...
            </T>
          ) : filteredStudents.length === 0 ? (
            <T weight="semi" style={{ textAlign: 'center', color: colors.slate, marginTop: 20 }}>
              Belum ada siswa.
            </T>
          ) : (
            filteredStudents.map((st, idx) => {
              const comp = st.completed || {};
              return (
                <View
                  key={st.id || idx}
                  style={[
                    { backgroundColor: '#fff', borderRadius: 20, padding: 14, marginBottom: 10 },
                    shadow,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ marginRight: 10 }}>
                      <Mascot size={40} bob={false} config={st.mascot || {}} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <T weight="bold" style={{ fontSize: 16 }} numberOfLines={1}>
                        {st.name}
                      </T>
                      <T weight="semi" style={{ fontSize: 12, color: colors.slate }} numberOfLines={1}>
                        {st.email}
                      </T>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                      <T weight="bold" style={{ fontSize: 15, color: colors.blueDark }}>
                        {st.xp || 0} XP
                      </T>
                      <T weight="semi" style={{ fontSize: 11, color: colors.slate }}>
                        Lv.{levelFromXp(st.xp || 0)}
                      </T>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {STAGES.map((s) => {
                      const sc = comp[s.id]?.score;
                      const done = sc !== undefined;
                      return (
                        <View
                          key={s.id}
                          style={{
                            flex: 1,
                            backgroundColor: done ? colors.mint : colors.bg,
                            borderRadius: 10,
                            paddingVertical: 5,
                            alignItems: 'center',
                          }}
                        >
                          <T weight="bold" style={{ fontSize: 11, color: done ? colors.greenText : colors.slate }}>
                            S{s.id}: {done ? `${sc}%` : '-'}
                          </T>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* MODAL MATERI + EDITOR SIMULASI MANUAL BEBAS */}
      <Modal
        visible={materiModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMateriModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(10, 9, 66, 0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 14,
          }}
        >
          <View
            style={[
              {
                backgroundColor: '#fff',
                borderRadius: 26,
                padding: 18,
                width: '100%',
                maxWidth: 460,
                maxHeight: '92%',
                overflow: 'hidden',
              },
              shadow,
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <T weight="bold" style={{ fontSize: 19, marginBottom: 10 }}>
                {editMateriIdx !== null ? 'Ubah Materi' : 'Tambah Materi'}
              </T>

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Judul:
              </T>
              <TextInput
                placeholder="Apa itu Variabel?"
                placeholderTextColor={colors.slate}
                value={mTitle}
                onChangeText={setMTitle}
                style={inputStyle}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Penjelasan:
              </T>
              <TextInput
                placeholder="Isi materi..."
                placeholderTextColor={colors.slate}
                value={mBody}
                onChangeText={setMBody}
                multiline
                style={[...inputStyle, { minHeight: 72 }]}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Contoh Kode (Opsional):
              </T>
              <TextInput
                placeholder={'nama = "Budi"\numur = 16'}
                placeholderTextColor={colors.slate}
                value={mCode}
                onChangeText={setMCode}
                multiline
                style={[...inputStyle, { minHeight: 60, fontFamily: 'monospace' }]}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Tips Singkat (Opsional):
              </T>
              <TextInput
                placeholder="Catatan penting..."
                placeholderTextColor={colors.slate}
                value={mTip}
                onChangeText={setMTip}
                style={inputStyle}
              />

              {/* Toggle Simulasi Kotak Memori Manual */}
              <Pressable
                onPress={() => setUseSim(!useSim)}
                style={{
                  backgroundColor: useSim ? colors.sky : colors.bg,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="hardware-chip-outline" size={18} color={colors.blue} />
                  <T weight="bold" style={{ fontSize: 14 }}>
                    Simulasi Kotak Memori
                  </T>
                </View>
                <T weight="bold" style={{ fontSize: 12, color: useSim ? colors.blueDark : colors.slate }}>
                  {useSim ? 'AKTIF' : 'NONAKTIF'}
                </T>
              </Pressable>

              {useSim ? (
                <View
                  style={{
                    backgroundColor: '#F6F9FE',
                    borderRadius: 18,
                    padding: 12,
                    borderWidth: 1.5,
                    borderColor: colors.sky,
                    marginBottom: 12,
                  }}
                >
                  <T weight="bold" style={{ fontSize: 12, marginBottom: 4 }}>
                    Judul Simulasi:
                  </T>
                  <TextInput
                    placeholder="Simulasi Kotak Memori"
                    placeholderTextColor={colors.slate}
                    value={simTitle}
                    onChangeText={setSimTitle}
                    style={[...inputStyle, { backgroundColor: '#fff' }]}
                  />

                  {simSteps.map((st, sIdx) => (
                    <View
                      key={sIdx}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 14,
                        padding: 10,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: '#E2ECF9',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <T weight="bold" style={{ fontSize: 13, color: colors.blueDark }}>
                          Langkah {sIdx + 1}
                        </T>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <T weight="semi" style={{ fontSize: 12, color: colors.slate }}>
                            Sorot Baris ke-
                          </T>
                          <TextInput
                            value={String((st.line ?? 0) + 1)}
                            onChangeText={(v) => {
                              const num = Math.max(1, parseInt(v || '1', 10) || 1);
                              updateStepField(sIdx, 'line', num - 1);
                            }}
                            keyboardType="number-pad"
                            style={[
                              {
                                width: 38,
                                height: 30,
                                backgroundColor: colors.bg,
                                borderRadius: 8,
                                textAlign: 'center',
                                fontFamily: fonts.bold,
                                fontSize: 13,
                                color: colors.navy,
                              },
                              webNoOutline,
                            ]}
                          />
                          {simSteps.length > 1 ? (
                            <Pressable
                              onPress={() =>
                                setSimSteps((prev) => prev.filter((_, i) => i !== sIdx))
                              }
                              style={{ padding: 4 }}
                            >
                              <Ionicons name="trash-outline" size={15} color={colors.redDark} />
                            </Pressable>
                          ) : null}
                        </View>
                      </View>

                      {/* Daftar Kotak Variabel di Langkah Ini */}
                      <T weight="bold" style={{ fontSize: 11, color: colors.slate, marginBottom: 4 }}>
                        Kotak Variabel:
                      </T>
                      {st.boxes.map((bx, bIdx) => (
                        <View key={bIdx} style={{ marginBottom: 8 }}>
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            <TextInput
                              placeholder="Nama"
                              placeholderTextColor={colors.slate}
                              value={bx.name}
                              onChangeText={(v) => updateBoxField(sIdx, bIdx, 'name', v)}
                              style={[
                                {
                                  flex: 1,
                                  minWidth: 0,
                                  backgroundColor: colors.bg,
                                  borderRadius: 10,
                                  paddingHorizontal: 10,
                                  paddingVertical: 6,
                                  fontSize: 13,
                                  fontFamily: 'monospace',
                                  color: colors.navy,
                                },
                                webNoOutline,
                              ]}
                            />
                            <TextInput
                              placeholder='Nilai ("Budi")'
                              placeholderTextColor={colors.slate}
                              value={bx.value}
                              onChangeText={(v) => updateBoxField(sIdx, bIdx, 'value', v)}
                              style={[
                                {
                                  flex: 1,
                                  minWidth: 0,
                                  backgroundColor: colors.bg,
                                  borderRadius: 10,
                                  paddingHorizontal: 10,
                                  paddingVertical: 6,
                                  fontSize: 13,
                                  fontFamily: 'monospace',
                                  color: colors.navy,
                                },
                                webNoOutline,
                              ]}
                            />
                            <Pressable
                              onPress={() => {
                                const nextType =
                                  DATA_TYPES[(DATA_TYPES.indexOf(bx.type) + 1) % DATA_TYPES.length];
                                updateBoxField(sIdx, bIdx, 'type', nextType);
                              }}
                              style={{
                                backgroundColor: colors.sky,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                                borderRadius: 10,
                              }}
                            >
                              <T weight="bold" style={{ fontSize: 11, color: colors.blueDark }}>
                                {bx.type}
                              </T>
                            </Pressable>
                            {st.boxes.length > 1 ? (
                              <Pressable onPress={() => removeBoxFromStep(sIdx, bIdx)}>
                                <Ionicons name="close-circle" size={18} color={colors.redDark} />
                              </Pressable>
                            ) : null}
                          </View>

                          <TextInput
                            placeholder="Nilai lama dicoret (opsional, mis: 10)"
                            placeholderTextColor={colors.slate}
                            value={bx.prevValue}
                            onChangeText={(v) => updateBoxField(sIdx, bIdx, 'prevValue', v)}
                            style={[
                              {
                                backgroundColor: colors.bg,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                fontSize: 12,
                                fontFamily: fonts.semi,
                                color: colors.navy,
                                marginTop: 4,
                              },
                              webNoOutline,
                            ]}
                          />
                        </View>
                      ))}

                      <Pressable
                        onPress={() => addBoxToStep(sIdx)}
                        style={{ alignSelf: 'flex-start', paddingVertical: 4, marginBottom: 6 }}
                      >
                        <T weight="bold" style={{ fontSize: 12, color: colors.blue }}>
                          + Kotak Variabel
                        </T>
                      </Pressable>

                      <TextInput
                        placeholder="Penjelasan langkah ini..."
                        placeholderTextColor={colors.slate}
                        value={st.desc}
                        onChangeText={(v) => updateStepField(sIdx, 'desc', v)}
                        style={[...inputStyle, { marginBottom: 6, paddingVertical: 7, fontSize: 13 }]}
                      />
                      <TextInput
                        placeholder="Output layar (opsional)"
                        placeholderTextColor={colors.slate}
                        value={st.output}
                        onChangeText={(v) => updateStepField(sIdx, 'output', v)}
                        style={[...inputStyle, { marginBottom: 2, paddingVertical: 7, fontSize: 13 }]}
                      />
                    </View>
                  ))}

                  <Pressable
                    onPress={() =>
                      setSimSteps((prev) => [...prev, emptyStep(prev.length)])
                    }
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      paddingVertical: 8,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.blue,
                    }}
                  >
                    <T weight="bold" style={{ fontSize: 12, color: colors.blue }}>
                      + Tambah Langkah Simulasi
                    </T>
                  </Pressable>
                </View>
              ) : null}

              {materiFormError ? (
                <T
                  weight="semi"
                  style={{ color: colors.redDark, textAlign: 'center', marginBottom: 10, fontSize: 13 }}
                >
                  {materiFormError}
                </T>
              ) : null}

              <Button3D
                title={saving ? 'Menyimpan...' : 'Simpan Materi'}
                variant="blue"
                onPress={handleSaveMateri}
              />

              <Pressable
                onPress={() => setMateriModalOpen(false)}
                style={{ alignItems: 'center', paddingTop: 14, paddingBottom: 4 }}
              >
                <T weight="bold" style={{ fontSize: 14, color: colors.slate }}>
                  Batal
                </T>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL SOAL (PILIHAN GANDA & DRAG-AND-DROP PASANGAN BEBAS) */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(10, 9, 66, 0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 14,
          }}
        >
          <View
            style={[
              {
                backgroundColor: '#fff',
                borderRadius: 26,
                padding: 18,
                width: '100%',
                maxWidth: 460,
                maxHeight: '92%',
                overflow: 'hidden',
              },
              shadow,
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <T weight="bold" style={{ fontSize: 19, marginBottom: 10 }}>
                {editIdx !== null ? 'Ubah Soal' : 'Tambah Soal'}
              </T>

              {/* Tipe Soal */}
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
                {[
                  { key: 'choice', label: 'Pilihan Ganda' },
                  { key: 'match', label: 'Drag & Drop' },
                ].map((t) => {
                  const active = qType === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => setQType(t.key)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        backgroundColor: active ? colors.navy : colors.bg,
                        paddingVertical: 9,
                        borderRadius: 12,
                        alignItems: 'center',
                      }}
                    >
                      <T weight="bold" style={{ fontSize: 13, color: active ? '#fff' : colors.navy }}>
                        {t.label}
                      </T>
                    </Pressable>
                  );
                })}
              </View>

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Topik:
              </T>
              <TextInput
                placeholder="Deklarasi variabel"
                placeholderTextColor={colors.slate}
                value={concept}
                onChangeText={setConcept}
                style={inputStyle}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Pertanyaan:
              </T>
              <TextInput
                placeholder="Tulis pertanyaan..."
                placeholderTextColor={colors.slate}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                style={[...inputStyle, { minHeight: 60 }]}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Cuplikan Kode (Opsional):
              </T>
              <TextInput
                placeholder={'skor = 10\nprint(skor)'}
                placeholderTextColor={colors.slate}
                value={codeSnippet}
                onChangeText={setCodeSnippet}
                multiline
                style={[...inputStyle, { minHeight: 50, fontFamily: 'monospace' }]}
              />

              {qType === 'choice' ? (
                <>
                  <T weight="bold" style={{ fontSize: 13, marginBottom: 6 }}>
                    Pilihan Jawaban (Ketuk huruf untuk kunci benar):
                  </T>
                  {options.map((opt, i) => {
                    const isCorrect = correctOpt === i;
                    return (
                      <View
                        key={i}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}
                      >
                        <Pressable
                          onPress={() => setCorrectOpt(i)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: isCorrect ? colors.green : colors.bg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <T weight="bold" style={{ color: isCorrect ? '#fff' : colors.navy, fontSize: 13 }}>
                            {String.fromCharCode(65 + i)}
                          </T>
                        </Pressable>
                        <TextInput
                          placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
                          placeholderTextColor={colors.slate}
                          value={opt}
                          onChangeText={(txt) => {
                            const next = [...options];
                            next[i] = txt;
                            setOptions(next);
                          }}
                          style={[
                            {
                              flex: 1,
                              minWidth: 0,
                              backgroundColor: isCorrect ? colors.mint : colors.bg,
                              borderRadius: 12,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              fontSize: 13,
                              fontFamily: fonts.semi,
                              color: colors.navy,
                            },
                            webNoOutline,
                          ]}
                        />
                      </View>
                    );
                  })}
                </>
              ) : (
                /* EDITOR DRAG & DROP PASANGAN [LABEL SLOT -> POTONGAN JAWABAN] */
                <View style={{ marginBottom: 10 }}>
                  <T weight="bold" style={{ fontSize: 13, marginBottom: 6 }}>
                    Pasangan Slot Kiri ➜ Potongan Kanan (diacak otomatis saat kuis):
                  </T>
                  {matchPairs.map((pair, pIdx) => (
                    <View
                      key={pIdx}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}
                    >
                      <TextInput
                        placeholder={`Baris ${pIdx + 1}`}
                        placeholderTextColor={colors.slate}
                        value={pair.slot}
                        onChangeText={(v) =>
                          setMatchPairs((prev) =>
                            prev.map((it, i) => (i === pIdx ? { ...it, slot: v } : it))
                          )
                        }
                        style={[
                          {
                            width: 96,
                            backgroundColor: colors.bg,
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            fontSize: 13,
                            fontFamily: fonts.bold,
                            color: colors.navy,
                          },
                          webNoOutline,
                        ]}
                      />
                      <Ionicons name="arrow-forward" size={14} color={colors.slate} />
                      <TextInput
                        placeholder="Potongan kode / jawaban"
                        placeholderTextColor={colors.slate}
                        value={pair.piece}
                        onChangeText={(v) =>
                          setMatchPairs((prev) =>
                            prev.map((it, i) => (i === pIdx ? { ...it, piece: v } : it))
                          )
                        }
                        style={[
                          {
                            flex: 1,
                            minWidth: 0,
                            backgroundColor: '#FFF8E1',
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            fontSize: 13,
                            fontFamily: 'monospace',
                            color: colors.navy,
                          },
                          webNoOutline,
                        ]}
                      />
                      {matchPairs.length > 2 ? (
                        <Pressable
                          onPress={() =>
                            setMatchPairs((prev) => prev.filter((_, i) => i !== pIdx))
                          }
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.redDark} />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}

                  <Pressable
                    onPress={() =>
                      setMatchPairs((prev) => [
                        ...prev,
                        { slot: `Baris ${prev.length + 1}`, piece: '' },
                      ])
                    }
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: colors.sky,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                    }}
                  >
                    <T weight="bold" style={{ fontSize: 12, color: colors.blueDark }}>
                      + Tambah Baris Pasangan
                    </T>
                  </Pressable>
                </View>
              )}

              <T weight="bold" style={{ fontSize: 13, marginTop: 4, marginBottom: 4 }}>
                Hint:
              </T>
              <TextInput
                placeholder="Petunjuk singkat..."
                placeholderTextColor={colors.slate}
                value={hint}
                onChangeText={setHint}
                style={inputStyle}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Penjelasan:
              </T>
              <TextInput
                placeholder="Penjelasan jawaban..."
                placeholderTextColor={colors.slate}
                value={explanation}
                onChangeText={setExplanation}
                style={[...inputStyle, { marginBottom: 14 }]}
              />

              {formError ? (
                <T
                  weight="semi"
                  style={{ color: colors.redDark, textAlign: 'center', marginBottom: 10, fontSize: 13 }}
                >
                  {formError}
                </T>
              ) : null}

              <Button3D
                title={saving ? 'Menyimpan...' : 'Simpan Soal'}
                variant="blue"
                onPress={handleSaveQuestion}
              />

              <Pressable
                onPress={() => setModalOpen(false)}
                style={{ alignItems: 'center', paddingTop: 14, paddingBottom: 4 }}
              >
                <T weight="bold" style={{ fontSize: 14, color: colors.slate }}>
                  Batal
                </T>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
