// Page-specific initialization and event handlers

import { ALERT_TYPE, ANIMATION, PAGE_URL } from './constants.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';
import { App } from './app.js';

// Global event listeners flag to prevent duplicates
let _globalListenersInitialized = false;
let _dashboardNavInitialized = false;

// Initialize global event listeners once
function initGlobalListeners() {
  if (_globalListenersInitialized) return;
  _globalListenersInitialized = true;

  // Handle logout modal across all pages
  document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('[data-action="logout"]');
    if (logoutBtn) {
      e.preventDefault();
      UI.showModal('logoutModal');
    }
  }, { passive: true });

  // Confirm logout action
  document.addEventListener('click', (e) => {
    const confirmBtn = e.target.closest('[data-action="confirm-logout"]');
    if (confirmBtn) {
      Auth.destroySession();
      window.location.href = PAGE_URL.LOGIN;
    }
  });

  // Handle add stock button (global since it can appear on multiple pages)
  document.addEventListener('click', (e) => {
    const addStockBtn = e.target.closest('[data-action="add-stock"]');
    if (addStockBtn) {
      UI.showModal('addStockModal');
    }
  });

  // Handle save stock button
  document.addEventListener('click', (e) => {
    const saveStockBtn = e.target.closest('[data-action="save-stock"]');
    if (saveStockBtn) {
      App.addStock();
    }
  });

  // Handle update stock button
  document.addEventListener('click', (e) => {
    const updateStockBtn = e.target.closest('[data-action="update-stock"]');
    if (updateStockBtn) {
      App.updateStock();
    }
  });

  // Handle confirm delete button
  document.addEventListener('click', (e) => {
    const confirmDeleteBtn = e.target.closest('[data-action="confirm-delete"]');
    if (confirmDeleteBtn) {
      App.deleteStock();
    }
  });

  // Handle stock item actions (view, edit, delete)
  document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('[data-action="view-item"]');
    if (viewBtn) {
      e.preventDefault();
      const kode = viewBtn.dataset.kode;
      window.location.href = `${PAGE_URL.STOK_DETAIL}?kode=${kode}`;
      return;
    }

    const editBtn = e.target.closest('[data-action="edit-item"]');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      App.openEditModal(editBtn.dataset.kode);
      return;
    }

    const deleteBtn = e.target.closest('[data-action="delete-item"]');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      App.openDeleteModal(deleteBtn.dataset.kode);
    }
  });

  // Handle back to stock navigation
  document.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-action="back-to-stock"]');
    if (backBtn) {
      window.location.href = PAGE_URL.STOK;
    }
  });

  // Handle view related item
  document.addEventListener('click', (e) => {
    const relatedItem = e.target.closest('[data-action="view-related-item"]');
    if (relatedItem) {
      const kode = relatedItem.dataset.kode;
      window.location.href = `${PAGE_URL.STOK_DETAIL}?kode=${kode}`;
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

  // Use event delegation for modal links (more efficient)
  document.addEventListener('click', (e) => {
    const modalLink = e.target.closest('[data-modal]');
    if (modalLink) {
      e.preventDefault();
      const modalId = modalLink.getAttribute('data-modal');
      UI.showModal(modalId);
    }
  });

  // Handle modal action buttons using event delegation
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="forgot-password"], [data-action="register"]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');

    if (action === 'forgot-password') {
      const email = document.getElementById('forgotEmail')?.value.trim();
      if (!email) {
        UI.showAlert('(o_o)! Masukkan email Anda', ALERT_TYPE.WARNING);
        return;
      }
      UI.showAlert('(^_^) Link reset password telah dikirim ke ' + email, ALERT_TYPE.SUCCESS);
      UI.hideModal('forgotModal');
    } else if (action === 'register') {
      const form = document.getElementById('registerForm');
      if (form && !UI.validateForm(form)) {
        return;
      }
      UI.showAlert('(^^) Pendaftaran berhasil! Silakan login', ALERT_TYPE.SUCCESS);
      UI.hideModal('registerModal');
      if (form) form.reset();
    }
  });
}

// Dashboard Page
function initDashboardPage() {
  Auth.requireAuth();
  UI.init();
  App.initDashboard();

  // Handle navigation cards using event delegation (one-time listener)
  if (!_dashboardNavInitialized) {
    document.addEventListener('click', (e) => {
      const navCard = e.target.closest('.nav-card[data-href]');
      if (navCard) {
        const href = navCard.getAttribute('data-href');
        if (href) {
          window.location.href = href;
        }
      }
    }, { passive: true });
    _dashboardNavInitialized = true;
  }
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
}

// Stock Detail Page
function initStockDetailPage() {
  Auth.requireAuth();
  UI.init();
  App.initStockDetail();
}

// Initialize page based on body class or path
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;

  // Initialize global listeners once for all pages except login
  if (!path.includes(PAGE_URL.LOGIN) && !path.endsWith('/login')) {
    initGlobalListeners();
  }

  if (path.includes(PAGE_URL.LOGIN) || path.endsWith('/login')) {
    initLoginPage();
  } else if (path.includes(PAGE_URL.DASHBOARD) || path.endsWith('/dashboard')) {
    initDashboardPage();
  } else if (path.includes(PAGE_URL.TRACKING) || path.endsWith('/tracking')) {
    initTrackingPage();
  } else if (path.includes(PAGE_URL.STOK) || path.endsWith('/stok')) {
    initStockPage();
  } else if (path.includes(PAGE_URL.STOK_DETAIL) || path.endsWith('/stok-detail')) {
    initStockDetailPage();
  }
});
