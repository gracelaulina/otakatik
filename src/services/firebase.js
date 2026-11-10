import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  reload,
  deleteUser,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// KONFIGURASI FIREBASE OTAKATIK (otakatik-100c6)
// ============================================================================
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD5Yv4iCT4UZlkK5bPB8UugeWejetuHaog',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'otakatik-100c6.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'otakatik-100c6',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'otakatik-100c6.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '769308927143',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:769308927143:web:6a840557e377256677a782',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-16RQBB3817',
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
    console.warn('Firebase init warning:', err?.message);
  }
}

const STORAGE_USER_KEY = '@otakatik_active_user_v2';
const STORAGE_ACCOUNTS_KEY = '@otakatik_accounts_v2';
const STORAGE_PROGRESS_PREFIX = '@otakatik_progress_v2_';

// Bersihkan cache akun versi lama (v1) otomatis
AsyncStorage.multiRemove(['@otakatik_active_user_v1', '@otakatik_accounts_v1']).catch(() => {});

const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const nameFromEmail = (email = '') => {
  const base =
    (email.split('@')[0] || 'Teman')
      .replace(/[^a-zA-Z]+/g, ' ')
      .trim()
      .split(' ')[0] || 'Teman';
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
};

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
  } catch {}
}

/**
 * Cek apakah nama panggilan sudah dipakai oleh email lain di Cloud Firestore atau lokal
 */
export async function isNameTaken(nameToCheck, currentEmail = '') {
  const targetName = String(nameToCheck || '').trim().toLowerCase();
  const myEmail = normalizeEmail(currentEmail);
  if (!targetName) return false;

  if (isFirebaseConfigured() && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      let taken = false;
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        const docEmail = normalizeEmail(d?.email || docSnap.id);
        const docName = String(d?.name || '').trim().toLowerCase();
        if (docName === targetName && docEmail !== myEmail) {
          taken = true;
        }
      });
      if (taken) return true;
    } catch {}
  }

  const accounts = await getLocalAccounts();
  for (const [accEmail, acc] of Object.entries(accounts)) {
    if (
      accEmail !== myEmail &&
      String(acc?.name || '').trim().toLowerCase() === targetName
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Daftar akun baru ke Firebase Auth + validasi nama unik + kirim email verifikasi dari noreply
 */
export async function registerUser({ name, email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = name.trim() || nameFromEmail(cleanEmail);

  // 1. Pastikan nama panggilan belum dipakai oleh email lain
  if (await isNameTaken(cleanName, cleanEmail)) {
    throw new Error(`Nama "${cleanName}" sudah dipakai akun lain. Gunakan nama unikmu!`);
  }

  if (isFirebaseConfigured() && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: cleanName });
        await sendEmailVerification(cred.user);
      }
      const userObj = {
        uid: cred.user.uid,
        name: cleanName,
        email: cleanEmail,
        emailVerified: false,
        provider: 'firebase',
      };
      if (db) {
        await setDoc(
          doc(db, 'users', cleanEmail),
          {
            uid: userObj.uid,
            name: cleanName,
            email: cleanEmail,
            xp: 0,
            hearts: 3,
            syncedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});
      }
      await saveLocalAccount(cleanEmail, { ...userObj, password });
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
      return { user: userObj, verificationSent: true, mode: 'firebase' };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        // Cek apakah dokumen di Firestore sudah dihapus sebelumnya (orphan di Firebase Auth)
        if (db) {
          const existingSnap = await getDoc(doc(db, 'users', cleanEmail)).catch(() => null);
          if (!existingSnap || !existingSnap.exists()) {
            try {
              const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
              await updateProfile(cred.user, { displayName: cleanName }).catch(() => {});
              await sendEmailVerification(cred.user).catch(() => {});
              const userObj = {
                uid: cred.user.uid,
                name: cleanName,
                email: cleanEmail,
                emailVerified: false,
                provider: 'firebase',
              };
              await setDoc(
                doc(db, 'users', cleanEmail),
                {
                  uid: userObj.uid,
                  name: cleanName,
                  email: cleanEmail,
                  xp: 0,
                  hearts: 3,
                  syncedAt: serverTimestamp(),
                },
                { merge: true }
              );
              await saveLocalAccount(cleanEmail, { ...userObj, password });
              await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
              return { user: userObj, verificationSent: true, mode: 'firebase' };
            } catch {
              throw new Error(
                'Email ini masih tersimpan di menu Authentication Firebase dengan sandi lama. Gunakan sandi sebelumnya atau hapus dari tab Authentication -> Users di Firebase Console.'
              );
            }
          }
        }
        throw new Error('Email ini sudah terdaftar. Silakan masuk.');
      }
      if (err.code === 'auth/invalid-email') {
        throw new Error('Format email tidak valid.');
      }
      if (err.code === 'auth/weak-password') {
        throw new Error('Kata sandi terlalu lemah (minimal 6 karakter).');
      }
      throw new Error(err.message || 'Gagal mendaftar ke Firebase.');
    }
  }

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
  return { user: userObj, verificationSent: false, mode: 'local' };
}

export async function checkEmailVerified() {
  if (!auth || !auth.currentUser) return false;
  try {
    await reload(auth.currentUser);
    return !!auth.currentUser.emailVerified;
  } catch {
    return false;
  }
}

export async function resendVerificationEmail() {
  if (!auth || !auth.currentUser) {
    throw new Error('Sesi pendaftaran tidak ditemukan.');
  }
  await sendEmailVerification(auth.currentUser);
  return true;
}

/**
 * Kirim email reset kata sandi dari noreply@otakatik-100c6.firebaseapp.com
 */
export async function resetPassword(email) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail.includes('@')) {
    throw new Error('Masukkan alamat email yang valid.');
  }
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Fitur reset sandi membutuhkan koneksi Firebase.');
  }
  if (db) {
    const snap = await getDoc(doc(db, 'users', cleanEmail)).catch(() => null);
    if (!snap || !snap.exists()) {
      throw new Error('Email ini belum pernah terdaftar. Silakan buat akun terlebih dahulu.');
    }
  }
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return true;
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
      throw new Error('Email tersebut belum terdaftar.');
    }
    throw new Error('Gagal mengirim email reset kata sandi.');
  }
}

/**
 * Masuk dengan Email & Kata Sandi via Firebase Auth
 */
export async function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);

  if (isFirebaseConfigured() && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      let resolvedName = cred.user.displayName || '';
      if (!resolvedName && db) {
        const snap = await getDoc(doc(db, 'users', cleanEmail)).catch(() => null);
        if (snap && snap.exists() && snap.data()?.name) {
          resolvedName = snap.data().name;
        }
      }
      const userObj = {
        uid: cred.user.uid,
        name: resolvedName || nameFromEmail(cleanEmail),
        email: cleanEmail,
        emailVerified: !!cred.user.emailVerified,
        provider: 'firebase',
      };
      await saveLocalAccount(cleanEmail, { ...userObj, password });
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
      throw new Error(err.message || 'Gagal masuk ke Firebase.');
    }
  }

  const accounts = await getLocalAccounts();
  const existing = accounts[cleanEmail];
  if (existing && existing.password && existing.password !== password) {
    throw new Error('Kata sandi yang kamu masukkan kurang tepat.');
  }
  const userObj = existing || {
    uid: `local_${cleanEmail}`,
    name: nameFromEmail(cleanEmail),
    email: cleanEmail,
    provider: 'local',
  };
  await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
  return { user: userObj, mode: 'local' };
}

/**
 * Masuk dengan Akun Google (validasi nama unik bila akun baru)
 */
export async function loginWithGoogle(customEmail, customName) {
  if (Platform.OS === 'web' && isFirebaseConfigured() && auth) {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const cleanEmail = normalizeEmail(cred.user.email || 'siswa@gmail.com');
    const cleanName = cred.user.displayName || nameFromEmail(cleanEmail);
    const userObj = {
      uid: cred.user.uid,
      name: cleanName,
      email: cleanEmail,
      emailVerified: true,
      provider: 'firebase-google',
    };
    if (db) {
      await setDoc(
        doc(db, 'users', cleanEmail),
        { uid: userObj.uid, name: cleanName, email: cleanEmail, syncedAt: serverTimestamp() },
        { merge: true }
      ).catch(() => {});
    }
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
    return { user: userObj };
  }

  const cleanEmail = normalizeEmail(customEmail || 'budi.siswa@gmail.com');
  let cleanName = (customName || '').trim();

  // Jika email ini sudah pernah terdaftar di Firestore, gunakan nama aslinya
  if (db) {
    const existingDoc = await getDoc(doc(db, 'users', cleanEmail)).catch(() => null);
    if (existingDoc && existingDoc.exists() && existingDoc.data()?.name) {
      cleanName = existingDoc.data().name;
    }
  }
  if (!cleanName) cleanName = nameFromEmail(cleanEmail);

  // Pastikan nama belum dipakai oleh email lain
  if (await isNameTaken(cleanName, cleanEmail)) {
    throw new Error(`Nama "${cleanName}" sudah dipakai email lain. Masukkan nama panggilan berbeda.`);
  }

  const userObj = {
    uid: `google_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
    name: cleanName,
    email: cleanEmail,
    emailVerified: true,
    provider: 'firebase-google',
  };
  if (db) {
    await setDoc(
      doc(db, 'users', cleanEmail),
      {
        uid: userObj.uid,
        name: userObj.name,
        email: cleanEmail,
        syncedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});
  }
  await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userObj));
  return { user: userObj };
}

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
 * Ubah nama panggilan pengguna (validasi nama unik + simpan ke Firestore, Auth & AsyncStorage)
 */
export async function updateUserName(user, newName) {
  const cleanName = String(newName || '').trim();
  if (!cleanName) {
    throw new Error('Nama panggilan tidak boleh kosong.');
  }
  const cleanEmail = normalizeEmail(user?.email || '');
  if (await isNameTaken(cleanName, cleanEmail)) {
    throw new Error(`Nama "${cleanName}" sudah dipakai siswa lain. Pilih nama lain!`);
  }

  const updatedUser = { ...user, name: cleanName };
  try {
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
    if (cleanEmail) {
      const accounts = await getLocalAccounts();
      if (accounts[cleanEmail]) {
        accounts[cleanEmail].name = cleanName;
        await AsyncStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
      }
    }
  } catch {}

  if (isFirebaseConfigured() && auth && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: cleanName }).catch(() => {});
  }

  if (isFirebaseConfigured() && db && cleanEmail) {
    await setDoc(
      doc(db, 'users', cleanEmail),
      { name: cleanName, syncedAt: serverTimestamp() },
      { merge: true }
    ).catch(() => {});
  }

  return updatedUser;
}

export async function deleteCurrentAccount(user) {
  const cleanEmail = user?.email ? normalizeEmail(user.email) : '';
  let savedPass = null;
  try {
    if (cleanEmail) {
      const accounts = await getLocalAccounts();
      savedPass = accounts[cleanEmail]?.password || null;
      delete accounts[cleanEmail];
      await AsyncStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
      await AsyncStorage.removeItem(STORAGE_PROGRESS_PREFIX + cleanEmail);
    }
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
  } catch {}

  if (isFirebaseConfigured() && db && cleanEmail) {
    try {
      await deleteDoc(doc(db, 'users', cleanEmail));
    } catch {}
  }

  if (isFirebaseConfigured() && auth) {
    try {
      if (!auth.currentUser && cleanEmail && savedPass) {
        await signInWithEmailAndPassword(auth, cleanEmail, savedPass);
      }
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
    } catch {
      try {
        if (cleanEmail && savedPass) {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, savedPass);
          await deleteUser(cred.user);
        } else {
          await fbSignOut(auth);
        }
      } catch {}
    }
  }
}

export async function getSavedSession() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loadUserProgress(user) {
  if (!user || !user.email) return null;
  const cleanEmail = normalizeEmail(user.email);
  const key = STORAGE_PROGRESS_PREFIX + cleanEmail;

  let localData = null;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) localData = JSON.parse(raw);
  } catch {}

  if (isFirebaseConfigured() && db) {
    try {
      const ref = doc(db, 'users', cleanEmail);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const cloudData = snap.data();
        if (!localData || (cloudData.xp || 0) >= (localData.xp || 0)) {
          await AsyncStorage.setItem(key, JSON.stringify(cloudData));
          return cloudData;
        }
      }
    } catch {}
  }

  return localData;
}



export async function saveUserProgress(user, stateToSave) {
  if (!user || !user.email) return false;

  const cleanEmail = normalizeEmail(user.email);
  const key = STORAGE_PROGRESS_PREFIX + cleanEmail;

  const payload = {
    hearts: stateToSave.hearts,
    xp: stateToSave.xp,
    completed: stateToSave.completed,
    weak: stateToSave.weak,
    history: (stateToSave.history || []).slice(0, 30),
    streak3: stateToSave.streak3,
    seenGuide: !!stateToSave.seenGuide,
    position: stateToSave.position,

    // Simpan seluruh kustomisasi robot Atik
    mascot: {
      color: stateToSave.mascot?.color || '#4DA8FF',
      accessory: stateToSave.mascot?.accessory || 'none',
      hair: stateToSave.mascot?.hair || 'none',
      hairColor: stateToSave.mascot?.hairColor || '#49315F',
      hat: stateToSave.mascot?.hat || 'none',
      outfit: stateToSave.mascot?.outfit || 'none',
      outfitColor: stateToSave.mascot?.outfitColor || '#FF8FB1',
      faceAccessory: stateToSave.mascot?.faceAccessory || 'none',
      extraAccessory: stateToSave.mascot?.extraAccessory || 'none',
    },

    updatedAt: Date.now(),
  };

  try {
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Gagal menyimpan progres lokal:', err);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const ref = doc(db, 'users', cleanEmail);

      await setDoc(
        ref,
        {
          ...payload,
          name: user.name,
          email: cleanEmail,
          syncedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return true;
    } catch (err) {
      console.warn('Gagal menyinkronkan progres Firebase:', err);
    }
  }

  return false;
}


export async function fetchLeaderboard() {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d && d.name) {
        list.push({
          id: docSnap.id,
          name: d.name,
          email: d.email || docSnap.id,
          xp: Number(d.xp || 0),
        });
      }
    });
    return list.length > 0 ? list.sort((a, b) => b.xp - a.xp) : null;
  } catch {
    return null;
  }
}
