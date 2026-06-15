Vue.component('stok-badge', {
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
  },
  template: '<span class="badge" :class="badgeClass">{{ status }}</span>'
});

Vue.component('stat-card', {
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    icon: { type: String, default: '(^_^)' },
    labelJp: { type: String, default: '' }
  },
  template: '\
    <article class="stat-card-compact">\
      <div class="stat-icon-wrapper">\
        <span class="stat-icon-compact" aria-hidden="true">{{ icon }}</span>\
      </div>\
      <div class="stat-content-compact">\
        <div class="stat-value-compact">{{ value }}</div>\
        <div class="stat-label-compact">{{ label }}<span v-if="labelJp" class="stat-label-jp-small">&nbsp;{{ labelJp }}</span></div>\
      </div>\
    </article>'
});
