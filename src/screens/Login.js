import React, { useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import Field from '../components/Field';
import Button3D from '../components/Button3D';
import FadeInUp from '../components/FadeInUp';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { colors } from '../theme';
import {
  loginUser,
  loginWithGoogle,
  loadUserProgress,
  nameFromEmail,
} from '../services/firebase';
import { feedback } from '../services/feedback';

export { nameFromEmail };

export default function Login() {
  const nav = useNav();
  const { dispatch } = useGame();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  const doShake = () => {
    feedback.wrong();
    Animated.sequence(
      [10, -10, 8, -8, 4, 0].map((v) =>
        Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true })
      )
    ).start();
  };

  const submit = async () => {
    if (busy) return;
    if (!email.includes('@') || pass.length < 6) {
      setError('Cek lagi email dan kata sandimu (min. 6 karakter).');
      doShake();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { user } = await loginUser({ email, password: pass });
      const progress = await loadUserProgress(user);
      feedback.correct();
      dispatch({ type: 'LOGIN', user, progress });
      nav.reset('Home');
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa kembali akunmu.');
      doShake();
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { user } = await loginWithGoogle();
      const progress = await loadUserProgress(user);
      feedback.correct();
      dispatch({ type: 'LOGIN', user, progress });
      nav.reset('Home');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen bg={colors.sky}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Mascot size={150} />
            <T weight="bold" style={{ fontSize: 42, marginTop: 4, marginBottom: 20 }}>Masuk</T>
          </View>
          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <FadeInUp delay={100}>
              <Field placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </FadeInUp>
            <FadeInUp delay={180} style={{ flexDirection: 'row', gap: 12, marginTop: 14, alignItems: 'flex-start' }}>
              <Field placeholder="Kata sandi" value={pass} onChangeText={setPass} secureTextEntry style={{ flex: 1 }} />
              <Button3D
                title={busy ? '...' : 'GO'}
                variant="blue"
                radius={22}
                disabled={busy}
                onPress={submit}
                faceStyle={{ height: 60, paddingVertical: 0 }}
                style={{ width: 96 }}
              />
            </FadeInUp>
          </Animated.View>
          {error ? <T style={{ color: colors.redDark, textAlign: 'center', marginTop: 10, fontSize: 15 }}>{error}</T> : null}
          <T weight="semi" style={{ textAlign: 'center', color: colors.slate, fontSize: 18, marginVertical: 14 }}>Atau masuk dengan</T>
          <FadeInUp delay={260}>
            <Button3D title="Google ID" disabled={busy} onPress={google} />
          </FadeInUp>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => {
              feedback.tap();
              nav.push('Register');
            }}
            style={{ paddingVertical: 18 }}
          >
            <T weight="semi" style={{ textAlign: 'center', color: colors.slate, fontSize: 18 }}>
              Belum punya akun? <T weight="bold" style={{ color: colors.blue }}>Daftar</T>
            </T>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
