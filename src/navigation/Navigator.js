import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, View } from 'react-native';
import { NavContext } from './NavContext';
import TabBar from '../components/TabBar';
import { colors } from '../theme';

import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import StageSelect from '../screens/StageSelect';
import Materi from '../screens/Materi';
import Quiz from '../screens/Quiz';
import StageComplete from '../screens/StageComplete';
import Progress from '../screens/Progress';
import Badges from '../screens/Badges';
import Profile from '../screens/Profile';
import History from '../screens/History';

const SCREENS = { Login, Register, Home, StageSelect, Materi, Quiz, StageComplete, Progress, Badges, Profile, History };
// layar mana saja yang menampilkan tab bar, dan tab mana yang aktif
const TAB_FOR = { Home: 'Home', StageSelect: 'Home', Progress: 'Progress', Badges: 'Badges', Profile: 'Profile' };

function Transition({ children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: v,
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function Navigator() {
  const idRef = useRef(2);
  const [stack, setStack] = useState([{ id: 1, name: 'Login', params: {} }]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const push = useCallback((name, params = {}) => setStack((s) => [...s, { id: idRef.current++, name, params }]), []);
  const replace = useCallback((name, params = {}) => setStack((s) => [...s.slice(0, -1), { id: idRef.current++, name, params }]), []);
  const reset = useCallback((name, params = {}) => setStack([{ id: idRef.current++, name, params }]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stackRef.current.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [back]);

  const nav = useMemo(() => ({ push, replace, reset, back }), [push, replace, reset, back]);
  const current = stack[stack.length - 1];
  const Comp = SCREENS[current.name];
  const activeTab = TAB_FOR[current.name];

  return (
    <NavContext.Provider value={nav}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Transition key={current.id}>
          <Comp params={current.params} />
        </Transition>
        {activeTab ? <TabBar active={activeTab} onChange={(tab) => reset(tab)} /> : null}
      </View>
    </NavContext.Provider>
  );
}
