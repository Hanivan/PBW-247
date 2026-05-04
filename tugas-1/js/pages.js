// Page-specific initialization and event handlers

import { ALERT_TYPE, ANIMATION, PAGE_URL } from './constants.js';

// Handle logout modal across all pages
function initLogoutModal() {
  // Show logout modal when logout button is clicked
  document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('[data-action="logout"]');
    if (logoutBtn) {
      e.preventDefault();
      UI.showModal('logoutModal');
    }
  });

  // Confirm logout action
  document.addEventListener('click', (e) => {
    const confirmBtn = e.target.closest('[data-action="confirm-logout"]');
    if (confirmBtn) {
      Auth.destroySession();
      window.location.href = PAGE_URL.LOGIN;
    }
  });
}

// Login Page
function initLoginPage() {
  // Redirect if already authenticated
  Auth.redirectIfAuthenticated();

  // Initialize UI
  UI.init();

  // Handle login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      UI.clearFormErrors(this);

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      // Validate form
      if (!UI.validateForm(this)) {
        this.classList.add('shake');
        setTimeout(() => this.classList.remove('shake'), ANIMATION.DURATION.SHAKE);
        return;
      }

      // Validate credentials
      const user = Auth.validateLogin(email, password);

      if (user) {
        Auth.createSession(user);
        UI.showAlert('(^^) Login berhasil! Mengalihkan...', ALERT_TYPE.SUCCESS);
        setTimeout(() => {
          window.location.href = PAGE_URL.DASHBOARD;
        }, 1000);
      } else {
        UI.showAlert('(x_x) Email atau password yang Anda masukkan salah', ALERT_TYPE.ERROR);
        this.classList.add('shake');
        setTimeout(() => this.classList.remove('shake'), ANIMATION.DURATION.SHAKE);
      }
    });
  }

  // Handle forgot password links
  const forgotLinks = document.querySelectorAll('[data-modal="forgotModal"]');
  forgotLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      UI.showModal('forgotModal');
    });
  });

  // Handle register links
  const registerLinks = document.querySelectorAll('[data-modal="registerModal"]');
  registerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      UI.showModal('registerModal');
    });
  });

  // Handle forgot password form
  const forgotBtn = document.querySelector('[data-action="forgot-password"]');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', function() {
      const email = document.getElementById('forgotEmail').value.trim();
      if (!email) {
        UI.showAlert('(o_o)! Masukkan email Anda', ALERT_TYPE.WARNING);
        return;
      }
      UI.showAlert('(^_^) Link reset password telah dikirim ke ' + email, ALERT_TYPE.SUCCESS);
      UI.hideModal('forgotModal');
    });
  }

  // Handle register form
  const registerBtn = document.querySelector('[data-action="register"]');
  if (registerBtn) {
    registerBtn.addEventListener('click', function() {
      const form = document.getElementById('registerForm');
      if (!UI.validateForm(form)) {
        return;
      }
      UI.showAlert('(^^) Pendaftaran berhasil! Silakan login', ALERT_TYPE.SUCCESS);
      UI.hideModal('registerModal');
      form.reset();
    });
  }
}

// Dashboard Page
function initDashboardPage() {
  Auth.requireAuth();
  UI.init();
  App.initDashboard();

  // Handle navigation cards
  document.querySelectorAll('.nav-card[data-href]').forEach(card => {
    card.addEventListener('click', function() {
      const href = this.getAttribute('data-href');
      if (href) {
        window.location.href = href;
      }
    });
  });

}

// Tracking Page
function initTrackingPage() {
  Auth.requireAuth();
  UI.init();
  App.initTracking();

}

// Stock Page
function initStockPage() {
  Auth.requireAuth();
  UI.init();
  App.initStock();

  // Handle add stock button
  const addStockBtn = document.querySelector('[data-action="add-stock"]');
  if (addStockBtn) {
    addStockBtn.addEventListener('click', function() {
      UI.showModal('addStockModal');
    });
  }

  // Handle save stock button
  const saveStockBtn = document.querySelector('[data-action="save-stock"]');
  if (saveStockBtn) {
    saveStockBtn.addEventListener('click', function() {
      App.addStock();
    });
  }

  // Handle update stock button
  const updateStockBtn = document.querySelector('[data-action="update-stock"]');
  if (updateStockBtn) {
    updateStockBtn.addEventListener('click', function() {
      App.updateStock();
    });
  }

  // Handle confirm delete button
  const confirmDeleteBtn = document.querySelector('[data-action="confirm-delete"]');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', function() {
      App.deleteStock();
    });
  }

}

// Stock Detail Page
function initStockDetailPage() {
  Auth.requireAuth();
  UI.init();
  App.initStockDetail();
  initLogoutModal();
}

// Initialize page based on body class or path
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;

  if (path.includes(PAGE_URL.LOGIN) || path.endsWith('/login')) {
    initLoginPage();
  } else if (path.includes(PAGE_URL.DASHBOARD) || path.endsWith('/dashboard')) {
    initDashboardPage();
    initLogoutModal();
  } else if (path.includes(PAGE_URL.TRACKING) || path.endsWith('/tracking')) {
    initTrackingPage();
    initLogoutModal();
  } else if (path.includes(PAGE_URL.STOK) || path.endsWith('/stok')) {
    initStockPage();
    initLogoutModal();
  } else if (path.includes(PAGE_URL.STOK_DETAIL) || path.endsWith('/stok-detail')) {
    initStockDetailPage();
  }
});
