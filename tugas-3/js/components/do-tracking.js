var MAX_JOURNEY_STEPS = 5;

Vue.component('do-tracking', {
  template: '#tpl-do-tracking',

  data: function () {
    return {
      tracking: window.AppData.tracking,
      paketList: window.AppData.paket,
      doNumber: '',
      lastQuery: '',
      result: null,
      searched: false
    };
  },

  computed: {
    progress: function () {
      if (!this.result) return 0;
      var pct = (this.result.perjalanan.length / MAX_JOURNEY_STEPS) * 100;
      return Math.round(Math.min(pct, 100));
    }
  },

  watch: {
    doNumber: function (val) {
      if (!val) { this.result = null; this.searched = false; }
    }
  },

  methods: {
    paketNama: function (kode) {
      var p = this.paketList.find(function (x) { return x.kode === kode; });
      return p ? p.nama : kode;
    },

    search: function () {
      var no = this.doNumber.trim();
      if (!no) { this.$root.showAlert('Masukkan Nomor DO', 'warning'); return; }
      this.lastQuery = no;
      this.searched = true;
      this.result = this.tracking[no] || null;
    },

    fillExample: function (no) {
      this.doNumber = no;
      this.search();
    },

    addTracking: function (doKey, entry) {
      this.$set(this.tracking, doKey, entry);
    }
  }
});
