// UI module for modals, alerts, dark mode, and sidebar

import { THEME, ALERT_TYPE, ANIMATION, STORAGE_KEY } from './constants.js';

export const UI = {
  THEME_KEY: STORAGE_KEY.THEME,
  _initialized: {},

  // Initialize UI components
  init() {
    this._initOnce('theme', () => this.initTheme());
    this._initOnce('modals', () => this.initModals());
    this.initAlerts();
    this._initOnce('sidebar', () => this.initSidebar());
    this._initOnce('actions', () => this.initActions());
  },

  _initOnce(key, fn) {
    if (!this._initialized[key]) {
      fn();
      this._initialized[key] = true;
    }
  },

  // Initialize action buttons
  initActions() {
    // Theme toggle buttons - use event delegation with proper handling
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="toggle-theme"]');
      if (btn) {
        e.preventDefault();
        this.toggleTheme();
      }
    }, { passive: true });
  },

  // Theme / Dark Mode
  initTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) || THEME.LIGHT;
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon();
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || THEME.LIGHT;
    const newTheme = currentTheme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);
    this.updateThemeIcon();
  },

  updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      const theme = document.documentElement.getAttribute('data-theme') || THEME.LIGHT;
      icon.textContent = theme === THEME.DARK ? '(☆^O^☆)' : '(-_-)';
    }
  },

  // Modals
  initModals() {
    // Close modal on backdrop click - use passive listener for better performance
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.querySelector('.modal');
        if (modal) {
          this.hideModal(e.target);
        }
      }
    }, { passive: true });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop.active');
        if (activeModal) {
          this.hideModal(activeModal);
        }
      }
    }, { passive: true });

    // Handle all modal close buttons
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.modal-close');
      if (closeBtn) {
        const backdrop = closeBtn.closest('.modal-backdrop');
        if (backdrop) {
          this.hideModal(backdrop);
        }
      }
    }, { passive: true });
  },

  showModal(modalId) {
    const backdrop = document.getElementById(modalId);
    if (!backdrop) return;

    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  hideModal(modalId) {
    const backdrop = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (!backdrop) return;

    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  },

  // Alerts
  initAlerts() {
    // Create alert container if it doesn't exist
    if (!document.querySelector('.alert-container')) {
      const container = document.createElement('div');
      container.className = 'alert-container';
      document.body.appendChild(container);
    }
  },

  showAlert(message, type = ALERT_TYPE.INFO, duration = ANIMATION.DURATION.DEFAULT) {
    const container = document.querySelector('.alert-container');

    const alert = document.createElement('div');
    alert.className = `alert ${type}`;

    const messageSpan = document.createElement('span');
    messageSpan.className = 'alert-message';
    messageSpan.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => alert.remove());

    alert.appendChild(messageSpan);
    alert.appendChild(closeBtn);
    container.appendChild(alert);

    // Auto dismiss
    setTimeout(() => {
      if (alert.parentElement) {
        alert.style.animation = `${ANIMATION.NAME.SLIDE_OUT} 0.3s forwards`;
        setTimeout(() => alert.remove(), ANIMATION.DURATION.FAST);
      }
    }, duration);
  },

  // Sidebar - Fixed with proper event delegation
  initSidebar() {
    // Use event delegation for sidebar toggle buttons
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.sidebar-toggle');
      if (toggleBtn) {
        this.toggleSidebar();
      }
    }, { passive: true });

    // Close sidebar when clicking overlay
    document.addEventListener('click', (e) => {
      const overlay = e.target.closest('.sidebar-overlay');
      if (overlay) {
        this.closeSidebar();
      }
    }, { passive: true });
  },

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('open');

    // Create or remove overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('open')) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
      }
      setTimeout(() => overlay.classList.add('active'), 10);
    } else {
      if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), ANIMATION.DURATION.FAST);
      }
    }
  },

  closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
    }

    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), ANIMATION.DURATION.FAST);
    }
  },

  // Form validation helper
  validateForm(form) {
    const errors = [];
    const inputs = form.querySelectorAll('input[required], select[required]');

    inputs.forEach(input => {
      const value = input.value.trim();
      const errorEl = input.parentElement.querySelector('.form-error');

      // Clear previous error
      if (errorEl) errorEl.remove();
      input.classList.remove('error');

      // Check required
      if (!value) {
        this.showInputError(input, 'Field ini wajib diisi');
        errors.push(input);
        return;
      }

      // Email validation
      if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          this.showInputError(input, 'Format email tidak valid');
          errors.push(input);
        }
      }

      // Password validation
      if (input.type === 'password' && value.length < 6) {
        this.showInputError(input, 'Password minimal 6 karakter');
        errors.push(input);
      }
    });

    return errors.length === 0;
  },

  showInputError(input, message) {
    input.classList.add('error');
    const error = document.createElement('span');
    error.className = 'form-error';
    error.textContent = message;
    input.parentElement.appendChild(error);
  },

  clearFormErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  },

  // Get form input value by ID
  getFormValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
};
