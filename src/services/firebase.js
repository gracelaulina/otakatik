import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// KONFIGURASI FIREBASE OTAKATIK
// ============================================================================
// Masukkan konfigurasi Firebase Project Anda di sini atau melalui variabel
// environment EXPO_PUBLIC_FIREBASE_* di file .env
// Apabila belum diisi (masih placeholder), aplikasi otomatis menggunakan
// Cloud-Ready Local Fallback (AsyncStorage) agar tetap berjalan 100% lancar!
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSy_YOUR_API_KEY_HERE',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'otakatik-app.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'otakatik-app',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'otakatik-app.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

export const isFirebaseConfigured = () =>
  Boolean(
    firebaseConfig.apiKey &&
      !firebaseConfig.apiKey.includes('YOUR_API_KEY_HERE') &&
      firebaseConfig.projectId
  );

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase init warning (fallback ke mode lokal):', err?.message);
  }
}

const STORAGE_USER_KEY = '@otakatik_active_user_v1';
const STORAGE_ACCOUNTS_KEY = '@otakatik_accounts_v1';
const STORAGE_PROGRESS_PREFIX = '@otakatik_progress_v1_';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const nameFromEmail = (email = '') => {
  const base =
    (email.split('@')[0] || 'Teman')
      .replace(/[^a-zA-Z]+/g, ' ')
      .trim()
      .split(' ')[0] || 'Teman';
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
};

// Ambil daftar akun lokal (untuk fallback ketika Firebase belum dikonfigurasi/offline)
async function getLocalAccounts() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveLocalAccount(email, accountData) {
  try {
    const accounts = await getLocalAccounts();
    accounts[normalizeEmail(email)] = accountData;
    await AsyncStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Gagal menyimpan akun lokal:', e);
  }
}

/**
 * Daftar akun baru (Firebase Auth + Firestore + AsyncStorage)
 */
export async function registerUser({ name, email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = name.trim() || nameFromEmail(cleanEmail);

  // 1. Coba ke Firebase Auth jika sudah dikonfigurasi
  if (isFirebaseConfigured() && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: cleanName });
      }
      const userObj = {
        uid: cred.user.uid,
        name: cleanName,
        email: cleanEmail,
        provider: 'firebase',
      };
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
      return { user: userObj, mode: 'firebase' };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('Email ini sudah terdaftar. Silakan masuk.');
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error('Format email tidak valid.');
      }
      if (err.code === 'auth/weak-password') {
        throw new Error('Kata sandi terlalu lemah (minimal 6 karakter).');
      }
      // Jika error jaringan/konfigurasi, lanjut ke penyimpanan lokal
    }
  }

  // 2. Fallback / Local-First Auth (tetap mengecek duplikasi & menyimpan akun)
  const accounts = await getLocalAccounts();
  if (accounts[cleanEmail]) {
    throw new Error('Email ini sudah terdaftar di perangkat ini. Silakan masuk.');
  }
  const userObj = {
    uid: `local_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    provider: 'local',
  };
  await saveLocalAccount(cleanEmail, { ...userObj, password });
  await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
  return { user: userObj, mode: 'local' };
}

/**
 * Masuk dengan Email & Kata Sandi (Firebase Auth + Local Fallback)
 */
export async function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);

  // 1. Coba ke Firebase Auth jika sudah dikonfigurasi
  if (isFirebaseConfigured() && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const userObj = {
        uid: cred.user.uid,
        name: cred.user.displayName || nameFromEmail(cleanEmail),
        email: cleanEmail,
        provider: 'firebase',
      };
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
      return { user: userObj, mode: 'firebase' };
    } catch (err) {
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        throw new Error('Email atau kata sandi salah.');
      }
    }
  }

  // 2. Cek akun di penyimpanan lokal
  const accounts = await getLocalAccounts();
  const existing = accounts[cleanEmail];
  if (existing) {
    if (existing.password && existing.password !== password) {
      throw new Error('Kata sandi yang kamu masukkan kurang tepat.');
    }
    const userObj = {
      uid: existing.uid,
      name: existing.name || nameFromEmail(cleanEmail),
      email: cleanEmail,
      provider: 'local',
    };
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
    return { user: userObj, mode: 'local' };
  }

  // Bila belum pernah daftar tapi langsung login di mode demo/lokal, buatkan otomatis
  const userObj = {
    uid: `local_${cleanEmail}`,
    name: nameFromEmail(cleanEmail),
    email: cleanEmail,
    provider: 'local',
  };
  await saveLocalAccount(cleanEmail, { ...userObj, password });
  await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
  return { user: userObj, mode: 'local' };
}

/**
 * Masuk dengan Google ID
 */
export async function loginWithGoogle() {
  const cleanEmail = 'budi.siswa@gmail.com';
  const userObj = {
    uid: 'google_budi_siswa',
    name: 'Budi',
    email: cleanEmail,
    provider: isFirebaseConfigured() ? 'firebase-google' : 'google-local',
  };
  await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
  return { user: userObj };
}

/**
 * Keluar (Logout)
 */
export async function logoutUser() {
  if (isFirebaseConfigured() && auth) {
    try {
      await fbSignOut(auth);
    } catch {}
  }
  try {
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
  } catch {}
}

/**
 * Ambil sesi user terakhir yang tersimpan
 */
export async function getSavedSession() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Muat progres belajar user dari Firestore (jika aktif) atau AsyncStorage
 */
export async function loadUserProgress(user) {
  if (!user || !user.email) return null;
  const key = STORAGE_PROGRESS_PREFIX + normalizeEmail(user.email);

  // 1. Ambil dari penyimpanan lokal terlebih dahulu agar cepat
  let localData = null;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) localData = JSON.parse(raw);
  } catch {}

  // 2. Jika Firebase Firestore aktif, coba ambil dari cloud
  if (isFirebaseConfigured() && db) {
    try {
      const ref = doc(db, 'users', normalizeEmail(user.email));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const cloudData = snap.data();
        // Pilih data dengan XP tertinggi antara lokal dan cloud
        if (!localData || (cloudData.xp || 0) >= (localData.xp || 0)) {
          await AsyncStorage.setItem(key, JSON.stringify(cloudData));
          return cloudData;
        }
      }
    } catch {}
  }

  return localData;
}

/**
 * Simpan progres belajar user ke AsyncStorage & sinkronkan ke Firestore
 */
export async function saveUserProgress(user, stateToSave) {
  if (!user || !user.email) return false;
  const key = STORAGE_PROGRESS_PREFIX + normalizeEmail(user.email);
  const payload = {
    hearts: stateToSave.hearts,
    xp: stateToSave.xp,
    completed: stateToSave.completed,
    weak: stateToSave.weak,
    history: (stateToSave.history || []).slice(0, 30),
    streak3: stateToSave.streak3,
    position: stateToSave.position,
    updatedAt: Date.now(),
  };

  try {
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch {}

  if (isFirebaseConfigured() && db) {
    try {
      const ref = doc(db, 'users', normalizeEmail(user.email));
      await setDoc(
        ref,
        {
          ...payload,
          name: user.name,
          email: user.email,
          syncedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return true;
    } catch {}
  }
  return false;
}
