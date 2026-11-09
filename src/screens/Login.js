import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
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
  loginUser,
  loginWithGoogle,
  resetPassword,
  checkEmailVerified,
  resendVerificationEmail,
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
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  // State halaman dalam (Lupa Kata Sandi & Verifikasi Email)
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [googleModal, setGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState('');
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
    if (!email.includes('@') || pass.length < 6) {
      setError('Cek lagi email dan kata sandimu (min. 6 karakter).');
      setInfo('');
      doShake();
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const { user } = await loginUser({ email, password: pass });
      if (user.provider === 'firebase' && !user.emailVerified) {
        setUnverifiedUser(user);
        return;
      }
      await finishLogin(user);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa kembali akunmu.');
      doShake();
    } finally {
      setBusy(false);
    }
  };

  const handleCheckVerified = async () => {
    if (busy || !unverifiedUser) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const ok = await checkEmailVerified();
      if (ok) {
        await finishLogin({ ...unverifiedUser, emailVerified: true });
      } else {
        setError('Email belum terverifikasi. Cek inbox / Spam Gmail kamu dari noreply@otakatik-100c6.firebaseapp.com');
        doShake();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerify = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await resendVerificationEmail();
      feedback.tap();
      setInfo('Link verifikasi baru telah dikirim ke ' + unverifiedUser.email);
    } catch {
      setError('Tunggu beberapa saat sebelum mengirim ulang email.');
    } finally {
      setBusy(false);
    }
  };

  const openForgotScreen = () => {
    feedback.tap();
    setForgotEmail(email);
    setForgotError('');
    setForgotSent(false);
    setForgotMode(true);
  };

  const submitForgotPassword = async () => {
    if (busy) return;
    setForgotError('');
    setForgotSent(false);
    if (!forgotEmail.trim().includes('@')) {
      setForgotError('Masukkan alamat email yang pernah kamu daftarkan.');
      doShake();
      return;
    }
    setBusy(true);
    try {
      await resetPassword(forgotEmail);
      feedback.correct();
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.message || 'Gagal mengirim email reset kata sandi.');
      doShake();
    } finally {
      setBusy(false);
    }
  };

  const handleGooglePress = async () => {
    if (busy) return;
    if (Platform.OS === 'web') {
      setBusy(true);
      setError('');
      try {
        const { user } = await loginWithGoogle();
        await finishLogin(user);
      } catch {
        setError('Gagal masuk dengan popup Google.');
      } finally {
        setBusy(false);
      }
      return;
    }
    feedback.tap();
    setGoogleError('');
    setGoogleModal(true);
  };

  const confirmMobileGoogle = async () => {
    const targetEmail = googleEmail.trim().toLowerCase();
    if (!targetEmail.includes('@')) {
      setGoogleError('Masukkan alamat email Google (@gmail.com) yang valid.');
      return;
    }
    setBusy(true);
    setGoogleError('');
    try {
      const { user } = await loginWithGoogle(targetEmail, googleName);
      setGoogleModal(false);
      await finishLogin(user);
    } catch (err) {
      setGoogleError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen bg={colors.sky}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {forgotMode ? (
            <FadeInUp>
              <View style={{ marginBottom: 16, alignItems: 'flex-start' }}>
                <BackButton
                  onPress={() => {
                    feedback.tap();
                    setForgotMode(false);
                  }}
                />
              </View>

              <T weight="bold" style={{ fontSize: 38 }}>Lupa Kata Sandi</T>
              <T weight="semi" style={{ color: colors.slate, fontSize: 17, marginTop: 6, marginBottom: 20, lineHeight: 24 }}>
                Masukkan alamat email yang pernah kamu daftarkan. Kami akan mengirim tautan reset kata sandi dari{' '}
                <T weight="bold" style={{ color: colors.navy }}>noreply@otakatik-100c6.firebaseapp.com</T>.
              </T>

              <Animated.View style={{ transform: [{ translateX: shake }] }}>
                <Field
                  placeholder="Masukkan email terdaftar (contoh: kamu@gmail.com)"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Animated.View>

              {forgotError ? (
                <T weight="semi" style={{ color: colors.redDark, marginTop: 12, fontSize: 14 }}>
                  {forgotError}
                </T>
              ) : null}

              {forgotSent ? (
                <View style={[{ backgroundColor: '#fff', borderRadius: 24, padding: 18, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, shadow]}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="checkmark-circle" size={26} color={colors.greenDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T weight="bold" style={{ fontSize: 16 }}>Email Reset Terkirim!</T>
                    <T weight="semi" style={{ fontSize: 14, color: colors.slate, marginTop: 2, lineHeight: 20 }}>
                      Cek kotak masuk atau folder Spam di <T weight="bold" style={{ color: colors.navy }}>{forgotEmail.trim()}</T>, lalu klik link untuk membuat kata sandi baru.
                    </T>
                  </View>
                </View>
              ) : null}

              <View style={{ marginTop: 20, gap: 12 }}>
                <Button3D
                  title={busy ? 'Mengirim...' : forgotSent ? 'Kirim Ulang Link Reset' : 'Kirim Link Reset Sandi'}
                  variant="blue"
                  disabled={busy}
                  onPress={submitForgotPassword}
                />
                {forgotSent && (
                  <Button3D
                    title="Kembali ke Halaman Masuk"
                    variant="white"
                    onPress={() => {
                      setEmail(forgotEmail.trim());
                      setForgotMode(false);
                    }}
                  />
                )}
              </View>
            </FadeInUp>
          ) : unverifiedUser ? (
            <FadeInUp style={{ marginTop: 28 }}>
              <View style={[{ backgroundColor: '#fff', borderRadius: 32, padding: 24, alignItems: 'center' }, shadow]}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.yellow,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="mail-unread" size={32} color={colors.navy} />
                </View>
                <T weight="bold" style={{ fontSize: 24, textAlign: 'center' }}>
                  Verifikasi Email Dulu Yuk!
                </T>
                <T weight="semi" style={{ fontSize: 14, color: colors.slate, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                  Akun <T weight="bold" style={{ color: colors.navy }}>{unverifiedUser.email}</T> belum diverifikasi. Klik tautan dari <T weight="bold">noreply@otakatik-100c6.firebaseapp.com</T> di Gmail kamu.
                </T>

                {error ? (
                  <T weight="semi" style={{ color: colors.redDark, textAlign: 'center', marginTop: 12, fontSize: 14 }}>
                    {error}
                  </T>
                ) : null}
                {info ? (
                  <T weight="semi" style={{ color: colors.greenDark, textAlign: 'center', marginTop: 12, fontSize: 14 }}>
                    {info}
                  </T>
                ) : null}

                <Button3D
                  title={busy ? 'Memeriksa...' : 'Saya Sudah Verifikasi'}
                  variant="blue"
                  disabled={busy}
                  onPress={handleCheckVerified}
                  style={{ width: '100%', marginTop: 18 }}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16 }}>
                  <Pressable onPress={handleResendVerify} style={{ paddingVertical: 6 }}>
                    <T weight="bold" style={{ fontSize: 14, color: colors.blue }}>
                      Kirim Ulang Email
                    </T>
                  </Pressable>
                  <Pressable onPress={() => finishLogin(unverifiedUser)} style={{ paddingVertical: 6 }}>
                    <T weight="semi" style={{ fontSize: 14, color: colors.slate }}>
                      Lanjut Masuk →
                    </T>
                  </Pressable>
                </View>
              </View>
            </FadeInUp>
          ) : (
            <>
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Mascot size={136} />
                <T weight="bold" style={{ fontSize: 40, marginTop: 4, marginBottom: 16 }}>Masuk</T>
              </View>

              <Animated.View style={{ transform: [{ translateX: shake }], gap: 12 }}>
                <FadeInUp delay={100}>
                  <Field
                    placeholder="Email (contoh: kamu@gmail.com)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </FadeInUp>
                <FadeInUp delay={160}>
                  <Field
                    placeholder="Kata sandi"
                    value={pass}
                    onChangeText={setPass}
                    secureTextEntry
                  />
                </FadeInUp>
              </Animated.View>

              <Pressable
                onPress={openForgotScreen}
                style={{ alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 4 }}
              >
                <T weight="bold" style={{ fontSize: 14, color: colors.blue }}>
                  Lupa Kata Sandi?
                </T>
              </Pressable>

              <FadeInUp delay={210} style={{ marginTop: 2 }}>
                <Button3D
                  title={busy ? 'Memproses...' : 'Masuk'}
                  variant="blue"
                  disabled={busy}
                  onPress={submit}
                />
              </FadeInUp>

              {error ? (
                <T weight="semi" style={{ color: colors.redDark, textAlign: 'center', marginTop: 10, fontSize: 14 }}>
                  {error}
                </T>
              ) : null}
              {info ? (
                <T weight="semi" style={{ color: colors.greenDark, textAlign: 'center', marginTop: 10, fontSize: 14 }}>
                  {info}
                </T>
              ) : null}

              <T weight="semi" style={{ textAlign: 'center', color: colors.slate, fontSize: 16, marginVertical: 12 }}>
                Atau masuk dengan
              </T>

              <FadeInUp delay={260}>
                <Button3D
                  title="Masuk dengan Google"
                  variant="navy"
                  disabled={busy}
                  onPress={handleGooglePress}
                />
              </FadeInUp>

              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => {
                  feedback.tap();
                  nav.push('Register');
                }}
                style={{ paddingVertical: 16 }}
              >
                <T weight="semi" style={{ textAlign: 'center', color: colors.slate, fontSize: 18 }}>
                  Belum punya akun? <T weight="bold" style={{ color: colors.blue }}>Daftar</T>
                </T>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Pilih Akun Google untuk Mobile (Expo Go) */}
      <Modal
        visible={googleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setGoogleModal(false)}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Ionicons name="logo-google" size={26} color={colors.blue} />
              <T weight="bold" style={{ fontSize: 22 }}>
                Masuk dengan Google
              </T>
            </View>
            <T weight="semi" style={{ fontSize: 14, color: colors.slate, marginBottom: 14, lineHeight: 20 }}>
              Masukkan akun Gmail dan nama panggilan unikmu untuk menyinkronkan progres ke Firebase:
            </T>

            <View style={{ gap: 10, marginBottom: 12 }}>
              <Field
                placeholder="Nama panggilan unik"
                value={googleName}
                onChangeText={setGoogleName}
                style={{ backgroundColor: colors.bg }}
              />
              <Field
                placeholder="emailkamu@gmail.com"
                value={googleEmail}
                onChangeText={setGoogleEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ backgroundColor: colors.bg }}
              />
            </View>

            {googleError ? (
              <T weight="semi" style={{ color: colors.redDark, textAlign: 'center', marginBottom: 10, fontSize: 14 }}>
                {googleError}
              </T>
            ) : null}

            <Button3D
              title={busy ? 'Memeriksa...' : 'Lanjutkan dengan Google'}
              variant="blue"
              disabled={busy}
              onPress={confirmMobileGoogle}
            />

            <Pressable
              onPress={() => setGoogleModal(false)}
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
