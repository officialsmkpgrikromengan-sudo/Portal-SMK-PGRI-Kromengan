import {
  SchoolInfo,
  NewsItem,
  EventItem,
  AchievementItem,
  GalleryItem,
  MajorItem,
  SubjectItem,
  TeacherItem,
  ClassItem,
  StudentItem,
  AcademicYearItem,
  ScheduleItem,
  AttendanceRecord,
  GradeRecord,
  SystemSettings,
  CompanyItem,
  InternshipItem,
  InternshipJournal,
  InternshipMonitoring,
  InternshipGrade,
  JobItem,
  JobApplication,
  AlumniItem,
  TracerSurvey,
  TracerResponse,
  UserAccount,
  AuditLogItem
} from '../types';

export const defaultSchoolInfo: SchoolInfo = {
  name: 'SMK PGRI Teladan Nusantara',
  tagline: 'Mencetak Generasi Unggul, Berkarakter, Kompeten & Siap Kerja di Era Digital',
  motto: 'UNGGUL • BERAKHLAK • KOMPETEN',
  npsn: '20512345',
  accreditation: 'A (Unggul)',
  headmasterName: 'Drs. H. Bambang Sudarsono, M.Pd.',
  headmasterTitle: 'Kepala Sekolah',
  headmasterPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  headmasterSpeech: `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Puji syukur kita panjatkan ke hadirat Allah SWT atas limpahan rahmat dan karunia-Nya, sehingga website resmi SMK PGRI Teladan Nusantara ini dapat hadir sebagai jembatan informasi, komunikasi, dan transparansi antara sekolah, peserta didik, orang tua, dunia usaha/dunia industri, dan masyarakat luas.

Di era transformasi digital dan revolusi industri modern, kami berkomitmen untuk terus meningkatkan mutu pendidikan kejuruan yang berlandaskan iman dan takwa, penguasaan ilmu pengetahuan dan teknologi mutakhir, serta pembentukan karakter luhur (Profil Pelajar Pancasila). Melalui kurikulum berbasis industri dan kemitraan strategis, kami menyiapkan lulusan yang tidak hanya siap bekerja, namun juga mampu berwirausaha dan melanjutkan ke jenjang pendidikan tinggi.

Selamat menjelajahi portal resmi kami. Semoga informasi yang kami sajikan memberikan gambaran utuh mengenai ekosistem pembelajaran yang inspiratif dan berdaya saing di sekolah kita tercinta.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  history: `SMK PGRI Teladan Nusantara didirikan pada tahun 1985 oleh Yayasan Pembina Lembaga Pendidikan PGRI dengan tekad mulia menyediakan akses pendidikan kejuruan yang bermutu tinggi dan terjangkau bagi masyarakat.

Bermula dari 2 program keahlian sederhana dengan 120 siswa, sekolah terus berinovasi dan bertransformasi seiring perkembangan zaman. Pada tahun 2010, sekolah memperoleh predikat Rintisan Sekolah Berstandar Internasional dan pada tahun 2021 resmi ditetapkan sebagai SMK Pusat Keunggulan (Center of Excellence).

Kini, dengan lebih dari 1.200 siswa aktif dan didukung oleh sarana prasarana modern, laboratorium berstandar industri, serta lebih dari 50 mitra dunia kerja nasional dan multinasional, SMK PGRI Teladan Nusantara teguh berdiri sebagai salah satu institusi vokasi rujukan di tingkat regional maupun nasional.`,
  vision: 'Menjadi Lembaga Pendidikan Vokasi Unggulan yang Menghasilkan Tamatan Beriman, Berkarakter, Kompeten, Berjiwa Wirausaha, dan Berdaya Saing Global.',
  missions: [
    'Menyelenggarakan proses pembelajaran berbasis teknologi dan berpusat pada peserta didik dengan nilai-nilai religius dan budi pekerti luhur.',
    'Mengembangkan kurikulum selaras (link and match) dengan kebutuhan Dunia Usaha dan Dunia Industri (DUDI).',
    'Menyediakan sarana prasarana serta lingkungan belajar yang representatif, modern, aman, dan berwawasan lingkungan.',
    'Meningkatkan kompetensi pendidik dan tenaga kependidikan melalui sertifikasi profesi dan magang industri berkala.',
    'Membekali peserta didik dengan kecakapan abad 21, keterampilan teknologi informasi, dan jiwa kewirausahaan (technopreneurship).'
  ],
  address: 'Jl. Pendidikan Raya No. 45, Kompleks Kampus Edukasi Mandiri',
  city: 'Malang',
  province: 'Jawa Timur',
  postalCode: '65123',
  phone: '(0341) 897654',
  email: 'info@smkpgri-teladan.sch.id',
  workingHours: 'Senin - Jumat: 07.00 - 16.00 WIB',
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126438.33748293991!2d112.56174179726562!3d-7.978639499999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd62822063edd43%3A0x33eb169c2642ed71!2sMalang%2C%20Kota%20Malang%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid',
  socials: {
    instagram: 'https://instagram.com/smkpgriteladan',
    youtube: 'https://youtube.com/@smkpgriteladanofficial',
    facebook: 'https://facebook.com/smkpgriteladanofficial',
    tiktok: 'https://tiktok.com/@smkpgriteladan',
    whatsapp: 'https://wa.me/6281234567890'
  },
  stats: {
    students: 1250,
    teachers: 78,
    majors: 5,
    partnerships: 54,
    accreditationYear: '2023 - 2028'
  },
  facilities: [
    {
      id: 'fac-1',
      name: 'Laboratorium Rekayasa Perangkat Lunak & AI',
      category: 'Laboratorium Komputer',
      description: 'Dilengkapi 40 unit PC High-End spesifikasi Core i7, GPU RTX, dual monitor, dan koneksi internet serat optik dedicated 1 Gbps untuk pengembangan web, mobile, dan cloud computing.',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
      capacity: '40 Siswa'
    },
    {
      id: 'fac-2',
      name: 'Studio Desain Komunikasi Visual & Multimedia',
      category: 'Studio Kreatif',
      description: 'Studio fotografi profesional, pen display tablet Wacom, green screen studio, alat rekaman audio podcast, dan lighting set standar industri kreatif.',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      capacity: '36 Siswa'
    },
    {
      id: 'fac-3',
      name: 'Teaching Factory & Bengkel Otomotif Modern',
      category: 'Bengkel Praktik',
      description: 'Bengkel standar Authorized Dealer dengan hidrolik 2-post lift, engine scanner OBD-II mutakhir, unit simulasi EFI, dan alignment balancing station.',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      capacity: '50 Siswa'
    },
    {
      id: 'fac-4',
      name: 'Perpustakaan Digital (E-Library) & Ruang Literasi',
      category: 'Pusat Sumber Belajar',
      description: 'Ruang ber-AC yang nyaman dengan koleksi ribuan buku fisik dan puluhan ribu e-book, workstation e-learning, serta area diskusi kolaboratif.',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
      capacity: '100 Siswa'
    },
    {
      id: 'fac-5',
      name: 'Gedung Olahraga & Lapangan Multifungsi',
      category: 'Sarana Olahraga',
      description: 'Lapangan indoor dan outdoor untuk futsal, basket, voli, dan bulu tangkis berstandar nasional lengkap dengan tribun penonton.',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      capacity: '500 Orang'
    },
    {
      id: 'fac-6',
      name: 'Masjid Al-Ikhlas & Pusat Kegiatan Rohani',
      category: 'Sarana Ibadah',
      description: 'Masjid luas dan bersih berkapasitas 800 jamaah untuk pelaksanaan shalat berjamaah, pengajian, dan pembinaan karakter rohani peserta didik.',
      imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
      capacity: '800 Jamaah'
    }
  ],
  organization: [
    {
      id: 'org-1',
      name: 'Drs. H. Bambang Sudarsono, M.Pd.',
      role: 'Kepala Sekolah',
      category: 'Pimpinan',
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'org-2',
      name: 'Hj. Siti Rahmawati, S.Pd., M.M.',
      role: 'Wakil Kepala Sekolah Bidang Kurikulum',
      category: 'Wakil Kepala Sekolah',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'org-3',
      name: 'Ahmad Fauzi, S.T., M.Kom.',
      role: 'Wakil Kepala Sekolah Bidang Hubungan Industri & Humas',
      category: 'Wakil Kepala Sekolah',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'org-4',
      name: 'Dewi Kartikasari, S.Pd.',
      role: 'Wakil Kepala Sekolah Bidang Kesiswaan',
      category: 'Wakil Kepala Sekolah',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'org-5',
      name: 'Ir. Hendro Wicaksono, M.T.',
      role: 'Wakil Kepala Sekolah Bidang Sarana & Prasarana',
      category: 'Wakil Kepala Sekolah',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'org-6',
      name: 'Rian Pratama, S.Kom., M.T.',
      role: 'Ketua Program Keahlian RPL & TKJ',
      category: 'Kepala Program',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    }
  ],
  programs: [
    {
      id: 'prog-rpl',
      name: 'Rekayasa Perangkat Lunak (RPL)',
      code: 'RPL',
      shortDesc: 'Pengembangan aplikasi web modern, mobile Android/iOS, basis data cloud, dan rekayasa kecerdasan buatan.',
      fullDesc: 'Program Keahlian Rekayasa Perangkat Lunak membekali peserta didik dengan kompetensi analisis sistem, perancangan UI/UX, pemrograman web full-stack (React, Node.js, PHP, Python), mobile app development (Flutter/React Native), serta manajemen basis data modern. Siswa dilatih menyelesaikan studi kasus nyata melalui proyek Teaching Factory bekerja sama dengan software house ternama.',
      iconName: 'Code',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      jobProspects: [
        'Full Stack Web Developer',
        'Mobile Application Developer (Android/iOS)',
        'UI/UX Designer & Product Researcher',
        'Database Administrator & Cloud Engineer',
        'Software Quality Assurance & Tester'
      ],
      competencies: [
        'Algoritma Pemrograman & OOP',
        'HTML5, CSS3, Tailwind CSS & JavaScript Modern',
        'Framework Frontend & Backend Modern',
        'Mobile Application Development',
        'Cloud Database & RESTful API Architecture'
      ],
      headOfProgram: 'Rian Pratama, S.Kom., M.T.'
    },
    {
      id: 'prog-tkj',
      name: 'Teknik Komputer dan Jaringan (TKJ)',
      code: 'TKJ',
      shortDesc: 'Arsitektur jaringan komputer enterprise, administrasi server Linux/Windows, mikrotik, dan cyber security dasar.',
      fullDesc: 'Program Keahlian TKJ mendidik siswa menjadi teknisi dan administrator jaringan andal yang menguasai instalasi jaringan kabel dan nirkabel, konfigurasi router Mikrotik & Cisco, setup server, virtualisasi cloud, serta pemeliharaan keamanan jaringan siber.',
      iconName: 'Network',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      jobProspects: [
        'Network Engineer & Administrator',
        'System Administrator (Linux/Windows Server)',
        'Cloud Support Specialist',
        'IT Technical Support & Hardware Specialist',
        'Fiber Optic Technician'
      ],
      competencies: [
        'Routing & Switching (Mikrotik MTCNA & Cisco CCNA)',
        'Server Administration & Virtualization',
        'Fiber Optic Splicing & FTTH Network',
        'Network Security & Firewalls',
        'IoT (Internet of Things) Implementation'
      ],
      headOfProgram: 'Bayu Nugroho, S.T.'
    },
    {
      id: 'prog-dkv',
      name: 'Desain Komunikasi Visual (DKV)',
      code: 'DKV',
      shortDesc: 'Desain grafis periklanan, ilustrasi digital, videografi sinematik, animasi 2D/3D, dan branding komersial.',
      fullDesc: 'Program Keahlian DKV mengasah kreativitas visual dan kepekaan estetika dalam menciptakan karya komunikasi visual bernilai komersial. Siswa menguasai software standar industri seperti Adobe Photoshop, Illustrator, Premiere Pro, After Effects, Blender, serta teknik fotografi dan videografi profesional.',
      iconName: 'Palette',
      imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
      jobProspects: [
        'Graphic Designer & Brand Identity Specialist',
        'Video Editor & Motion Graphic Artist',
        'Digital Illustrator & Concept Artist',
        'Commercial Photographer & Videographer',
        'Social Media Content Creator'
      ],
      competencies: [
        'Prinsip Dasar Desain Grafis & Tipografi',
        'Ilustrasi Digital & Vektor',
        'Fotografi Studio & Lighting',
        'Videografi & Post-Production Editing',
        'Animasi 2D/3D & Motion Graphics'
      ],
      headOfProgram: 'Maya Anggraini, S.Sn., M.Ds.'
    },
    {
      id: 'prog-tkro',
      name: 'Teknik Kendaraan Ringan Otomotif (TKRO)',
      code: 'TKRO',
      shortDesc: 'Perawatan dan perbaikan mesin EFI modern, transmisi otomatis, sistem kelistrikan body, dan diagnosa scanner ECU.',
      fullDesc: 'Program Keahlian TKRO menyiapkan teknisi mekanik profesional bidang kendaraan roda empat dengan kurikulum berstandar industri otomotif Jepang. Siswa dilatih melakukan tune-up, servis berkala, overhaul mesin bensin & diesel, perbaikan sasis, sistem rem ABS, AC mobil, dan kelistrikan otomotif modern.',
      iconName: 'Wrench',
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      jobProspects: [
        'Teknisi Servis Kendaraan di Bengkel Resmi (Astra, dsb.)',
        'Service Advisor & Estimator Biaya',
        'Mekanik Balap & Modifikasi Otomotif',
        'Quality Control Inspector Industri Otomotif',
        'Wirausaha Bengkel Mandiri / Auto Detailing'
      ],
      competencies: [
        'Sistem Manajemen Mesin Elektronik (EFI/ECU)',
        'Sistem Pemindah Tenaga & Transmisi Otomatis',
        'Sistem Sasis & Suspensi Modern',
        'Kelistrikan Kendaraan & Sistem AC',
        'Standar K3 & Manajemen Operasional Bengkel'
      ],
      headOfProgram: 'Surya Wibowo, S.Pd., M.T.'
    },
    {
      id: 'prog-akl',
      name: 'Akuntansi dan Keuangan Lembaga (AKL)',
      code: 'AKL',
      shortDesc: 'Akuntansi keuangan perusahaan, perpajakan digital, perbankan syariah/konvensional, dan aplikasi Accurate/MYOB.',
      fullDesc: 'Program Keahlian AKL mencetak tenaga ahli pembukuan dan keuangan yang teliti, jujur, dan terampil mengoperasikan software akuntansi komputer modern (MYOB, Accurate, Spreadsheet Advanced). Lulusan siap mengisi posisi staf akuntansi, kasir perbankan, staf pajak, dan auditor junior.',
      iconName: 'Coins',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      jobProspects: [
        'Staff Akuntansi & Pembukuan Perusahaan',
        'Teller & Customer Service Perbankan',
        'Staf Perpajakan (Tax Consultant Assistant)',
        'Junior Internal Auditor',
        'Financial Administrator & Budgeting Officer'
      ],
      competencies: [
        'Siklus Akuntansi Jasa, Dagang & Manufaktur',
        'Komputer Akuntansi (MYOB & Accurate)',
        'Perpajakan (PPh, PPN & E-Faktur)',
        'Akuntansi Perbankan & Lembaga Keuangan',
        'Manajemen Keuangan Syariah'
      ],
      headOfProgram: 'Sri Wahyuni, S.E., M.Ak.'
    }
  ]
};

export const defaultNewsList: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Siswa SMK PGRI Teladan Raih Medali Emas LKS Tingkat Nasional 2026 Bidang Web Technologies',
    slug: 'siswa-raih-emas-lks-nasional-2026-web-technologies',
    category: 'Prestasi',
    excerpt: 'Prestasi gemilang kembali ditorehkan oleh kontingen sekolah pada ajang Lomba Kompetensi Siswa (LKS) SMK Tingkat Nasional XXXIV.',
    content: `Prestasi membanggakan kembali diukir oleh peserta didik SMK PGRI Teladan Nusantara. Pada perhelatan bergengsi Lomba Kompetensi Siswa (LKS) SMK Tingkat Nasional ke-34 yang diselenggarakan di Jakarta International Expo, perwakilan sekolah, Muhammad Fadhil Rahadian dari kelas XII Rekayasa Perangkat Lunak, berhasil mempersembahkan Medali Emas pada bidang lomba Web Technologies.

Kompetisi yang berlangsung ketat selama empat hari tersebut menguji kemampuan peserta dalam merancang arsitektur sistem web skala enterprise, responsive design UI/UX, microservices, hingga integrasi cloud API dalam batasan waktu yang sangat ketat.

"Alhamdulillah, hasil ini merupakan buah dari disiplin latihan selama berbulan-bulan didampingi para guru pembimbing dan mentor dari industri. Kami persembahkan medali ini untuk almamater tercinta dan keluarga," ujar Fadhil saat diwawancarai seusai penyerahan medali.

Kepala Sekolah, Drs. H. Bambang Sudarsono, M.Pd., menyampaikan apresiasi yang setinggi-tingginya kepada seluruh tim pembimbing dan berjanji akan terus memberikan fasilitas optimal bagi talenta-talenta muda berbakat di sekolah.`,
    author: 'Tim Humas & Publikasi',
    publishedAt: '2026-08-15',
    status: 'published',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    views: 1420,
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'news-2',
    title: 'Penandatanganan MoU Kemitraan Strategis Link and Match dengan 10 Perusahaan Multinasional',
    slug: 'penandatanganan-mou-kemitraan-strategis-dudi-2026',
    category: 'Kerjasama DUDI',
    excerpt: 'Langkah konkret penguatan vokasi dilakukan melalui penyerapan lulusan, sinkronisasi kurikulum, dan program magang bersertifikat.',
    content: `Sebagai wujud komitmen link and match antara dunia pendidikan dan dunia kerja, SMK PGRI Teladan Nusantara resmi menandatangani Nota Kesepahaman (MoU) dengan 10 perusahaan terkemuka berskala nasional dan multinasional di aula utama sekolah pada hari Kamis.

Kerja sama ini mencakup beberapa poin strategis penting, di antaranya penyelarasan kurikulum berbasis kebutuhan riil industri, program magang kerja bersertifikat selama 6 bulan, guru tamu praktisi industri, hingga komitmen penyerapan kerja langsung bagi lulusan berprestasi.

Beberapa mitra industri yang hadir dalam penandatanganan ini antara lain perwakilan industri software house terkemuka, perakitan otomotif, jaringan telekomunikasi nasional, serta lembaga perbankan syariah.

Ketua Hubungan Industri, Ahmad Fauzi, S.T., M.Kom., menegaskan bahwa kemitraan ini memastikan kurikulum yang diajarkan di kelas selalu relevan dengan perkembangan teknologi terdepan yang digunakan di industri saat ini.`,
    author: 'Ahmad Fauzi, S.T., M.Kom.',
    publishedAt: '2026-08-10',
    status: 'published',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80',
    views: 980,
    createdAt: '2026-08-10T14:30:00.000Z'
  },
  {
    id: 'news-3',
    title: 'Gelar Karya P5 dan Pameran Produk Inovasi Teaching Factory 2026 Tarik Ribuan Pengunjung',
    slug: 'gelar-karya-p5-dan-pameran-produk-teaching-factory-2026',
    category: 'Kegiatan Sekolah',
    excerpt: 'Ratusan karya kreatif mulai dari robotika, aplikasi cerdas, karya seni DKV, hingga motor listrik konversi dipamerkan secara terbuka.',
    content: `Halaman sekolah berubah menjadi panggung kreativitas akbar dalam rangka Gelar Karya Projek Penguatan Profil Pelajar Pancasila (P5) dan Pameran Produk Inovasi Teaching Factory. Kegiatan yang berlangsung selama dua hari ini terbuka untuk umum dan berhasil menyedot antusiasme lebih dari 2.500 pengunjung.

Setiap program keahlian unjuk gigi menampilkan inovasi terbaiknya. Jurusan RPL memamerkan aplikasi smart school dan kasir digital UMKM, DKV menggelar instalasi seni visual dan merchandise kreatif, TKJ menampilkan purwarupa smart home IoT, TKRO memamerkan sepeda motor listrik hasil konversi, serta AKL mengelola mini bank dan bazar kewirausahaan siswa.

Acara ini diapresiasi oleh perwakilan Dinas Pendidikan Provinsi yang turut hadir dan memuji kualitas produk yang sudah layak masuk ke pasar komersial.`,
    author: 'Dewi Kartikasari, S.Pd.',
    publishedAt: '2026-08-02',
    status: 'published',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    views: 1250,
    createdAt: '2026-08-02T11:00:00.000Z'
  },
  {
    id: 'news-4',
    title: 'Workshop Literasi Digital dan Keamanan Siber Bagi Seluruh Civitas Akademika',
    slug: 'workshop-literasi-digital-keamanan-siber-2026',
    category: 'Akademik',
    excerpt: 'Menanamkan etika berinternet sehat dan perlindungan data pribadi di tengah maraknya ancaman siber modern.',
    content: `Menghadapi pesatnya perkembangan teknologi informasi, sekolah mengadakan workshop khusus keamanan siber dan literasi digital dengan menghadirkan narasumber dari praktisi Cyber Security Indonesia.

Kegiatan ini bertujuan meningkatkan kesadaran seluruh siswa dan tenaga pendidik mengenai bahaya phishing, manajemen kata sandi yang aman, perlindungan privasi data pribadi, serta pentingnya etika dan jejak digital positif dalam bermedia sosial.`,
    author: 'Tim IT & Jaringan',
    publishedAt: '2026-07-28',
    status: 'published',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    views: 640,
    createdAt: '2026-07-28T08:00:00.000Z'
  }
];

export const defaultEventsList: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Job Fair & Career Expo Vokasi Nusantara 2026',
    category: 'Karir & Alumni',
    date: '2026-09-15',
    time: '08.00 - 15.00 WIB',
    location: 'Auditorium Utama & Lapangan Indoor SMK PGRI',
    description: 'Bursa kerja khusus vokasi yang menghadirkan lebih dari 35 perusahaan ternama nasional untuk walk-in interview langsung, konsultasi karir, dan rekrutmen alumni serta siswa kelas XII tingkat akhir.',
    status: 'published',
    posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    registrationLink: 'https://bit.ly/JobFairSMKPGRI2026',
    organizer: 'Bursa Kerja Khusus (BKK) & Hubin',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'evt-2',
    title: 'Seminar Nasional Artificial Intelligence in Vocational Education',
    category: 'Seminar & Workshop',
    date: '2026-09-28',
    time: '09.00 - 12.30 WIB',
    location: 'Lab Riset & E-Library Lt. 3 / Hybrid Zoom',
    description: 'Menghadirkan pakar teknologi AI dan praktisi industri untuk membedah bagaimana generasi muda vokasi memanfaatkan teknologi kecerdasan buatan untuk akselerasi karir dan inovasi produk.',
    status: 'published',
    posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    registrationLink: 'https://bit.ly/SeminarAISMK2026',
    organizer: 'Program Keahlian RPL',
    createdAt: '2026-08-18T13:00:00.000Z'
  },
  {
    id: 'evt-3',
    title: 'Peringatan Bulan Bahasa & Festival Budaya Nusantara',
    category: 'Seni & Budaya',
    date: '2026-10-24',
    time: '07.30 - 16.00 WIB',
    location: 'Panggung Terbuka Kampus SMK PGRI',
    description: 'Kompetisi orasi kebangsaan, debat bahasa Inggris & Jepang, festival busana adat nusantara, musikalisasi puisi, dan stand kuliner tradisional khas berbagai daerah di Indonesia.',
    status: 'published',
    posterUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    organizer: 'OSIS & Ekstrakurikuler Bahasa',
    createdAt: '2026-08-12T09:00:00.000Z'
  },
  {
    id: 'evt-4',
    title: 'Masa Pengenalan Lingkungan Sekolah (MPLS) Ramah Siswa 2026',
    category: 'Kegiatan Sekolah',
    date: '2026-07-15',
    time: '07.00 - 14.00 WIB',
    location: 'Kampus SMK PGRI Teladan Nusantara',
    description: 'Penyambutan siswa baru tahun ajaran 2026/2027 dengan materi penguatan karakter, penanaman disiplin positif, pengenalan jurusan, dan pembekalan budaya industri aman dan nyaman.',
    status: 'published',
    posterUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    organizer: 'Panitia MPLS & Kesiswaan',
    createdAt: '2026-07-01T08:00:00.000Z'
  }
];

export const defaultAchievementsList: AchievementItem[] = [
  {
    id: 'ach-1',
    title: 'Medali Emas LKS Tingkat Nasional Bidang Web Technologies',
    studentName: 'Muhammad Fadhil Rahadian (XII RPL 1)',
    level: 'Nasional',
    rank: 'Juara 1',
    year: '2026',
    category: 'Teknologi Informasi',
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80',
    description: 'Menyelesaikan modul frontend microservices dan optimasi backend real-time dengan skor tertinggi nasional 98.4.',
    createdAt: '2026-08-16T10:00:00.000Z'
  },
  {
    id: 'ach-2',
    title: 'Juara 1 Lomba Desain Poster Kreatif Nasional Festival Vokasi',
    studentName: 'Nadhira Salsabila & Tim (XI DKV 2)',
    level: 'Nasional',
    rank: 'Juara 1',
    year: '2026',
    category: 'Seni & Desain',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    description: 'Karya poster bertema "Merajut Asa Pemuda Vokasi Membangun Negeri Berkelanjutan" memukau dewan juri.',
    createdAt: '2026-06-20T11:00:00.000Z'
  },
  {
    id: 'ach-3',
    title: 'Juara 2 Toyota Skill Contest Regional Jawa Timur',
    studentName: 'Dimas Bagus Anggoro (XII TKRO 1)',
    level: 'Provinsi',
    rank: 'Juara 2',
    year: '2026',
    category: 'Teknik Otomotif',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80',
    description: 'Uji keterampilan troubleshooting sistem kelistrikan mesin EFI dan standarisasi pengerjaan cepat dan presisi.',
    createdAt: '2026-05-14T09:30:00.000Z'
  },
  {
    id: 'ach-4',
    title: 'Juara 1 Olimpiade Akuntansi Komputer Tingkat Wilayah Malang Raya',
    studentName: 'Anindya Putri Lestari (XII AKL 2)',
    level: 'Kota/Kabupaten',
    rank: 'Juara 1',
    year: '2025',
    category: 'Ekonomi & Keuangan',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    description: 'Kecepatan dan ketelitian penyusunan laporan keuangan konsolidasi menggunakan software Accurate tingkat lanjut.',
    createdAt: '2025-11-10T14:00:00.000Z'
  },
  {
    id: 'ach-5',
    title: 'Medali Perunggu Cyber Security Competition Nasional',
    studentName: 'Rizky Alamsyah & Bayu Hendrawan (XI TKJ 1)',
    level: 'Nasional',
    rank: 'Medali Perunggu',
    year: '2025',
    category: 'Cyber Security',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    description: 'Uji forensik digital, capture the flag (CTF), dan penanganan insiden siber pada server enterprise simulasi.',
    createdAt: '2025-10-05T08:00:00.000Z'
  }
];

export const defaultGalleryList: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Praktik Coding & Pengembangan Web di Laboratorium RPL',
    category: 'Akademik',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    date: '2026-08-12',
    description: 'Siswa kelas XI RPL antusias mengerjakan proyek aplikasi inventaris sekolah.',
    createdAt: '2026-08-12T10:00:00.000Z'
  },
  {
    id: 'gal-2',
    title: 'Sesi Pemotretan Studio Fotografi Jurusan DKV',
    category: 'Kegiatan Siswa',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    date: '2026-08-08',
    description: 'Praktik pencahayaan studio komersial dan teknik modeling produk katalog.',
    createdAt: '2026-08-08T14:00:00.000Z'
  },
  {
    id: 'gal-3',
    title: 'Pemeriksaan Mesin EFI di Bengkel Teaching Factory TKRO',
    category: 'Fasilitas',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    date: '2026-07-30',
    description: 'Simulasi servis berkala dan tune-up mesin menggunakan scanner ECU.',
    createdAt: '2026-07-30T11:00:00.000Z'
  },
  {
    id: 'gal-4',
    title: 'Upacara Bendera Hari Kemerdekaan Republik Indonesia',
    category: 'Upacara & Event',
    imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80',
    date: '2026-08-17',
    description: 'Paskibra sekolah bertugas dengan penuh khidmat di lapangan utama.',
    createdAt: '2026-08-17T07:30:00.000Z'
  },
  {
    id: 'gal-5',
    title: 'Latihan Ekstrakurikuler Robotika & IoT',
    category: 'Ekstrakurikuler',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    date: '2026-08-04',
    description: 'Persiapan robot line follower dan smart greenhouse untuk kompetisi teknologi.',
    createdAt: '2026-08-04T15:30:00.000Z'
  },
  {
    id: 'gal-6',
    title: 'Penyerahan Piala Juara Umum LKS Tingkat Kota',
    category: 'Prestasi & Lomba',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-18',
    description: 'Kepala sekolah menyerahkan apresiasi kepada seluruh peraih medali.',
    createdAt: '2026-06-18T09:00:00.000Z'
  },
  {
    id: 'gal-7',
    title: 'Suasana Membaca Nyaman di E-Library Sekolah',
    category: 'Fasilitas',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    date: '2026-07-22',
    description: 'Pusat literasi digital dengan ribuan e-book dan koneksi internet cepat.',
    createdAt: '2026-07-22T13:00:00.000Z'
  },
  {
    id: 'gal-8',
    title: 'Pertandingan Persahabatan Futsal Antar Kelas (Classmeeting)',
    category: 'Kegiatan Siswa',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-12',
    description: 'Semarak classmeeting akhir semester mempererat sportivitas dan kekeluargaan.',
    createdAt: '2026-06-12T16:00:00.000Z'
  }
];

// ==========================================
// FASE 2: DATA MASTER DEFAULT LISTS
// ==========================================

export const defaultMajorsList: MajorItem[] = [
  {
    id: 'major-rpl',
    code: 'RPL',
    name: 'Rekayasa Perangkat Lunak',
    shortName: 'RPL',
    description: 'Pengembangan aplikasi web modern, mobile Android/iOS, basis data cloud, dan rekayasa kecerdasan buatan.',
    status: 'Aktif',
    headOfProgram: 'Rian Pratama, S.Kom., M.T.',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    iconName: 'Code',
    jobProspects: [
      'Full Stack Web Developer',
      'Mobile Application Developer (Android/iOS)',
      'UI/UX Designer & Product Researcher',
      'Database Administrator & Cloud Engineer',
      'Software Quality Assurance & Tester'
    ],
    competencies: [
      'Algoritma Pemrograman & OOP',
      'HTML5, CSS3, Tailwind CSS & JavaScript Modern',
      'Framework Frontend & Backend Modern',
      'Mobile Application Development',
      'Cloud Database & RESTful API Architecture'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'major-tjkt',
    code: 'TJKT',
    name: 'Teknik Jaringan Komputer dan Telekomunikasi',
    shortName: 'TJKT',
    description: 'Arsitektur jaringan komputer enterprise, fiber optic, administrasi server Linux/Windows, mikrotik, dan cyber security.',
    status: 'Aktif',
    headOfProgram: 'Bayu Nugroho, S.T.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    iconName: 'Network',
    jobProspects: [
      'Network Engineer & Administrator',
      'System Administrator (Linux/Windows Server)',
      'Cloud Support Specialist',
      'IT Technical Support & Hardware Specialist',
      'Fiber Optic Technician'
    ],
    competencies: [
      'Routing & Switching (Mikrotik MTCNA & Cisco CCNA)',
      'Server Administration & Virtualization',
      'Fiber Optic Splicing & FTTH Network',
      'Network Security & Firewalls',
      'IoT (Internet of Things) Implementation'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'major-dkv',
    code: 'DKV',
    name: 'Desain Komunikasi Visual',
    shortName: 'DKV',
    description: 'Desain grafis periklanan, ilustrasi digital, videografi sinematik, animasi 2D/3D, dan branding komersial.',
    status: 'Aktif',
    headOfProgram: 'Maya Anggraini, S.Sn., M.Ds.',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    iconName: 'Palette',
    jobProspects: [
      'Graphic Designer & Brand Identity Specialist',
      'Video Editor & Motion Graphic Artist',
      'Digital Illustrator & Concept Artist',
      'Commercial Photographer & Videographer',
      'Social Media Content Creator'
    ],
    competencies: [
      'Prinsip Dasar Desain Grafis & Tipografi',
      'Ilustrasi Digital & Vektor',
      'Fotografi Studio & Lighting',
      'Videografi & Post-Production Editing',
      'Animasi 2D/3D & Motion Graphics'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'major-to',
    code: 'TO',
    name: 'Teknik Kendaraan Ringan Otomotif (TKRO)',
    shortName: 'TO',
    description: 'Perawatan dan perbaikan mesin EFI modern, transmisi otomatis, sistem kelistrikan body, dan diagnosa scanner ECU.',
    status: 'Aktif',
    headOfProgram: 'Surya Wibowo, S.Pd., M.T.',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    iconName: 'Wrench',
    jobProspects: [
      'Teknisi Servis Kendaraan di Bengkel Resmi (Astra, dsb.)',
      'Service Advisor & Estimator Biaya',
      'Mekanik Balap & Modifikasi Otomotif',
      'Quality Control Inspector Industri Otomotif',
      'Wirausaha Bengkel Mandiri / Auto Detailing'
    ],
    competencies: [
      'Sistem Manajemen Mesin Elektronik (EFI/ECU)',
      'Sistem Pemindah Tenaga & Transmisi Otomatis',
      'Sistem Sasis & Suspensi Modern',
      'Kelistrikan Kendaraan & Sistem AC',
      'Standar K3 & Manajemen Operasional Bengkel'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'major-mplb',
    code: 'MPLB',
    name: 'Manajemen Perkantoran dan Layanan Bisnis',
    shortName: 'MPLB',
    description: 'Manajemen arsip digital, otomatisasi tata kelola perkantoran modern, public relations, dan layanan administrasi bisnis terpadu.',
    status: 'Aktif',
    headOfProgram: 'Sri Wahyuni, S.E., M.Ak.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    iconName: 'Coins',
    jobProspects: [
      'Staff Akuntansi & Pembukuan Perusahaan',
      'Teller & Customer Service Perbankan',
      'Staf Perpajakan (Tax Consultant Assistant)',
      'Junior Internal Auditor',
      'Financial Administrator & Budgeting Officer'
    ],
    competencies: [
      'Siklus Akuntansi Jasa, Dagang & Manufaktur',
      'Komputer Akuntansi (MYOB & Accurate)',
      'Perpajakan (PPh, PPN & E-Faktur)',
      'Akuntansi Perbankan & Lembaga Keuangan',
      'Manajemen Keuangan Syariah'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const defaultSubjectsList: SubjectItem[] = [
  // Mata Pelajaran Umum
  {
    id: 'subj-um-01',
    code: 'MP-UM-01',
    name: 'Pendidikan Agama dan Budi Pekerti',
    group: 'Umum',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-um-02',
    code: 'MP-UM-02',
    name: 'Pendidikan Pancasila',
    group: 'Umum',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-um-03',
    code: 'MP-UM-03',
    name: 'Bahasa Indonesia',
    group: 'Umum',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-um-04',
    code: 'MP-UM-04',
    name: 'Matematika Terapan',
    group: 'Umum',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-um-05',
    code: 'MP-UM-05',
    name: 'Bahasa Inggris & Komunikasi Bisnis',
    group: 'Umum',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-um-06',
    code: 'MP-UM-06',
    name: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
    group: 'Umum',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-um-07',
    code: 'MP-UM-07',
    name: 'Sejarah Indonesia',
    group: 'Umum',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // Kejuruan TJKT
  {
    id: 'subj-tjkt-01',
    code: 'MP-TJKT-01',
    name: 'Dasar-dasar Teknik Jaringan Komputer dan Telekomunikasi',
    group: 'Kejuruan',
    majorId: 'major-tjkt',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-tjkt-02',
    code: 'MP-TJKT-02',
    name: 'Administrasi Infrastruktur Jaringan (Routing & Switching)',
    group: 'Kejuruan',
    majorId: 'major-tjkt',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-tjkt-03',
    code: 'MP-TJKT-03',
    name: 'Administrasi Sistem Jaringan & Server Enterprise',
    group: 'Kejuruan',
    majorId: 'major-tjkt',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // Kejuruan RPL
  {
    id: 'subj-rpl-01',
    code: 'MP-RPL-01',
    name: 'Pemrograman Berorientasi Objek (OOP)',
    group: 'Kejuruan',
    majorId: 'major-rpl',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-rpl-02',
    code: 'MP-RPL-02',
    name: 'Pemrograman Web dan Perangkat Bergerak (Full-Stack)',
    group: 'Kejuruan',
    majorId: 'major-rpl',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-rpl-03',
    code: 'MP-RPL-03',
    name: 'Basis Data dan Arsitektur Cloud',
    group: 'Kejuruan',
    majorId: 'major-rpl',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // Kejuruan DKV
  {
    id: 'subj-dkv-01',
    code: 'MP-DKV-01',
    name: 'Desain Grafis & Ilustrasi Digital',
    group: 'Kejuruan',
    majorId: 'major-dkv',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-dkv-02',
    code: 'MP-DKV-02',
    name: 'Fotografi Studio & Videografi Sinematik',
    group: 'Kejuruan',
    majorId: 'major-dkv',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // Kejuruan Otomotif (TO)
  {
    id: 'subj-to-01',
    code: 'MP-TO-01',
    name: 'Pemeliharaan Mesin Kendaraan Ringan (EFI & Hybrid)',
    group: 'Kejuruan',
    majorId: 'major-to',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-to-02',
    code: 'MP-TO-02',
    name: 'Kelistrikan Bodi dan Sistem Diagnosa Otomotif',
    group: 'Kejuruan',
    majorId: 'major-to',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },

  // Muatan Lokal & Pilihan
  {
    id: 'subj-mulok-01',
    code: 'MP-ML-01',
    name: 'Bahasa Jawa Terapan & Unggah-Ungguh',
    group: 'Muatan Lokal',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'subj-opt-01',
    code: 'MP-PIL-01',
    name: 'Cyber Security & Ethical Hacking Dasar',
    group: 'Pilihan',
    majorId: 'major-tjkt',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const defaultTeachersList: TeacherItem[] = [
  {
    id: 'tch-1',
    nip: '197805122005011004',
    fullName: 'Rian Pratama, S.Kom., M.T.',
    gender: 'Laki-laki',
    email: 'rian.pratama@smkpgri-teladan.sch.id',
    phone: '081234567801',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    subjectIds: ['subj-rpl-01', 'subj-rpl-02'],
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tch-2',
    nip: '198203152008011009',
    fullName: 'Bayu Nugroho, S.T.',
    gender: 'Laki-laki',
    email: 'bayu.nugroho@smkpgri-teladan.sch.id',
    phone: '081234567802',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    subjectIds: ['subj-tjkt-01', 'subj-tjkt-02', 'subj-opt-01'],
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tch-3',
    nip: '198907242014022003',
    fullName: 'Maya Anggraini, S.Sn., M.Ds.',
    gender: 'Perempuan',
    email: 'maya.anggraini@smkpgri-teladan.sch.id',
    phone: '081234567803',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    subjectIds: ['subj-dkv-01', 'subj-dkv-02'],
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tch-4',
    nip: '197511092002121002',
    fullName: 'Surya Wibowo, S.Pd., M.T.',
    gender: 'Laki-laki',
    email: 'surya.wibowo@smkpgri-teladan.sch.id',
    phone: '081234567804',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    subjectIds: ['subj-to-01', 'subj-to-02'],
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tch-5',
    nip: '198502182010012015',
    fullName: 'Dewi Kartikasari, S.Pd.',
    gender: 'Perempuan',
    email: 'dewi.kartikasari@smkpgri-teladan.sch.id',
    phone: '081234567805',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    subjectIds: ['subj-um-03', 'subj-mulok-01'],
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'tch-6',
    nip: '199104082019031008',
    fullName: 'Arief Prasetyo, S.Pd., M.Ed.',
    gender: 'Laki-laki',
    email: 'arief.prasetyo@smkpgri-teladan.sch.id',
    phone: '081234567806',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    subjectIds: ['subj-um-04', 'subj-um-05'],
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const defaultClassesList: ClassItem[] = [
  {
    id: 'cls-x-tjkt-1',
    name: 'X TJKT 1',
    grade: 'X',
    majorId: 'major-tjkt',
    homeroomTeacherId: 'tch-2',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-xi-tjkt-1',
    name: 'XI TJKT 1',
    grade: 'XI',
    majorId: 'major-tjkt',
    homeroomTeacherId: 'tch-2',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-xii-tjkt-1',
    name: 'XII TJKT 1',
    grade: 'XII',
    majorId: 'major-tjkt',
    homeroomTeacherId: 'tch-2',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-x-rpl-1',
    name: 'X RPL 1',
    grade: 'X',
    majorId: 'major-rpl',
    homeroomTeacherId: 'tch-1',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-xi-rpl-1',
    name: 'XI RPL 1',
    grade: 'XI',
    majorId: 'major-rpl',
    homeroomTeacherId: 'tch-1',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-xii-rpl-1',
    name: 'XII RPL 1',
    grade: 'XII',
    majorId: 'major-rpl',
    homeroomTeacherId: 'tch-1',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-x-dkv-1',
    name: 'X DKV 1',
    grade: 'X',
    majorId: 'major-dkv',
    homeroomTeacherId: 'tch-3',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-xi-dkv-1',
    name: 'XI DKV 1',
    grade: 'XI',
    majorId: 'major-dkv',
    homeroomTeacherId: 'tch-3',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-x-to-1',
    name: 'X TO 1',
    grade: 'X',
    majorId: 'major-to',
    homeroomTeacherId: 'tch-4',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'cls-x-mplb-1',
    name: 'X MPLB 1',
    grade: 'X',
    majorId: 'major-mplb',
    homeroomTeacherId: 'tch-5',
    academicYear: '2025/2026',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const defaultStudentsList: StudentItem[] = [
  {
    id: 'std-1',
    nis: '242501001',
    nisn: '0071829341',
    fullName: 'Muhammad Fadhil Rahadian',
    gender: 'Laki-laki',
    birthPlace: 'Malang',
    birthDate: '2008-04-14',
    address: 'Jl. Danau Toba No. 12, Sawojajar, Kota Malang',
    phone: '081334567891',
    email: 'fadhil.rahadian@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-xii-rpl-1',
    majorId: 'major-rpl',
    enrollmentYear: '2024',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'std-2',
    nis: '242501002',
    nisn: '0078291032',
    fullName: 'Nadhira Salsabila Putri',
    gender: 'Perempuan',
    birthPlace: 'Surabaya',
    birthDate: '2008-09-22',
    address: 'Jl. Ijen Boulevard No. 45, Klojen, Kota Malang',
    phone: '081334567892',
    email: 'nadhira.salsabila@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-xi-dkv-1',
    majorId: 'major-dkv',
    enrollmentYear: '2024',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'std-3',
    nis: '242501003',
    nisn: '0081294819',
    fullName: 'Rizky Alamsyah Pratama',
    gender: 'Laki-laki',
    birthPlace: 'Blitar',
    birthDate: '2008-01-10',
    address: 'Jl. Soekarno Hatta No. 88, Lowokwaru, Kota Malang',
    phone: '081334567893',
    email: 'rizky.alamsyah@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-xi-tjkt-1',
    majorId: 'major-tjkt',
    enrollmentYear: '2024',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'std-4',
    nis: '242501004',
    nisn: '0079201948',
    fullName: 'Dimas Bagus Anggoro',
    gender: 'Laki-laki',
    birthPlace: 'Pasuruan',
    birthDate: '2007-11-05',
    address: 'Jl. MT Haryono Gg. 10 No. 4, Dinoyo, Kota Malang',
    phone: '081334567894',
    email: 'dimas.bagus@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-x-to-1',
    majorId: 'major-to',
    enrollmentYear: '2025',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'std-5',
    nis: '242501005',
    nisn: '0083920194',
    fullName: 'Anindya Putri Lestari',
    gender: 'Perempuan',
    birthPlace: 'Malang',
    birthDate: '2008-07-18',
    address: 'Jl. Borobudur Barat No. 23, Blimbing, Kota Malang',
    phone: '081334567895',
    email: 'anindya.putri@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-x-mplb-1',
    majorId: 'major-mplb',
    enrollmentYear: '2025',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'std-6',
    nis: '242501006',
    nisn: '0089201934',
    fullName: 'Bayu Hendrawan Putra',
    gender: 'Laki-laki',
    birthPlace: 'Kediri',
    birthDate: '2008-12-03',
    address: 'Jl. Sigura-Gura Barat No. 17, Sukun, Kota Malang',
    phone: '081334567896',
    email: 'bayu.hendrawan@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-x-tjkt-1',
    majorId: 'major-tjkt',
    enrollmentYear: '2025',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'std-7',
    nis: '242501007',
    nisn: '0091029384',
    fullName: 'Aisyah Zahra Kirana',
    gender: 'Perempuan',
    birthPlace: 'Batu',
    birthDate: '2009-03-15',
    address: 'Jl. Panglima Sudirman No. 50, Kota Batu',
    phone: '081334567897',
    email: 'aisyah.zahra@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-x-rpl-1',
    majorId: 'major-rpl',
    enrollmentYear: '2025',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'std-8',
    nis: '242501008',
    nisn: '0085729103',
    fullName: 'Kevin Arya Maulana',
    gender: 'Laki-laki',
    birthPlace: 'Malang',
    birthDate: '2008-08-30',
    address: 'Jl. Sulfat Indah Blok C-5, Blimbing, Kota Malang',
    phone: '081334567898',
    email: 'kevin.arya@siswa.smkpgri.sch.id',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    classId: 'cls-x-dkv-1',
    majorId: 'major-dkv',
    enrollmentYear: '2025',
    status: 'Aktif',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// ==========================================
// FASE 3: DEFAULT DATA AKADEMIK
// ==========================================

export const defaultAcademicYearsList: AcademicYearItem[] = [
  {
    id: 'ay-2026-ganjil',
    name: '2026/2027',
    semester: 'Ganjil',
    isActive: true,
    startDate: '2026-07-15',
    endDate: '2026-12-20',
    notes: 'Tahun Ajaran Aktif Berjalan (Semester Ganjil 2026/2027)',
    createdAt: '2026-07-01T00:00:00.000Z'
  },
  {
    id: 'ay-2025-genap',
    name: '2025/2026',
    semester: 'Genap',
    isActive: false,
    startDate: '2026-01-05',
    endDate: '2026-06-25',
    notes: 'Semester Genap Tahun Sebelumnya',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ay-2025-ganjil',
    name: '2025/2026',
    semester: 'Ganjil',
    isActive: false,
    startDate: '2025-07-15',
    endDate: '2025-12-20',
    notes: 'Semester Ganjil Tahun Sebelumnya',
    createdAt: '2025-07-01T00:00:00.000Z'
  }
];

export const defaultSchedulesList: ScheduleItem[] = [
  // Senin
  {
    id: 'sch-1',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-tjkt-01',
    teacherId: 'tch-2', // Bayu Nugroho
    day: 'Senin',
    startTime: '07:00',
    endTime: '08:30',
    room: 'Lab Jaringan Komputer Lt. 2',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-2',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-um-04',
    teacherId: 'tch-6', // Arief Prasetyo
    day: 'Senin',
    startTime: '08:45',
    endTime: '10:15',
    room: 'Ruang Teori 101',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-3',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-rpl-1',
    subjectId: 'subj-rpl-01',
    teacherId: 'tch-1', // Rian Pratama
    day: 'Senin',
    startTime: '07:00',
    endTime: '09:15',
    room: 'Lab Rekayasa Perangkat Lunak 1',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-4',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-xi-dkv-1',
    subjectId: 'subj-dkv-01',
    teacherId: 'tch-3', // Maya Anggraini
    day: 'Senin',
    startTime: '09:30',
    endTime: '11:45',
    room: 'Studio DKV Lt. 3',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },

  // Selasa
  {
    id: 'sch-5',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-tjkt-02',
    teacherId: 'tch-2', // Bayu Nugroho
    day: 'Selasa',
    startTime: '07:00',
    endTime: '09:15',
    room: 'Lab Jaringan Komputer Lt. 2',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-6',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-um-03',
    teacherId: 'tch-5', // Dewi Kartikasari
    day: 'Selasa',
    startTime: '09:30',
    endTime: '11:00',
    room: 'Ruang Teori 101',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-7',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-to-1',
    subjectId: 'subj-to-01',
    teacherId: 'tch-4', // Surya Wibowo
    day: 'Selasa',
    startTime: '07:00',
    endTime: '10:15',
    room: 'Bengkel Otomotif Modern A',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },

  // Rabu
  {
    id: 'sch-8',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-xii-rpl-1',
    subjectId: 'subj-rpl-02',
    teacherId: 'tch-1', // Rian Pratama
    day: 'Rabu',
    startTime: '07:00',
    endTime: '10:15',
    room: 'Lab Rekayasa Perangkat Lunak 2',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-9',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-xi-tjkt-1',
    subjectId: 'subj-opt-01',
    teacherId: 'tch-2', // Bayu Nugroho
    day: 'Rabu',
    startTime: '08:00',
    endTime: '10:15',
    room: 'Lab Jaringan Komputer Lt. 2',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },

  // Kamis
  {
    id: 'sch-10',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-opt-01',
    teacherId: 'tch-2', // Bayu Nugroho
    day: 'Kamis',
    startTime: '07:00',
    endTime: '08:30',
    room: 'Lab Siber & Jaringan Lt. 2',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-11',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-mplb-1',
    subjectId: 'subj-mulok-01',
    teacherId: 'tch-5', // Dewi Kartikasari
    day: 'Kamis',
    startTime: '08:45',
    endTime: '10:15',
    room: 'Ruang Teori 103',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },

  // Jumat
  {
    id: 'sch-12',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-um-05',
    teacherId: 'tch-6', // Arief Prasetyo
    day: 'Jumat',
    startTime: '07:00',
    endTime: '08:30',
    room: 'Ruang Bahasa Multimedia',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  },
  {
    id: 'sch-13',
    academicYearId: 'ay-2026-ganjil',
    classId: 'cls-xi-dkv-1',
    subjectId: 'subj-dkv-02',
    teacherId: 'tch-3', // Maya Anggraini
    day: 'Jumat',
    startTime: '08:45',
    endTime: '11:00',
    room: 'Studio Fotografi & Sinematik Lt. 3',
    status: 'Aktif',
    createdAt: '2026-07-15T00:00:00.000Z'
  }
];

export const defaultAttendanceList: AttendanceRecord[] = [
  {
    id: 'att-1',
    academicYearId: 'ay-2026-ganjil',
    date: '2026-08-24',
    time: '07:00',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-tjkt-01',
    teacherId: 'tch-2',
    topicOrMaterial: 'Pengenalan Topologi Jaringan & Perangkat Switch/Router',
    items: [
      { studentId: 'std-6', status: 'Hadir', notes: '' }
    ],
    createdAt: '2026-08-24T08:35:00.000Z'
  },
  {
    id: 'att-2',
    academicYearId: 'ay-2026-ganjil',
    date: '2026-08-25',
    time: '07:00',
    classId: 'cls-x-tjkt-1',
    subjectId: 'subj-tjkt-02',
    teacherId: 'tch-2',
    topicOrMaterial: 'Praktik Konfigurasi VLAN pada Switch Managed',
    items: [
      { studentId: 'std-6', status: 'Hadir', notes: '' }
    ],
    createdAt: '2026-08-25T09:20:00.000Z'
  },
  {
    id: 'att-3',
    academicYearId: 'ay-2026-ganjil',
    date: '2026-08-24',
    time: '07:00',
    classId: 'cls-x-rpl-1',
    subjectId: 'subj-rpl-01',
    teacherId: 'tch-1',
    topicOrMaterial: 'Konsep Dasar Class, Object, dan Encapsulation dalam TypeScript',
    items: [
      { studentId: 'std-7', status: 'Hadir', notes: '' }
    ],
    createdAt: '2026-08-24T09:20:00.000Z'
  },
  {
    id: 'att-4',
    academicYearId: 'ay-2026-ganjil',
    date: '2026-08-24',
    time: '09:30',
    classId: 'cls-xi-dkv-1',
    subjectId: 'subj-dkv-01',
    teacherId: 'tch-3',
    topicOrMaterial: 'Prinsip Hierarki Tipografi dan Komposisi Warna Visual',
    items: [
      { studentId: 'std-2', status: 'Hadir', notes: '' }
    ],
    createdAt: '2026-08-24T11:50:00.000Z'
  },
  {
    id: 'att-5',
    academicYearId: 'ay-2026-ganjil',
    date: '2026-08-25',
    time: '07:00',
    classId: 'cls-x-to-1',
    subjectId: 'subj-to-01',
    teacherId: 'tch-4',
    topicOrMaterial: 'Pemeriksaan Sistem Injeksi Bahan Bakar Elektronik (EFI)',
    items: [
      { studentId: 'std-4', status: 'Hadir', notes: '' }
    ],
    createdAt: '2026-08-25T10:20:00.000Z'
  }
];

export const defaultGradesList: GradeRecord[] = [
  // Fadhil Rahadian (XII RPL 1)
  {
    id: 'grd-1',
    studentId: 'std-1',
    subjectId: 'subj-rpl-02',
    teacherId: 'tch-1',
    classId: 'cls-xii-rpl-1',
    academicYearId: 'ay-2026-ganjil',
    semester: 'Ganjil',
    attendanceScore: 96,
    assignmentScore: 92,
    utsScore: 90,
    uasScore: 94,
    // (96 * 0.45) + (92 * 0.20) + (90 * 0.15) + (94 * 0.20) = 43.2 + 18.4 + 13.5 + 18.8 = 93.90
    finalScore: 93.90,
    letterGrade: 'A',
    predicate: 'Sangat Baik',
    notes: 'Pemahaman full-stack web sangat matang dan aktif dalam proyek riil.',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  // Nadhira Salsabila (XI DKV 1)
  {
    id: 'grd-2',
    studentId: 'std-2',
    subjectId: 'subj-dkv-01',
    teacherId: 'tch-3',
    classId: 'cls-xi-dkv-1',
    academicYearId: 'ay-2026-ganjil',
    semester: 'Ganjil',
    attendanceScore: 95,
    assignmentScore: 90,
    utsScore: 88,
    uasScore: 92,
    // (95 * 0.45) + (90 * 0.20) + (88 * 0.15) + (92 * 0.20) = 42.75 + 18.0 + 13.2 + 18.4 = 92.35
    finalScore: 92.35,
    letterGrade: 'A',
    predicate: 'Sangat Baik',
    notes: 'Kreativitas visual luar biasa dan konsisten menyerahkan karya tepat waktu.',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  // Rizky Alamsyah (XI TJKT 1)
  {
    id: 'grd-3',
    studentId: 'std-3',
    subjectId: 'subj-opt-01',
    teacherId: 'tch-2',
    classId: 'cls-xi-tjkt-1',
    academicYearId: 'ay-2026-ganjil',
    semester: 'Ganjil',
    attendanceScore: 90,
    assignmentScore: 85,
    utsScore: 82,
    uasScore: 88,
    // (90 * 0.45) + (85 * 0.20) + (82 * 0.15) + (88 * 0.20) = 40.5 + 17.0 + 12.3 + 17.6 = 87.40
    finalScore: 87.40,
    letterGrade: 'A',
    predicate: 'Sangat Baik',
    notes: 'Sangat antusias dalam modul ethical hacking dan keamanan jaringan.',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  // Dimas Bagus (X TO 1)
  {
    id: 'grd-4',
    studentId: 'std-4',
    subjectId: 'subj-to-01',
    teacherId: 'tch-4',
    classId: 'cls-x-to-1',
    academicYearId: 'ay-2026-ganjil',
    semester: 'Ganjil',
    attendanceScore: 88,
    assignmentScore: 82,
    utsScore: 80,
    uasScore: 85,
    // (88 * 0.45) + (82 * 0.20) + (80 * 0.15) + (85 * 0.20) = 39.6 + 16.4 + 12.0 + 17.0 = 85.00
    finalScore: 85.00,
    letterGrade: 'A',
    predicate: 'Sangat Baik',
    notes: 'Keterampilan praktik bengkel sangat teliti dan taat SOP K3.',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  // Bayu Hendrawan (X TJKT 1)
  {
    id: 'grd-5',
    studentId: 'std-6',
    subjectId: 'subj-tjkt-01',
    teacherId: 'tch-2',
    classId: 'cls-x-tjkt-1',
    academicYearId: 'ay-2026-ganjil',
    semester: 'Ganjil',
    attendanceScore: 92,
    assignmentScore: 86,
    utsScore: 84,
    uasScore: 88,
    // (92 * 0.45) + (86 * 0.20) + (84 * 0.15) + (88 * 0.20) = 41.4 + 17.2 + 12.6 + 17.6 = 88.80
    finalScore: 88.80,
    letterGrade: 'A',
    predicate: 'Sangat Baik',
    notes: 'Aktif berdiskusi dan mahir dalam perakitan kabel UTP/STP.',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  // Aisyah Zahra (X RPL 1)
  {
    id: 'grd-6',
    studentId: 'std-7',
    subjectId: 'subj-rpl-01',
    teacherId: 'tch-1',
    classId: 'cls-x-rpl-1',
    academicYearId: 'ay-2026-ganjil',
    semester: 'Ganjil',
    attendanceScore: 94,
    assignmentScore: 88,
    utsScore: 85,
    uasScore: 90,
    // (94 * 0.45) + (88 * 0.20) + (85 * 0.15) + (90 * 0.20) = 42.3 + 17.6 + 12.75 + 18.0 = 90.65
    finalScore: 90.65,
    letterGrade: 'A',
    predicate: 'Sangat Baik',
    notes: 'Logika pemrograman terstruktur rapi dan cepat beradaptasi.',
    createdAt: '2026-08-20T10:00:00.000Z'
  }
];

export const defaultSystemSettings: SystemSettings = {
  adminDisplayName: 'Administrator Utama',
  adminPhone: '081234567890',
  adminAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  kkmStandard: 75,
  attendanceWeight: 45,
  assignmentWeight: 20,
  utsWeight: 15,
  uasWeight: 20,
  schoolStartTime: '07:00',
  schoolEndTime: '15:30',
  ppdbStatus: 'open',
  ppdbYear: '2026/2027',
  maintenanceMode: false,
  enableSoundNotification: true,
  helpdeskPhone: '081234567890',
  helpdeskEmail: 'helpdesk@smkpgri-teladan.sch.id'
};

// ==========================================
// FASE 5: DATA DEFAULT PKL
// ==========================================

export const defaultCompaniesList: CompanyItem[] = [
  {
    id: 'comp-1',
    name: 'PT Telkom Indonesia (Persero) Tbk - Witel Malang',
    industryType: 'Teknologi Informasi & Telekomunikasi',
    address: 'Jl. Jenderal Basuki Rahmat No. 7-9, Kauman, Klojen',
    city: 'Kota Malang',
    phone: '(0341) 363000',
    email: 'hrd.witelmalang@telkom.co.id',
    website: 'https://www.telkom.co.id',
    contactPerson: 'Ir. Hendra Setiawan (Manager Network Operation)',
    status: 'Aktif',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    quota: 10,
    description: 'Mitra industri utama bidang jaringan fiber optik, data center, dan cloud infrastructure.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'comp-2',
    name: 'PT Astra International Tbk - Daihatsu Malang',
    industryType: 'Otomotif & Manufaktur',
    address: 'Jl. Ahmad Yani No. 175, Purwodadi, Blimbing',
    city: 'Kota Malang',
    phone: '(0341) 491888',
    email: 'karir.daihatsumlg@dso.astra.co.id',
    website: 'https://www.daihatsu.co.id',
    contactPerson: 'Bambang Irawan, S.T. (Kepala Bengkel & SDM)',
    status: 'Aktif',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    quota: 8,
    description: 'Pusat perawatan mesin, sistem kelistrikan injeksi, dan transmisi kendaraan roda empat modern.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'comp-3',
    name: 'PT Nusantara Digital Studio (Animasi & Multimedia)',
    industryType: 'Desain Komunikasi Visual & Kreatif',
    address: 'Komp. Ruko Soekarno Hatta No. 42, Jatimulyo, Lowokwaru',
    city: 'Kota Malang',
    phone: '(0341) 567890',
    email: 'production@nusantaradigital.id',
    website: 'https://nusantaradigital.id',
    contactPerson: 'Dian Anggraini, S.Sn. (Lead Art Director)',
    status: 'Aktif',
    logoUrl: 'https://images.unsplash.com/photo-1542744094-3a31727221eb?auto=format&fit=crop&w=400&q=80',
    quota: 6,
    description: 'Studio kreatif pembuatan aset animasi 2D/3D, motion graphic, dan branding digital.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'comp-4',
    name: 'PT Solusi Otomasi & Software Indonesia',
    industryType: 'Software House & Web Development',
    address: 'Jl. Veteran No. 12, Ketawanggede, Lowokwaru',
    city: 'Kota Malang',
    phone: '(0341) 554321',
    email: 'info@solusiotomasi.co.id',
    website: 'https://solusiotomasi.co.id',
    contactPerson: 'Rian Pratama, M.Kom. (CTO)',
    status: 'Aktif',
    logoUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
    quota: 8,
    description: 'Pengembangan aplikasi ERP, web portal berbasis cloud, dan mobile apps enterprise.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'comp-5',
    name: 'PT Bank Pembangunan Daerah Jawa Timur (Bank Jatim)',
    industryType: 'Perbankan & Administrasi Bisnis',
    address: 'Jl. Jaksa Agung Suprapto No. 26, Klojen',
    city: 'Kota Malang',
    phone: '(0341) 326777',
    email: 'sdm.malang@bankjatim.co.id',
    website: 'https://www.bankjatim.co.id',
    contactPerson: 'Fitri Handayani, S.E. (Supervisor Operasional)',
    status: 'Aktif',
    logoUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
    quota: 5,
    description: 'Pengelolaan kearsipan digital, customer relation, dan administrasi operasional perbankan.',
    createdAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'comp-6',
    name: 'CV Mitra Komputer Mandiri',
    industryType: 'Hardware, Jaringan & Servis Komputer',
    address: 'Jl. MT Haryono No. 88, Dinoyo',
    city: 'Kota Malang',
    phone: '(0341) 571234',
    email: 'mitrakomputermalang@gmail.com',
    website: 'https://mitrakomputer.com',
    contactPerson: 'Agus Waluyo (Owner & Teknisi Senior)',
    status: 'Aktif',
    logoUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80',
    quota: 4,
    description: 'Instalasi jaringan LAN/WLAN kantor, perbaikan hardware PC/laptop, dan pengadaan sistem IT.',
    createdAt: '2026-08-01T08:00:00.000Z'
  }
];

export const defaultInternshipsList: InternshipItem[] = [
  {
    id: 'int-1',
    studentId: 'std-1', // Ahmad Rizky Pratama (XI TJKT 1)
    companyId: 'comp-1', // PT Telkom Indonesia
    teacherId: 'tch-1', // Budi Hermawan
    industrySupervisor: 'Ir. Hendra Setiawan',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    status: 'Aktif',
    notes: 'Penempatan di Divisi OSP (Outside Plant) dan Jaringan Fiber Optic FO Metro.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'int-2',
    studentId: 'std-2', // Budi Santoso (XI TJKT 1)
    companyId: 'comp-1', // PT Telkom Indonesia
    teacherId: 'tch-1', // Budi Hermawan
    industrySupervisor: 'Ir. Hendra Setiawan',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    status: 'Aktif',
    notes: 'Penempatan di Maintenance Router Core & OLT.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'int-3',
    studentId: 'std-4', // Dedi Prasetyo (XI TO 1)
    companyId: 'comp-2', // PT Astra Daihatsu
    teacherId: 'tch-2', // Ir. Agus Setiawan
    industrySupervisor: 'Bambang Irawan, S.T.',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    status: 'Aktif',
    notes: 'Penempatan di Workshop Engine Overhaul & Scan OBD-II.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'int-4',
    studentId: 'std-7', // Aisyah Zahra (X RPL 1 / XI RPL)
    companyId: 'comp-4', // PT Solusi Otomasi
    teacherId: 'tch-1', // Budi Hermawan
    industrySupervisor: 'Rian Pratama, M.Kom.',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    status: 'Aktif',
    notes: 'Penempatan di Frontend UI Web React & REST API Testing.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'int-5',
    studentId: 'std-3', // Citra Dewi Lestari (XI TJKT 1)
    companyId: 'comp-3', // PT Nusantara Digital Studio
    teacherId: 'tch-4', // Ratna Sartika
    industrySupervisor: 'Dian Anggraini, S.Sn.',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    status: 'Aktif',
    notes: 'Penempatan di Desain Karakter 2D & Video Editing.',
    createdAt: '2026-07-01T08:00:00.000Z'
  },
  {
    id: 'int-6',
    studentId: 'std-5', // Eka Nur Azizah (XI MPLB 1)
    companyId: 'comp-5', // Bank Jatim
    teacherId: 'tch-3', // Siti Nurhaliza
    industrySupervisor: 'Fitri Handayani, S.E.',
    startDate: '2026-07-15',
    endDate: '2026-10-15',
    status: 'Aktif',
    notes: 'Penempatan di Divisi Kearsipan Surat Menyurat dan Front Office.',
    createdAt: '2026-07-01T08:00:00.000Z'
  }
];

export const defaultInternshipJournalsList: InternshipJournal[] = [
  {
    id: 'jrn-1',
    internshipId: 'int-1',
    studentId: 'std-1',
    date: '2026-08-25',
    activity: 'Penyambungan Kabel Fiber Optic (Splicing) 24 Core',
    description: 'Melakukan pemotongan menggunakan fiber cleaver, penyambungan inti kaca dengan Fusion Splicer Fujikura, dan pengujian redaman menggunakan OTDR dengan hasil redaman 0.02 dB per joint.',
    attachment: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
    status: 'Disetujui',
    teacherNotes: 'Sangat baik! Terus pertahankan standar keselamatan kerja (K3LH) saat menangani sisa potongan fiber.',
    createdAt: '2026-08-25T16:30:00.000Z'
  },
  {
    id: 'jrn-2',
    internshipId: 'int-1',
    studentId: 'std-1',
    date: '2026-08-26',
    activity: 'Konfigurasi ONT GPON Pelanggan Corporate & Pengujian Bandwidth',
    description: 'Setting IP Static, VLAN tagging 200 untuk voice dan VLAN 100 untuk internet dedicated 100 Mbps pada perangkat ZTE F609.',
    attachment: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    status: 'Disetujui',
    teacherNotes: 'Laporan rinci dan sistematis. Pertahankan!',
    createdAt: '2026-08-26T16:00:00.000Z'
  },
  {
    id: 'jrn-3',
    internshipId: 'int-1',
    studentId: 'std-1',
    date: '2026-08-27',
    activity: 'Troubleshooting Gangguan Kabel Drop Wire Putus Tertimpa Pohon',
    description: 'Melakukan tracing jalur kabel di Jl. Ijen, perbaikan sambungan dengan protection sleeve, dan pengetesan redaman daya optik sebesar -18 dBm.',
    attachment: '',
    status: 'Menunggu Verifikasi',
    createdAt: '2026-08-27T17:00:00.000Z'
  },
  {
    id: 'jrn-4',
    internshipId: 'int-3',
    studentId: 'std-4',
    date: '2026-08-26',
    activity: 'Tune Up Mesin & Penggantian Kampas Rem All New Xenia',
    description: 'Pembersihan throttle body, pengecekan busi iridium, penggantian filter oli, dan bleeding sistem rem hidrolik dengan minyak rem DOT 4.',
    attachment: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
    status: 'Disetujui',
    teacherNotes: 'Bagus, pastikan selalu menggunakan torque wrench sesuai torsi spesifikasi pabrikan.',
    createdAt: '2026-08-26T16:45:00.000Z'
  },
  {
    id: 'jrn-5',
    internshipId: 'int-4',
    studentId: 'std-7',
    date: '2026-08-26',
    activity: 'Implementasi Form Validasi & Integrasi REST API Login',
    description: 'Membuat validasi input form menggunakan schema Zod, integrasi autentikasi JWT token dengan Axios interceptor, dan pembuatan toast notifikasi responsif.',
    attachment: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    status: 'Disetujui',
    teacherNotes: 'Struktur kode rapi dan modular. Kerja bagus!',
    createdAt: '2026-08-26T17:30:00.000Z'
  }
];

export const defaultInternshipMonitoringList: InternshipMonitoring[] = [
  {
    id: 'mon-1',
    internshipId: 'int-1',
    studentId: 'std-1',
    teacherId: 'tch-1', // Budi Hermawan
    visitDate: '2026-08-10',
    notes: 'Kunjungan monitoring pertama ke kantor PT Telkom Witel Malang. Siswa hadir tepat waktu, disiplin, dan memakai atribut wearpack K3 lengkap. Pembimbing industri memberikan apresiasi positif atas antusiasme kerja siswa.',
    evaluation: 'Siswa menunjukkan adaptasi cepat dengan budaya kerja industri, mampu mempraktikkan materi jaringan fiber optik dengan terampil.',
    status: 'Sangat Baik',
    photoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-08-10T14:00:00.000Z'
  },
  {
    id: 'mon-2',
    internshipId: 'int-3',
    studentId: 'std-4',
    teacherId: 'tch-2', // Ir. Agus Setiawan
    visitDate: '2026-08-12',
    notes: 'Monitoring di bengkel resmi PT Astra Daihatsu Malang. Bertemu langsung dengan Bapak Bambang (Kepala Bengkel). Siswa aktif menangani unit servis berkala 10.000 KM.',
    evaluation: 'Keterampilan mekanik dan pemahaman sistem EFI sangat baik. Disarankan untuk lebih memperdalam pembacaan diagram wiring kelistrikan.',
    status: 'Sangat Baik',
    photoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-08-12T14:30:00.000Z'
  },
  {
    id: 'mon-3',
    internshipId: 'int-4',
    studentId: 'std-7',
    teacherId: 'tch-1', // Budi Hermawan
    visitDate: '2026-08-15',
    notes: 'Kunjungan ke PT Solusi Otomasi. Siswa ditempatkan dalam squad web development. Bekerja kolaboratif menggunakan Git dan Trello sprint.',
    evaluation: 'Pemahaman logika pemrograman dan komitmen menyelesaikan task sprint patut diacungi jempol.',
    status: 'Sangat Baik',
    photoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-08-15T15:00:00.000Z'
  }
];

export const defaultInternshipGradesList: InternshipGrade[] = [
  {
    id: 'igrd-1',
    internshipId: 'int-1',
    studentId: 'std-1',
    industryScore: 92,
    teacherScore: 90,
    // (92 * 0.60) + (90 * 0.40) = 55.2 + 36.0 = 91.20
    finalScore: 91.20,
    predicate: 'Sangat Baik',
    notes: 'Memiliki etos kerja tinggi, inisiatif prima, dan kemampuan teknis fiber optik sangat kompeten.',
    isPublished: true,
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'igrd-2',
    internshipId: 'int-3',
    studentId: 'std-4',
    industryScore: 88,
    teacherScore: 86,
    // (88 * 0.60) + (86 * 0.40) = 52.8 + 34.4 = 87.20
    finalScore: 87.20,
    predicate: 'Sangat Baik',
    notes: 'Keterampilan mekanik otomotif dan ketelitian servis sangat memuaskan pihak bengkel.',
    isPublished: true,
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'igrd-3',
    internshipId: 'int-4',
    studentId: 'std-7',
    industryScore: 95,
    teacherScore: 92,
    // (95 * 0.60) + (92 * 0.40) = 57.0 + 36.8 = 93.80
    finalScore: 93.80,
    predicate: 'Sangat Baik',
    notes: 'Kreatif, cepat memecahkan masalah bug kode, dan dapat bekerja secara tim.',
    isPublished: true,
    createdAt: '2026-08-20T10:00:00.000Z'
  }
];

// ==========================================
// FASE 5: DATA DEFAULT BKK (BURSA KERJA KHUSUS)
// ==========================================

export const defaultJobsList: JobItem[] = [
  {
    id: 'job-1',
    companyId: 'comp-1', // PT Telkom
    position: 'Junior Fiber Optic & Network Technician',
    description: 'Kami mencari lulusan SMK Teknik Jaringan / Telekomunikasi yang berdedikasi untuk bergabung dalam tim operasional jaringan internet cepat dan maintenance FTTx di area Malang Raya.',
    requirements: `1. Lulusan SMK Program Keahlian TJKT / RPL / Teknik Elektro
2. Memahami dasar kabel fiber optik, fusion splicing, dan alat ukur OPM/OTDR
3. Memiliki SIM C aktif dan kendaraan pribadi
4. Bersedia bekerja sistem shift dan siap bekerja mobile di lapangan
5. Disiplin, jujur, dan bertanggung jawab terhadap target kerja`,
    location: 'Kota Malang & Kabupaten Malang',
    employmentType: 'Kontrak',
    salaryInfo: 'Rp 3.500.000 - Rp 4.500.000 / bulan + BPJS & Insentif Lapangan',
    deadline: '2026-09-30',
    status: 'Published',
    bannerUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'recruitment.malang@telkom.co.id',
    contactPhone: '(0341) 363000',
    createdAt: '2026-08-10T09:00:00.000Z'
  },
  {
    id: 'job-2',
    companyId: 'comp-2', // PT Astra Daihatsu
    position: 'Mekanik Servis Kendaraan Ringan (Auto Technician)',
    description: 'PT Astra International Daihatsu Malang membuka lowongan posisi Teknisi Bengkel Resmi untuk menangani servis berkala, overhaul mesin, sistem rem hidrolik, dan tune up injeksi modern.',
    requirements: `1. Lulusan SMK Jurusan Teknik Otomotif / Teknik Kendaraan Ringan
2. Memahami dasar kerja mesin bensin 4-tak, sistem EFI, dan scan tool diagnostik
3. Teliti, mampu bekerja cepat, dan mengutamakan keselamatan kerja (K3)
4. Terbuka bagi fresh graduate SMK yang memiliki nilai PKL baik
5. Sehat jasmani dan rohani`,
    location: 'Blimbing, Kota Malang',
    employmentType: 'Full Time',
    salaryInfo: 'UMK Malang Raya + Bonus Kinerja Servis & Asuransi Kesehatan',
    deadline: '2026-10-15',
    status: 'Published',
    bannerUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'hrd.daihatsumlg@dso.astra.co.id',
    contactPhone: '(0341) 491888',
    createdAt: '2026-08-12T10:00:00.000Z'
  },
  {
    id: 'job-3',
    companyId: 'comp-3', // PT Nusantara Digital
    position: 'Junior 2D Animator & Graphic Designer',
    description: 'Bergabunglah dengan tim kreatif kami dalam memproduksi serial animasi edukasi, aset game 2D, dan desain visual promosi digital untuk klien nasional.',
    requirements: `1. Lulusan SMK Desain Komunikasi Visual (DKV) / Animasi / Multimedia
2. Menguasai Adobe Photoshop, Illustrator, Premiere Pro, dan software animasi 2D (Spine/Toon Boom/After Effects)
3. Memiliki portofolio karya gambar karakter atau animasi orisinal
4. Kreatif, komunikatif, dan mampu bekerja dalam tenggat waktu proyek
5. Fresh graduate dengan portofolio kuat sangat diutamakan`,
    location: 'Lowokwaru, Kota Malang (Hybrid)',
    employmentType: 'Full Time',
    salaryInfo: 'Rp 3.800.000 - Rp 5.000.000 / bulan + Bonus Proyek',
    deadline: '2026-09-25',
    status: 'Published',
    bannerUrl: 'https://images.unsplash.com/photo-1542744094-3a31727221eb?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'talent@nusantaradigital.id',
    contactPhone: '(0341) 567890',
    createdAt: '2026-08-14T11:00:00.000Z'
  },
  {
    id: 'job-4',
    companyId: 'comp-4', // PT Solusi Otomasi
    position: 'Junior Frontend Web Developer (React / Tailwind)',
    description: 'Kami membutuhkan talenta muda berbakat untuk mengembangkan dashboard interaktif, aplikasi sistem informasi sekolah/perusahaan, dan integrasi API responsif.',
    requirements: `1. Lulusan SMK Rekayasa Perangkat Lunak (RPL) / TJKT
2. Menguasai HTML5, CSS3, JavaScript modern (ES6+), React.js, dan Tailwind CSS
3. Memahami konsep REST API, Git version control, dan responsive design
4. Memiliki kemauan belajar tinggi dan kemampuan problem solving yang baik
5. Melampirkan link repository GitHub atau portofolio project website`,
    location: 'Kota Malang (WFO)',
    employmentType: 'Full Time',
    salaryInfo: 'Rp 4.000.000 - Rp 5.500.000 / bulan + Tunjangan Laptop',
    deadline: '2026-10-30',
    status: 'Published',
    bannerUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'recruitment@solusiotomasi.co.id',
    contactPhone: '(0341) 554321',
    createdAt: '2026-08-15T13:00:00.000Z'
  },
  {
    id: 'job-5',
    companyId: 'comp-5', // Bank Jatim
    position: 'Staff Administrasi & Kearsipan Digital',
    description: 'Membuka kesempatan karir bagi lulusan SMK Manajemen Perkantoran untuk mengelola dokumentasi nasabah, kearsipan elektronik, dan verifikasi data transaksi perbankan.',
    requirements: `1. Lulusan SMK Program Keahlian MPLB / Manajemen Perkantoran / Akuntansi
2. Mahir mengoperasikan Microsoft Office (Word, Excel, PowerPoint) dan Google Workspace
3. Berpenampilan rapi, ramah, dan memiliki komunikasi interpersonal yang baik
4. Teliti dalam input data numerik dan pengelolaan berkas
5. Usia maksimal 22 tahun untuk fresh graduate`,
    location: 'Klojen, Kota Malang',
    employmentType: 'Kontrak',
    salaryInfo: 'Standar Perbankan Daerah + BPJS Ketenagakerjaan & Kesehatan',
    deadline: '2026-10-05',
    status: 'Published',
    bannerUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    contactEmail: 'rekrutmen.jatim@bankjatim.co.id',
    contactPhone: '(0341) 326777',
    createdAt: '2026-08-16T14:00:00.000Z'
  }
];

export const defaultJobApplicationsList: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    userId: 'user-std-1',
    studentId: 'std-1',
    applicantName: 'Ahmad Rizky Pratama',
    applicantEmail: 'ahmad.rizky@gmail.com',
    applicantPhone: '081234567891',
    cvUrl: 'https://example.com/cv/ahmad_rizky_cv.pdf',
    coverLetter: 'Saya memiliki sertifikasi mikrotik MTCNA dan pengalaman PKL di divisi Fiber Optic PT Telkom selama 3 bulan.',
    status: 'Seleksi',
    notes: 'Kandidat dipanggil untuk sesi wawancara teknis tanggal 15 September.',
    appliedAt: '2026-08-18T10:00:00.000Z'
  },
  {
    id: 'app-2',
    jobId: 'job-4',
    userId: 'user-std-7',
    studentId: 'std-7',
    applicantName: 'Aisyah Zahra',
    applicantEmail: 'aisyah.zahra@gmail.com',
    applicantPhone: '081234567897',
    cvUrl: 'https://example.com/cv/aisyah_zahra_portofolio.pdf',
    coverLetter: 'Saya sangat antusias dengan pengembangan web React & Tailwind, serta telah membangun beberapa project aplikasi open-source.',
    status: 'Lolos',
    notes: 'Lolos tahap coding test dengan nilai 95/100. Penawaran kerja dikirim via email.',
    appliedAt: '2026-08-19T11:30:00.000Z'
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    userId: 'user-std-4',
    studentId: 'std-4',
    applicantName: 'Dedi Prasetyo',
    applicantEmail: 'dedi.prasetyo@gmail.com',
    applicantPhone: '081234567894',
    cvUrl: 'https://example.com/cv/dedi_prasetyo_otomotif.pdf',
    coverLetter: 'Lulusan SMK Otomotif dengan nilai PKL Sangat Baik di bengkel resmi Daihatsu.',
    status: 'Terdaftar',
    appliedAt: '2026-08-20T14:15:00.000Z'
  }
];

// ==========================================
// FASE 5: DATA DEFAULT ALUMNI & TRACER STUDY
// ==========================================

export const defaultAlumniList: AlumniItem[] = [
  {
    id: 'alm-1',
    name: 'Muhammad Farhan Al-Fikri, S.Kom.',
    graduationYear: '2022',
    majorId: 'mj-tjkt',
    email: 'farhan.alfikri@gmail.com',
    phone: '081399887766',
    city: 'Jakarta Selatan',
    status: 'Bekerja',
    currentJob: 'Cloud Infrastructure & DevOps Engineer',
    currentCompany: 'PT Tokopedia / GoTo Group',
    position: 'Senior Engineer',
    higherEducation: 'S1 Teknik Informatika (Universitas Brawijaya)',
    startYear: '2022',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'Alumni TJKT angkatan 2022. Berkat fondasi kuat mikrotik, cisco, dan server di SMK PGRI, karir di bidang cloud engineering melesat cepat.',
    isPublic: true,
    createdAt: '2026-07-10T10:00:00.000Z'
  },
  {
    id: 'alm-2',
    name: 'Siti Sarah Rahmawati, S.Tr.Sn.',
    graduationYear: '2023',
    majorId: 'mj-dkv',
    email: 'sarah.rahma@studioanimasi.id',
    phone: '081288776655',
    city: 'Kota Malang',
    status: 'Bekerja',
    currentJob: 'Senior UI/UX & Motion Designer',
    currentCompany: 'Studio Animasi Digital Kreasi',
    position: 'Creative Lead',
    higherEducation: 'D4 Desain Grafis (Politeknik Negeri Malang)',
    startYear: '2023',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Pemenang Juara 1 LKS Desain Grafis Provinsi Jatim 2023. Saat ini aktif mendesain produk digital perbankan dan e-commerce.',
    isPublic: true,
    createdAt: '2026-07-12T11:00:00.000Z'
  },
  {
    id: 'alm-3',
    name: 'Bayu Aditya Pratama',
    graduationYear: '2024',
    majorId: 'mj-to',
    email: 'bayu.aditya.bengkel@gmail.com',
    phone: '081277665544',
    city: 'Kabupaten Malang',
    status: 'Wirausaha',
    currentJob: 'Owner & Head Mechanic',
    currentCompany: 'Aditya Auto Speed Modification & Servis',
    position: 'Pemilik Usaha',
    startYear: '2024',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Mendirikan bengkel modifikasi dan tune up spesialis injeksi roda 4 dengan omzet puluhan juta per bulan dan mempekerjakan 4 adik kelas SMK.',
    isPublic: true,
    createdAt: '2026-07-15T12:00:00.000Z'
  },
  {
    id: 'alm-4',
    name: 'Nurul Hidayati',
    graduationYear: '2024',
    majorId: 'mj-mplb',
    email: 'nurul.hidayati@bankjatim.co.id',
    phone: '081266554433',
    city: 'Kota Malang',
    status: 'Bekerja',
    currentJob: 'Customer Relationship Officer',
    currentCompany: 'PT Bank Pembangunan Daerah Jawa Timur',
    position: 'Staff Front Office',
    startYear: '2024',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Langsung direkrut Bank Jatim setelah menyelesaikan program magang berprestasi dari BKK SMK PGRI Teladan.',
    isPublic: true,
    createdAt: '2026-07-18T13:00:00.000Z'
  },
  {
    id: 'alm-5',
    name: 'Dimas Wahyu Saputra',
    graduationYear: '2025',
    majorId: 'mj-rpl',
    email: 'dimas.wahyu.tech@gmail.com',
    phone: '081255443322',
    city: 'Surabaya',
    status: 'Kuliah',
    currentJob: 'Mahasiswa Berprestasi & Freelance Web Developer',
    currentCompany: 'Institut Teknologi Sepuluh Nopember (ITS)',
    position: 'Mahasiswa Teknik Informatika',
    higherEducation: 'S1 Teknik Informatika - ITS Surabaya (Jalur Prestasi SNBP)',
    startYear: '2025',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Diterima di ITS lewat jalur SNBP berkat sertifikasi kompetensi keahlian dan kejuaraan software development.',
    isPublic: true,
    createdAt: '2026-07-20T14:00:00.000Z'
  },
  {
    id: 'alm-6',
    name: 'Rian Bagus Pamungkas',
    graduationYear: '2025',
    majorId: 'mj-to',
    email: 'rian.bagus99@gmail.com',
    phone: '081244332211',
    city: 'Kota Malang',
    status: 'Mencari Kerja',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    bio: 'Fresh graduate Otomotif tahun 2025 dengan keahlian tune up mesin EFI dan spooring balancing, aktif mengikuti proses seleksi di BKK.',
    isPublic: true,
    createdAt: '2026-07-22T15:00:00.000Z'
  }
];

export const defaultTracerSurveysList: TracerSurvey[] = [
  {
    id: 'survey-main-2026',
    title: 'Tracer Study Nasional SMK PGRI Teladan Nusantara (Standar Kemendikbudristek)',
    description: 'Survei pelacakan jejak alumni untuk memetakan serapan lulusan, keselarasan kurikulum vokasi dengan dunia industri, dan pengembangan mutu pembelajaran kejuruan.',
    targetGraduationYears: ['2022', '2023', '2024', '2025'],
    isActive: true,
    questions: [
      {
        id: 'q1',
        question: 'Apa status aktivitas utama Anda saat ini?',
        text: 'Apa status aktivitas utama Anda saat ini?',
        type: 'single_choice',
        options: ['Bekerja (Full Time / Kontrak)', 'Melanjutkan Pendidikan (Kuliah)', 'Wirausaha / Membuka Usaha Sendiri', 'Bekerja sambil Kuliah', 'Sedang Mencari Pekerjaan'],
        required: true,
        category: 'Status Pekerjaan'
      },
      {
        id: 'q2',
        question: 'Berapa lama waktu tunggu Anda sejak lulus hingga mendapatkan pekerjaan/aktivitas pertama?',
        text: 'Berapa lama waktu tunggu Anda sejak lulus hingga mendapatkan pekerjaan/aktivitas pertama?',
        type: 'single_choice',
        options: ['Langsung diterima sebelum lulus (Ijon industri)', '< 1 Bulan', '1 - 3 Bulan', '3 - 6 Bulan', '> 6 Bulan'],
        required: true,
        category: 'Waktu Tunggu'
      },
      {
        id: 'q3',
        question: 'Seberapa selaras bidang pekerjaan/kuliah Anda saat ini dengan Program Keahlian (Jurusan) sewaktu di SMK?',
        text: 'Seberapa selaras bidang pekerjaan/kuliah Anda saat ini dengan Program Keahlian (Jurusan) sewaktu di SMK?',
        type: 'single_choice',
        options: ['Sangat Selaras (Tepat Sesuai Jurusan)', 'Cukup Selaras (Masih Berhubungan)', 'Kurang Selaras', 'Tidak Selaras (Bidang Baru)'],
        required: true,
        category: 'Keselarasan Vokasi'
      },
      {
        id: 'q4',
        question: 'Berapa kisaran pendapatan/omzet bulanan rata-rata yang Anda peroleh saat ini?',
        text: 'Berapa kisaran pendapatan/omzet bulanan rata-rata yang Anda peroleh saat ini?',
        type: 'single_choice',
        options: ['< Rp 2.500.000', 'Rp 2.500.000 - Rp 4.000.000 (Setara UMK)', 'Rp 4.000.000 - Rp 7.000.000', '> Rp 7.000.000'],
        required: true,
        category: 'Pendapatan'
      },
      {
        id: 'q5',
        question: 'Nama instansi, perusahaan, perguruan tinggi, atau nama unit usaha tempat Anda beraktivitas saat ini:',
        text: 'Nama instansi, perusahaan, perguruan tinggi, atau nama unit usaha tempat Anda beraktivitas saat ini:',
        type: 'text',
        required: true,
        category: 'Nama Instansi'
      },
      {
        id: 'q6',
        question: 'Saran dan masukan konstruktif untuk peningkatan mutu kompetensi adik kelas di SMK PGRI Teladan:',
        text: 'Saran dan masukan konstruktif untuk peningkatan mutu kompetensi adik kelas di SMK PGRI Teladan:',
        type: 'text',
        required: false,
        category: 'Masukan Kurikulum'
      }
    ],
    createdAt: '2026-08-01T08:00:00.000Z'
  }
];

export const defaultTracerResponsesList: TracerResponse[] = [
  {
    id: 'tr-resp-1',
    surveyId: 'survey-main-2026',
    alumniId: 'alm-1',
    alumniName: 'Rizky Pratama, A.Md.',
    graduationYear: '2024',
    majorId: 'mj-rpl',
    answers: {
      q1: 'Bekerja (Full Time / Kontrak)',
      q2: 'Sangat Sesuai (Linier)',
      q3: '< 3 Bulan',
      q4: 'Rp 4.000.000 - Rp 7.000.000',
      q5: 'PT Telkom Akses Regional V Jawa Timur',
      q6: 'Pertahankan pembelajaran project-based learning dan penguasaan sertifikasi industri internasional.'
    },
    submittedAt: '2026-08-10T10:30:00.000Z'
  },
  {
    id: 'tr-resp-2',
    surveyId: 'survey-main-2026',
    alumniId: 'alm-2',
    alumniName: 'Annisa Putri Rahmawati',
    graduationYear: '2023',
    majorId: 'mj-dkv',
    answers: {
      q1: 'Bekerja sambil Kuliah',
      q2: 'Sangat Sesuai (Linier)',
      q3: '< 3 Bulan',
      q4: 'Rp 4.000.000 - Rp 7.000.000',
      q5: 'Creative Hub Media Jakarta',
      q6: 'Tingkatkan portofolio digital siswa sejak kelas X.'
    },
    submittedAt: '2026-08-12T14:20:00.000Z'
  },
  {
    id: 'tr-resp-3',
    surveyId: 'survey-main-2026',
    alumniId: 'alm-3',
    alumniName: 'Bagus Setiawan',
    graduationYear: '2024',
    majorId: 'mj-to',
    answers: {
      q1: 'Wirausaha / Membuka Usaha Sendiri',
      q2: 'Sangat Sesuai (Linier)',
      q3: '3 - 6 Bulan',
      q4: '> Rp 7.000.000',
      q5: 'Bengkel Mandiri Setiawan Motor',
      q6: 'Berikan materi pembekalan manajemen keuangan wirausaha yang lebih mendalam.'
    },
    submittedAt: '2026-08-15T09:15:00.000Z'
  }
];

export const defaultUsersList: UserAccount[] = [
  {
    id: 'user-admin-1',
    email: 'official.smkpgri.kromengan@gmail.com',
    username: 'admin',
    initialPassword: 'admin123456',
    displayName: 'Administrator Utama',
    role: 'admin',
    status: 'Aktif',
    phone: '081234567890',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-08-28T07:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-kepsek-1',
    email: 'kepsek@smkpgri.sch.id',
    username: 'kepsek',
    initialPassword: 'kepsek123456',
    displayName: 'Drs. H. Mulyadi, M.Pd.',
    role: 'kepala_sekolah',
    status: 'Aktif',
    phone: '081234567891',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    teacherId: 'tch-1',
    lastLoginAt: '2026-08-27T14:15:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-guru-1',
    email: 'budi.santoso@smkpgri.sch.id',
    username: '198503152010011002',
    initialPassword: 'guru123456',
    displayName: 'Budi Santoso, S.Kom., M.T.',
    role: 'guru',
    status: 'Aktif',
    phone: '081234567892',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    teacherId: 'tch-2',
    lastLoginAt: '2026-08-28T06:45:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-guru-2',
    email: 'siti.nurhaliza@smkpgri.sch.id',
    username: '199004122015022001',
    initialPassword: 'guru123456',
    displayName: 'Siti Nurhaliza, M.Pd.',
    role: 'guru',
    status: 'Aktif',
    phone: '081234567893',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    teacherId: 'tch-3',
    lastLoginAt: '2026-08-26T11:20:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-bkk-1',
    email: 'koordinator.bkk@smkpgri.sch.id',
    username: 'bkk',
    initialPassword: 'bkk123456',
    displayName: 'Ahmad Fauzi, S.T. (Koordinator BKK)',
    role: 'bkk',
    status: 'Aktif',
    phone: '081234567894',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    teacherId: 'tch-4',
    lastLoginAt: '2026-08-28T07:10:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-tu-1',
    email: 'tatausaha@smkpgri.sch.id',
    username: 'tatausaha',
    initialPassword: 'tu123456',
    displayName: 'Ratna Dewi, S.E. (Kepala TU)',
    role: 'tu',
    status: 'Aktif',
    phone: '081234567895',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLoginAt: '2026-08-27T09:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'user-siswa-1',
    email: 'fadhil.rahadian@siswa.smkpgri.sch.id',
    username: '0071829341',
    initialPassword: 'siswa123456',
    displayName: 'Muhammad Fadhil Rahadian',
    role: 'siswa',
    status: 'Aktif',
    phone: '081334567891',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    studentId: 'std-1',
    lastLoginAt: '2026-08-27T19:30:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const defaultAuditLogsList: AuditLogItem[] = [
  {
    id: 'log-001',
    userId: 'user-admin-1',
    userEmail: 'official.smkpgri.kromengan@gmail.com',
    userRole: 'admin',
    action: 'CREATE',
    module: 'Akademik',
    targetId: 'ay-2026-1',
    targetName: 'Tahun Ajaran 2026/2027 Ganjil',
    description: 'Mengaktifkan dan memvalidasi periode Tahun Ajaran 2026/2027 Semester Ganjil.',
    ipAddress: '180.252.164.22',
    createdAt: '2026-08-28T07:15:00.000Z'
  },
  {
    id: 'log-002',
    userId: 'user-guru-1',
    userEmail: 'budi.santoso@smkpgri.sch.id',
    userRole: 'guru',
    action: 'UPDATE',
    module: 'Akademik',
    targetId: 'att-sample-1',
    targetName: 'Absensi XII RPL 1',
    description: 'Menyimpan input absensi harian kelas XII RPL 1 mata pelajaran Administrasi Server.',
    ipAddress: '180.252.164.88',
    createdAt: '2026-08-28T06:50:00.000Z'
  },
  {
    id: 'log-003',
    userId: 'user-bkk-1',
    userEmail: 'koordinator.bkk@smkpgri.sch.id',
    userRole: 'bkk',
    action: 'CREATE',
    module: 'BKK',
    targetId: 'job-1',
    targetName: 'Junior Cloud Network Engineer',
    description: 'Mempublikasikan lowongan kerja baru dari mitra PT Telkom Akses Regional V.',
    ipAddress: '180.252.165.12',
    createdAt: '2026-08-28T07:12:00.000Z'
  },
  {
    id: 'log-004',
    userId: 'user-admin-1',
    userEmail: 'official.smkpgri.kromengan@gmail.com',
    userRole: 'admin',
    action: 'UPDATE',
    module: 'PKL',
    targetId: 'int-1',
    targetName: 'Penempatan PKL Siswa',
    description: 'Menetapkan penempatan PKL 2 siswa ke PT Telkom Akses dengan pembimbing Budi Santoso.',
    ipAddress: '180.252.164.22',
    createdAt: '2026-08-27T16:40:00.000Z'
  },
  {
    id: 'log-005',
    userId: 'user-admin-1',
    userEmail: 'official.smkpgri.kromengan@gmail.com',
    userRole: 'admin',
    action: 'EXPORT',
    module: 'Laporan',
    targetId: 'rep-academic-2026',
    targetName: 'Rekap Nilai Siswa TA 2026/2027',
    description: 'Mengekspor laporan rekapitulasi nilai dan capaian pembelajaran semester dalam format Excel/CSV.',
    ipAddress: '180.252.164.22',
    createdAt: '2026-08-27T11:10:00.000Z'
  },
  {
    id: 'log-006',
    userId: 'user-admin-1',
    userEmail: 'official.smkpgri.kromengan@gmail.com',
    userRole: 'admin',
    action: 'UPDATE',
    module: 'Settings',
    targetId: 'sys-settings',
    targetName: 'Pengaturan KKM & Bobot Nilai',
    description: 'Memperbarui standar KKM sekolah menjadi 75 dan bobot kehadiran menjadi 45%.',
    ipAddress: '180.252.164.22',
    createdAt: '2026-08-26T15:20:00.000Z'
  }
];



