// Semua materi & bank soal ada di sini. Tinggal tambah/ubah objeknya.
// Kode di soal memakai pseudo-code supaya netral bahasa.

export const LEVELS = [
  { key: 'mudah', label: 'Mudah', bg: '#C8F2DC' },
  { key: 'sedang', label: 'Sedang', bg: '#FDE0A5' },
  { key: 'sulit', label: 'Sulit', bg: '#FBC4E8' },
];

export const STAGES = [
  {
    id: 1,
    title: 'Variabel',
    subtitle: 'Menyimpan nilai',
    color: '#FBC4E8',
    materi: [
      {
        title: 'Kenapa Perlu Variabel?',
        body: 'Saat main game, skor dan nyawamu harus diingat komputer. Tempat untuk mengingatnya disebut variabel.',
        code: 'skor = 0\nnyawa = 3',
        tip: 'Beri nama variabel yang jelas artinya.',
      },
      {
        title: 'Apa itu Variabel?',
        body: 'Variabel itu seperti kotak berlabel di memori komputer. Label adalah nama, isinya adalah nilai yang bisa diganti.',
        code: 'nama = "Budi"\numur = 16',
        tip: 'nama variabel tidak boleh diawali angka.',
      },
      {
        title: 'Mengubah Nilai',
        body: 'Isi variabel bisa diganti kapan saja. Nilai lama akan tertimpa oleh nilai yang baru.',
        code: 'skor = 0\nskor = skor + 10',
        tip: 'Tanda = artinya "simpan ke", bukan "sama dengan" seperti di matematika.',
      },
    ],
    questions: {
      mudah: [
        { id: 'v1', concept: 'Nama variabel', type: 'choice', mono: true, prompt: 'Pada nama = "Budi", mana yang menjadi nama variabelnya?', options: ['nama', '"Budi"', '=', 'Tidak ada'], answer: 0, explanation: 'Nama variabel adalah label yang ada di sebelah kiri tanda =.' },
        { id: 'v2', concept: 'Pengertian variabel', type: 'choice', prompt: 'Variabel paling mirip dengan apa?', options: ['Kotak berlabel untuk menyimpan nilai', 'Tombol untuk mematikan komputer', 'Kabel penghubung layar', 'Folder berisi gambar'], answer: 0, explanation: 'Variabel seperti kotak berlabel: label adalah nama, isinya adalah nilai.' },
        { id: 'v3', concept: 'Tanda =', type: 'choice', prompt: 'Pada umur = 16, apa fungsi tanda =?', options: ['Menyimpan nilai ke variabel', 'Membandingkan dua nilai', 'Menghapus variabel', 'Menampilkan teks'], answer: 0, explanation: 'Tanda = dipakai untuk menyimpan nilai di kanan ke variabel di kiri.' },
      ],
      sedang: [
        { id: 'v4', concept: 'Aturan penamaan', type: 'choice', mono: true, prompt: 'Nama variabel mana yang valid?', options: ['1nama', 'nama-1', 'nama_1', 'nama 1'], answer: 2, explanation: 'Nama variabel tidak boleh diawali angka, tidak boleh pakai spasi atau tanda minus.' },
        { id: 'v5', concept: 'Mengubah nilai', type: 'choice', mono: true, prompt: 'Setelah x = 5 lalu x = 9, berapa isi x?', options: ['5', '9', '14', 'Error'], answer: 1, explanation: 'Nilai baru menimpa nilai lama, jadi x sekarang berisi 9.' },
        { id: 'v6', concept: 'Mengubah nilai', type: 'choice', mono: true, prompt: 'Berapa isi umur sekarang?', code: 'umur = 16\numur = umur + 1', options: ['16', '17', '1', 'Error'], answer: 1, explanation: 'Komputer menghitung umur + 1 = 17, lalu menyimpannya kembali ke umur.' },
      ],
      sulit: [
        { id: 'v7', concept: 'Menyalin nilai', type: 'choice', mono: true, prompt: 'Berapa isi b di akhir?', code: 'a = 3\nb = a\na = 10', options: ['3', '10', '13', 'Error'], answer: 0, explanation: 'b menyalin nilai a saat itu (3). Mengubah a setelahnya tidak ikut mengubah b.' },
        { id: 'v8', concept: 'Menyalin nilai', type: 'choice', mono: true, prompt: 'Berapa isi y di akhir?', code: 'x = 2\ny = 3\nx = y\ny = x + 1', options: ['3', '4', '5', '6'], answer: 1, explanation: 'x menjadi 3, lalu y = 3 + 1 = 4.' },
        { id: 'v9', concept: 'Tanda =', type: 'choice', mono: true, prompt: 'Mana yang BUKAN cara benar untuk menyimpan nilai?', options: ['5 = x', 'x = 5', 'y = x', 'nama = "Ani"'], answer: 0, explanation: 'Sisi kiri harus nama variabel, bukan angka.' },
      ],
    },
  },
  {
    id: 2,
    title: 'Tipe Data',
    subtitle: 'Integer, String, Boolean',
    color: '#D8CEFB',
    materi: [
      {
        title: 'Jenis-jenis Data',
        body: 'Setiap nilai punya tipe. Tipe menentukan apa yang bisa kita lakukan dengan nilai itu.',
        code: '25\n"Halo"\ntrue',
        tip: 'Angka, teks, dan benar/salah adalah tiga tipe yang paling sering dipakai.',
      },
      {
        title: 'Integer & String',
        body: 'Integer adalah bilangan bulat. String adalah teks yang ditulis di dalam tanda kutip.',
        code: 'umur = 16\nnama = "Budi"',
        tip: '"16" dengan kutip adalah String, sedangkan 16 adalah Integer.',
      },
      {
        title: 'Boolean',
        body: 'Boolean hanya punya dua nilai: true atau false. Cocok untuk menyimpan jawaban ya/tidak.',
        code: 'sudahLulus = true\npunyaAkun = false',
        tip: 'Tulis tanpa tanda kutip. "true" dengan kutip itu String.',
      },
    ],
    questions: {
      mudah: [
        { id: 't1', concept: 'Tipe data Boolean', type: 'choice', mono: true, prompt: 'Manakah yang merupakan tipe data Boolean?', options: ['25', '"Halo"', 'true', '3.14'], answer: 2, explanation: 'Boolean hanya bernilai true atau false. Teks di dalam tanda kutip adalah String.' },
        { id: 't2', concept: 'Tipe data Integer', type: 'choice', mono: true, prompt: 'Manakah yang merupakan tipe data Integer?', options: ['"25"', '25', 'true', '"dua puluh lima"'], answer: 1, explanation: 'Integer adalah bilangan bulat tanpa tanda kutip.' },
        { id: 't3', concept: 'Tipe data String', type: 'choice', mono: true, prompt: 'Manakah yang merupakan tipe data String?', options: ['100', 'false', '"Halo"', '7'], answer: 2, explanation: 'String adalah teks yang diapit tanda kutip.' },
      ],
      sedang: [
        { id: 't4', concept: 'Mencocokkan tipe data', type: 'match', prompt: 'Cocokkan data dengan tipe datanya', pieces: ['25', '"Halo"', 'true'], slots: ['Integer', 'String', 'Boolean'], answer: [0, 1, 2], explanation: '25 adalah Integer, "Halo" adalah String, dan true adalah Boolean.' },
        { id: 't5', concept: 'Tipe data String', type: 'choice', prompt: 'Apa tipe data dari "16"?', options: ['Integer', 'String', 'Boolean', 'Tidak punya tipe'], answer: 1, explanation: 'Karena ada tanda kutip, "16" dibaca sebagai teks (String), bukan angka.' },
        { id: 't6', concept: 'Tipe data Boolean', type: 'choice', mono: true, prompt: 'Variabel mana yang menyimpan nilai Boolean?', options: ['sudahLulus = true', 'sudahLulus = "true"', 'sudahLulus = 1', 'sudahLulus = "ya"'], answer: 0, explanation: 'Boolean ditulis true atau false tanpa tanda kutip.' },
      ],
      sulit: [
        { id: 't7', concept: 'Tipe data String', type: 'choice', mono: true, prompt: 'Apa hasil dari "5" + "3" jika keduanya String?', options: ['8', '"53"', '"8"', 'Error'], answer: 1, explanation: 'Pada String, + menyambung teks, jadi hasilnya "53".' },
        { id: 't8', concept: 'Tipe data Integer', type: 'choice', prompt: 'Apa tipe data dari hasil 5 + 3?', options: ['String', 'Boolean', 'Integer', 'Tidak ada'], answer: 2, explanation: 'Dua Integer dijumlahkan menghasilkan Integer, yaitu 8.' },
        { id: 't9', concept: 'Mencocokkan tipe data', type: 'match', prompt: 'Cocokkan data dengan tipe datanya', pieces: ['2026', '"true"', 'false'], slots: ['String', 'Boolean', 'Integer'], answer: [1, 2, 0], explanation: '"true" pakai kutip jadi String, false adalah Boolean, dan 2026 adalah Integer.' },
      ],
    },
  },
  {
    id: 3,
    title: 'Percabangan',
    subtitle: 'if, else if, else',
    color: '#FADFAA',
    materi: [
      {
        title: 'Kenapa Perlu Percabangan?',
        body: 'Program bisa memilih jalan yang berbeda tergantung kondisi, seperti kamu memutuskan bawa payung kalau hujan.',
        code: 'if hujan:\n    bawa_payung()',
        tip: 'Kondisi selalu menghasilkan true atau false.',
      },
      {
        title: 'if dan else',
        body: 'Blok if dijalankan kalau kondisinya true. Blok else dijalankan kalau tidak.',
        code: 'if umur >= 17:\n    print("Boleh")\nelse:\n    print("Belum")',
        tip: 'else tidak punya kondisi sendiri.',
      },
      {
        title: 'else if',
        body: 'Pakai else if untuk memeriksa kondisi lain. Hanya satu blok yang akan dijalankan.',
        code: 'if nilai >= 80:\n    print("A")\nelse if nilai >= 70:\n    print("B")\nelse:\n    print("C")',
        tip: 'Pengecekan berjalan dari atas ke bawah dan berhenti di kondisi pertama yang true.',
      },
    ],
    questions: {
      mudah: [
        { id: 'c1', concept: 'Kata kunci if', type: 'choice', mono: true, prompt: 'Kata kunci apa untuk membuat kondisi pertama?', options: ['if', 'else', 'loop', 'print'], answer: 0, explanation: 'if memeriksa kondisi. Kalau true, blok di bawahnya dijalankan.' },
        { id: 'c2', concept: 'Kata kunci else', type: 'choice', prompt: 'Kapan blok else dijalankan?', options: ['Saat kondisi if bernilai false', 'Saat kondisi if bernilai true', 'Selalu dijalankan', 'Tidak pernah dijalankan'], answer: 0, explanation: 'else adalah jalan cadangan ketika kondisi if tidak terpenuhi.' },
        { id: 'c3', concept: 'Kondisi Boolean', type: 'choice', mono: true, prompt: 'Apa hasil dari 5 > 3?', options: ['true', 'false', '5', 'Error'], answer: 0, explanation: '5 memang lebih besar dari 3, jadi hasilnya true.' },
      ],
      sedang: [
        { id: 'c4', concept: 'if dan else', type: 'choice', prompt: 'Apa yang tercetak?', code: 'umur = 17\nif umur >= 17:\n    print("Boleh")\nelse:\n    print("Belum")', options: ['Boleh', 'Belum', 'Boleh dan Belum', 'Tidak ada'], answer: 0, explanation: '17 >= 17 bernilai true, jadi blok if yang jalan.' },
        { id: 'c5', concept: 'else if', type: 'choice', prompt: 'Apa yang tercetak?', code: 'nilai = 75\nif nilai >= 80:\n    print("A")\nelse if nilai >= 70:\n    print("B")\nelse:\n    print("C")', options: ['A', 'B', 'C', 'B dan C'], answer: 1, explanation: '75 tidak >= 80, tapi >= 70, jadi yang tercetak adalah B.' },
        { id: 'c6', concept: 'Kondisi Boolean', type: 'match', prompt: 'Cocokkan kondisi dengan hasilnya', pieces: ['2 > 9', '7 > 1'], slots: ['true', 'false'], answer: [1, 0], explanation: '7 > 1 benar (true), sedangkan 2 > 9 salah (false).' },
      ],
      sulit: [
        { id: 'c7', concept: 'else if', type: 'choice', prompt: 'Apa yang tercetak?', code: 'x = 10\nif x > 5:\n    print("A")\nelse if x > 8:\n    print("B")\nelse:\n    print("C")', options: ['A', 'B', 'A dan B', 'C'], answer: 0, explanation: 'Hanya blok pertama yang kondisinya true yang dijalankan. x > 5 sudah true, jadi berhenti di A.' },
        { id: 'c8', concept: 'if dan else', type: 'choice', prompt: 'Apa yang tercetak?', code: 'skor = 40\nif skor >= 50:\n    print("Lulus")\nelse:\n    print("Ulang")\nprint("Selesai")', options: ['Lulus', 'Ulang', 'Ulang lalu Selesai', 'Lulus lalu Selesai'], answer: 2, explanation: 'print("Selesai") ada di luar if/else, jadi selalu dijalankan.' },
        { id: 'c9', concept: 'Kondisi Boolean', type: 'choice', mono: true, prompt: 'Kondisi mana yang true jika x = 8?', options: ['x < 5', 'x > 10', 'x >= 8', 'x == 9'], answer: 2, explanation: '8 >= 8 benar. Pilihan lain salah untuk x = 8.' },
      ],
    },
  },
];

export const flattenStage = (stage) =>
  LEVELS.flatMap((lv, i) =>
    (stage.questions[lv.key] || []).map((q) => ({ ...q, level: i, stageId: stage.id }))
  );
