# Dokumentasi Laporan & Materi Presentasi Proyek: OtakAtik

> **Judul Aplikasi:** OtakAtik — Aplikasi Mobile Pembelajaran Dasar Pemrograman Berbasis Gamifikasi Interaktif
> **Platform:** Android, iOS, & Web (React Native + Expo SDK 58)
> **Backend & Cloud:** Firebase Authentication, Cloud Firestore (`otakatik-100c6`), & REST API MySQL (`backend/`)

---

## 1. Deskripsi Singkat & Tujuan Aplikasi
**OtakAtik** adalah aplikasi media pembelajaran mobile interaktif yang dirancang untuk membantu siswa/mahasiswa memahami konsep dasar algoritma dan pemrograman (**Variabel**, **Tipe Data**, dan **Percabangan `if-else`**) melalui pendekatan **Gamifikasi** dan **Visualisasi Memori**.

### Masalah yang Diselesaikan:
1. Belajar pemrograman dari buku/teks statis sering terasa abstrak (sulit membayangkan bagaimana nilai variabel disimpan dan ditimpa di memori).
2. Kurangnya umpan balik langsung (*instant feedback*) dan motivasi belajar mandiri.

### Solusi OtakAtik:
- **Simulasi Kotak Memori Interaktif**: Menampilkan isi kotak memori langkah demi langkah saat baris kode dieksekusi.
- **Pembelajaran Bertingkat (3 Tier)**: Setiap Stage terbagi atas tingkat **Mudah**, **Menengah**, dan **Susah**.
- **Evaluasi Interaktif**: Menggabungkan soal **Pilihan Ganda** dan **Drag-and-Drop Merapikan Baris Kode**.

---

## 2. Daftar Fitur Utama (12 Layar & Modul)

| No | Modul / Layar | File Utama | Penjelasan Fitur |
|----|---------------|------------|------------------|
| 1 | **Autentikasi & Verifikasi Email** | `src/screens/Login.js`, `src/screens/Register.js`, `src/services/firebase.js` | Login Email/Sandi, Login Google, Validasi Nama Unik, Lupa Kata Sandi, serta pengiriman email verifikasi resmi dari `noreply@otakatik-100c6.firebaseapp.com`. |
| 2 | **Spotlight Onboarding Tour** | `src/components/GuideModal.js`, `src/screens/Home.js` | Panduan interaktif 5 langkah dengan *smooth animated spotlight cutout* untuk pengguna baru. |
| 3 | **Beranda & Lanjutkan Belajar** | `src/screens/Home.js` | Menampilkan status Nyawa (`3/3`), total XP, kartu *Quick Resume* ke stage terakhir, serta pintasan Latihan & Riwayat. |
| 4 | **Pilih Stage & Tingkat Kesulitan** | `src/screens/StageSelect.js` | Pemilihan 3 Stage utama (*Variabel*, *Tipe Data*, *Percabangan*) dengan sub-level *Mudah*, *Menengah*, dan *Susah* beserta indikator centang kelulusan. |
| 5 | **Materi & Simulator Memori** | `src/screens/Materi.js`, `src/components/MemorySim.js` | Kartu materi bertahap, blok kode berwarna, tips konsep, simulator kotak memori interaktif, dan kartu rangkuman di akhir stage. |
| 6 | **Kuis Adaptif & Drag-and-Drop** | `src/screens/Quiz.js`, `src/components/MatchBoard.js` | Kuis dengan sistem Nyawa, petunjuk (*Hint*), penjelasan jawaban, serta papan susun kode *Drag-and-Drop* (`PanResponder`). |
| 7 | **Stage Selesai & Naik Tingkat** | `src/screens/StageComplete.js`, `src/components/LevelUpView.js` | Animasi bintang (`1–3 Star`), konfeti, rincian skor & XP, serta evaluasi konsep yang perlu diulang. |
| 8 | **Progres & Rekomendasi Belajar** | `src/screens/Progress.js` | Grafik persentase penguasaan per Stage, bar progres Level XP, dan rekomendasi otomatis materi yang masih lemah (`weak concepts`). |
| 9 | **Peringkat Kelas (Live Leaderboard)** | `src/screens/Leaderboard.js` | Klasemen XP *real-time* dari Cloud Firestore, dilengkapi pencarian nama siswa, penanganan skor seri, dan **Avatar Maskot Kustom** tiap siswa. |
| 10 | **Lencana Prestasi (Badges)** | `src/screens/Badges.js` | 6 lencana pencapaian (*Beruntun 3x*, *Stage 1 Tuntas*, *Tanpa Salah*, *Level 5*, *Master Tipe Data*, *Master If-Else*). |
| 11 | **Riwayat Percobaan & Filter** | `src/screens/History.js` | Catatan waktu & skor seluruh percobaan kuis dengan filter *Semua*, *Tuntas*, dan *Nyawa Habis*. |
| 12 | **Profil & Kustomisasi Maskot Atik** | `src/screens/Profile.js`, `src/components/Mascot.js` | Ubah nama panggilan unik, kustomisasi dandanan Robot Atik (warna tubuh, rambut, topi, baju, kacamata, aksesoris), pengaturan Suara/Getaran, dan Hapus Akun. |

---

## 3. Arsitektur Penyimpanan Data (Hybrid Cloud + Offline-First)
1. **Cloud Utama (Firebase Auth & Cloud Firestore)**:
   - Koleksi `users/{email}` menyimpan profil, XP, nyawa, stage tamat, konsep lemah, riwayat kuis, dan konfigurasi pakaian maskot (`mascot`).
2. **Penyimpanan Lokal (`AsyncStorage`)**:
   - Menyimpan sesi dan progres secara lokal di perangkat sehingga aplikasi tetap berjalan 100% lancar saat *offline* (mode pesawat) dan otomatis menyinkronkan XP tertinggi saat kembali *online*.
3. **Skema Relasional MySQL (`backend/`)**:
   - Tersedia `backend/create-table.js` (19 tabel ternormalisasi), `backend/seed.js` (seeder otomatis seluruh materi & soal), dan `backend/server.js` (REST API Node.js).

---

## 4. Panduan Cara Build File `.APK` Android (Tanpa Expo Go)
Jika ingin menghasilkan file `.apk` yang bisa diinstal langsung di HP Android:

1. Install EAS CLI secara global (cukup sekali):
   ```bash
   npm install -g eas-cli
   ```
2. Login ke akun Expo (buat gratis di [expo.dev](https://expo.dev) jika belum punya):
   ```bash
   npx eas login
   ```
3. Jalankan perintah build APK menggunakan profil `preview` yang sudah disiapkan di `eas.json`:
   ```bash
   npx eas build -p android --profile preview
   ```
4. Setelah proses selesai di server Expo, akan muncul **Link Download `.apk`** dan **QR Code** untuk mengunduh dan menginstal aplikasi langsung di HP Android.
