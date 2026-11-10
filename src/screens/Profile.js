import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
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

export default function Profile() {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const user = state.user || { name: 'Teman', email: '' };
  const badges = getBadges(state).filter((b) => b.unlocked).length;
  const done = Object.keys(state.completed).length;
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [editModal, setEditModal] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState(false);
  const cloudActive = isFirebaseConfigured();

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

  return (
    <Screen padBottom={100}>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 12 }}>
        <Mascot size={120} />
        <FadeInUp delay={100} style={{ alignItems: 'center' }}>
          <Pressable
            onPress={openEditName}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}
          >
            <T weight="bold" style={{ fontSize: 32, textAlign: 'center' }}>{user.name}</T>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="pencil" size={15} color={colors.blue} />
            </View>
          </Pressable>
          <T weight="semi" style={{ color: colors.slate, fontSize: 16, textAlign: 'center' }}>{user.email}</T>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
              backgroundColor: cloudActive ? colors.mint : colors.sky,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 4,
              marginTop: 8,
            }}
          >
            <Ionicons
              name={cloudActive ? 'cloud-done' : 'save'}
              size={15}
              color={cloudActive ? colors.greenText : colors.blueDark}
            />
            <T weight="bold" style={{ fontSize: 13, marginLeft: 6, color: cloudActive ? colors.greenText : colors.blueDark }}>
              {cloudActive ? 'Tersinkron ke Firebase Cloud' : 'Tersimpan Otomatis di Perangkat'}
            </T>
          </View>
        </FadeInUp>

        <FadeInUp delay={200} style={{ flexDirection: 'row', gap: 12, marginTop: 18, alignSelf: 'stretch' }}>
          {[
            ['Level', levelFromXp(state.xp)],
            ['Stage tuntas', done],
            ['Lencana', badges],
          ].map(([label, val]) => (
            <View key={label} style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 24, paddingVertical: 16, alignItems: 'center' }, shadow]}>
              <T weight="bold" style={{ fontSize: 28 }}>{val}</T>
              <T weight="semi" style={{ color: colors.slate, fontSize: 14 }}>{label}</T>
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
              <Ionicons name={soundOn ? 'volume-high' : 'volume-mute'} size={24} color={colors.blue} />
              <T weight="bold" style={{ fontSize: 17, marginLeft: 12 }}>
                Suara & Getaran
              </T>
            </View>
            <View
              style={{
                backgroundColor: soundOn ? colors.mint : colors.bg,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <T weight="bold" style={{ fontSize: 14, color: soundOn ? colors.greenText : colors.slate }}>
                {soundOn ? 'AKTIF' : 'MATI'}
              </T>
            </View>
          </Pressable>
        </FadeInUp>
      </View>

      <View style={{ gap: 10 }}>
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

      {/* Modal Ubah Nama Panggilan */}
      <Modal
        visible={editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(10, 9, 66, 0.65)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View style={[{ backgroundColor: '#fff', borderRadius: 30, padding: 22 }, shadow]}>
            <T weight="bold" style={{ fontSize: 22, marginBottom: 6 }}>
              Ubah Nama Panggilan
            </T>
            <T weight="semi" style={{ fontSize: 14, color: colors.slate, marginBottom: 14 }}>
              Masukkan nama unik yang akan tampil di Beranda dan Peringkat kelas:
            </T>

            <Field
              placeholder="Nama panggilan baru"
              value={newName}
              onChangeText={setNewName}
              style={{ backgroundColor: colors.bg, marginBottom: 12 }}
            />

            {editError ? (
              <T weight="semi" style={{ color: colors.redDark, textAlign: 'center', marginBottom: 10, fontSize: 14 }}>
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
