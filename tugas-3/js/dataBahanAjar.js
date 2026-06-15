var app = new Vue ({
  el: '#app',
  data: {
      // ----- pengguna untuk login & sesi -----
      dataPengguna: [
        { id: 1, nama: "Rina Wulandari", email: "rina@ut.ac.id", password: "rina123", role: "UPBJJ-UT", lokasi: "UPBJJ Jakarta" },
        { id: 2, nama: "Agus Pranoto", email: "agus@ut.ac.id", password: "agus123", role: "UPBJJ-UT", lokasi: "UPBJJ Makassar" },
        { id: 3, nama: "Siti Marlina", email: "siti@ut.ac.id", password: "siti123", role: "Puslaba", lokasi: "Pusat" },
        { id: 4, nama: "Doni Setiawan", email: "doni@ut.ac.id", password: "doni123", role: "Fakultas", lokasi: "FISIP" },
        { id: 5, nama: "Admin SITTA", email: "admin@ut.ac.id", password: "admin123", role: "Administrator", lokasi: "Pusat" }
      ],
      upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
      kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
      pengirimanList: [
        { kode: "REG", nama: "Reguler (3-5 hari)" },
        { kode: "EXP", nama: "Ekspres (1-2 hari)" }
      ],
      paket: [
        { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
        { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 }
      ],
      stok: [
        {
          kode: "EKMA4116",
          judul: "Pengantar Manajemen",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A3",
          harga: 65000,
          qty: 28,
          safety: 20,
          catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
        },
        {
          kode: "EKMA4115",
          judul: "Pengantar Akuntansi",
          kategori: "MK Wajib",
          upbjj: "Jakarta",
          lokasiRak: "R1-A4",
          harga: 60000,
          qty: 7,
          safety: 15,
          catatanHTML: "<strong>Cover baru</strong>"
        },
        {
          kode: "BIOL4201",
          judul: "Biologi Umum (Praktikum)",
          kategori: "Praktikum",
          upbjj: "Surabaya",
          lokasiRak: "R3-B2",
          harga: 80000,
          qty: 12,
          safety: 10,
          catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
        },
        {
          kode: "FISIP4001",
          judul: "Dasar-Dasar Sosiologi",
          kategori: "MK Pilihan",
          upbjj: "Makassar",
          lokasiRak: "R2-C1",
          harga: 55000,
          qty: 2,
          safety: 8,
          catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
        }
      ],
      // Simulasi status DO (opsional fitur Tracking DO)
      tracking: {
        "DO2025-0001": {
          nim: "123456789",
          nama: "Rina Wulandari",
          status: "Dalam Perjalanan",
          ekspedisi: "JNE",
          tanggalKirim: "2025-08-25",
          paket: "PAKET-UT-001",
          total: 120000,
          perjalanan: [
            { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
            { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
            { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
          ]
        }
      },
      doCounter: 1
  }
});

Vue.filter('rupiah', function (n) {
  return 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
});

Vue.filter('uppercase', function (s) {
  return s ? String(s).toUpperCase() : '';
});

Vue.filter('statusStok', function (item) {
  if (!item || item.qty === 0) return 'Habis';
  if (Number(item.qty) < Number(item.safety)) return 'Terbatas';
  return 'Tersedia';
});

Vue.filter('tanggal', function (str) {
  if (!str) return '-';
  var d = new Date(str);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
});