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

export const nameFromEmail = (email) => {
  const base = (email.split('@')[0] || 'Teman').replace(/[^a-zA-Z]+/g, ' ').trim().split(' ')[0] || 'Teman';
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
};

export default function Login() {
  const nav = useNav();
  const { dispatch } = useGame();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  const doShake = () =>
    Animated.sequence([10, -10, 8, -8, 4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start();

  const submit = () => {
    if (!email.includes('@') || pass.length < 6) {
      setError('Cek lagi email dan kata sandimu (min. 6 karakter).');
      doShake();
      return;
    }
    dispatch({ type: 'LOGIN', user: { name: nameFromEmail(email), email: email.trim() } });
    nav.reset('Home');
  };

  const google = () => {
    dispatch({ type: 'LOGIN', user: { name: 'Teman', email: 'pengguna@gmail.com' } });
    nav.reset('Home');
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
              <Button3D title="GO" variant="blue" radius={22} onPress={submit} faceStyle={{ height: 60, paddingVertical: 0 }} style={{ width: 96 }} />
            </FadeInUp>
          </Animated.View>
          {error ? <T style={{ color: colors.redDark, textAlign: 'center', marginTop: 10, fontSize: 15 }}>{error}</T> : null}
          <T weight="semi" style={{ textAlign: 'center', color: colors.slate, fontSize: 18, marginVertical: 14 }}>Atau masuk dengan</T>
          <FadeInUp delay={260}>
            <Button3D title="Google ID" onPress={google} />
          </FadeInUp>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => nav.push('Register')} style={{ paddingVertical: 18 }}>
            <T weight="semi" style={{ textAlign: 'center', color: colors.slate, fontSize: 18 }}>
              Belum punya akun? <T weight="bold" style={{ color: colors.blue }}>Daftar</T>
            </T>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
