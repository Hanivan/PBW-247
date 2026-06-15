/* ============================================================
   shared.js — Auth + mixin bersama untuk seluruh halaman (Vue 2).
   Auth membaca pengguna dari window.app (dataBahanAjar.js).
   appShellMixin menyediakan: tema gelap, sidebar, alert, logout.
   ============================================================ */

var PAGE = {
  LOGIN: "login.html",
  DASHBOARD: "dashboard.html",
  TRACKING: "tracking.html",
  STOK: "stok.html",
  STOK_DETAIL: "stok-detail.html"
};

var SESSION_KEY = "sitta_session";
var THEME_KEY = "sitta_theme";

window.SittaAuth = {
  validateLogin: function (email, password) {
    var users = window.app.dataPengguna;
    return users.find(function (u) {
      return u.email === email && u.password === password;
    }) || null;
  },

  createSession: function (user) {
    var session = {
      userEmail: user.email,
      userName: user.nama,
      userRole: user.role,
      userLocation: user.lokasi,
      timestamp: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getSession: function () {
    var raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: function () {
    return this.getSession() !== null;
  },

  destroySession: function () {
    localStorage.removeItem(SESSION_KEY);
  },

  requireAuth: function () {
    if (!this.isAuthenticated()) window.location.href = PAGE.LOGIN;
  },

  redirectIfAuthenticated: function () {
    if (this.isAuthenticated()) window.location.href = PAGE.DASHBOARD;
  }
};

// Mixin dipakai oleh setiap instance Vue halaman untuk fitur shell bersama.
window.appShellMixin = {
  data: function () {
    return {
      theme: "light",
      sidebarOpen: false,
      showLogoutModal: false,
      alerts: [],
      _alertSeq: 0
    };
  },

  computed: {
    themeIcon: function () {
      return this.theme === "dark" ? "(☆^O^☆)" : "(-_-)";
    }
  },

  created: function () {
    this.theme = localStorage.getItem(THEME_KEY) || "light";
    document.documentElement.setAttribute("data-theme", this.theme);
  },

  methods: {
    toggleTheme: function () {
      this.theme = this.theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", this.theme);
      localStorage.setItem(THEME_KEY, this.theme);
    },

    toggleSidebar: function () {
      this.sidebarOpen = !this.sidebarOpen;
    },

    closeSidebar: function () {
      this.sidebarOpen = false;
    },

    confirmLogout: function () {
      window.SittaAuth.destroySession();
      window.location.href = PAGE.LOGIN;
    },

    showAlert: function (message, type) {
      var id = ++this._alertSeq;
      this.alerts.push({ id: id, message: message, type: type || "info" });
      var self = this;
      setTimeout(function () { self.removeAlert(id); }, 5000);
    },

    removeAlert: function (id) {
      this.alerts = this.alerts.filter(function (a) { return a.id !== id; });
    }
  }
};
