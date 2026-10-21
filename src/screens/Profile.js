import React from 'react';
import { View } from 'react-native';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import Button3D from '../components/Button3D';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame, levelFromXp, getBadges } from '../state/GameContext';
import { colors } from '../theme';

export default function Profile() {
  const nav = useNav();
  const { state, dispatch } = useGame();
  const user = state.user || { name: 'Teman', email: '' };
  const badges = getBadges(state).filter((b) => b.unlocked).length;
  const done = Object.keys(state.completed).length;

  const logout = () => {
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
        </FadeInUp>
        <FadeInUp delay={200} style={{ flexDirection: 'row', gap: 12, marginTop: 24, alignSelf: 'stretch' }}>
          {[
            ['Level', levelFromXp(state.xp)],
            ['Stage tuntas', done],
            ['Lencana', badges],
          ].map(([label, val]) => (
            <View key={label} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 24, paddingVertical: 18, alignItems: 'center' }}>
              <T weight="bold" style={{ fontSize: 30 }}>{val}</T>
              <T weight="semi" style={{ color: colors.slate, fontSize: 14 }}>{label}</T>
            </View>
          ))}
        </FadeInUp>
      </View>
      <Button3D title="Keluar" variant="white" onPress={logout} />
    </Screen>
  );
}
