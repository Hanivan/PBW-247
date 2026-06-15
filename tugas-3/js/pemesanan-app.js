new Vue({
  el: '#pemesanan-app',
  mixins: [window.appShellMixin],

  data: {
    stok: window.app.stok.map(function (s) { return Object.assign({}, s); }),
    kategoriList: window.app.kategoriList,
    upbjjList: window.app.upbjjList,
    pengirimanList: window.app.pengirimanList,

    step: 1,
    search: '',
    filterKategori: '',

    selectedMap: {},
    qtyMap: {},

    form: { nama: '', upbjj: '', pengiriman: '' },
    errors: {},
    ongkir: 0,

    showSuccess: false,
    lastDO: ''
  },

  created: function () {
    window.SittaAuth.requireAuth();
  },

  computed: {
    filteredStok: function () {
      var q = this.search.toLowerCase();
      var kat = this.filterKategori;
      return this.stok.filter(function (item) {
        var matchQ = !q ||
          item.judul.toLowerCase().indexOf(q) !== -1 ||
          item.kode.toLowerCase().indexOf(q) !== -1;
        var matchK = !kat || item.kategori === kat;
        return matchQ && matchK;
      });
    },

    selectedItems: function () {
      var self = this;
      return this.stok.filter(function (s) { return !!self.selectedMap[s.kode]; });
    },

    totalHarga: function () {
      var self = this;
      return this.selectedItems.reduce(function (sum, s) {
        return sum + (s.harga * (Number(self.qtyMap[s.kode]) || 0));
      }, 0);
    },

    totalQty: function () {
      var self = this;
      return this.selectedItems.reduce(function (sum, s) {
        return sum + (Number(self.qtyMap[s.kode]) || 0);
      }, 0);
    },

    grandTotal: function () {
      return this.totalHarga + this.ongkir;
    }
  },

  watch: {
    // Watcher 1: reset qty when item unchecked
    selectedMap: {
      deep: true,
      handler: function (val) {
        var self = this;
        Object.keys(val).forEach(function (kode) {
          if (!val[kode]) {
            self.$set(self.qtyMap, kode, 0);
          }
        });
      }
    },

    // Watcher 2: ongkir based on pengiriman choice
    'form.pengiriman': function (val) {
      this.ongkir = val === 'EXP' ? 15000 : 0;
    }
  },

  methods: {
    toggleRow: function (kode) {
      this.$set(this.selectedMap, kode, !this.selectedMap[kode]);
      if (this.selectedMap[kode] && !this.qtyMap[kode]) {
        this.$set(this.qtyMap, kode, 1);
      }
    },

    focusNextQty: function (index) {
      var inputs = document.querySelectorAll('.pemesanan-qty-input:not(:disabled)');
      if (inputs[index + 1]) inputs[index + 1].focus();
    },

    goStep2: function () {
      var self = this;
      var valid = this.selectedItems.length > 0 &&
        this.selectedItems.every(function (s) {
          return Number(self.qtyMap[s.kode]) > 0;
        });
      if (!valid) {
        this.showAlert('(o_o)! Pilih minimal 1 bahan ajar dan isi jumlah pesanan', 'warning');
        return;
      }
      this.step = 2;
    },

    goBack: function () {
      this.step = 1;
    },

    validateForm: function () {
      var e = {};
      if (!this.form.nama.trim()) e.nama = 'Nama pemesan wajib diisi';
      if (!this.form.upbjj) e.upbjj = 'UPBJJ tujuan wajib dipilih';
      if (!this.form.pengiriman) e.pengiriman = 'Jenis pengiriman wajib dipilih';
      this.errors = e;
      return Object.keys(e).length === 0;
    },

    submitPemesanan: function () {
      if (!this.validateForm()) return;
      var year = new Date().getFullYear();
      var counter = window.app.doCounter;
      var doKey = 'DO' + year + '-' + String(counter).padStart(4, '0');
      var self = this;

      var items = this.selectedItems.map(function (s) {
        return { kode: s.kode, judul: s.judul, qty: Number(self.qtyMap[s.kode]), harga: s.harga };
      });

      window.app.tracking[doKey] = {
        nim: '-',
        nama: this.form.nama,
        status: 'Diproses',
        ekspedisi: this.form.pengiriman === 'EXP' ? 'Ekspres' : 'Reguler',
        tanggalKirim: new Date().toISOString().slice(0, 10),
        upbjj: this.form.upbjj,
        items: items,
        total: this.grandTotal,
        perjalanan: [
          { waktu: new Date().toLocaleString('id-ID'), keterangan: 'Pesanan diterima oleh sistem SITTA' }
        ]
      };

      window.app.doCounter++;
      this.lastDO = doKey;
      this.showSuccess = true;
    },

    closeSuccess: function () {
      this.showSuccess = false;
      this.step = 1;
      this.search = '';
      this.filterKategori = '';
      this.selectedMap = {};
      this.qtyMap = {};
      this.form = { nama: '', upbjj: '', pengiriman: '' };
      this.errors = {};
      this.ongkir = 0;
    },

    handleSuccessKeydown: function (e) {
      if (e.key === 'Escape') this.closeSuccess();
    }
  }
});
