Vue.component('stok-badge', {
  template: '#tpl-stok-badge',
  props: {
    qty: { type: Number, required: true },
    safety: { type: Number, required: true }
  },
  computed: {
    status: function () {
      if (this.qty === 0) return 'Habis';
      if (this.qty < this.safety) return 'Terbatas';
      return 'Tersedia';
    },
    badgeClass: function () {
      if (this.qty === 0) return 'badge-danger';
      if (this.qty < this.safety) return 'badge-warning';
      return 'badge-success';
    }
  }
});
