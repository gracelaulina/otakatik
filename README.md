# OtakAtik

Aplikasi belajar logika dasar pemrograman (Variabel, Tipe Data, dan Percabangan) bersama maskot **Atik**, dibuat dengan React Native + Expo SDK 58.

> 📖 **Panduan Lengkap Tim (Clone, Pull, Setup MySQL & Expo Go):** Lihat juga di [PANDUAN.md](./PANDUAN.md).

## Panduan Cepat Update GitHub & Jalankan di Expo Go

### 1. Ambil Kode Terbaru dari GitHub
Buka Terminal di VS Code (`Ctrl + ~`):

- **Kalau BELUM pernah punya foldernya di laptop (Clone):**
  ```bash
  git clone https://github.com/gracelaulina/otakatik.git
  cd otakatik
  ```

- **Kalau SUDAH punya foldernya dan mau update kode terbaru (Pull):**
  Pastikan terminal sudah berada di folder `otakatik`, lalu ketik:
  ```bash
  git pull origin main
  ```

### 2. Install Library Aplikasi (Wajib setelah Clone / Pull)
Ketik perintah ini di folder `otakatik`:
```bash
npm install
```

### 3. Setup Database Lokal (XAMPP / MySQL)
1. Buka **XAMPP Control Panel**, lalu klik **Start** pada **MySQL** sampai berwarna hijau.
2. Di VS Code, buka folder `backend` lalu buat file bernama `.env` dan isi dengan:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=otakatik
   ```
3. Jalankan perintah ini di terminal untuk membuat database & 19 tabel otomatis:
   ```bash
   cd backend
   npm install mysql2 dotenv
   node create-table.js
   cd ..
   ```

### 4. Cara Membuka Aplikasi di HP (Expo Go)
1. Pastikan posisi terminal berada di folder utama `otakatik` (bukan di dalam `backend`), lalu ketik:
   ```bash
   npx expo start -c
   ```
2. Pastikan HP dan Laptop terhubung ke **WiFi / Hotspot yang sama**.
3. Buka aplikasi **Expo Go** di HP, lalu **Scan QR Code** yang muncul di terminal VS Code.
4. Jika ingin me-refresh aplikasi di HP, tekan huruf `r` di terminal VS Code.
5. Jika sudah selesai dan ingin mematikan server di terminal, tekan `Ctrl + C`.

### 5. Kalau Habis Ngoding dan Mau Upload (Push) ke GitHub
Pastikan di terminal ketik urutan ini:
```bash
git pull origin main
git add .
git commit -m "update kode"
git push origin main
```

---

## Struktur Proyek

```
App.js                      entry, load font Outfit, provider
PANDUAN.md                  panduan lengkap penggunaan GitHub, MySQL & Expo Go
backend/
  create-table.js           pembuatan 19 tabel database MySQL (otakatik)
src/
  theme.js                  warna, font, shadow
  data/content.js           materi + bank soal (3 stage x 3 tingkatan: Mudah, Menengah, Susah)
  state/GameContext.js      state global (nyawa, XP, lencana, progres, panduan)
  services/                 firebase.js (Auth + Firestore + AsyncStorage) & feedback.js (Haptics)
  navigation/               navigator ringan (stack + 5 tab)
  components/               Mascot, MemorySim, GuideModal, Button3D, TabBar, OptionCard, MatchBoard, dll.
  screens/                  Login, Register, Home, StageSelect, Materi, Quiz,
                            StageComplete, Progress, Leaderboard, Badges, Profile, History
```
