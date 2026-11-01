// Semua materi (Mudah, Menengah, Susah), simulasi kotak memori interaktif,
// rangkuman stage, dan bank soal adaptif (Pilihan Ganda + Drag & Drop Merapikan Kode).

export const LEVELS = [
  { key: 'mudah', label: 'Mudah', subtitle: 'Konsep dasar & pengenalan', bg: '#C8F2DC' },
  { key: 'sedang', label: 'Menengah', subtitle: 'Aturan & penerapan kode', bg: '#FDE0A5' },
  { key: 'sulit', label: 'Susah', subtitle: 'Logika lanjut & rapikan kode', bg: '#FBC4E8' },
];

export const STAGES = [
  {
    id: 1,
    title: 'Variabel',
    subtitle: 'Menyimpan nilai',
    color: '#FBC4E8',
    materi: [
      // === MUDAH ===
      {
        level: 'mudah',
        title: 'Apa itu Variabel?',
        body: 'Variabel adalah nama yang digunakan untuk menyimpan suatu nilai agar nilai tersebut dapat dipakai kembali oleh program. Bayangkan variabel seperti kotak berlabel di memori komputer: nama kotak adalah nama variabel, sedangkan isi kotak adalah nilainya.',
        code: 'nama = "Budi"\numur = 16\nskor = 90',
        tip: 'Variabel nama menyimpan teks "Budi", umur menyimpan angka 16, dan skor menyimpan angka 90.',
        sim: {
          title: 'Simulasi Kotak Memori',
          steps: [
            {
              line: 0,
              desc: 'Baris 1 membuat kotak bernama "nama" dan mengisinya dengan teks "Budi".',
              boxes: [{ name: 'nama', value: '"Budi"', type: 'String', updated: true }],
            },
            {
              line: 1,
              desc: 'Baris 2 membuat kotak "umur" di memori dan menyimpan angka 16.',
              boxes: [
                { name: 'nama', value: '"Budi"', type: 'String' },
                { name: 'umur', value: '16', type: 'Integer', updated: true },
              ],
            },
            {
              line: 2,
              desc: 'Baris 3 membuat kotak "skor" dan menyimpan angka 90.',
              boxes: [
                { name: 'nama', value: '"Budi"', type: 'String' },
                { name: 'umur', value: '16', type: 'Integer' },
                { name: 'skor', value: '90', type: 'Integer', updated: true },
              ],
            },
          ],
        },
      },
      {
        level: 'mudah',
        title: 'Mengapa Variabel Diperlukan?',
        body: 'Variabel membuat informasi lebih mudah digunakan kembali dan diperbarui. Tanpa variabel, nilai yang sama harus ditulis berulang kali. Dengan variabel, program cukup merujuk pada nama yang sudah dibuat.',
        code: 'namaSiswa = "Nadia"\nnilai = 88\nprint(namaSiswa)\nprint(nilai)',
        tip: 'Program cukup memanggil namaSiswa dan nilai saat perlu menampilkan informasi siswa.',
        sim: {
          title: 'Simulasi Memakai Variabel',
          steps: [
            {
              line: 0,
              desc: 'Menyimpan "Nadia" ke dalam kotak variabel namaSiswa.',
              boxes: [{ name: 'namaSiswa', value: '"Nadia"', type: 'String', updated: true }],
            },
            {
              line: 1,
              desc: 'Menyimpan angka 88 ke dalam kotak variabel nilai.',
              boxes: [
                { name: 'namaSiswa', value: '"Nadia"', type: 'String' },
                { name: 'nilai', value: '88', type: 'Integer', updated: true },
              ],
            },
            {
              line: 2,
              desc: 'print(namaSiswa) mengambil isi kotak namaSiswa lalu menampilkan: Nadia',
              boxes: [
                { name: 'namaSiswa', value: '"Nadia"', type: 'String', updated: true },
                { name: 'nilai', value: '88', type: 'Integer' },
              ],
              output: 'Nadia',
            },
            {
              line: 3,
              desc: 'print(nilai) mengambil isi kotak nilai lalu menampilkan: 88',
              boxes: [
                { name: 'namaSiswa', value: '"Nadia"', type: 'String' },
                { name: 'nilai', value: '88', type: 'Integer', updated: true },
              ],
              output: 'Nadia\n88',
            },
          ],
        },
      },
      // === MENENGAH ===
      {
        level: 'sedang',
        title: 'Nilai Variabel Dapat Berubah',
        body: 'Nilai yang disimpan dalam variabel dapat diperbarui kapan saja. Ketika nilai baru diberikan kepada nama variabel yang sama, nilai lama tertimpa dan nilai terbaru itulah yang digunakan selanjutnya.',
        code: 'skor = 10\nskor = 20\nprint(skor)',
        tip: 'Setelah baris kedua dijalankan, nilai terbaru skor adalah 20, bukan 10.',
        sim: {
          title: 'Simulasi Perubahan Nilai di Memori',
          steps: [
            {
              line: 0,
              desc: 'Awalnya kotak variabel "skor" diisi dengan nilai 10.',
              boxes: [{ name: 'skor', value: '10', type: 'Integer', updated: true }],
            },
            {
              line: 1,
              desc: 'Baris kedua menimpa isi kotak "skor" menjadi 20! Nilai 10 digantikan.',
              boxes: [{ name: 'skor', value: '20', prevValue: '10', type: 'Integer', updated: true }],
            },
            {
              line: 2,
              desc: 'Saat dicetak, yang tampil adalah nilai terbaru yaitu 20.',
              boxes: [{ name: 'skor', value: '20', type: 'Integer' }],
              output: '20',
            },
          ],
        },
      },
      {
        level: 'sedang',
        title: 'Aturan Penamaan Variabel',
        body: 'Gunakan nama yang jelas dan menggambarkan data yang disimpan. Nama variabel tidak boleh diawali angka, tidak boleh mengandung spasi, dan sebaiknya menggunakan camelCase atau underscore (_).',
        code: 'namaSiswa = "Rani"  # jelas (Valid)\n2nilai = 75         # diawali angka (Salah)\nnama siswa = "Rani" # memakai spasi (Salah)',
        tip: 'Contoh yang baik: namaSiswa, umur, totalBelanja, dan nilai_ujian.',
      },
      // === SUSAH ===
      {
        level: 'sulit',
        title: 'Menyalin & Menghitung Variabel',
        body: 'Variabel bisa mengambil nilai dari variabel lain atau menghitung nilainya sendiri. Urutan baris kode sangat menentukan hasil akhirnya: komputer selalu mengeksekusi kode dari baris paling atas ke bawah.',
        code: 'a = 10\nb = a\na = a + 5\nprint(b)',
        tip: 'Variabel harus dibuat (diisi nilai) terlebih dahulu sebelum bisa dipanggil atau dihitung di baris bawahnya.',
        sim: {
          title: 'Simulasi Salin & Hitung Variabel',
          steps: [
            {
              line: 0,
              desc: 'Kotak a dibuat dengan nilai 10.',
              boxes: [{ name: 'a', value: '10', type: 'Integer', updated: true }],
            },
            {
              line: 1,
              desc: 'Kotak b menyalin isi kotak a saat ini (10).',
              boxes: [
                { name: 'a', value: '10', type: 'Integer' },
                { name: 'b', value: '10', type: 'Integer', updated: true },
              ],
            },
            {
              line: 2,
              desc: 'Kotak a ditambah 5 menjadi 15. Kotak b tetap 10!',
              boxes: [
                { name: 'a', value: '15', prevValue: '10', type: 'Integer', updated: true },
                { name: 'b', value: '10', type: 'Integer' },
              ],
            },
            {
              line: 3,
              desc: 'Mencetak isi b yaitu 10.',
              boxes: [
                { name: 'a', value: '15', type: 'Integer' },
                { name: 'b', value: '10', type: 'Integer', updated: true },
              ],
              output: '10',
            },
          ],
        },
      },
      {
        level: 'sulit',
        title: 'Merapikan Urutan Kode Variabel',
        body: 'Kode yang berantakan (misalnya mencetak variabel sebelum variabelnya dibuat, atau menaruh tanda = secara terbalik) akan menyebabkan error. Pastikan deklarasi nilai awal selalu berada di baris pertama sebelum pembaruan dan print.',
        code: '# Urutan yang Rapi & Benar:\nharga = 5000\ndiskon = 1000\ntotal = harga - diskon\nprint(total)',
        tip: 'Selalu susun dari: (1) Buat variabel awal -> (2) Proses/ubah nilai -> (3) Tampilkan hasil.',
        summary: [
          'Mudah: Variabel adalah kotak berlabel untuk menyimpan nilai agar bisa dipakai ulang.',
          'Menengah: Nilai variabel bisa diperbarui; namanya tidak boleh diawali angka atau spasi.',
          'Susah: Menyalin variabel menyalin nilainya saat itu, dan urutan baris kode harus rapi dari atas ke bawah.',
        ],
      },
    ],
    questions: {
      mudah: [
        {
          id: 'v1',
          concept: 'Pengertian variabel',
          type: 'choice',
          prompt: 'Dalam program, apa fungsi utama variabel?',
          options: [
            'Menghias tampilan program',
            'Menyimpan nilai agar dapat digunakan',
            'Menghapus semua data',
            'Menghentikan komputer',
          ],
          answer: 1,
          hint: 'Ingat analogi kotak berlabel di memori komputer. Untuk apa kotak itu dibuat?',
          explanation: 'Variabel memberi nama pada nilai agar program dapat menyimpannya dan menggunakannya kembali.',
        },
        {
          id: 'v2',
          concept: 'Nama variabel',
          type: 'choice',
          mono: true,
          prompt: 'Perhatikan kode: nama = "Budi". Apa nama variabelnya?',
          options: ['Budi', 'nama', 'tanda kutip', 'Budi dan nama'],
          answer: 1,
          hint: 'Nama variabel (label kotak) selalu berada di sebelah kiri tanda sama dengan (=).',
          explanation: 'Nama variabel berada di sebelah kiri tanda pemberian nilai (=), sedangkan "Budi" adalah nilainya.',
        },
        {
          id: 'v3',
          concept: 'Pengertian variabel',
          type: 'choice',
          prompt: 'Pernyataan: nama variabel dapat membantu program menggunakan informasi berulang kali.',
          options: ['Benar', 'Salah'],
          answer: 0,
          hint: 'Jika sudah disimpan di variabel, apakah kita perlu mengetik ulang nilainya terus-menerus?',
          explanation: 'Benar! Variabel membuat program dapat merujuk kembali pada nilai yang disimpan.',
        },
        {
          id: 'v4',
          concept: 'Merapikan deklarasi variabel',
          type: 'match',
          prompt: 'Kode ini masih berantakan! Seret potongan untuk merapikan urutan membuat variabel umur = 16',
          pieces: ['16', 'umur', '='],
          slots: ['Bagian 1 (Kiri)', 'Bagian 2 (Tengah)', 'Bagian 3 (Kanan)'],
          answer: [1, 2, 0],
          hint: 'Urutan menyimpan nilai: Nama Variabel di kiri, tanda = di tengah, dan Nilai di kanan.',
          explanation: 'Penulisan variabel yang rapi adalah: umur = 16 (nama variabel, tanda =, lalu nilainya).',
        },
      ],
      sedang: [
        {
          id: 'v5',
          concept: 'Mengubah nilai',
          type: 'choice',
          mono: true,
          prompt: 'Setelah kode skor = 10 lalu skor = 20 dijalankan, nilai terbaru skor adalah …',
          code: 'skor = 10\nskor = 20',
          options: ['10', '20', '30', 'Tidak memiliki nilai'],
          answer: 1,
          hint: 'Ketika variabel yang sama diberi nilai baru, apa yang terjadi pada nilai lamanya?',
          explanation: 'Pemberian nilai kedua memperbarui (menimpa) nilai lama yang disimpan, sehingga skor menjadi 20.',
        },
        {
          id: 'v6',
          concept: 'Aturan penamaan',
          type: 'choice',
          mono: true,
          prompt: 'Manakah nama variabel yang paling sesuai untuk menyimpan total belanja?',
          options: ['x', 'totalBelanja', '2belanja', 'total belanja'],
          answer: 1,
          hint: 'Cari nama yang jelas artinya, tidak diawali angka, dan tidak memakai spasi.',
          explanation: 'totalBelanja jelas maknanya dan tidak mengandung spasi maupun diawali angka.',
        },
        {
          id: 'v7',
          concept: 'Aturan penamaan',
          type: 'choice',
          mono: true,
          prompt: 'Pernyataan: nama variabel 2nilai merupakan contoh nama yang baik karena diawali angka.',
          options: ['Benar', 'Salah'],
          answer: 1,
          hint: 'Cek kembali aturan penamaan variabel: bolehkah huruf pertamanya berupa angka?',
          explanation: 'Salah. Nama variabel tidak boleh diawali dengan angka.',
        },
        {
          id: 'v8',
          concept: 'Merapikan kode variabel',
          type: 'match',
          prompt: 'Kode berikut belum rapi dan terbalik! Seret baris kode agar skor dimulai dari 10, diubah jadi 20, lalu dicetak',
          pieces: ['print(skor)', 'skor = 10', 'skor = 20'],
          slots: ['Baris 1', 'Baris 2', 'Baris 3'],
          answer: [1, 2, 0],
          hint: 'Buat nilai awal 10 dulu di Baris 1, perbarui jadi 20 di Baris 2, baru print(skor) di Baris 3.',
          explanation: 'Urutan kode yang rapi: skor = 10 -> skor = 20 -> print(skor).',
        },
      ],
      sulit: [
        {
          id: 'v9',
          concept: 'Merapikan kode perhitungan',
          type: 'match',
          prompt: 'Rapikan baris kode yang acak ini agar program menghitung total = harga - diskon dengan benar!',
          pieces: ['total = harga - diskon', 'harga = 5000', 'print(total)', 'diskon = 1000'],
          slots: ['Baris 1', 'Baris 2', 'Baris 3', 'Baris 4'],
          answer: [1, 3, 0, 2],
          hint: 'Tentukan harga (5000) dan diskon (1000) dulu sebelum menghitung total dan mencetaknya!',
          explanation: 'Variabel harga dan diskon wajib diisi nilai dulu sebelum dipakai menghitung total = harga - diskon.',
        },
        {
          id: 'v10',
          concept: 'Menyalin nilai',
          type: 'choice',
          mono: true,
          prompt: 'Berapa isi variabel b di akhir kode berikut?',
          code: 'a = 3\nb = a\na = 10',
          options: ['3', '10', '13', 'Error'],
          answer: 0,
          hint: 'Saat baris b = a dijalankan, nilai a waktu itu masih berapa?',
          explanation: 'b menyalin nilai a saat itu (3). Mengubah a menjadi 10 setelahnya tidak mengubah isi b.',
        },
        {
          id: 'v11',
          concept: 'Merapikan kode tukar nilai',
          type: 'match',
          prompt: 'Rapikan urutan kode berikut agar variabel umur awal 16 bertambah 1 tahun lalu ditampilkan!',
          pieces: ['umur = umur + 1', 'print(umur)', 'umur = 16'],
          slots: ['Baris 1', 'Baris 2', 'Baris 3'],
          answer: [2, 0, 1],
          hint: 'Mulai dari umur = 16, lalu tambahkan 1, dan terakhir print(umur).',
          explanation: 'Urutan yang benar: umur = 16 -> umur = umur + 1 -> print(umur).',
        },
      ],
    },
  },
  {
    id: 2,
    title: 'Tipe Data',
    subtitle: 'Integer, String, Boolean',
    color: '#D8CEFB',
    materi: [
      // === MUDAH ===
      {
        level: 'mudah',
        title: 'Apa itu Tipe Data?',
        body: 'Tipe data adalah kategori yang menjelaskan jenis nilai yang disimpan dalam variabel. Pada OtakAtik, kita mempelajari tiga tipe dasar: Integer untuk bilangan bulat, String untuk teks, dan Boolean untuk nilai benar atau salah.',
        code: 'umur = 16\nnama = "Rani"\nlulus = true',
        tip: 'Angka untuk menghitung berbeda dari teks untuk nama, dan berbeda dari nilai logika benar/salah.',
        sim: {
          title: 'Simulasi Tiga Tipe Data di Memori',
          steps: [
            {
              line: 0,
              desc: 'Angka bulat 16 disimpan ke variabel umur dengan tipe Integer.',
              boxes: [{ name: 'umur', value: '16', type: 'Integer', updated: true }],
            },
            {
              line: 1,
              desc: 'Teks "Rani" (diapit tanda kutip) disimpan ke nama dengan tipe String.',
              boxes: [
                { name: 'umur', value: '16', type: 'Integer' },
                { name: 'nama', value: '"Rani"', type: 'String', updated: true },
              ],
            },
            {
              line: 2,
              desc: 'Nilai logika true (tanpa kutip) disimpan ke lulus dengan tipe Boolean.',
              boxes: [
                { name: 'umur', value: '16', type: 'Integer' },
                { name: 'nama', value: '"Rani"', type: 'String' },
                { name: 'lulus', value: 'true', type: 'Boolean', updated: true },
              ],
            },
          ],
        },
      },
      {
        level: 'mudah',
        title: 'Integer & String',
        body: 'Integer digunakan untuk menyimpan bilangan bulat tanpa desimal (negatif, nol, atau positif). Sedangkan String digunakan untuk menyimpan teks dan selalu ditulis di antara tanda kutip ("...").',
        code: 'jumlahBuku = 4\nsuhu = -2\nsapaan = "Halo!"\nkota = "Bandung"',
        tip: 'Contoh Integer: -2, 0, 4, 16. Angka 3.5 bukan Integer karena memiliki desimal.',
      },
      // === MENENGAH ===
      {
        level: 'sedang',
        title: 'Boolean (Benar atau Salah)',
        body: 'Boolean menyimpan salah satu dari dua nilai logika: true (benar) atau false (salah). Tipe ini berguna untuk menyatakan status atau hasil pemeriksaan, misalnya apakah pengguna sudah login.',
        code: 'sudahLogin = true\njawabanBenar = false',
        tip: 'Boolean ditulis langsung true atau false TANPA tanda kutip.',
      },
      {
        level: 'sedang',
        title: 'Cara Membedakan Tipe Data Mirip',
        body: 'Perhatikan bentuk nilai dan tanda kutipnya! Angka 25 adalah Integer, sedangkan "25" adalah String karena ditulis di antara tanda kutip, dan true adalah nilai Boolean.',
        code: 'jumlah = 25\nkodePos = "25"\naktif = true',
        tip: 'Angka 25 dan teks "25" tampak mirip, tetapi jenis tipe datanya berbeda di memori!',
        sim: {
          title: 'Bandingkan 25 vs "25" vs true',
          steps: [
            {
              line: 0,
              desc: '25 tanpa kutip dikenali komputer sebagai angka bulat (Integer) yang bisa dihitung.',
              boxes: [{ name: 'jumlah', value: '25', type: 'Integer', updated: true }],
            },
            {
              line: 1,
              desc: '"25" memakai tanda kutip sehingga dikenali sebagai teks (String), bukan angka hitung.',
              boxes: [
                { name: 'jumlah', value: '25', type: 'Integer' },
                { name: 'kodePos', value: '"25"', type: 'String', updated: true },
              ],
            },
            {
              line: 2,
              desc: 'true tanpa kutip adalah nilai logika benar (Boolean).',
              boxes: [
                { name: 'jumlah', value: '25', type: 'Integer' },
                { name: 'kodePos', value: '"25"', type: 'String' },
                { name: 'aktif', value: 'true', type: 'Boolean', updated: true },
              ],
            },
          ],
        },
      },
      // === SUSAH ===
      {
        level: 'sulit',
        title: 'Operasi Antar Tipe Data',
        body: 'Tipe data menentukan apa yang terjadi saat nilai dioperasikan. Tanda + pada dua Integer akan menjumlahkan angka (5 + 3 = 8), tetapi tanda + pada dua String akan menyambung teks ("5" + "3" = "53").',
        code: 'angka = 5 + 3       # Hasil: 8 (Integer)\nteks = "5" + "3"    # Hasil: "53" (String)\ncek = 5 > 3         # Hasil: true (Boolean)',
        tip: 'Jangan mencampur teks String dengan perhitungan angka tanpa mengubah tipenya terlebih dahulu!',
        summary: [
          'Mudah: Integer untuk bilangan bulat, String untuk teks berkutip ("...").',
          'Menengah: Boolean bernilai true/false tanpa kutip; "25" adalah String sedangkan 25 adalah Integer.',
          'Susah: Operasi + pada Integer menjumlahkan angka, sedangkan pada String menggabungkan teks.',
        ],
      },
    ],
    questions: {
      mudah: [
        {
          id: 't1',
          concept: 'Tipe data Integer',
          type: 'choice',
          mono: true,
          prompt: 'Nilai mana yang merupakan Integer?',
          options: ['"17"', '17', 'true', '"Halo"'],
          answer: 1,
          hint: 'Integer adalah bilangan bulat yang ditulis langsung sebagai angka tanpa tanda kutip.',
          explanation: '17 adalah bilangan bulat (Integer) karena ditulis sebagai angka tanpa tanda kutip.',
        },
        {
          id: 't2',
          concept: 'Tipe data String',
          type: 'choice',
          mono: true,
          prompt: 'Manakah contoh nilai String?',
          options: ['false', '28', '"Selamat pagi"', '-4'],
          answer: 2,
          hint: 'Cari pilihan yang berupa teks dan diapit oleh tanda kutip.',
          explanation: '"Selamat pagi" adalah String karena menyimpan teks dan ditandai dengan tanda kutip.',
        },
        {
          id: 't3',
          concept: 'Tipe data Boolean',
          type: 'choice',
          prompt: 'Tipe data Boolean memiliki nilai …',
          options: [
            'Benar dan salah (true / false)',
            'Bilangan positif dan negatif',
            'Huruf besar dan kecil',
            'Bilangan bulat dan desimal',
          ],
          answer: 0,
          hint: 'Ingat dua keadaan logika yang dimiliki oleh Boolean.',
          explanation: 'Boolean hanya mewakili dua keadaan logika, yaitu benar (true) dan salah (false).',
        },
        {
          id: 't4',
          concept: 'Mencocokkan tipe data',
          type: 'match',
          prompt: 'Cocokkan data dasar berikut dengan tipe datanya',
          pieces: ['25', '"Halo"', 'true'],
          slots: ['Integer', 'String', 'Boolean'],
          answer: [0, 1, 2],
          hint: 'Angka bulat ke Integer, teks berkutip ke String, dan logika benar/salah ke Boolean.',
          explanation: '25 adalah Integer, "Halo" adalah String, dan true adalah Boolean.',
        },
      ],
      sedang: [
        {
          id: 't5',
          concept: 'Tipe data String',
          type: 'choice',
          mono: true,
          prompt: 'Variabel kode = "25" menyimpan nilai bertipe apa?',
          options: ['Integer', 'String', 'Boolean', 'Tidak ada tipe'],
          answer: 1,
          hint: 'Perhatikan apakah angka 25 tersebut dibungkus tanda kutip atau tidak!',
          explanation: 'Tanda kutip pada "25" menunjukkan bahwa nilai tersebut diperlakukan sebagai teks (String).',
        },
        {
          id: 't6',
          concept: 'Tipe data Integer',
          type: 'choice',
          prompt: 'Pernyataan: nilai 3.5 merupakan bilangan bulat (Integer).',
          options: ['Benar', 'Salah'],
          answer: 1,
          hint: 'Apakah bilangan bulat boleh memiliki angka desimal di belakang koma/titik?',
          explanation: 'Salah. Nilai 3.5 memiliki bagian desimal, sehingga bukan bilangan bulat (Integer).',
        },
        {
          id: 't7',
          concept: 'Tipe data Boolean',
          type: 'choice',
          mono: true,
          prompt: 'Kode aktif = true paling tepat menunjukkan bahwa variabel aktif menyimpan …',
          options: ['Nama pengguna', 'Bilangan bulat', 'Nilai logika', 'Kalimat panjang'],
          answer: 2,
          hint: 'true dan false digunakan untuk menyatakan status atau logika.',
          explanation: 'true adalah nilai logika (Boolean) yang menyatakan keadaan benar.',
        },
        {
          id: 't8',
          concept: 'Merapikan kode tipe data',
          type: 'match',
          prompt: 'Rapikan baris deklarasi profil siswa berikut sesuai urutan komentar: (1) Nama String, (2) Umur Integer, (3) Status Boolean!',
          pieces: ['umur = 16', 'aktif = true', 'nama = "Rani"'],
          slots: ['1. String', '2. Integer', '3. Boolean'],
          answer: [2, 0, 1],
          hint: 'Pilih yang bertanda kutip untuk String, angka bulat untuk Integer, dan true untuk Boolean.',
          explanation: 'nama = "Rani" (String), umur = 16 (Integer), dan aktif = true (Boolean).',
        },
      ],
      sulit: [
        {
          id: 't9',
          concept: 'Mencocokkan tipe data',
          type: 'match',
          prompt: 'Cocokkan data yang tampak mirip berikut dengan tipe datanya yang tepat',
          pieces: ['-4', '"false"', 'false'],
          slots: ['String', 'Boolean', 'Integer'],
          answer: [1, 2, 0],
          hint: 'Hati-hati! "false" memakai tanda kutip, sedangkan false tidak memakai kutip.',
          explanation: '"false" bertanda kutip adalah String, false tanpa kutip adalah Boolean, dan -4 adalah Integer.',
        },
        {
          id: 't10',
          concept: 'Operasi tipe data',
          type: 'choice',
          mono: true,
          prompt: 'Apa hasil dari "5" + "3" jika keduanya bertipe String (teks)?',
          options: ['8', '"53"', '"8"', 'Error'],
          answer: 1,
          hint: 'Jika dua teks digabungkan (seperti "A" + "B"), hasilnya ditempelkan, bukan dijumlahkan.',
          explanation: 'Pada tipe String, tanda + menyambung teks sehingga "5" + "3" menghasilkan "53".',
        },
        {
          id: 't11',
          concept: 'Merapikan kode operasi tipe data',
          type: 'match',
          prompt: 'Susun dan rapikan kode berikut agar menggabungkan teks sapaan "Halo " dan nama "Budi" lalu mencetaknya!',
          pieces: ['pesan = sapa + nama', 'sapa = "Halo "', 'print(pesan)', 'nama = "Budi"'],
          slots: ['Baris 1', 'Baris 2', 'Baris 3', 'Baris 4'],
          answer: [1, 3, 0, 2],
          hint: 'Buat variabel sapa dan nama terlebih dahulu, gabungkan ke dalam pesan, baru print(pesan).',
          explanation: 'Urutan yang rapi: sapa = "Halo " -> nama = "Budi" -> pesan = sapa + nama -> print(pesan).',
        },
      ],
    },
  },
  {
    id: 3,
    title: 'Percabangan',
    subtitle: 'if, else if, else',
    color: '#FADFAA',
    materi: [
      // === MUDAH ===
      {
        level: 'mudah',
        title: 'Apa itu Percabangan?',
        body: 'Percabangan adalah struktur yang membuat program memilih tindakan berdasarkan kondisi. Dalam kehidupan sehari-hari, jika hujan maka kita membawa payung. Program juga mengambil keputusan dengan cara serupa.',
        code: 'if hujan:\n    bawaPayung()',
        tip: 'Baris di dalam if hanya dijalankan ketika kondisi hujan bernilai benar (true).',
      },
      {
        level: 'mudah',
        title: 'Struktur Dasar if',
        body: 'if digunakan untuk menjalankan perintah ketika suatu kondisi benar. Jika kondisi salah, bagian di dalam if dilewati dan program melanjutkan langkah berikutnya.',
        code: 'nilai = 85\nif nilai >= 75:\n    print("Lulus")',
        tip: 'Karena nilai 85 memenuhi syarat nilai >= 75 (benar), maka pesan "Lulus" ditampilkan.',
        sim: {
          title: 'Simulasi Eksekusi if',
          steps: [
            {
              line: 0,
              desc: 'Variabel nilai diisi dengan angka 85.',
              boxes: [{ name: 'nilai', value: '85', type: 'Integer', updated: true }],
            },
            {
              line: 1,
              desc: 'Periksa kondisi: apakah 85 >= 75? Hasilnya BENAR (true)!',
              boxes: [
                { name: 'nilai', value: '85', type: 'Integer' },
                { name: 'nilai >= 75', value: 'true', type: 'Boolean', updated: true },
              ],
            },
            {
              line: 2,
              desc: 'Karena kondisi true, program masuk ke blok if dan mencetak "Lulus".',
              boxes: [{ name: 'nilai', value: '85', type: 'Integer' }],
              output: 'Lulus',
            },
          ],
        },
      },
      // === MENENGAH ===
      {
        level: 'sedang',
        title: 'Struktur if - else',
        body: 'else menyediakan pilihan alternatif ketika kondisi pada if tidak terpenuhi (bernilai salah). Dalam satu alur if-else, program hanya memilih salah satu cabang.',
        code: 'nilai = 60\nif nilai >= 75:\n    print("Lulus")\nelse:\n    print("Belum lulus")',
        tip: 'Karena 60 kurang dari 75 (kondisi if salah), program menjalankan cabang else.',
        sim: {
          title: 'Simulasi Jalur if - else (Nilai = 60)',
          steps: [
            {
              line: 0,
              desc: 'Variabel nilai diisi dengan angka 60.',
              boxes: [{ name: 'nilai', value: '60', type: 'Integer', updated: true }],
            },
            {
              line: 1,
              desc: 'Cek kondisi if: apakah 60 >= 75? Hasilnya SALAH (false)! Cabang if dilewati.',
              boxes: [
                { name: 'nilai', value: '60', type: 'Integer' },
                { name: 'nilai >= 75', value: 'false', type: 'Boolean', updated: true },
              ],
            },
            {
              line: 3,
              desc: 'Program berpindah ke jalur alternatif yaitu else:',
              boxes: [{ name: 'nilai', value: '60', type: 'Integer' }],
            },
            {
              line: 4,
              desc: 'Menjalankan perintah di dalam else dan mencetak "Belum lulus".',
              boxes: [{ name: 'nilai', value: '60', type: 'Integer' }],
              output: 'Belum lulus',
            },
          ],
        },
      },
      {
        level: 'sedang',
        title: 'Operator Perbandingan',
        body: 'Kondisi sering menggunakan operator perbandingan seperti >, <, >=, <=, == (sama dengan), dan != (tidak sama dengan). Hasil pemeriksaan kondisi selalu berupa benar (true) atau salah (false).',
        code: 'umur = 17\nif umur >= 17:\n    print("Boleh mendaftar")',
        tip: 'Simbol >= berarti lebih besar dari atau sama dengan. Jangan tertukar dengan = yang dipakai untuk menyimpan nilai.',
      },
      // === SUSAH ===
      {
        level: 'sulit',
        title: 'Rangkaian if - else if - else',
        body: 'else if (atau elif) digunakan untuk memeriksa kondisi tambahan ketika kondisi sebelumnya salah. Urutan pemeriksaan sangat penting karena program hanya menjalankan cabang pertama yang kondisinya terpenuhi.',
        code: 'nilai = 85\nif nilai >= 90:\n    predikat = "A"\nelse if nilai >= 75:\n    predikat = "B"\nelse:\n    predikat = "C"',
        tip: 'Selalu urutkan kondisi dari syarat yang paling ketat (misal >= 90) ke syarat yang lebih longgar (>= 75), lalu tutup dengan else.',
        sim: {
          title: 'Simulasi Urutan else if (Nilai = 85)',
          steps: [
            {
              line: 0,
              desc: 'Variabel nilai diatur menjadi 85.',
              boxes: [{ name: 'nilai', value: '85', type: 'Integer', updated: true }],
            },
            {
              line: 1,
              desc: 'Cek if pertama: apakah 85 >= 90? SALAH (false). Lanjut ke bawah.',
              boxes: [
                { name: 'nilai', value: '85', type: 'Integer' },
                { name: '85 >= 90', value: 'false', type: 'Boolean', updated: true },
              ],
            },
            {
              line: 3,
              desc: 'Cek else if kedua: apakah 85 >= 75? BENAR (true)!',
              boxes: [
                { name: 'nilai', value: '85', type: 'Integer' },
                { name: '85 >= 75', value: 'true', type: 'Boolean', updated: true },
              ],
            },
            {
              line: 4,
              desc: 'Cabang kedua dipilih! Variabel predikat diisi "B", dan blok else di bawahnya dilewati.',
              boxes: [
                { name: 'nilai', value: '85', type: 'Integer' },
                { name: 'predikat', value: '"B"', type: 'String', updated: true },
              ],
            },
          ],
        },
        summary: [
          'Mudah: if menjalankan blok kode hanya ketika kondisinya bernilai benar (true).',
          'Menengah: else menjadi jalur alternatif saat kondisi if salah; gunakan operator >=, <=, ==, !=.',
          'Susah: Susun if -> else if -> else secara berurutan dari syarat paling spesifik karena hanya cabang pertama yang true yang dieksekusi.',
        ],
      },
    ],
    questions: {
      mudah: [
        {
          id: 'c1',
          concept: 'Kata kunci if',
          type: 'choice',
          prompt: 'Apa fungsi utama struktur if dalam pemrograman?',
          options: [
            'Mengulang kode terus-menerus',
            'Memilih tindakan berdasarkan kondisi',
            'Menyimpan teks ke memori',
            'Membuat variabel otomatis',
          ],
          answer: 1,
          hint: 'Ingat analogi "jika hujan maka bawa payung".',
          explanation: 'Struktur if mengevaluasi suatu kondisi sebelum memutuskan apakah blok kode dijalankan.',
        },
        {
          id: 'c2',
          concept: 'Kondisi Boolean',
          type: 'choice',
          mono: true,
          prompt: 'Jika nilai = 80 dan syaratnya nilai >= 75, hasil pemeriksaan kondisinya adalah …',
          options: ['Benar (true)', 'Salah (false)', 'Teks', 'Tidak bisa diperiksa'],
          answer: 0,
          hint: 'Apakah angka 80 lebih besar dari atau sama dengan 75?',
          explanation: '80 lebih besar daripada 75, sehingga memenuhi syarat dan bernilai Benar (true).',
        },
        {
          id: 'c3',
          concept: 'Merapikan kode if sederhana',
          type: 'match',
          prompt: 'Kode if ini masih acak! Seret baris kode agar mengecek nilai >= 75 lalu mencetak "Lulus"',
          pieces: ['    print("Lulus")', 'nilai = 80', 'if nilai >= 75:'],
          slots: ['Baris 1', 'Baris 2', 'Baris 3'],
          answer: [1, 2, 0],
          hint: 'Isi variabel nilai = 80 dulu, lalu tulis syarat if nilai >= 75:, dan terakhir perintah print yang menjorok ke dalam.',
          explanation: 'Urutan yang rapi: nilai = 80 -> if nilai >= 75: -> print("Lulus").',
        },
      ],
      sedang: [
        {
          id: 'c4',
          concept: 'Kata kunci else',
          type: 'choice',
          prompt: 'Pada struktur if-else, kapan bagian else dijalankan?',
          options: [
            'Selalu dijalankan pertama kali',
            'Ketika kondisi if tidak terpenuhi (salah)',
            'Hanya ketika program ditutup',
            'Ketika variabel dihapus',
          ],
          answer: 1,
          hint: 'else adalah jalur alternatif atau cadangan jika syarat utama gagal.',
          explanation: 'Bagian else menjadi jalur alternatif yang dijalankan ketika kondisi if bernilai salah (false).',
        },
        {
          id: 'c5',
          concept: 'if dan else',
          type: 'choice',
          prompt: 'Jika nilai = 60 pada kode berikut, pesan mana yang dipilih?',
          code: 'nilai = 60\nif nilai >= 75:\n    print("Lulus")\nelse:\n    print("Belum lulus")',
          options: ['Lulus', 'Belum lulus', 'Keduanya selalu tampil', 'Tidak ada'],
          answer: 1,
          hint: 'Apakah 60 >= 75? Jika salah, lihat blok di bawah else.',
          explanation: 'Karena 60 tidak memenuhi kondisi nilai >= 75, maka cabang else ("Belum lulus") yang dipilih.',
        },
        {
          id: 'c6',
          concept: 'Merapikan blok if-else',
          type: 'match',
          prompt: 'Rapikan blok kode if-else yang berantakan ini dari Baris 1 sampai Baris 4!',
          pieces: ['else:', '    print("Lulus")', 'if nilai >= 75:', '    print("Remidi")'],
          slots: ['Baris 1', 'Baris 2', 'Baris 3', 'Baris 4'],
          answer: [2, 1, 0, 3],
          hint: 'Mulai dengan if nilai >= 75:, lalu aksi Lulus, kemudian else:, dan aksi Remidi.',
          explanation: 'Struktur if-else yang rapi: if nilai >= 75: -> print("Lulus") -> else: -> print("Remidi").',
        },
      ],
      sulit: [
        {
          id: 'c7',
          concept: 'Merapikan struktur if - else if - else',
          type: 'match',
          prompt: 'Kode penentu predikat nilai ini masih berantakan! Seret potongan untuk merapikan urutannya dari atas ke bawah',
          pieces: ['else:', 'if nilai >= 90:', 'else if nilai >= 75:'],
          slots: ['Cabang 1 (Atas)', 'Cabang 2 (Tengah)', 'Cabang 3 (Bawah)'],
          answer: [1, 2, 0],
          hint: 'Mulai dengan if untuk syarat tertinggi (>= 90), lalu else if untuk syarat kedua (>= 75), dan tutup dengan else:',
          explanation: 'Percabangan bertingkat harus disusun rapi dari if -> else if -> else.',
        },
        {
          id: 'c8',
          concept: 'else if',
          type: 'choice',
          prompt: 'Apa predikat yang dihasilkan oleh kode berikut?',
          code: 'nilai = 85\nif nilai >= 90:\n    predikat = "A"\nelse if nilai >= 75:\n    predikat = "B"\nelse:\n    predikat = "C"',
          options: ['"A"', '"B"', '"C"', '"A" dan "B"'],
          answer: 1,
          hint: 'Uji dari atas: apakah 85 >= 90? Tidak. Lalu apakah 85 >= 75?',
          explanation: 'Kondisi pertama (85 >= 90) salah, kondisi kedua (85 >= 75) benar, sehingga predikat menjadi "B".',
        },
        {
          id: 'c9',
          concept: 'Urutan percabangan',
          type: 'choice',
          prompt: 'Apa yang tercetak ke layar dari kode berikut?',
          code: 'x = 10\nif x > 5:\n    print("A")\nelse if x > 8:\n    print("B")\nelse:\n    print("C")',
          options: ['A', 'B', 'A dan B', 'C'],
          answer: 0,
          hint: 'Ingat: pengecekan berhenti begitu menemukan cabang PERTAMA yang bernilai true!',
          explanation: 'Meskipun 10 > 8 juga benar, kondisi pertama (10 > 5) sudah terpenuhi lebih dulu sehingga program mencetak A lalu berhenti.',
        },
      ],
    },
  },
];

export const flattenStage = (stage, levelKey) => {
  if (levelKey) {
    const lvIdx = LEVELS.findIndex((l) => l.key === levelKey);
    return (stage.questions[levelKey] || []).map((q) => ({
      ...q,
      level: lvIdx >= 0 ? lvIdx : 0,
      stageId: stage.id,
    }));
  }
  return LEVELS.flatMap((lv, i) =>
    (stage.questions[lv.key] || []).map((q) => ({ ...q, level: i, stageId: stage.id }))
  );
};
