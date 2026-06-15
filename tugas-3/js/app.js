var SESSION_KEY = 'sitta_session';
var THEME_KEY = 'sitta_theme';
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var JP_MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
var JP_DAYS = ['日','月','火','水','木','金','土'];
var JP_GREETINGS = { pagi: 'おはようございます', siang: 'こんにちは', sore: 'こんばんは', malam: 'おやすみなさい' };
var ID_GREETINGS = { pagi: 'Selamat Pagi', siang: 'Selamat Siang', sore: 'Selamat Sore', malam: 'Selamat Malam' };
var REIWA_ERA_START = 2018;

function greetingPeriod(hour, minute) {
  if (hour === 0 || (hour >= 1 && hour < 10) || (hour === 10 && minute <= 30)) return 'pagi';
  if ((hour === 10 && minute > 30) || (hour >= 11 && hour < 15) || (hour === 15 && minute === 0)) return 'siang';
  if ((hour === 15 && minute > 0) || (hour >= 16 && hour < 18) || (hour === 18 && minute === 0)) return 'sore';
  return 'malam';
}

Vue.filter('rupiah', function (n) {
  return 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');
});
Vue.filter('uppercase', function (s) { return s ? String(s).toUpperCase() : ''; });
Vue.filter('statusStok', function (item) {
  if (!item || item.qty === 0) return 'Habis';
  if (Number(item.qty) < Number(item.safety)) return 'Terbatas';
  return 'Tersedia';
});
Vue.filter('tanggal', function (str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
});

window.SittaAuth = {
  validateLogin: function (email, password) {
    return window.AppData.dataPengguna.find(function (u) {
      return u.email === email && u.password === password;
    }) || null;
  },
  createSession: function (user) {
    var session = { userEmail: user.email, userName: user.nama, userRole: user.role, userLocation: user.lokasi, timestamp: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  getSession: function () {
    var raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  isAuthenticated: function () { return this.getSession() !== null; },
  destroySession: function () { localStorage.removeItem(SESSION_KEY); }
};

api.loadApp().then(function () {
  new Vue({
    el: '#app',

    data: {
      tab: 'login',
      selectedKode: '',

      /* shell */
      theme: 'light',
      sidebarOpen: false,
      showLogoutModal: false,
      alerts: [],
      alertSeq: 0,

      /* dashboard */
      session: null,
      now: new Date(),
      _clock: null,

      /* login */
      loginForm: { email: '', password: '' },
      loginErrors: {},
      shake: false,
      showForgot: false,
      forgot: { email: '' },
      showRegister: false,
      register: { nama: '', email: '', password: '', lokasi: '' },
      regErrors: {}
    },

    created: function () {
      this.theme = localStorage.getItem(THEME_KEY) || 'light';
      document.documentElement.setAttribute('data-theme', this.theme);
      if (window.SittaAuth.isAuthenticated()) {
        this.session = window.SittaAuth.getSession();
        this.tab = 'dashboard';
      }
    },

    mounted: function () {
      var self = this;
      this._clock = setInterval(function () { self.now = new Date(); }, 60000);
    },

    beforeDestroy: function () {
      if (this._clock) clearInterval(this._clock);
    },

    computed: {
      themeIcon: function () { return this.theme === 'dark' ? '(☆^O^☆)' : '(-_-)'; },

      /* dashboard stats */
      totalItems: function () { return window.AppData.stok.length; },
      totalStock: function () {
        return window.AppData.stok.reduce(function (sum, i) { return sum + i.qty; }, 0).toLocaleString('id-ID');
      },
      shippingCount: function () { return Object.keys(window.AppData.tracking).length; },
      upbjjCount: function () {
        return window.AppData.dataPengguna.filter(function (u) { return u.role === 'UPBJJ-UT'; }).length;
      },

      /* date / greeting */
      period: function () { return greetingPeriod(this.now.getHours(), this.now.getMinutes()); },
      jpGreeting: function () { return JP_GREETINGS[this.period]; },
      idGreeting: function () { return ID_GREETINGS[this.period]; },
      greetingText: function () {
        var name = this.session ? this.session.userName : '';
        return JP_GREETINGS[this.period] + '、' + name;
      },
      jpYear: function () { return 'R' + (this.now.getFullYear() - REIWA_ERA_START); },
      jpMonth: function () { return JP_MONTHS[this.now.getMonth()]; },
      jpDay: function () { return this.now.getDate() + JP_DAYS[this.now.getDay()]; }
    },

    watch: {
      period: function (now, before) {
        if (before) this.showAlert(ID_GREETINGS[now] + '! Waktu telah berganti.', 'info');
      }
    },

    methods: {
      /* shell */
      toggleTheme: function () {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem(THEME_KEY, this.theme);
      },
      toggleSidebar: function () { this.sidebarOpen = !this.sidebarOpen; },
      closeSidebar: function () { this.sidebarOpen = false; },
      confirmLogout: function () {
        window.SittaAuth.destroySession();
        this.session = null;
        this.tab = 'login';
        this.showLogoutModal = false;
      },
      showAlert: function (message, type) {
        var id = ++this.alertSeq;
        this.alerts.push({ id: id, message: message, type: type || 'info' });
        var self = this;
        setTimeout(function () { self.removeAlert(id); }, 5000);
      },
      removeAlert: function (id) {
        this.alerts = this.alerts.filter(function (a) { return a.id !== id; });
      },

      /* tab navigation */
      goTab: function (name) { this.tab = name; this.sidebarOpen = false; },
      goDetail: function (kode) { this.selectedKode = kode; this.tab = 'stok-detail'; },

      /* login */
      triggerShake: function () {
        var self = this;
        this.shake = true;
        setTimeout(function () { self.shake = false; }, 400);
      },
      validateLoginForm: function () {
        var e = {};
        if (!this.loginForm.email) e.email = 'Field ini wajib diisi';
        else if (!EMAIL_RE.test(this.loginForm.email)) e.email = 'Format email tidak valid';
        if (!this.loginForm.password) e.password = 'Field ini wajib diisi';
        else if (this.loginForm.password.length < 6) e.password = 'Password minimal 6 karakter';
        this.loginErrors = e;
        return Object.keys(e).length === 0;
      },
      submitLogin: function () {
        if (!this.validateLoginForm()) { this.triggerShake(); return; }
        var user = window.SittaAuth.validateLogin(this.loginForm.email, this.loginForm.password);
        if (user) {
          this.session = window.SittaAuth.createSession(user);
          this.showAlert('(^^) Login berhasil!', 'success');
          var self = this;
          setTimeout(function () { self.tab = 'dashboard'; }, 500);
        } else {
          this.showAlert('(x_x) Email atau password yang Anda masukkan salah', 'error');
          this.triggerShake();
        }
      },
      openForgot: function () { this.forgot.email = ''; this.showForgot = true; },
      submitForgot: function () {
        var email = this.forgot.email.trim();
        if (!email) { this.showAlert('(o_o)! Masukkan email Anda', 'warning'); return; }
        this.showAlert('(^_^) Link reset password telah dikirim ke ' + email, 'success');
        this.showForgot = false;
      },
      openRegister: function () {
        this.register = { nama: '', email: '', password: '', lokasi: '' };
        this.regErrors = {};
        this.showRegister = true;
      },
      validateRegister: function () {
        var e = {}, r = this.register;
        if (!r.nama) e.nama = 'Field ini wajib diisi';
        if (!r.email) e.email = 'Field ini wajib diisi';
        else if (!EMAIL_RE.test(r.email)) e.email = 'Format email tidak valid';
        if (!r.password) e.password = 'Field ini wajib diisi';
        else if (r.password.length < 6) e.password = 'Password minimal 6 karakter';
        if (!r.lokasi) e.lokasi = 'Field ini wajib diisi';
        this.regErrors = e;
        return Object.keys(e).length === 0;
      },
      submitRegister: function () {
        if (!this.validateRegister()) return;
        this.showAlert('(^^) Pendaftaran berhasil! Silakan login', 'success');
        this.showRegister = false;
      }
    }
  });
});
