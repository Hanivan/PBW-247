Vue.component('stat-card', {
  template: '#tpl-stat-card',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    icon: { type: String, default: '(^_^)' },
    labelJp: { type: String, default: '' }
  }
});
