var RELATED_LIMIT = 4;

Vue.component('stok-detail-panel', {
  template: '#tpl-stok-detail',
  props: { kode: { type: String, required: true } },
  emits: ['go-detail', 'go-back'],

  data: function () {
    return {
      all: window.AppData.stok.map(function (s) { return Object.assign({}, s); }),
      kategoriList: window.AppData.kategoriList,
      upbjjList: window.AppData.upbjjList,
      item: null,
      showEdit: false,
      editForm: {},
      editErrors: {},
      editOriginalKode: ''
    };
  },

  created: function () {
    this.loadItem(this.kode);
  },

  computed: {
    related: function () {
      if (!this.item) return [];
      var self = this;
      return this.all.filter(function (b) {
        return b.kategori === self.item.kategori && b.kode !== self.item.kode;
      }).slice(0, RELATED_LIMIT);
    }
  },

  watch: {
    kode: function (val) { this.loadItem(val); },
    'item.qty': function (val) {
      if (val === 0) this.$root.showAlert('(o_o)! Stok item ini habis', 'warning');
    }
  },

  methods: {
    loadItem: function (kode) {
      var found = this.all.find(function (b) { return b.kode === kode; });
      if (!found) {
        this.$root.showAlert('(x_x) Data barang tidak ditemukan', 'error');
        this.$emit('go-back');
        return;
      }
      this.item = found;
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
      if (!f.lokasiRak) e.lokasiRak = 'Field ini wajib diisi';
      if (!f.kode) e.kode = 'Field ini wajib diisi';
      if (!f.judul) e.judul = 'Field ini wajib diisi';
      if (!f.upbjj) e.upbjj = 'Field ini wajib diisi';
      if (f.harga === null || f.harga === '' || isNaN(f.harga) || f.harga < 0) e.harga = 'Harga harus berupa angka yang valid';
      if (f.qty === null || f.qty === '' || isNaN(f.qty) || f.qty < 0) e.qty = 'Jumlah stok harus berupa angka yang valid';
      if (f.safety === null || f.safety === '' || isNaN(f.safety) || f.safety < 0) e.safety = 'Safety stock harus berupa angka yang valid';
      this.editErrors = e;
      if (Object.keys(e).length > 0) return;

      var self = this;
      var idx = this.all.findIndex(function (b) { return b.kode === self.editOriginalKode; });
      var updated = {
        kode: f.kode, judul: f.judul, kategori: f.kategori,
        upbjj: f.upbjj, lokasiRak: f.lokasiRak,
        harga: Number(f.harga), qty: Number(f.qty),
        safety: Number(f.safety), catatanHTML: f.catatanHTML
      };
      if (idx !== -1) this.all.splice(idx, 1, updated);
      this.item = updated;
      this.showEdit = false;
      this.$root.showAlert('(^_^) Stok berhasil diperbarui', 'success');
    }
  }
});