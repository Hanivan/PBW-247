/* ============================================================
   stok-app.js — logika halaman Stok Bahan Ajar (Vue 2).
   Pencarian (computed), tabel/grid, tambah/edit/hapus + validasi.
   Dua watcher: simpan mode tampilan & normalisasi kode ke huruf besar.
   ============================================================ */

function emptyForm() {
  return { lokasiRak: "", kode: "", judul: "", kategori: "MK Wajib", upbjj: "Jakarta", harga: null, qty: null, safety: null, catatanHTML: "" };
}

new Vue({
  el: "#stok-app",
  mixins: [window.appShellMixin],

  data: {
    // Klon agar perubahan CRUD tidak mengubah sumber asli.
    stok: window.app.stok.map(function (s) { return Object.assign({}, s); }),
    kategoriList: window.app.kategoriList,
    upbjjList: window.app.upbjjList,
    search: "",
    view: localStorage.getItem("stockView") || "table",

    showAdd: false,
    form: emptyForm(),
    errors: {},

    showEdit: false,
    editForm: {},
    editErrors: {},
    editOriginalKode: "",

    showDelete: false,
    deleteKode: "",
    deleteLabel: ""
  },

  created: function () {
    window.SittaAuth.requireAuth();
  },

  computed: {
    viewIcon: function () {
      return this.view === "grid" ? "▦" : "≡";
    },

    filtered: function () {
      var q = this.search.toLowerCase();
      if (!q) return this.stok;
      return this.stok.filter(function (item) {
        return item.lokasiRak.toLowerCase().indexOf(q) !== -1 ||
               item.kode.toLowerCase().indexOf(q) !== -1 ||
               item.judul.toLowerCase().indexOf(q) !== -1 ||
               item.kategori.toLowerCase().indexOf(q) !== -1 ||
               item.upbjj.toLowerCase().indexOf(q) !== -1;
      });
    },

    stats: function () {
      var totalQty = 0, lowStock = 0, cats = {};
      this.stok.forEach(function (item) {
        totalQty += Number(item.qty) || 0;
        if (Number(item.qty) < Number(item.safety)) lowStock++;
        cats[item.kategori] = true;
      });
      return {
        totalItems: this.stok.length,
        totalQty: totalQty.toLocaleString("id-ID"),
        lowStock: lowStock,
        categories: Object.keys(cats).length
      };
    }
  },

  watch: {
    // Watcher 1: pertahankan pilihan tampilan antar kunjungan.
    view: function (val) {
      localStorage.setItem("stockView", val);
    },

    // Watcher 2: kode barang selalu huruf besar saat diketik.
    "form.kode": function (val) {
      if (val) this.form.kode = val.toUpperCase();
    }
  },

  methods: {
    formatRupiah: function (n) {
      return "Rp " + (Number(n) || 0).toLocaleString("id-ID");
    },

    toggleView: function () {
      this.view = this.view === "table" ? "grid" : "table";
    },

    goDetail: function (kode) {
      window.location.href = "stok-detail.html?kode=" + encodeURIComponent(kode);
    },

    validateStock: function (f, errsKey) {
      var e = {};
      if (!f.lokasiRak) e.lokasiRak = "Field ini wajib diisi";
      if (!f.kode) e.kode = "Field ini wajib diisi";
      if (!f.judul) e.judul = "Field ini wajib diisi";
      if (!f.upbjj) e.upbjj = "Field ini wajib diisi";
      if (f.harga === null || f.harga === "" || isNaN(f.harga) || f.harga < 0)
        e.harga = "Harga harus berupa angka yang valid";
      if (f.qty === null || f.qty === "" || isNaN(f.qty) || f.qty < 0)
        e.qty = "Jumlah stok harus berupa angka yang valid";
      if (f.safety === null || f.safety === "" || isNaN(f.safety) || f.safety < 0)
        e.safety = "Safety stock harus berupa angka yang valid";
      this[errsKey] = e;
      return Object.keys(e).length === 0;
    },

    openAdd: function () {
      this.form = emptyForm();
      this.errors = {};
      this.showAdd = true;
    },

    saveAdd: function () {
      if (!this.validateStock(this.form, "errors")) return;
      if (this.stok.some(function (s) { return s.kode === this.form.kode; }.bind(this))) {
        this.errors = Object.assign({}, this.errors, { kode: "Kode barang sudah ada" });
        return;
      }
      this.stok.push({
        kode: this.form.kode,
        judul: this.form.judul,
        kategori: this.form.kategori,
        upbjj: this.form.upbjj,
        lokasiRak: this.form.lokasiRak,
        harga: Number(this.form.harga),
        qty: Number(this.form.qty),
        safety: Number(this.form.safety),
        catatanHTML: this.form.catatanHTML
      });
      this.showAdd = false;
      this.showAlert("(^_^) Stok berhasil ditambahkan", "success");
    },

    openEdit: function (item) {
      this.editForm = Object.assign({}, item);
      this.editErrors = {};
      this.editOriginalKode = item.kode;
      this.showEdit = true;
    },

    saveEdit: function () {
      if (!this.validateStock(this.editForm, "editErrors")) return;
      var self = this;
      var idx = this.stok.findIndex(function (s) { return s.kode === self.editOriginalKode; });
      if (idx === -1) {
        this.showAlert("(x_x) Data tidak ditemukan", "error");
        return;
      }
      this.stok.splice(idx, 1, {
        kode: this.editForm.kode,
        judul: this.editForm.judul,
        kategori: this.editForm.kategori,
        upbjj: this.editForm.upbjj,
        lokasiRak: this.editForm.lokasiRak,
        harga: Number(this.editForm.harga),
        qty: Number(this.editForm.qty),
        safety: Number(this.editForm.safety),
        catatanHTML: this.editForm.catatanHTML
      });
      this.showEdit = false;
      this.showAlert("(^_^) Stok berhasil diperbarui", "success");
    },

    openDelete: function (item) {
      this.deleteKode = item.kode;
      this.deleteLabel = item.judul + " (" + item.kode + ")";
      this.showDelete = true;
    },

    confirmDelete: function () {
      var self = this;
      var idx = this.stok.findIndex(function (s) { return s.kode === self.deleteKode; });
      if (idx !== -1) this.stok.splice(idx, 1);
      this.showDelete = false;
      this.showAlert("(^_^) Stok berhasil dihapus", "success");
    }
  }
});
