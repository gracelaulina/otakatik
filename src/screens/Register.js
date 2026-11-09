import React, { useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import Mascot from '../components/Mascot';
import Field from '../components/Field';
import Button3D from '../components/Button3D';
import FadeInUp from '../components/FadeInUp';
import { BackButton } from '../components/TopBar';
import { useNav } from '../navigation/NavContext';
import { useGame } from '../state/GameContext';
import { colors, shadow } from '../theme';
import {
  registerUser,
  checkEmailVerified,
  resendVerificationEmail,
  loadUserProgress,
} from '../services/firebase';
import { feedback } from '../services/feedback';

export default function Register() {
  const nav = useNav();
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const shake = useRef(new Animated.Value(0)).current;

  const doShake = () => {
    feedback.wrong();
    Animated.sequence(
      [10, -10, 8, -8, 4, 0].map((v) =>
        Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: true })
      )
    ).start();
  };

  const finishLogin = async (userObj) => {
    const progress = await loadUserProgress(userObj);
    feedback.correct();
    dispatch({ type: 'LOGIN', user: userObj, progress });
    nav.reset('Home');
  };

  const submit = async () => {
    if (busy) return;
    if (!name.trim() || !email.includes('@') || pass.length < 6) {
      setError('Isi nama unik, email aktif, dan kata sandi minimal 6 karakter.');
      doShake();
      return;
    }
    if (pass !== confirmPass) {
      setError('Konfirmasi kata sandi tidak cocok.');
      doShake();
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const { user, verificationSent } = await registerUser({ name, email, password: pass });
      if (verificationSent) {
        feedback.correct();
        setPendingUser(user);
      } else {
        await finishLogin(user);
      }
    } catch (err) {
      setError(err.message || 'Gagal mendaftar. Coba lagi.');
      doShake();
    } finally {
      setBusy(false);
    }
  };

  const handleCheckVerification = async () => {
    if (busy || !pendingUser) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const verified = await checkEmailVerified();
      if (verified) {
        await finishLogin({ ...pendingUser, emailVerified: true });
      } else {
        setError('Email belum terverifikasi. Buka Gmail (cek juga folder Spam) lalu klik link dari noreply@otakatik-100c6.firebaseapp.com');
        doShake();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await resendVerificationEmail();
      feedback.tap();
      setInfo('Email verifikasi baru sudah dikirim ulang ke ' + pendingUser.email);
    } catch {
      setError('Tunggu sebentar sebelum meminta kirim ulang email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen bg={colors.sky}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ marginBottom: 12, alignItems: 'flex-start' }}>
          <BackButton
            onPress={() => {
              feedback.tap();
              if (pendingUser) setPendingUser(null);
              else nav.back();
            }}
          />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {pendingUser ? (
            <FadeInUp>
              <View style={[{ backgroundColor: '#fff', borderRadius: 32, padding: 24, alignItems: 'center', marginTop: 8 }, shadow]}>
                <View
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    backgroundColor: colors.mint,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Ionicons name="mail-unread" size={34} color={colors.navy} />
                </View>

                <T weight="bold" style={{ fontSize: 26, textAlign: 'center' }}>
                  Cek Email Kamu!
                </T>
                <T weight="semi" style={{ fontSize: 15, color: colors.slate, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
                  Kami telah mengirim pesan verifikasi dari{' '}
                  <T weight="bold" style={{ color: colors.navy }}>noreply@otakatik-100c6.firebaseapp.com</T> ke:
                </T>

                <View style={{ backgroundColor: colors.sky, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginVertical: 14 }}>
                  <T weight="bold" style={{ fontSize: 16, color: colors.blueDark }}>
                    {pendingUser.email}
                  </T>
                </View>

                <T weight="semi" style={{ fontSize: 14, color: colors.slate, textAlign: 'center', marginBottom: 18, lineHeight: 20 }}>
                  Buka aplikasi Gmail (cek juga folder Spam), klik tautan verifikasi di dalamnya, lalu tekan tombol di bawah ini:
                </T>

                {error ? (
                  <T weight="semi" style={{ color: colors.redDark, textAlign: 'center', marginBottom: 12, fontSize: 14 }}>
                    {error}
                  </T>
                ) : null}
                {info ? (
                  <T weight="semi" style={{ color: colors.greenDark, textAlign: 'center', marginBottom: 12, fontSize: 14 }}>
                    {info}
                  </T>
                ) : null}

                <Button3D
                  title={busy ? 'Memeriksa...' : 'Saya Sudah Verifikasi'}
                  variant="blue"
                  disabled={busy}
                  onPress={handleCheckVerification}
                  style={{ width: '100%' }}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 18, paddingHorizontal: 4 }}>
                  <Pressable onPress={handleResend} style={{ paddingVertical: 6 }}>
                    <T weight="bold" style={{ fontSize: 14, color: colors.blue }}>
                      Kirim Ulang Email
                    </T>
                  </Pressable>
                  <Pressable onPress={() => finishLogin(pendingUser)} style={{ paddingVertical: 6 }}>
                    <T weight="semi" style={{ fontSize: 14, color: colors.slate }}>
                      Lanjut Masuk →
                    </T>
                  </Pressable>
                </View>
              </View>
            </FadeInUp>
          ) : (
            <>
              <FadeInUp>
                <T weight="bold" style={{ fontSize: 38 }}>Buat Akun</T>
                <T weight="semi" style={{ color: colors.slate, fontSize: 17, marginTop: 4, marginBottom: 14 }}>
                  Daftar dengan nama unik & Gmail aktif untuk menerima verifikasi.
                </T>
              </FadeInUp>
              <Animated.View style={{ transform: [{ translateX: shake }], gap: 12 }}>
                <FadeInUp delay={80}><Field placeholder="Nama panggilan unik" value={name} onChangeText={setName} /></FadeInUp>
                <FadeInUp delay={130}><Field placeholder="Alamat Gmail (contoh: nama@gmail.com)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /></FadeInUp>
                <FadeInUp delay={180}><Field placeholder="Kata sandi (min. 6 karakter)" value={pass} onChangeText={setPass} secureTextEntry /></FadeInUp>
                <FadeInUp delay={220}><Field placeholder="Ulangi kata sandi" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry /></FadeInUp>
              </Animated.View>
              {error ? <T weight="semi" style={{ color: colors.redDark, marginTop: 10, fontSize: 14 }}>{error}</T> : null}
              <View style={{ flex: 1 }} />
              <FadeInUp delay={280}>
                <View style={{ backgroundColor: colors.yellow, borderRadius: 28, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 14 }}>
                  <Mascot size={46} style={{ marginRight: 12, marginTop: -4 }} />
                  <T weight="semi" style={{ fontSize: 16, flex: 1, lineHeight: 22 }}>
                    Halo! Aku <T weight="bold">Atik</T>, temanmu belajar kode.
                  </T>
                </View>
              </FadeInUp>
              <Button3D title={busy ? 'Mendaftarkan...' : 'Daftar & Kirim Verifikasi'} disabled={busy} onPress={submit} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
