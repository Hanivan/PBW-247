/* ============================================================
   tracking-app.js — halaman Tracking Pengiriman (Vue 2).
   Cari DO di window.app.tracking, tampilkan info, progress,
   dan timeline. Progress dihitung lewat computed property.
   ============================================================ */

var MAX_JOURNEY_STEPS = 5;

new Vue({
  el: "#tracking-app",
  mixins: [window.appShellMixin],

  data: {
    tracking: window.app.tracking,
    paketList: window.app.paket,
    doNumber: "",
    lastQuery: "",
    result: null,
    searched: false
  },

  created: function () {
    window.SittaAuth.requireAuth();
  },

  computed: {
    progress: function () {
      if (!this.result) return 0;
      var pct = (this.result.perjalanan.length / MAX_JOURNEY_STEPS) * 100;
      return Math.round(Math.min(pct, 100));
    }
  },

  watch: {
    // Watcher: bersihkan hasil lama begitu kotak pencarian dikosongkan.
    doNumber: function (val) {
      if (!val) {
        this.result = null;
        this.searched = false;
      }
    }
  },

  methods: {
    paketNama: function (kode) {
      var p = this.paketList.find(function (x) { return x.kode === kode; });
      return p ? p.nama : kode;
    },

    formatRupiah: function (n) {
      return "Rp " + (Number(n) || 0).toLocaleString("id-ID");
    },

    search: function () {
      var no = this.doNumber.trim();
      if (!no) {
        this.showAlert("Masukkan Nomor DO", "warning");
        return;
      }
      this.lastQuery = no;
      this.searched = true;
      this.result = this.tracking[no] || null;
    },

    fillExample: function (no) {
      this.doNumber = no;
      this.search();
    }
  }
});
