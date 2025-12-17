function createUsabilityForm() {
  // 1. Create the form
  var formId = "1jb33hJ3QLCfioJp9RZnKApkj8pItFzttG13Z_Yt_8Ls";
  var form = FormApp.openById(formId);
  deleteAllItems(form);

  form.setDescription(
    "Formulir ini mencakup evaluasi usability untuk berbagai role di platform Rempahtour dan Marketplace Rempahtour. Silakan pilih kategori evaluasi yang sesuai di halaman pertama."
  );

  // 2. Add the Branching Logic (Role Selection)
  // We create the item first, but we will populate exact navigation choices after creating the page breaks.
  var roleSelect = form.addMultipleChoiceItem();
  roleSelect
    .setTitle("Pilih Instrumen Evaluasi")
    .setHelpText(
      "Silakan pilih role atau bagian yang akan dievaluasi saat ini."
    )
    .setRequired(true);

  // ==========================================================================================
  // SECTION 1: Rempahtour User
  // Source: REMPAHTOUR-INSTRUMEN-EVALUASI-USABILITY-USER.md
  // ==========================================================================================
  var pageUserJR = form
    .addPageBreakItem()
    .setTitle("Rempahtour - User (Pengunjung Umum)");

  // Intro
  form
    .addSectionHeaderItem()
    .setTitle("BAGIAN 1: Pendahuluan")
    .setHelpText(
      "Instruksi: Terima kasih telah bersedia meluangkan waktu. Kami sedang mengembangkan website Rempahtour.com. Mohon diingat bahwa kami sedang menguji sistem/website, bukan kemampuan Anda."
    );

  // Profile
  form.addSectionHeaderItem().setTitle("BAGIAN 2: Profil Responden");
  form.addTextItem().setTitle("Nama").setRequired(true);
  form.addTextItem().setTitle("Usia").setRequired(true);
  form.addTextItem().setTitle("Pekerjaan").setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Seberapa sering Anda mengakses website wisata/travel?")
    .setChoiceValues(["Tidak Pernah", "Jarang", "Sering", "Sangat Sering"])
    .setRequired(true);

  // Tasks
  form
    .addSectionHeaderItem()
    .setTitle("BAGIAN 3: Skenario Tugas (Task Scenario)");

  // Task A
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS A: Eksplorasi Destinasi (Fitur Peta & Virtual Tour)")
    .setHelpText(
      'Instruksi:\n1. Buka menu "See Map" (Peta).\n2. Pilih salah satu titik lokasi destinasi.\n3. Klik tombol Virtual Tour.\n4. Coba gerakkan layar 360 derajat.'
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan A: Seberapa SULIT atau MUDAH bagi Anda untuk menemukan dan menggunakan fitur Virtual Tour tersebut?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // Task B
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS B: Bantuan AI (Fitur Chatbot)")
    .setHelpText(
      "Instruksi:\n1. Temukan fitur Chatbot.\n2. Ketikkan pertanyaan terkait sejarah rempah/wisata.\n3. Tunggu balasan."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan B: Seberapa SULIT atau MUDAH mendapatkan informasi yang relevan dari Chatbot?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // Task C
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS C: Akun & Transaksi (Register & Upgrade)")
    .setHelpText(
      'Instruksi:\n1. Lakukan Register.\n2. Login dan cari tombol "Upgrade Premium".\n3. Ikuti proses sampai halaman Konfirmasi Pembayaran.'
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan C: Seberapa JELAS alur pendaftaran akun dan proses upgrade premium tersebut?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Tidak Jelas", "Sangat Jelas")
    .setRequired(true);

  // Task D
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS D: Pengajuan Pemasangan Iklan")
    .setHelpText(
      "Instruksi:\n1. Lakukan Login/Register.\n2. Cari menu Ads Submission.\n3. Buat pengajuan baru dengan klik tombol New Ads Submission\n4. isi form dengan informasi yang dibutuhkan dan klik Submit"
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan D: Seberapa JELAS alur pengajuan pemasangan iklan tersebut?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Tidak Jelas", "Sangat Jelas")
    .setRequired(true);

  // SUS
  addSusGrid(form, "Rempahtour User", [
    "Saya berpikir akan menggunakan website Rempahtour ini lagi.",
    "Saya merasa website Rempahtour ini rumit untuk digunakan.",
    "Saya merasa website Rempahtour ini mudah digunakan.",
    "Saya membutuhkan bantuan dari orang teknis untuk bisa menggunakan website ini.",
    "Saya merasa fitur-fitur pada website ini berjalan dengan semestinya (terintegrasi dengan baik).",
    "Saya merasa ada banyak hal yang tidak konsisten (tidak nyambung) pada website ini.",
    "Saya merasa orang lain akan memahami cara menggunakan website ini dengan cepat.",
    "Saya merasa website ini sangat membingungkan.",
    "Saya merasa tidak ada hambatan dalam menggunakan website ini.",
    "Saya perlu membiasakan diri terlebih dahulu sebelum dapat menggunakan website ini.",
  ]);

  // Feedback
  form.addSectionHeaderItem().setTitle("BAGIAN 5: Masukan Tambahan");
  form
    .addMultipleChoiceItem()
    .setTitle("Fitur mana yang menurut Anda paling SULIT digunakan?")
    .setChoiceValues([
      "Peta / Virtual Tour",
      "Chatbot AI",
      "Register / Login",
      "Upgrade Premium / Pembayaran",
      "Lainnya", // FormApp doesn't support 'Other' text input directly in choices easily in code without showOtherOption(true), using direct value for simplicity or enable other
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Apa saran atau kritik Anda untuk perbaikan website Rempahtour?");

  pageUserJR.setGoToPage(FormApp.PageNavigationType.SUBMIT); // End form after this section

  // ==========================================================================================
  // SECTION 2: Rempahtour Admin
  // Source: REMPAHTOUR-INSTRUMEN-EVALUASI-USABILITY-ADMIN.md
  // ==========================================================================================
  var pageAdminJR = form.addPageBreakItem().setTitle("Rempahtour - Admin");

  // Intro
  form
    .addSectionHeaderItem()
    .setTitle("BAGIAN 1: Pendahuluan")
    .setHelpText(
      "Instruksi: Anda berperan sebagai Administrator. Tujuan kami adalah menguji kemudahan penggunaan Dashboard Admin."
    );

  // Profile
  form.addSectionHeaderItem().setTitle("BAGIAN 2: Data Responden");
  form.addTextItem().setTitle("Nama").setRequired(true);
  form.addTextItem().setTitle("Peran/Posisi").setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Pengalaman Mengelola Website (CMS):")
    .setChoiceValues(["Belum Pernah", "Pemula", "Menengah", "Ahli"])
    .setRequired(true);

  // Tasks
  form.addSectionHeaderItem().setTitle("BAGIAN 3: Skenario Tugas");

  // Task A
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS A: Manajemen Destinasi")
    .setHelpText(
      "Instruksi:\n1. download file virtual tour https://drive.usercontent.google.com/u/0/uc?id=1RAvtZ1WfLemEA5ihkNfetlkNUByKs0yS&export=download\n2. Buka menu Destinations.\n3. Buat Destinasi Baru dengan ketentuan berikut:\n   - Destination Name memakai format SUS_TEST_NAMA (pakai nama panggilan / julukan maks 1 kata)\n   - Longitude & Latitude memakai angka seperti berikut 109.13656740 (koma pakai titik)\n   - Description diisi yang bagus karena akan jadi blog\n   - Thumbnail berupa file gambar dengan size dibawah 2MB\n   - Pano2vr berupa file hasil download pada instruksi ke-1\n4. Cari dan Edit destinasi tersebut tanpa upload Thumbnail/Pano2vr lalu simpan."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan A: Seberapa SULIT atau MUDAH proses menambahkan dan mengedit data destinasi?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // Task B
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS B: Persetujuan Iklan")
    .setHelpText(
      "Instruksi:\n1. Buka menu Ads Submission.\n2. Pilih pengajuan status Pending.\n3. Lakukan Approval (Diterima/Ditolak)."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan B: Seberapa JELAS informasi yang ditampilkan untuk mengambil keputusan persetujuan iklan?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Tidak Jelas", "Sangat Jelas")
    .setRequired(true);

  // Task C
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS C: Penempatan Iklan")
    .setHelpText(
      "Instruksi:\n1. Buka menu Ads Placement.\n2. Buat/Edit penempatan iklan.\n3. Simpan."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan C: Seberapa EFISIEN langkah-langkah pengaturan penempatan iklan tersebut?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Tidak Efisien", "Sangat Efisien")
    .setRequired(true);

  // SUS
  addSusGrid(form, "Rempahtour Admin", [
    "Saya berpikir akan sering menggunakan Dashboard Admin ini (dalam konteks pekerjaan).",
    "Saya merasa Dashboard Admin ini rumit untuk digunakan.",
    "Saya merasa Dashboard Admin ini mudah digunakan.",
    "Saya membutuhkan bantuan teknis untuk menggunakan fitur-fitur admin ini.",
    "Saya merasa fitur-fitur manajemen (CRUD) berjalan dengan semestinya.",
    "Saya merasa ada banyak hal yang tidak konsisten pada tampilan admin ini.",
    "Saya merasa orang lain (admin baru) akan memahami cara pakainya dengan cepat.",
    "Saya merasa alur kerja di Dashboard Admin ini sangat membingungkan.",
    "Saya merasa tidak ada hambatan berarti dalam mengelola data di sini.",
    "Saya perlu membiasakan diri terlebih dahulu sebelum lancar mengelola Dashboard ini.",
  ]);

  // Feedback
  form.addSectionHeaderItem().setTitle("BAGIAN 5: Masukan Tambahan");
  form
    .addMultipleChoiceItem()
    .setTitle("Fitur manajemen mana yang alurnya paling ribet/panjang?")
    .setChoiceValues([
      "Manajemen Destinasi",
      "Approval Iklan",
      "Penempatan Iklan (Placement)",
      "Lainnya",
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle(
      "Apakah ada data atau tombol yang sulit ditemukan saat Anda mencoba mengelola konten?"
    );

  form
    .addParagraphTextItem()
    .setTitle("Saran perbaikan untuk Dashboard Admin:");

  pageAdminJR.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  // ==========================================================================================
  // SECTION 3: Marketplace User
  // Source: REMPAHTOUR-MARKETPLACE-INSTRUMEN-EVALUASI-USABILITY-USER.md
  // ==========================================================================================
  var pageUserMP = form
    .addPageBreakItem()
    .setTitle("Marketplace - User (Pembeli)");

  // Intro
  form
    .addSectionHeaderItem()
    .setTitle("BAGIAN 1: Pendahuluan")
    .setHelpText(
      "Instruksi: Terima kasih telah bersedia berpartisipasi. Kami membutuhkan masukan Anda sebagai pengguna Marketplace Rempahtour."
    );

  // Profile
  form.addSectionHeaderItem().setTitle("BAGIAN 2: Profil Responden");
  form.addTextItem().setTitle("Nama").setRequired(true);
  form.addTextItem().setTitle("Usia").setRequired(true);
  form.addTextItem().setTitle("Pekerjaan").setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Seberapa sering Anda berbelanja melalui marketplace online?")
    .setChoiceValues(["Jarang", "Cukup Sering", "Sering", "Sangat Sering"])
    .setRequired(true);

  // Tasks
  form.addSectionHeaderItem().setTitle("BAGIAN 3: Skenario Tugas");

  // Task A
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS A: Ekplorasi & Pencarian Produk")
    .setHelpText(
      "Instruksi:\n1. Buka Home.\n2. Gunakan Search atau Lihat Semua.\n3. Temukan produk rempah dan buka detailnya."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan A: Seberapa MUDAH bagi Anda untuk menemukan produk yang Anda cari?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // Task B
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS B: Proses Pembelian (Checkout)")
    .setHelpText(
      "Instruksi:\n1. Masukkan produk ke Keranjang / Beli Langsung.\n2. Lanjut ke Checkout.\n3. Lengkapi info & buat pesanan (simulasi)."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan B: Seberapa JELAS alur proses pembelian dari keranjang hingga pembayaran selesai?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Tidak Jelas", "Sangat Jelas")
    .setRequired(true);

  // Task C
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS C: Riwayat Pesanan (Order History)")
    .setHelpText(
      "Instruksi:\n1. Masuk halaman Pesanan Saya.\n2. Cari pesanan baru.\n3. Lihat Detail Pesanan."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan C: Seberapa INFORMATIF halaman riwayat pesanan bagi Anda?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Kurang Informatif", "Sangat Informatif")
    .setRequired(true);

  // SUS
  addSusGrid(form, "Marketplace User", [
    "Saya berpikir akan sering menggunakan Marketplace Rempahtour ini.",
    "Saya merasa Marketplace Rempahtour ini terlalu rumit untuk digunakan.",
    "Saya merasa Marketplace Rempahtour ini mudah digunakan.",
    "Saya membutuhkan bantuan dari orang yang lebih teknis untuk dapat menggunakan Marketplace Rempahtour ini.",
    "Saya merasa fitur-fitur di Marketplace Rempahtour terintegrasi dengan baik.",
    "Saya merasa terdapat banyak hal yang tidak konsisten pada Marketplace Rempahtour.",
    "Saya merasa kebanyakan orang akan dapat mempelajari cara menggunakan Marketplace Rempahtour dengan cepat.",
    "Saya merasa Marketplace Rempahtour ini membingungkan untuk digunakan.",
    "Saya merasa tidak ada hambatan berarti dalam menggunakan Marketplace Rempahtour.",
    "Saya perlu membiasakan diri terlebih dahulu sebelum dapat menggunakan Marketplace Rempahtour dengan baik.",
  ]);

  // Feedback
  form.addSectionHeaderItem().setTitle("BAGIAN 5: Masukan Tambahan");
  form
    .addMultipleChoiceItem()
    .setTitle("Bagian mana yang menurut Anda PALING SULIT digunakan?")
    .setChoiceValues([
      "Pencarian Produk",
      "Detail Produk",
      "Keranjang",
      "Checkout",
      "Lainnya",
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle("Saran atau kritik untuk perbaikan Marketplace Rempahtour:");

  pageUserMP.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  // ==========================================================================================
  // SECTION 4: Marketplace Seller
  // Source: REMPAHTOUR-MARKETPLACE-INSTRUMEN-EVALUASI-USABILITY-SELLER.md
  // ==========================================================================================
  var pageSellerMP = form
    .addPageBreakItem()
    .setTitle("Marketplace - Seller (Penjual)");

  // Intro
  form
    .addSectionHeaderItem()
    .setTitle("BAGIAN 1: Pendahuluan")
    .setHelpText(
      "Instruksi: Evaluasi ini bertujuan menilai kemudahan penggunaan Panel Seller Marketplace Rempahtour."
    );

  // Profile
  form.addSectionHeaderItem().setTitle("BAGIAN 2: Profil Responden");
  form.addTextItem().setTitle("Nama Toko / UMKM").setRequired(true);
  form.addTextItem().setTitle("Nama Penjual").setRequired(true);
  form.addTextItem().setTitle("Usia").setRequired(true);
  form.addTextItem().setTitle("Jenis Produk yang Dijual").setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Lama pengalaman berjualan online")
    .setChoiceValues(["< 6 bulan", "6–12 bulan", "1–3 tahun", "> 3 tahun"])
    .setRequired(true);

  // Tasks
  form.addSectionHeaderItem().setTitle("BAGIAN 3: Skenario Tugas");

  // Task A
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS A: Manajemen Produk")
    .setHelpText(
      "Instruksi:\n1. Buka menu Produk.\n2. Tambah produk baru (simpan).\n3. Edit produk (simpan)."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan A: Seberapa MUDAH proses penambahan dan pengelolaan data produk pada panel seller?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // Task B
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS B: Manajemen Pesanan")
    .setHelpText(
      "Instruksi:\n1. Buka menu Orderan.\n2. Lihat detail pesanan.\n3. Perbarui status pesanan."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan B: Seberapa JELAS dan MUDAH alur pengelolaan pesanan pada panel seller?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // Task C
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS C: Request Payout")
    .setHelpText(
      "Instruksi:\n1. Buka menu Payout.\n2. Ajukan request payout.\n3. Lihat status permintaan."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan C: Seberapa MUDAH proses pengajuan dan pemantauan payout dilakukan oleh seller?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // SUS
  addSusGrid(form, "Marketplace Seller", [
    "Saya berpikir akan sering menggunakan panel seller Marketplace Rempahtour ini.",
    "Saya merasa panel seller ini terlalu rumit untuk digunakan.",
    "Saya merasa panel seller Marketplace Rempahtour ini mudah digunakan.",
    "Saya membutuhkan bantuan dari orang teknis untuk dapat menggunakan panel seller ini.",
    "Saya merasa fitur-fitur pada panel seller ini terintegrasi dengan baik.",
    "Saya merasa terdapat banyak hal yang tidak konsisten pada panel seller ini.",
    "Saya merasa kebanyakan penjual akan dapat mempelajari cara menggunakan panel ini dengan cepat.",
    "Saya merasa panel seller ini membingungkan.",
    "Saya merasa tidak ada hambatan berarti dalam menggunakan panel seller ini.",
    "Saya perlu membiasakan diri terlebih dahulu sebelum dapat menggunakan panel seller ini dengan baik.",
  ]);

  // Feedback
  form.addSectionHeaderItem().setTitle("BAGIAN 5: Masukan Tambahan");
  form
    .addMultipleChoiceItem()
    .setTitle("Fitur seller yang paling SULIT digunakan:")
    .setChoiceValues([
      "Manajemen Produk",
      "Manajemen Pesanan",
      "Request Payout",
      "Navigasi Dashboard",
      "Lainnya",
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle(
      "Saran atau kritik untuk peningkatan Panel Seller Marketplace Rempahtour:"
    );

  pageSellerMP.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  // ==========================================================================================
  // SECTION 5: Marketplace Admin
  // Source: REMPAHTOUR-MARKETPLACE-INSTRUMEN-EVALUASI-USABILITY-ADMIN.md
  // ==========================================================================================
  var pageAdminMP = form.addPageBreakItem().setTitle("Marketplace - Admin");

  // Intro
  form
    .addSectionHeaderItem()
    .setTitle("BAGIAN 1: Pendahuluan")
    .setHelpText(
      "Instruksi: Fokus evaluasi adalah Manajemen User, Payout, dan Service Fee."
    );

  // Profile
  form.addSectionHeaderItem().setTitle("BAGIAN 2: Data Responden");
  form.addTextItem().setTitle("Nama").setRequired(true);
  form.addTextItem().setTitle("Jabatan / Peran").setRequired(true);
  form
    .addTextItem()
    .setTitle("Lama pengalaman sebagai admin")
    .setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle("Frekuensi penggunaan panel admin")
    .setChoiceValues(["Harian", "Mingguan", "Bulanan", "Insidental"])
    .setRequired(true);

  // Tasks
  form.addSectionHeaderItem().setTitle("BAGIAN 3: Skenario Tugas");

  // Task A
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS A: Monitoring Dashboard Admin")
    .setHelpText(
      "Instruksi:\n1. Buka Dashboard.\n2. Perhatikan statistik.\n3. Gunakan Quick Actions."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan A: Seberapa SULIT atau MUDAH bagi Anda untuk memahami ringkasan data dan navigasi awal pada dashboard?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // Task B
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS B: Manajemen User")
    .setHelpText(
      "Instruksi:\n1. Buka menu Users.\n2. Cari user & filter roles.\n3. Simulasi ubah role."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan B: Seberapa JELAS alur pencarian dan pengelolaan hak akses (role) pengguna pada panel admin?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Tidak Jelas", "Sangat Jelas")
    .setRequired(true);

  // Task C
  form
    .addSectionHeaderItem()
    .setTitle("TUGAS C: Proses Payout & Service Fee")
    .setHelpText(
      "Instruksi:\n1. Buka Payouts (Accept/Reject).\n2. Buka Service Fee.\n3. Edit fee & simpan."
    );
  form
    .addScaleItem()
    .setTitle(
      "Pertanyaan C: Seberapa MUDAH proses pengelolaan pencairan dana dan konfigurasi biaya layanan dilakukan?"
    )
    .setBounds(1, 7)
    .setLabels("Sangat Sulit", "Sangat Mudah")
    .setRequired(true);

  // SUS
  addSusGrid(form, "Marketplace Admin", [
    "Saya berpikir akan sering menggunakan panel admin Marketplace Rempahtour ini.",
    "Saya merasa panel admin ini terlalu rumit untuk digunakan.",
    "Saya merasa panel admin Marketplace Rempahtour ini mudah digunakan.",
    "Saya membutuhkan bantuan dari orang teknis untuk dapat menggunakan panel admin ini.",
    "Saya merasa fitur-fitur pada panel admin ini terintegrasi dengan baik.",
    "Saya merasa terdapat banyak hal yang tidak konsisten pada panel admin ini.",
    "Saya merasa kebanyakan admin akan dapat mempelajari cara menggunakan panel ini dengan cepat.",
    "Saya merasa panel admin ini membingungkan.",
    "Saya merasa tidak ada hambatan berarti dalam menggunakan panel admin ini.",
    "Saya perlu membiasakan diri terlebih dahulu sebelum dapat menggunakan panel admin ini dengan baik.",
  ]);

  // Feedback
  form.addSectionHeaderItem().setTitle("BAGIAN 5: Masukan Tambahan");
  form
    .addMultipleChoiceItem()
    .setTitle("Fitur admin yang paling SULIT digunakan:")
    .setChoiceValues([
      "Dashboard",
      "Manajemen User",
      "Payout",
      "Pengaturan Service Fee",
      "Log / Notifikasi",
      "Lainnya",
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle(
      "Saran atau kritik untuk peningkatan Panel Admin Marketplace Rempahtour:"
    );

  pageAdminMP.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  // ==========================================================================================
  // FINALIZE: Set Options for Role Selection
  // ==========================================================================================
  roleSelect.setChoices([
    roleSelect.createChoice("Rempahtour User", pageUserJR),
    roleSelect.createChoice("Rempahtour Admin", pageAdminJR),
    roleSelect.createChoice("Rempahtour Marketplace User", pageUserMP),
    roleSelect.createChoice("Rempahtour Marketplace Seller", pageSellerMP),
    roleSelect.createChoice("Rempahtour Marketplace Admin", pageAdminMP),
  ]);
}

/**
 * Helper to add SUS Grid/Questions
 * Since Google Forms script doesn't natively support "Grid" items via App Script easily in a simplified way that matches visual grids perfectly
 * (it uses GridItem which requires rows and columns), we will implement it as a GridItem.
 */
function addSusGrid(form, context, questions) {
  form
    .addSectionHeaderItem()
    .setTitle("BAGIAN 4: System Usability Scale (SUS)")
    .setHelpText(
      "Berdasarkan pengalaman Anda menggunakan " +
        context +
        ", beri penilaian Anda.\nSkala: 1 (Sangat Tidak Setuju) - 5 (Sangat Setuju)."
    );

  var grid = form.addGridItem();
  grid
    .setTitle("Pertanyaan SUS (" + context + ")")
    .setRows(questions)
    .setColumns([
      "1 (Sangat Tidak Setuju)",
      "2",
      "3 (Netral)",
      "4",
      "5 (Sangat Setuju)",
    ])
    .setRequired(true);
}

/**
 * Helper to delete all items in the form
 */
function deleteAllItems(form) {
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    form.deleteItem(items[i]);
  }
}
