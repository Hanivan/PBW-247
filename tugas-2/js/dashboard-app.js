/* ============================================================
   dashboard-app.js — logika dashboard (Vue 2).
   Statistik (computed) dari window.app, tanggal & salam ala Jepang
   yang diperbarui berkala (watcher pada jam memperbarui salam).
   ============================================================ */

var JP_MONTHS = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
var JP_DAYS = ["日","月","火","水","木","金","土"];
var JP_GREETINGS = { pagi: "おはようございます", siang: "こんにちは", sore: "こんばんは", malam: "おやすみなさい" };
var ID_GREETINGS = { pagi: "Selamat Pagi", siang: "Selamat Siang", sore: "Selamat Sore", malam: "Selamat Malam" };
var REIWA_ERA_START = 2018;

function greetingPeriod(hour, minute) {
  if (hour === 0 || (hour >= 1 && hour < 10) || (hour === 10 && minute <= 30)) return "pagi";
  if ((hour === 10 && minute > 30) || (hour >= 11 && hour < 15) || (hour === 15 && minute === 0)) return "siang";
  if ((hour === 15 && minute > 0) || (hour >= 16 && hour < 18) || (hour === 18 && minute === 0)) return "sore";
  return "malam";
}

new Vue({
  el: "#dashboard-app",
  mixins: [window.appShellMixin],

  data: {
    source: window.app,
    session: null,
    now: new Date(),
    _clock: null
  },

  created: function () {
    window.SittaAuth.requireAuth();
    this.session = window.SittaAuth.getSession();
  },

  mounted: function () {
    var self = this;
    // Perbarui jam tiap menit agar tanggal & salam tetap akurat.
    this._clock = setInterval(function () { self.now = new Date(); }, 60000);
  },

  beforeDestroy: function () {
    if (this._clock) clearInterval(this._clock);
  },

  computed: {
    totalItems: function () {
      return this.source.stok.length;
    },
    totalStock: function () {
      return this.source.stok
        .reduce(function (sum, i) { return sum + i.qty; }, 0)
        .toLocaleString("id-ID");
    },
    shippingCount: function () {
      return Object.keys(this.source.tracking).length;
    },
    upbjjCount: function () {
      return this.source.dataPengguna.filter(function (u) { return u.role === "UPBJJ-UT"; }).length;
    },

    period: function () {
      return greetingPeriod(this.now.getHours(), this.now.getMinutes());
    },
    jpGreeting: function () {
      return JP_GREETINGS[this.period];
    },
    idGreeting: function () {
      return ID_GREETINGS[this.period];
    },
    greetingText: function () {
      var name = this.session ? this.session.userName : "";
      return JP_GREETINGS[this.period] + "、" + name;
    },

    jpYear: function () {
      return "R" + (this.now.getFullYear() - REIWA_ERA_START);
    },
    jpMonth: function () {
      return JP_MONTHS[this.now.getMonth()];
    },
    jpDay: function () {
      return this.now.getDate() + JP_DAYS[this.now.getDay()];
    }
  },

  watch: {
    // Watcher: ketika periode salam berganti (mis. pagi → siang),
    // tampilkan notifikasi ramah.
    period: function (now, before) {
      if (before) this.showAlert(ID_GREETINGS[now] + "! Waktu telah berganti.", "info");
    }
  }
});
