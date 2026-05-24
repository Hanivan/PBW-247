/* ============================================================
   login-app.js — logika halaman login (Vue 2).
   Validasi form, autentikasi ke window.app.dataPengguna, buat sesi.
   ============================================================ */

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

new Vue({
  el: "#login-app",
  mixins: [window.appShellMixin],

  data: {
    form: { email: "", password: "" },
    errors: {},
    shake: false,

    showForgot: false,
    forgot: { email: "" },

    showRegister: false,
    register: { nama: "", email: "", password: "", lokasi: "" },
    regErrors: {}
  },

  created: function () {
    window.SittaAuth.redirectIfAuthenticated();
  },

  methods: {
    triggerShake: function () {
      var self = this;
      this.shake = true;
      setTimeout(function () { self.shake = false; }, 400);
    },

    validateLoginForm: function () {
      var e = {};
      if (!this.form.email) e.email = "Field ini wajib diisi";
      else if (!EMAIL_RE.test(this.form.email)) e.email = "Format email tidak valid";
      if (!this.form.password) e.password = "Field ini wajib diisi";
      else if (this.form.password.length < 6) e.password = "Password minimal 6 karakter";
      this.errors = e;
      return Object.keys(e).length === 0;
    },

    submitLogin: function () {
      if (!this.validateLoginForm()) {
        this.triggerShake();
        return;
      }
      var user = window.SittaAuth.validateLogin(this.form.email, this.form.password);
      if (user) {
        window.SittaAuth.createSession(user);
        this.showAlert("(^^) Login berhasil! Mengalihkan...", "success");
        setTimeout(function () { window.location.href = "dashboard.html"; }, 1000);
      } else {
        this.showAlert("(x_x) Email atau password yang Anda masukkan salah", "error");
        this.triggerShake();
      }
    },

    openForgot: function () {
      this.forgot.email = "";
      this.showForgot = true;
    },

    submitForgot: function () {
      var email = this.forgot.email.trim();
      if (!email) {
        this.showAlert("(o_o)! Masukkan email Anda", "warning");
        return;
      }
      this.showAlert("(^_^) Link reset password telah dikirim ke " + email, "success");
      this.showForgot = false;
    },

    openRegister: function () {
      this.register = { nama: "", email: "", password: "", lokasi: "" };
      this.regErrors = {};
      this.showRegister = true;
    },

    validateRegister: function () {
      var e = {};
      var r = this.register;
      if (!r.nama) e.nama = "Field ini wajib diisi";
      if (!r.email) e.email = "Field ini wajib diisi";
      else if (!EMAIL_RE.test(r.email)) e.email = "Format email tidak valid";
      if (!r.password) e.password = "Field ini wajib diisi";
      else if (r.password.length < 6) e.password = "Password minimal 6 karakter";
      if (!r.lokasi) e.lokasi = "Field ini wajib diisi";
      this.regErrors = e;
      return Object.keys(e).length === 0;
    },

    submitRegister: function () {
      if (!this.validateRegister()) return;
      this.showAlert("(^^) Pendaftaran berhasil! Silakan login", "success");
      this.showRegister = false;
    }
  }
});
