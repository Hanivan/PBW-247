// Page-specific initialization and event handlers

import { ALERT_TYPE, ANIMATION, PAGE_URL } from './constants.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';
import { App } from './app.js';

let _globalListenersInitialized = false;

const ACTION_HANDLERS = {
  'logout': (e) => {
    e.preventDefault();
    UI.showModal('logoutModal');
  },
  'confirm-logout': () => {
    Auth.destroySession();
    window.location.href = PAGE_URL.LOGIN;
  },
  'add-stock': () => {
    UI.showModal('addStockModal');
  },
  'save-stock': () => {
    App.addStock();
  },
  'update-stock': () => {
    App.updateStock();
  },
  'confirm-delete': () => {
    App.deleteStock();
  },
  'view-item': (e, target) => {
    e.preventDefault();
    window.location.href = `${PAGE_URL.STOK_DETAIL}?kode=${target.dataset.kode}`;
  },
  'edit-item': (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    App.openEditModal(target.dataset.kode);
  },
  'delete-item': (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    App.openDeleteModal(target.dataset.kode);
  },
  'back-to-stock': () => {
    window.location.href = PAGE_URL.STOK;
  },
  'view-related-item': (e, target) => {
    window.location.href = `${PAGE_URL.STOK_DETAIL}?kode=${target.dataset.kode}`;
  }
};

function initGlobalListeners() {
  if (_globalListenersInitialized) return;
  _globalListenersInitialized = true;

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const handler = ACTION_HANDLERS[action];

    if (handler) {
      handler(e, target);
      return;
    }

    // Handle navigation cards
    const navCard = e.target.closest('.nav-card[data-href]');
    if (navCard) {
      const href = navCard.getAttribute('data-href');
      if (href) {
        window.location.href = href;
      }
    }
  }, { passive: true });
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
function initPage() {
  const path = window.location.pathname;

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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
