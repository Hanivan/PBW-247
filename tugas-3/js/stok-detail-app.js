/* ============================================================
   stok-detail-app.js — halaman detail bahan ajar (Vue 2).
   Membaca ?kode= dari URL, menampilkan detail + item terkait,
   serta modal edit. Watcher menyelaraskan status stok ke alert.
   ============================================================ */

var RELATED_LIMIT = 4;

new Vue({
  el: "#detail-app",
  mixins: [window.appShellMixin],

  data: {
    all: window.app.stok.map(function (s) { return Object.assign({}, s); }),
    kategoriList: window.app.kategoriList,
    upbjjList: window.app.upbjjList,
    item: null,

    showEdit: false,
    editForm: {},
    editErrors: {},
    editOriginalKode: ""
  },

  created: function () {
    window.SittaAuth.requireAuth();
    var kode = new URLSearchParams(window.location.search).get("kode");
    var found = this.all.find(function (b) { return b.kode === kode; });
    if (!found) {
      this.showAlert("(x_x) Data barang tidak ditemukan", "error");
      setTimeout(function () { window.location.href = "stok.html"; }, 1500);
      return;
    }
    this.item = found;
  },

  computed: {
    related: function () {
      if (!this.item) return [];
      var self = this;
      return this.all.filter(function (b) {
        return b.kategori === self.item.kategori && b.kode !== self.item.kode;
      }).slice(0, RELATED_LIMIT);
    },

    stockStatus: function () {
      if (!this.item) return "";
      if (this.item.qty === 0) return "Habis";
      if (this.item.qty < this.item.safety) return "Terbatas";
      return "Tersedia";
    },

  },

  methods: {
    goDetail: function (kode) {
      window.location.href = "stok-detail.html?kode=" + encodeURIComponent(kode);
    },

    openEdit: function () {
      this.editForm = Object.assign({}, this.item);
      this.editErrors = {};
      this.editOriginalKode = this.item.kode;
      this.showEdit = true;
    },

    saveEdit: function () {
      var f = this.editForm;
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
      this.editErrors = e;
      if (Object.keys(e).length > 0) return;

      var self = this;
      var idx = this.all.findIndex(function (b) { return b.kode === self.editOriginalKode; });
      var updated = {
        kode: f.kode,
        judul: f.judul,
        kategori: f.kategori,
        upbjj: f.upbjj,
        lokasiRak: f.lokasiRak,
        harga: Number(f.harga),
        qty: Number(f.qty),
        safety: Number(f.safety),
        catatanHTML: f.catatanHTML
      };
      if (idx !== -1) this.all.splice(idx, 1, updated);
      this.item = updated;
      if (updated.kode !== this.editOriginalKode) {
        history.replaceState(null, "", "stok-detail.html?kode=" + encodeURIComponent(updated.kode));
      }
      this.showEdit = false;
      this.showAlert("(^_^) Stok berhasil diperbarui", "success");
    }
  },

  watch: {
    // Watcher: peringatkan saat stok item habis setelah pembaruan.
    "item.qty": function (val) {
      if (val === 0) this.showAlert("(o_o)! Stok item ini habis", "warning");
    }
  }
});
