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

export default function TeacherDashboard() {
  const nav = useNav();
  const [activeTab, setActiveTab] = useState('materi'); // 'materi' | 'questions' | 'students'
  const [stageId, setStageId] = useState(1);
  const [tierKey, setTierKey] = useState('mudah');
  const [bank, setBank] = useState(() => getQuestionBank());
  const [syncMsg, setSyncMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // State Modal Tambah / Edit Materi
  const [materiModalOpen, setMateriModalOpen] = useState(false);
  const [editMateriIdx, setEditMateriIdx] = useState(null); // index asli di array stage.materi
  const [mTitle, setMTitle] = useState('');
  const [mBody, setMBody] = useState('');
  const [mCode, setMCode] = useState('');
  const [mTip, setMTip] = useState('');
  const [materiFormError, setMateriFormError] = useState('');

  // State Modal Tambah / Edit Soal
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [qType, setQType] = useState('choice');
  const [concept, setConcept] = useState('');
  const [prompt, setPrompt] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOpt, setCorrectOpt] = useState(0);
  const [orderedLinesText, setOrderedLinesText] = useState('');
  const [hint, setHint] = useState('');
  const [explanation, setExplanation] = useState('');
  const [formError, setFormError] = useState('');

  // State Tab Rekap Siswa
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

  const persistBank = async (nextBank, msg = 'Tersimpan & disinkronkan ke Firebase!') => {
    setSaving(true);
    setBank(nextBank);
    applyQuestionBank(nextBank);
    try {
      await saveQuestionBank(nextBank);
      feedback.correct();
      setSyncMsg(msg);
      setTimeout(() => setSyncMsg(''), 3000);
    } catch {
      setSyncMsg('Tersimpan di perangkat.');
    } finally {
      setSaving(false);
    }
  };

  // === HANDLER MATERI ===
  const openAddMateriModal = () => {
    feedback.tap();
    setEditMateriIdx(null);
    setMTitle('');
    setMBody('');
    setMCode('');
    setMTip('');
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
    setMateriFormError('');
    setMateriModalOpen(true);
  };

  const handleDeleteMateri = async (realIdx) => {
    if (currentTierMateri.length <= 1) {
      setSyncMsg('Minimal harus ada 1 halaman materi di tingkat kesulitan ini.');
      return;
    }
    feedback.wrong();
    const nextBank = JSON.parse(JSON.stringify(bank));
    nextBank[String(stageId)].materi.splice(realIdx, 1);
    await persistBank(nextBank, 'Halaman materi berhasil dihapus.');
  };

  const handleSaveMateri = async () => {
    if (!mTitle.trim() || !mBody.trim()) {
      setMateriFormError('Judul materi dan isi penjelasan wajib diisi.');
      return;
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
    };

    if (editMateriIdx !== null) {
      list[editMateriIdx] = builtMateri;
    } else {
      list.push(builtMateri);
    }
    nextBank[String(stageId)].materi = list;
    setMateriModalOpen(false);
    await persistBank(
      nextBank,
      editMateriIdx !== null ? 'Materi berhasil diperbarui!' : 'Materi baru berhasil ditambahkan!'
    );
  };

  // === HANDLER SOAL ===
  const openAddModal = () => {
    feedback.tap();
    setEditIdx(null);
    setQType('choice');
    setConcept(`Konsep ${currentStage.title}`);
    setPrompt('');
    setCodeSnippet('');
    setOptions(['', '', '', '']);
    setCorrectOpt(0);
    setOrderedLinesText('nama = "Budi"\numur = 16\nprint(nama)');
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
      const ordered = q.answer.map((pIdx) => q.pieces[pIdx] || '');
      setOrderedLinesText(ordered.join('\n'));
      setOptions(['', '', '', '']);
      setCorrectOpt(0);
    } else {
      const opts = Array.isArray(q.options) ? [...q.options] : ['', '', '', ''];
      while (opts.length < 4) opts.push('');
      setOptions(opts.slice(0, 4));
      setCorrectOpt(typeof q.answer === 'number' ? q.answer : 0);
      setOrderedLinesText('');
    }
    setHint(q.hint || '');
    setExplanation(q.explanation || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleDeleteQuestion = async (idx) => {
    if (currentQuestions.length <= 1) {
      setSyncMsg('Minimal harus ada 1 soal di setiap tingkat kesulitan.');
      return;
    }
    feedback.wrong();
    const nextBank = JSON.parse(JSON.stringify(bank));
    nextBank[String(stageId)][tierKey].splice(idx, 1);
    await persistBank(nextBank, 'Soal berhasil dihapus.');
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
      const lines = orderedLinesText
        .split('\n')
        .map((l) => l.replace(/\r$/, ''))
        .filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setFormError('Masukkan minimal 2 baris kode (pisahkan tiap baris dengan Enter).');
        return;
      }
      const indexed = lines.map((text, origIdx) => ({ text, origIdx }));
      const shuffled = [...indexed].sort((a, b) => a.text.localeCompare(b.text));
      if (shuffled.every((item, i) => item.origIdx === i) && shuffled.length > 1) {
        const tmp = shuffled[0];
        shuffled[0] = shuffled[1];
        shuffled[1] = tmp;
      }
      const pieces = shuffled.map((item) => item.text);
      const answer = lines.map((_, origIdx) =>
        shuffled.findIndex((item) => item.origIdx === origIdx)
      );
      const slots = lines.map((_, i) => `Baris ${i + 1}`);

      builtQuestion.pieces = pieces;
      builtQuestion.slots = slots;
      builtQuestion.answer = answer;
    }

    const nextBank = JSON.parse(JSON.stringify(bank));
    const list = nextBank[String(stageId)][tierKey];
    if (editIdx !== null) {
      list[editIdx] = builtQuestion;
    } else {
      list.push(builtQuestion);
    }

    setModalOpen(false);
    await persistBank(
      nextBank,
      editIdx !== null ? 'Soal berhasil diperbarui!' : 'Soal baru berhasil ditambahkan!'
    );
  };

  const handleResetDefault = async () => {
    const cleanDefault = JSON.parse(JSON.stringify(DEFAULT_QUESTION_BANK));
    await persistBank(cleanDefault, 'Materi & soal dikembalikan ke bawaan asli.');
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
      paddingVertical: 10,
      fontSize: 14,
      fontFamily: fonts.semi,
      color: colors.navy,
      width: '100%',
      minWidth: 0,
      marginBottom: 10,
    },
    webNoOutline,
  ];

  // Komponen pemilih Stage & Tingkat Kesulitan (dipakai di Tab Materi & Tab Soal)
  const renderStageAndTierPicker = (isMateriTab) => (
    <>
      <T weight="bold" style={{ fontSize: 14, marginBottom: 6 }}>
        1. Pilih Stage:
      </T>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
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
              <T weight="bold" style={{ fontSize: 11, color: active ? '#fff' : colors.slate }}>
                Stage {st.id}
              </T>
              <T
                weight="bold"
                style={{ fontSize: 13, color: active ? '#fff' : colors.navy, marginTop: 2 }}
                numberOfLines={1}
              >
                {st.title}
              </T>
            </Pressable>
          );
        })}
      </View>

      <T weight="bold" style={{ fontSize: 14, marginBottom: 6 }}>
        2. Pilih Tingkat Kesulitan:
      </T>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
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
                borderRadius: 16,
                paddingVertical: 9,
                paddingHorizontal: 4,
                alignItems: 'center',
              }}
            >
              <T weight="bold" style={{ fontSize: 13 }} numberOfLines={1}>
                {lv.label}
              </T>
              <T weight="semi" style={{ fontSize: 11, color: colors.slate }}>
                {count} {isMateriTab ? 'Materi' : 'Soal'}
              </T>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <Screen padBottom={20}>
      {/* Header Responsif */}
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
        <View style={{ flex: 1, minWidth: 0 }}>
          <T weight="bold" style={{ fontSize: 22 }} numberOfLines={1}>
            Kelola Materi & Soal
          </T>
          <T weight="semi" style={{ fontSize: 12, color: colors.slate }} numberOfLines={1}>
            Perubahan tersinkron otomatis ke Firebase
          </T>
        </View>
      </View>

      {/* 3 Tab Switcher: Materi, Soal Kuis, Rekap Siswa */}
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
          { key: 'students', label: 'Rekap Siswa', icon: 'people-outline' },
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
                style={{ fontSize: 12, color: active ? '#fff' : colors.navy }}
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
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="cloud-done" size={16} color={colors.greenDark} />
          <T weight="bold" style={{ fontSize: 12, color: colors.greenDark, flex: 1 }}>
            {syncMsg}
          </T>
        </View>
      ) : null}

      {activeTab === 'materi' ? (
        /* TAB 1: KELOLA MATERI */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {renderStageAndTierPicker(true)}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              gap: 8,
            }}
          >
            <T weight="bold" style={{ fontSize: 16, flex: 1 }}>
              Halaman Materi ({currentTierMateri.length})
            </T>
            <Pressable
              onPress={openAddMateriModal}
              style={{
                backgroundColor: colors.blue,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Ionicons name="add-circle" size={16} color="#fff" />
              <T weight="bold" style={{ fontSize: 13, color: '#fff' }}>
                Tambah Materi
              </T>
            </Pressable>
          </View>

          {currentTierMateri.map((m, idx) => (
            <FadeInUp key={m.realIdx} delay={idx * 40}>
              <View
                style={[
                  {
                    backgroundColor: '#fff',
                    borderRadius: 22,
                    padding: 15,
                    marginBottom: 12,
                  },
                  shadow,
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.sky,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <T weight="bold" style={{ fontSize: 11, color: colors.blueDark }}>
                      Bagian #{idx + 1}
                    </T>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Pressable
                      onPress={() => openEditMateriModal(m)}
                      style={{
                        backgroundColor: colors.bg,
                        paddingHorizontal: 9,
                        paddingVertical: 5,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Ionicons name="pencil" size={13} color={colors.blue} />
                      <T weight="bold" style={{ fontSize: 11, color: colors.blue }}>
                        Ubah
                      </T>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteMateri(m.realIdx)}
                      style={{
                        backgroundColor: colors.redBg,
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash-outline" size={13} color={colors.redDark} />
                    </Pressable>
                  </View>
                </View>

                <T weight="bold" style={{ fontSize: 16, marginBottom: 6 }}>
                  {m.title}
                </T>
                <T weight="semi" style={{ fontSize: 13, color: colors.slate, lineHeight: 19, marginBottom: 8 }}>
                  {m.body}
                </T>

                {m.code ? (
                  <View
                    style={{
                      backgroundColor: '#1E2235',
                      borderRadius: 12,
                      padding: 10,
                      marginBottom: 8,
                    }}
                  >
                    <T weight="semi" style={{ color: '#F8FAFC', fontSize: 12, fontFamily: 'monospace' }}>
                      {m.code}
                    </T>
                  </View>
                ) : null}

                {m.tip ? (
                  <View
                    style={{
                      backgroundColor: colors.yellow,
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <T weight="semi" style={{ fontSize: 12 }}>
                      💡 {m.tip}
                    </T>
                  </View>
                ) : null}
              </View>
            </FadeInUp>
          ))}

          <Pressable
            onPress={handleResetDefault}
            disabled={saving}
            style={{ alignItems: 'center', paddingVertical: 12, marginTop: 4 }}
          >
            <T weight="bold" style={{ fontSize: 13, color: colors.slate, textAlign: 'center' }}>
              Kembalikan Semua Materi & Soal ke Standar Bawaan
            </T>
          </Pressable>
        </ScrollView>
      ) : activeTab === 'questions' ? (
        /* TAB 2: KELOLA SOAL KUIS */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {renderStageAndTierPicker(false)}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              gap: 8,
            }}
          >
            <T weight="bold" style={{ fontSize: 16, flex: 1 }}>
              Daftar Soal ({currentQuestions.length})
            </T>
            <Pressable
              onPress={openAddModal}
              style={{
                backgroundColor: colors.blue,
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Ionicons name="add-circle" size={16} color="#fff" />
              <T weight="bold" style={{ fontSize: 13, color: '#fff' }}>
                Tambah Soal
              </T>
            </Pressable>
          </View>

          {currentQuestions.map((q, idx) => (
            <FadeInUp key={q.id || idx} delay={idx * 40}>
              <View
                style={[
                  {
                    backgroundColor: '#fff',
                    borderRadius: 22,
                    padding: 15,
                    marginBottom: 12,
                  },
                  shadow,
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                    gap: 6,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    <View
                      style={{
                        backgroundColor: colors.sky,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        flexShrink: 0,
                      }}
                    >
                      <T weight="bold" style={{ fontSize: 11, color: colors.blueDark }}>
                        #{idx + 1} • {q.type === 'match' ? 'Susun' : 'PG'}
                      </T>
                    </View>
                    <T
                      weight="semi"
                      style={{ fontSize: 12, color: colors.slate, flex: 1 }}
                      numberOfLines={1}
                    >
                      {q.concept}
                    </T>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, flexShrink: 0 }}>
                    <Pressable
                      onPress={() => openEditModal(q, idx)}
                      style={{
                        backgroundColor: colors.bg,
                        paddingHorizontal: 9,
                        paddingVertical: 5,
                        borderRadius: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Ionicons name="pencil" size={13} color={colors.blue} />
                      <T weight="bold" style={{ fontSize: 11, color: colors.blue }}>
                        Ubah
                      </T>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteQuestion(idx)}
                      style={{
                        backgroundColor: colors.redBg,
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash-outline" size={13} color={colors.redDark} />
                    </Pressable>
                  </View>
                </View>

                <T weight="bold" style={{ fontSize: 15, lineHeight: 21, marginBottom: 8 }}>
                  {q.prompt}
                </T>

                {q.code ? (
                  <View
                    style={{
                      backgroundColor: '#1E2235',
                      borderRadius: 12,
                      padding: 10,
                      marginBottom: 8,
                    }}
                  >
                    <T
                      weight="semi"
                      style={{ color: '#F8FAFC', fontSize: 12, fontFamily: 'monospace' }}
                    >
                      {q.code}
                    </T>
                  </View>
                ) : null}

                {q.type === 'choice' && Array.isArray(q.options) ? (
                  <View style={{ gap: 5 }}>
                    {q.options.map((opt, oIdx) => {
                      const isKey = oIdx === q.answer;
                      return (
                        <View
                          key={oIdx}
                          style={{
                            backgroundColor: isKey ? colors.mint : colors.bg,
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 7,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 6,
                          }}
                        >
                          <T
                            weight={isKey ? 'bold' : 'semi'}
                            style={{
                              fontSize: 13,
                              color: isKey ? colors.greenText : colors.navy,
                              flex: 1,
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </T>
                          {isKey && (
                            <Ionicons name="checkmark-circle" size={16} color={colors.greenDark} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : q.type === 'match' && Array.isArray(q.pieces) ? (
                  <View style={{ backgroundColor: colors.bg, borderRadius: 12, padding: 10 }}>
                    <T weight="bold" style={{ fontSize: 11, color: colors.slate, marginBottom: 4 }}>
                      Urutan Kunci Jawaban:
                    </T>
                    {(q.answer || []).map((pIdx, sIdx) => (
                      <T key={sIdx} weight="semi" style={{ fontSize: 12 }}>
                        {q.slots?.[sIdx] || `Baris ${sIdx + 1}`}:{' '}
                        <T weight="bold">{q.pieces[pIdx]}</T>
                      </T>
                    ))}
                  </View>
                ) : null}
              </View>
            </FadeInUp>
          ))}

          <Pressable
            onPress={handleResetDefault}
            disabled={saving}
            style={{ alignItems: 'center', paddingVertical: 12, marginTop: 4 }}
          >
            <T weight="bold" style={{ fontSize: 13, color: colors.slate, textAlign: 'center' }}>
              Kembalikan Semua Materi & Soal ke Standar Bawaan
            </T>
          </Pressable>
        </ScrollView>
      ) : (
        /* TAB 3: REKAP NILAI SISWA */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <View
              style={[
                {
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  padding: 14,
                  alignItems: 'center',
                },
                shadow,
              ]}
            >
              <T weight="bold" style={{ fontSize: 24, color: colors.blue }}>
                {students.length}
              </T>
              <T weight="semi" style={{ fontSize: 12, color: colors.slate }}>
                Siswa Terdaftar
              </T>
            </View>
            <View
              style={[
                {
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  padding: 14,
                  alignItems: 'center',
                },
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
                Rata-rata XP Kelas
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
              placeholder="Cari nama atau email siswa..."
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
              Memuat data siswa dari Firebase...
            </T>
          ) : filteredStudents.length === 0 ? (
            <T weight="semi" style={{ textAlign: 'center', color: colors.slate, marginTop: 20 }}>
              Belum ada data siswa yang cocok.
            </T>
          ) : (
            filteredStudents.map((st, idx) => {
              const comp = st.completed || {};
              return (
                <View
                  key={st.id || idx}
                  style={[
                    {
                      backgroundColor: '#fff',
                      borderRadius: 22,
                      padding: 14,
                      marginBottom: 10,
                    },
                    shadow,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ marginRight: 10 }}>
                      <Mascot size={42} bob={false} config={st.mascot || {}} />
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
                        Level {levelFromXp(st.xp || 0)}
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
                            paddingHorizontal: 6,
                            alignItems: 'center',
                          }}
                        >
                          <T weight="bold" style={{ fontSize: 10, color: colors.slate }}>
                            Stage {s.id}
                          </T>
                          <T
                            weight="bold"
                            style={{
                              fontSize: 12,
                              color: done ? colors.greenText : colors.slate,
                            }}
                          >
                            {done ? `${sc}%` : 'Belum'}
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

      {/* MODAL FORM TAMBAH / EDIT MATERI */}
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
              <T weight="bold" style={{ fontSize: 20, marginBottom: 2 }}>
                {editMateriIdx !== null ? 'Ubah Halaman Materi' : 'Tambah Materi Baru'}
              </T>
              <T weight="semi" style={{ fontSize: 12, color: colors.slate, marginBottom: 12 }}>
                Stage {stageId} ({currentStage.title}) • Tingkat{' '}
                {LEVELS.find((l) => l.key === tierKey)?.label}
              </T>

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Judul Materi:
              </T>
              <TextInput
                placeholder="Contoh: Apa itu Variabel?"
                placeholderTextColor={colors.slate}
                value={mTitle}
                onChangeText={setMTitle}
                style={inputStyle}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Isi Penjelasan Materi:
              </T>
              <TextInput
                placeholder="Tulis penjelasan materi yang mudah dipahami..."
                placeholderTextColor={colors.slate}
                value={mBody}
                onChangeText={setMBody}
                multiline
                style={[...inputStyle, { minHeight: 80 }]}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Contoh Kode Program (Opsional):
              </T>
              <TextInput
                placeholder={'Contoh:\nnama = "Budi"\nprint(nama)'}
                placeholderTextColor={colors.slate}
                value={mCode}
                onChangeText={setMCode}
                multiline
                style={[...inputStyle, { minHeight: 60, fontFamily: 'monospace' }]}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Tips / Catatan Penting (Opsional):
              </T>
              <TextInput
                placeholder="Contoh: Ingat tanda kutip selalu dipakai untuk teks String."
                placeholderTextColor={colors.slate}
                value={mTip}
                onChangeText={setMTip}
                multiline
                style={[...inputStyle, { marginBottom: 14 }]}
              />

              {materiFormError ? (
                <T
                  weight="semi"
                  style={{
                    color: colors.redDark,
                    textAlign: 'center',
                    marginBottom: 10,
                    fontSize: 13,
                  }}
                >
                  {materiFormError}
                </T>
              ) : null}

              <Button3D
                title={saving ? 'Menyimpan...' : 'Simpan Materi ke Firebase'}
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

      {/* MODAL FORM TAMBAH / EDIT SOAL */}
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
              <T weight="bold" style={{ fontSize: 20, marginBottom: 2 }}>
                {editIdx !== null ? 'Ubah Soal Kuis' : 'Tambah Soal Kuis Baru'}
              </T>
              <T weight="semi" style={{ fontSize: 12, color: colors.slate, marginBottom: 12 }}>
                Stage {stageId} ({currentStage.title}) • Tingkat{' '}
                {LEVELS.find((l) => l.key === tierKey)?.label}
              </T>

              {/* Tipe Soal */}
              <T weight="bold" style={{ fontSize: 13, marginBottom: 6 }}>
                Tipe Soal:
              </T>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                {[
                  { key: 'choice', label: 'Pilihan Ganda' },
                  { key: 'match', label: 'Susun Kode' },
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
                        paddingHorizontal: 6,
                        borderRadius: 12,
                        alignItems: 'center',
                      }}
                    >
                      <T
                        weight="bold"
                        style={{ fontSize: 12, color: active ? '#fff' : colors.navy }}
                        numberOfLines={1}
                      >
                        {t.label}
                      </T>
                    </Pressable>
                  );
                })}
              </View>

              {/* Topik Konsep */}
              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Topik / Konsep:
              </T>
              <TextInput
                placeholder="Contoh: Deklarasi variabel"
                placeholderTextColor={colors.slate}
                value={concept}
                onChangeText={setConcept}
                style={inputStyle}
              />

              {/* Pertanyaan */}
              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Pertanyaan Soal:
              </T>
              <TextInput
                placeholder="Tulis pertanyaan di sini..."
                placeholderTextColor={colors.slate}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                style={[...inputStyle, { minHeight: 60 }]}
              />

              {/* Cuplikan Kode Opsional */}
              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Cuplikan Kode (Opsional):
              </T>
              <TextInput
                placeholder={'Contoh:\nskor = 10\nprint(skor)'}
                placeholderTextColor={colors.slate}
                value={codeSnippet}
                onChangeText={setCodeSnippet}
                multiline
                style={[...inputStyle, { minHeight: 52, fontFamily: 'monospace' }]}
              />

              {qType === 'choice' ? (
                <>
                  <T weight="bold" style={{ fontSize: 13, marginBottom: 6, lineHeight: 18 }}>
                    Pilihan Jawaban (Ketuk A/B/C/D untuk pilih Kunci Benar):
                  </T>
                  {options.map((opt, i) => {
                    const isCorrect = correctOpt === i;
                    return (
                      <View
                        key={i}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                        }}
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
                          <T
                            weight="bold"
                            style={{ color: isCorrect ? '#fff' : colors.navy, fontSize: 13 }}
                          >
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
                <>
                  <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                    Tulis Baris Kode Sesuai Urutan Benar (1 baris per Enter):
                  </T>
                  <T weight="semi" style={{ fontSize: 11, color: colors.slate, marginBottom: 6 }}>
                    Sistem otomatis mengacak baris kode ini saat ditampilkan ke siswa.
                  </T>
                  <TextInput
                    placeholder={'nilai = 80\nif nilai >= 75:\n    print("Lulus")'}
                    placeholderTextColor={colors.slate}
                    value={orderedLinesText}
                    onChangeText={setOrderedLinesText}
                    multiline
                    style={[...inputStyle, { minHeight: 80, fontFamily: 'monospace' }]}
                  />
                </>
              )}

              {/* Hint & Penjelasan */}
              <T weight="bold" style={{ fontSize: 13, marginTop: 2, marginBottom: 4 }}>
                Petunjuk / Hint:
              </T>
              <TextInput
                placeholder="Petunjuk bantuan jika siswa kesulitan..."
                placeholderTextColor={colors.slate}
                value={hint}
                onChangeText={setHint}
                style={inputStyle}
              />

              <T weight="bold" style={{ fontSize: 13, marginBottom: 4 }}>
                Penjelasan Jawaban:
              </T>
              <TextInput
                placeholder="Penjelasan yang tampil setelah siswa menjawab..."
                placeholderTextColor={colors.slate}
                value={explanation}
                onChangeText={setExplanation}
                style={[...inputStyle, { marginBottom: 14 }]}
              />

              {formError ? (
                <T
                  weight="semi"
                  style={{
                    color: colors.redDark,
                    textAlign: 'center',
                    marginBottom: 10,
                    fontSize: 13,
                  }}
                >
                  {formError}
                </T>
              ) : null}

              <Button3D
                title={saving ? 'Menyimpan...' : 'Simpan Soal ke Firebase'}
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
