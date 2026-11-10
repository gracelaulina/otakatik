
import React, { useState } from 'react';
import { Modal, Pressable, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import Field from '../components/Field';
import Button3D from '../components/Button3D';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame, levelFromXp, getBadges } from '../state/GameContext';
import { colors, shadow } from '../theme';
import {
  logoutUser,
  deleteCurrentAccount,
  updateUserName,
  isFirebaseConfigured,
} from '../services/firebase';
import { feedback, isSoundEnabled, setSoundEnabled } from '../services/feedback';

const COLOR_OPTIONS = [
  { name: 'Biru', value: '#4DA8FF' },
  { name: 'Pink', value: '#FF8FB1' },
  { name: 'Ungu', value: '#A78BFA' },
  { name: 'Hijau', value: '#68DDB5' },
  { name: 'Kuning', value: '#FFD166' },
  { name: 'Jingga', value: '#FFAA70' },
  { name: 'Merah', value: '#FF7777' },
  { name: 'Mint', value: '#82DDD0' },
];

const HAIR_COLORS = [
  '#49315F', '#2D2438', '#8B573F', '#D28B45',
  '#FF8FB1', '#A78BFA', '#4DA8FF', '#E6B85C',
];

const OUTFIT_COLORS = [
  '#FF8FB1', '#A78BFA', '#4DA8FF', '#68DDB5',
  '#FFD166', '#FFAA70', '#7D83D8', '#FFFFFF',
];

const CATEGORIES = [
  { id: 'color', label: 'Warna', icon: 'color-palette-outline' },
  { id: 'hair', label: 'Rambut', icon: 'cut-outline' },
  { id: 'hat', label: 'Topi', icon: 'happy-outline' },
  { id: 'outfit', label: 'Baju', icon: 'shirt-outline' },
  { id: 'face', label: 'Wajah', icon: 'eye-outline' },
  { id: 'extra', label: 'Aksesori', icon: 'sparkles-outline' },
];

const OPTIONS = {
  hair: [
    { name: 'Tanpa rambut', value: 'none' },
    { name: 'Pendek', value: 'short' },
    { name: 'Panjang', value: 'long' },
    { name: 'Poni', value: 'bangs' },
    { name: 'Keriting', value: 'curly' },
    { name: 'Bob', value: 'bob' },
    { name: 'Kuncir', value: 'ponytail' },
  ],
  hat: [
    { name: 'Tanpa topi', value: 'none' },
    { name: 'Baret', value: 'beret' },
    { name: 'Bucket hat', value: 'bucket' },
    { name: 'Topi pesta', value: 'party' },
    { name: 'Mahkota', value: 'crown' },
    { name: 'Topi baseball', value: 'cap' },
    { name: 'Hood', value: 'hood' },
  ],
  outfit: [
    { name: 'Tanpa baju', value: 'none' },
    { name: 'Hoodie', value: 'hoodie' },
    { name: 'Overall', value: 'overall' },
    { name: 'Dress', value: 'dress' },
    { name: 'Sweater', value: 'sweater' },
    { name: 'Jas', value: 'suit' },
  ],
  face: [
    { name: 'Wajah normal', value: 'none' },
    { name: 'Kacamata', value: 'glasses' },
    { name: 'Blush on', value: 'blush' },
    { name: 'Freckles', value: 'freckles' },
  ],
  extra: [
    { name: 'Tanpa aksesori', value: 'none' },
    { name: 'Pita', value: 'bow' },
    { name: 'Headphone', value: 'headphones' },
    { name: 'Sayap', value: 'wings' },
    { name: 'Kalung', value: 'necklace' },
    { name: 'Bintang', value: 'star' },
  ],
};

const DEFAULT_MASCOT = {
  color: '#4DA8FF',
  accessory: 'none',
  hair: 'none',
  hairColor: '#49315F',
  hat: 'none',
  outfit: 'none',
  outfitColor: '#FF8FB1',
  faceAccessory: 'none',
  extraAccessory: 'none',
};

export default function Profile() {
  const nav = useNav();
  const { state, dispatch } = useGame();

  const user = state.user || { name: 'Teman', email: '' };
  const badges = getBadges(state).filter((b) => b.unlocked).length;
  const done = Object.keys(state.completed).length;

  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [editModal, setEditModal] = useState(false);
  const [mascotModal, setMascotModal] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState(false);

  const [activeTab, setActiveTab] = useState('color');
  const [draft, setDraft] = useState({
    ...DEFAULT_MASCOT,
    ...(state.mascot || {}),
  });

  const cloudActive = isFirebaseConfigured();

  const updateDraft = (key, value) => {
    feedback.tap();
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openMascotEditor = () => {
    feedback.tap();
    setDraft({
      ...DEFAULT_MASCOT,
      ...(state.mascot || {}),
    });
    setActiveTab('color');
    setMascotModal(true);
  };

  const saveMascot = () => {
    dispatch({
      type: 'UPDATE_MASCOT',
      mascot: draft,
    });

    feedback.correct();
    setMascotModal(false);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) feedback.tap();
  };

  const openEditName = () => {
    feedback.tap();
    setNewName(user.name);
    setEditError('');
    setEditModal(true);
  };

  const saveEditName = async () => {
    if (busy) return;

    setBusy(true);
    setEditError('');

    try {
      const updated = await updateUserName(user, newName);
      dispatch({ type: 'UPDATE_USER', user: updated });
      feedback.correct();
      setEditModal(false);
    } catch (err) {
      feedback.wrong();
      setEditError(err.message || 'Gagal menyimpan nama baru.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    feedback.tap();
    await logoutUser();
    dispatch({ type: 'LOGOUT' });
    nav.reset('Login');
  };

  const handleDeleteAccount = async () => {
    feedback.wrong();
    await deleteCurrentAccount(state.user);
    dispatch({ type: 'LOGOUT' });
    nav.reset('Login');
  };

  const renderColorOptions = (items, selected, onSelect) => (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    }}>
      {items.map((item) => (
        <Pressable
          key={item.value}
          onPress={() => onSelect(item.value)}
          style={{
            alignItems: 'center',
            width: 70,
            gap: 6,
          }}
        >
          <View style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: item.value,
            borderWidth: selected === item.value ? 4 : 2,
            borderColor: selected === item.value ? colors.blueDark : '#fff',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {selected === item.value && (
              <Ionicons name="checkmark" size={22} color="#fff" />
            )}
          </View>
          <T weight="semi" style={{ fontSize: 11 }}>
            {item.name}
          </T>
        </Pressable>
      ))}
    </View>
  );

  const renderOptions = (category, property) => (
    <View style={{ gap: 9 }}>
      {OPTIONS[category].map((item) => {
        const selected = draft[property] === item.value;

        return (
          <Pressable
            key={item.value}
            onPress={() => updateDraft(property, item.value)}
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: selected ? 2 : 1,
              borderColor: selected ? colors.blue : '#eee',
            }}
          >
            <T
              weight="bold"
              style={{ flex: 1, fontSize: 15 }}
            >
              {item.name}
            </T>

            {selected && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.blue}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'color':
        return (
          <>
            <T weight="bold" style={{ fontSize: 16, marginBottom: 13 }}>
              Warna badan Atik
            </T>
            {renderColorOptions(
              COLOR_OPTIONS,
              draft.color,
              (value) => updateDraft('color', value)
            )}
          </>
        );

      case 'hair':
        return (
          <>
            <T weight="bold" style={{ fontSize: 16, marginBottom: 13 }}>
              Model rambut
            </T>
            {renderOptions('hair', 'hair')}

            <T weight="bold" style={{ fontSize: 16, marginTop: 22, marginBottom: 13 }}>
              Warna rambut
            </T>
            {renderColorOptions(
              HAIR_COLORS.map((value) => ({ name: '', value })),
              draft.hairColor,
              (value) => updateDraft('hairColor', value)
            )}
          </>
        );

      case 'hat':
        return renderOptions('hat', 'hat');

      case 'outfit':
        return (
          <>
            <T weight="bold" style={{ fontSize: 16, marginBottom: 13 }}>
              Pilih pakaian
            </T>
            {renderOptions('outfit', 'outfit')}

            <T weight="bold" style={{ fontSize: 16, marginTop: 22, marginBottom: 13 }}>
              Warna pakaian
            </T>
            {renderColorOptions(
              OUTFIT_COLORS.map((value) => ({ name: '', value })),
              draft.outfitColor,
              (value) => updateDraft('outfitColor', value)
            )}
          </>
        );

      case 'face':
        return renderOptions('face', 'faceAccessory');

      case 'extra':
        return renderOptions('extra', 'extraAccessory');

      default:
        return null;
    }
  };

  return (
    <Screen padBottom={0}>
  <ScrollView
    style={{ flex: 1 }}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ paddingBottom: 30 }}
  >
    <View style={{ alignItems: 'center', paddingTop: 12 }}>
        <Mascot
  size={120}
  mascotColor={draft.color}
  hair={draft.hair}
  hairColor={draft.hairColor}
  hat={draft.hat}
  outfit={draft.outfit}
  outfitColor={draft.outfitColor}
  faceAccessory={draft.faceAccessory}
  extraAccessory={draft.extraAccessory}
/>

        <FadeInUp delay={100} style={{ alignItems: 'center' }}>
          <Pressable
            onPress={openEditName}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 6,
            }}
          >
            <T weight="bold" style={{ fontSize: 32, textAlign: 'center' }}>
              {user.name}
            </T>
            <Ionicons name="pencil" size={17} color={colors.blue} />
          </Pressable>

          <T weight="semi" style={{
            color: colors.slate,
            fontSize: 16,
            textAlign: 'center',
          }}>
            {user.email}
          </T>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: cloudActive ? colors.mint : colors.sky,
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 4,
            marginTop: 8,
          }}>
            <Ionicons
              name={cloudActive ? 'cloud-done' : 'save'}
              size={15}
              color={cloudActive ? colors.greenText : colors.blueDark}
            />
            <T weight="bold" style={{
              fontSize: 13,
              marginLeft: 6,
              color: cloudActive ? colors.greenText : colors.blueDark,
            }}>
              {cloudActive
                ? 'Tersinkron ke Firebase Cloud'
                : 'Tersimpan Otomatis di Perangkat'}
            </T>
          </View>
        </FadeInUp>

        <Pressable
          onPress={openMascotEditor}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'stretch',
              backgroundColor: '#fff',
              borderRadius: 20,
              padding: 15,
              marginTop: 18,
              gap: 10,
            },
            shadow,
          ]}
        >
          <Ionicons name="color-palette" size={23} color={colors.blue} />
          <T weight="bold" style={{ fontSize: 16, color: colors.blueDark }}>
            Kustomisasi Robot Atik
          </T>
          <Ionicons name="chevron-forward" size={20} color={colors.slate} />
        </Pressable>

        <FadeInUp
          delay={200}
          style={{
            flexDirection: 'row',
            gap: 12,
            marginTop: 18,
            alignSelf: 'stretch',
          }}
        >
          {[
            ['Level', levelFromXp(state.xp)],
            ['Stage tuntas', done],
            ['Lencana', badges],
          ].map(([label, val]) => (
            <View
              key={label}
              style={[
                {
                  flex: 1,
                  backgroundColor: '#fff',
                  borderRadius: 24,
                  paddingVertical: 16,
                  alignItems: 'center',
                },
                shadow,
              ]}
            >
              <T weight="bold" style={{ fontSize: 28 }}>{val}</T>
              <T weight="semi" style={{ color: colors.slate, fontSize: 14 }}>
                {label}
              </T>
            </View>
          ))}
        </FadeInUp>

        <FadeInUp delay={280} style={{ alignSelf: 'stretch', marginTop: 14 }}>
          <Pressable
            onPress={toggleSound}
            style={[
              {
                backgroundColor: '#fff',
                borderRadius: 24,
                paddingHorizontal: 20,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              shadow,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={soundOn ? 'volume-high' : 'volume-mute'}
                size={24}
                color={colors.blue}
              />
              <T weight="bold" style={{ fontSize: 17, marginLeft: 12 }}>
                Suara & Getaran
              </T>
            </View>

            <T weight="bold" style={{
              fontSize: 14,
              color: soundOn ? colors.greenText : colors.slate,
            }}>
              {soundOn ? 'AKTIF' : 'MATI'}
            </T>
          </Pressable>
        </FadeInUp>
      </View>

      <View style={{ gap: 10, marginTop: 16 }}>
        <Button3D title="Keluar" variant="white" onPress={logout} />

        <Pressable
          onPress={handleDeleteAccount}
          style={{ alignItems: 'center', paddingVertical: 8 }}
        >
          <T weight="bold" style={{ fontSize: 15, color: colors.redDark }}>
            Hapus Akun & Reset Data Ini
          </T>
        </Pressable>
      </View>
</ScrollView>
      {/* Modal kustomisasi */}
      <Modal
        visible={mascotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setMascotModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(10,9,66,0.65)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 20,
            maxHeight: '92%',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <View>
                <T weight="bold" style={{ fontSize: 22 }}>
                  Dress Up Atik!
                </T>
                <T weight="semi" style={{ fontSize: 13, color: colors.slate }}>
                  Atur penampilan robot kesayanganmu
                </T>
              </View>

              <Pressable onPress={() => setMascotModal(false)}>
                <Ionicons name="close-circle" size={30} color={colors.slate} />
              </Pressable>
            </View>

            {/* Preview */}
            <View style={{
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 22,
              padding: 8,
              marginVertical: 10,
            }}>
              <Mascot
  size={135}
  bob={false}
  mascotColor={draft.color}
  hair={draft.hair}
  hairColor={draft.hairColor}
  hat={draft.hat}
  outfit={draft.outfit}
  outfitColor={draft.outfitColor}
  faceAccessory={draft.faceAccessory}
  extraAccessory={draft.extraAccessory}
/>
              <T weight="bold" style={{
                color: colors.blueDark,
                marginBottom: 8,
              }}>
                Preview Atik Kamu
              </T>
            </View>

            {/* Tab kategori */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, marginBottom: 14 }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map((tab) => {
                  const selected = activeTab === tab.id;

                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => {
                        feedback.tap();
                        setActiveTab(tab.id);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 13,
                        paddingVertical: 11,
                        borderRadius: 15,
                        backgroundColor: selected ? colors.blue : '#fff',
                      }}
                    >
                      <Ionicons
                        name={tab.icon}
                        size={17}
                        color={selected ? '#fff' : colors.slate}
                      />
                      <T weight="bold" style={{
                        fontSize: 12,
                        color: selected ? '#fff' : colors.slate,
                      }}>
                        {tab.label}
                      </T>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Isi kategori */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 235 }}
              contentContainerStyle={{ paddingBottom: 15 }}
            >
              {renderTabContent()}
            </ScrollView>

            <Button3D
              title="Simpan Tampilan Atik"
              variant="blue"
              onPress={saveMascot}
            />

            <Pressable
              onPress={() => setMascotModal(false)}
              style={{ alignItems: 'center', paddingTop: 12 }}
            >
              <T weight="bold" style={{ color: colors.slate }}>
                Batal
              </T>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal ubah nama */}
      <Modal
        visible={editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(10,9,66,0.65)',
          justifyContent: 'center',
          padding: 20,
        }}>
          <View style={[
            { backgroundColor: '#fff', borderRadius: 30, padding: 22 },
            shadow,
          ]}>
            <T weight="bold" style={{ fontSize: 22, marginBottom: 6 }}>
              Ubah Nama Panggilan
            </T>
            <T weight="semi" style={{
              fontSize: 14,
              color: colors.slate,
              marginBottom: 14,
            }}>
              Masukkan nama unik yang akan tampil di Beranda dan Peringkat kelas:
            </T>

            <Field
              placeholder="Nama panggilan baru"
              value={newName}
              onChangeText={setNewName}
              style={{ backgroundColor: colors.bg, marginBottom: 12 }}
            />

            {editError ? (
              <T weight="semi" style={{
                color: colors.redDark,
                textAlign: 'center',
                marginBottom: 10,
                fontSize: 14,
              }}>
                {editError}
              </T>
            ) : null}

            <Button3D
              title={busy ? 'Menyimpan...' : 'Simpan Nama'}
              variant="blue"
              disabled={busy}
              onPress={saveEditName}
            />

            <Pressable
              onPress={() => setEditModal(false)}
              style={{ alignItems: 'center', paddingTop: 14, paddingBottom: 4 }}
            >
              <T weight="bold" style={{ fontSize: 15, color: colors.slate }}>
                Batal
              </T>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
