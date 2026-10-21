import React, { useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import Field from '../components/Field';
import Button3D from '../components/Button3D';
import FadeInUp from '../components/FadeInUp';
import { BackButton } from '../components/TopBar';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { colors } from '../theme';

export default function Register() {
  const nav = useNav();
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  const submit = () => {
    if (!name.trim() || !email.includes('@') || pass.length < 6) {
      setError('Isi nama, email yang benar, dan kata sandi minimal 6 karakter.');
      Animated.sequence([10, -10, 8, -8, 4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true }))).start();
      return;
    }
    dispatch({ type: 'LOGIN', user: { name: name.trim(), email: email.trim() } });
    nav.reset('Home');
  };

  return (
    <Screen bg={colors.sky}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginBottom: 16, alignItems: 'flex-start' }}>
          <BackButton onPress={nav.back} />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <FadeInUp>
            <T weight="bold" style={{ fontSize: 40 }}>Buat Akun</T>
            <T weight="semi" style={{ color: colors.slate, fontSize: 18, marginTop: 6, marginBottom: 18 }}>
              Simpan progres belajarmu di semua perangkat.
            </T>
          </FadeInUp>
          <Animated.View style={{ transform: [{ translateX: shake }], gap: 14 }}>
            <FadeInUp delay={80}><Field placeholder="Nama" value={name} onChangeText={setName} /></FadeInUp>
            <FadeInUp delay={140}><Field placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /></FadeInUp>
            <FadeInUp delay={200}><Field placeholder="Kata sandi (min. 6 karakter)" value={pass} onChangeText={setPass} secureTextEntry /></FadeInUp>
          </Animated.View>
          {error ? <T style={{ color: colors.redDark, marginTop: 10, fontSize: 15 }}>{error}</T> : null}
          <View style={{ flex: 1 }} />
          <FadeInUp delay={300}>
            <View style={{ backgroundColor: colors.yellow, borderRadius: 32, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 20 }}>
              <Mascot size={52} style={{ marginRight: 14, marginTop: -4 }} />
              <T weight="semi" style={{ fontSize: 18, flex: 1, lineHeight: 26 }}>
                Halo! Aku <T weight="bold">Atik</T>, temanmu belajar kode.
              </T>
            </View>
          </FadeInUp>
          <Button3D title="Daftar" onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
