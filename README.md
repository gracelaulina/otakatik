# OtakAtik (Prototype)

Prototype app belajar kode dengan maskot **Atik**, dibuat dengan React Native + Expo mengikuti desain UI/UX final.
Alurnya: Masuk/Daftar → Beranda → Pilih Stage → Materi → Kuis adaptif → Hasil, plus Progres, Lencana, Profil, dan Riwayat.

## Cara menjalankan

```bash
npm install
npx expo install --fix   # menyelaraskan versi paket dengan SDK Expo
npx expo start
```

Scan QR dengan **Expo Go**. Kalau Expo Go di HP kamu minta SDK yang lebih baru dari yang ada di `package.json`:

```bash
npx expo install expo@latest
npx expo install --fix
```

Kode hanya memakai API bawaan (`Animated`, `Pressable`, dll.) jadi upgrade SDK biasanya mulus.

## Struktur

```
App.js                      entry, load font Outfit, provider
src/
  theme.js                  warna, font, shadow
  data/content.js           materi + bank soal (3 stage x 3 level)
  state/GameContext.js      state global (nyawa, XP, lencana, progres) via useReducer
  navigation/               navigator ringan (stack + tab) tanpa library tambahan
  components/               Mascot, Button3D, TabBar, OptionCard, MatchBoard, FeedbackSheet, dll.
  screens/                  Login, Register, Home, StageSelect, Materi, Quiz,
                            StageComplete, Progress, Badges, Profile, History
```

## Logika kuis adaptif

- Satu sesi = 5 soal, mulai dari level **Sedang**.
- Benar 3x berturut-turut → naik tingkat (layar "Naik Tingkat!"). Salah 2x berturut-turut → turun tingkat.
- Benar +10 XP, salah -1 nyawa. Nyawa habis → layar "Nyawa Habis".
- Selesai stage: bonus +20 XP, bintang dari skor, konsep yang salah masuk "perlu diulang".
- Level pemain = `floor(XP / 100) + 1`.
- **Latihan** di Beranda mengambil soal dari konsep yang masih lemah (tanpa mengurangi nyawa).

## Animasi

Semua pakai `Animated` bawaan RN (mayoritas `useNativeDriver: true`):

- Maskot melayang dan berkedip, tombol 3D yang menekan ke bawah
- Transisi antarlayar (fade + geser), elemen muncul bertahap (stagger)
- Kartu opsi memantul saat dipilih, layar kuis bergetar saat salah, ikon nyawa bergetar saat berkurang
- Feedback sheet naik dari bawah, progress bar terisi halus
- Konfeti + maskot melompat di layar naik tingkat, bintang muncul memantul dan angka skor/XP menghitung naik di hasil stage
- Tab bar aktif membesar, kartu stage terkunci bergoyang saat diketuk

## Catatan prototype

- Login/daftar masih **mock** (tidak ada backend), dan progres tidak disimpan saat app ditutup.
  Langkah lanjut yang masuk akal: `@react-native-async-storage/async-storage` untuk simpan lokal, lalu Firebase/Supabase untuk akun dan sinkronisasi.
- Soal "Cocokkan data" memakai ketuk-lalu-ketuk. Seret-lepas (drag and drop) belum ada.
- Belum ada ikon app dan splash. Tambahkan di `app.json` sebelum build.
- `bundleIdentifier` dan `package` di `app.json` masih placeholder (`com.example.otakatik`), ganti sebelum rilis.
