import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import Button3D from '../components/Button3D';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame, levelFromXp, getBadges } from '../state/GameContext';
import { colors, shadow } from '../theme';
import { logoutUser, isFirebaseConfigured } from '../services/firebase';
import { feedback, isSoundEnabled, setSoundEnabled } from '../services/feedback';

export default function Profile() {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const user = state.user || { name: 'Teman', email: '' };
  const badges = getBadges(state).filter((b) => b.unlocked).length;
  const done = Object.keys(state.completed).length;
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const cloudActive = isFirebaseConfigured();

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) feedback.tap();
  };

  const logout = async () => {
    feedback.tap();
    await logoutUser();
    dispatch({ type: 'LOGOUT' });
    nav.reset('Login');
  };

  return (
    <Screen padBottom={100}>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 12 }}>
        <Mascot size={130} />
        <FadeInUp delay={100}>
          <T weight="bold" style={{ fontSize: 34, textAlign: 'center', marginTop: 6 }}>{user.name}</T>
          <T weight="semi" style={{ color: colors.slate, fontSize: 17, textAlign: 'center' }}>{user.email}</T>
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

        <FadeInUp delay={200} style={{ flexDirection: 'row', gap: 12, marginTop: 22, alignSelf: 'stretch' }}>
          {[
            ['Level', levelFromXp(state.xp)],
            ['Stage tuntas', done],
            ['Lencana', badges],
          ].map(([label, val]) => (
            <View key={label} style={[{ flex: 1, backgroundColor: '#fff', borderRadius: 24, paddingVertical: 18, alignItems: 'center' }, shadow]}>
              <T weight="bold" style={{ fontSize: 30 }}>{val}</T>
              <T weight="semi" style={{ color: colors.slate, fontSize: 14 }}>{label}</T>
            </View>
          ))}
        </FadeInUp>

        <FadeInUp delay={280} style={{ alignSelf: 'stretch', marginTop: 16 }}>
          <Pressable
            onPress={toggleSound}
            style={[
              {
                backgroundColor: '#fff',
                borderRadius: 24,
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              shadow,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={soundOn ? 'volume-high' : 'volume-mute'} size={24} color={colors.blue} />
              <T weight="bold" style={{ fontSize: 18, marginLeft: 12 }}>
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
      <Button3D title="Keluar" variant="white" onPress={logout} />
    </Screen>
  );
}
