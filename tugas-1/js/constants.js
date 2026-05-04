// Application constants - centralized to avoid magic numbers and strings

// Theme constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
};

// View mode constants
export const VIEW_MODE = {
  TABLE: 'table',
  GRID: 'grid'
};

// Alert type constants
export const ALERT_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Animation constants
export const ANIMATION = {
  NAME: {
    FADE_IN: 'fadeIn',
    FADE_OUT: 'fadeOut',
    SLIDE_IN: 'slideIn',
    SLIDE_OUT: 'slideOut',
    SLIDE_UP: 'slideUp',
    SHAKE: 'shake',
    SCALE_IN: 'scaleIn'
  },
  DURATION: {
    FAST: 300,
    SHAKE: 400,
    DEFAULT: 5000
  },
  DELAY: {
    STAGGER_BASE: 50,
    STAGGER_TABLE: 50,
    STAGGER_GRID: 30,
    REDIRECT: 1500
  }
};

// Progress calculation constant
export const PROGRESS_MAX_JOURNEY_STEPS = 5;

// User role constants
export const USER_ROLE = {
  UPBJJ_UT: 'UPBJJ-UT',
  ADMIN: 'Admin'
};

// Page URL constants
export const PAGE_URL = {
  LOGIN: 'login.html',
  DASHBOARD: 'dashboard.html',
  TRACKING: 'tracking.html',
  STOK: 'stok.html',
  STOK_DETAIL: 'stok-detail.html'
};

// Storage key constants
export const STORAGE_KEY = {
  THEME: 'sitta_theme',
  STOCK_VIEW: 'stockView',
  SESSION: 'sitta_session'
};

// Image placeholder constant
export const IMG_DEFAULT_BOOK = 'img/default-book.svg';

// Related items limit constant
export const RELATED_ITEMS_LIMIT = 4;
