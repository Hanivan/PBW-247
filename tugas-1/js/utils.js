// Utility Functions - Japanese Creative Aesthetic
// Shared helper functions used across the application

/**
 * Animate a numeric value with counting effect
 * @param {HTMLElement|string} element - Element or element ID
 * @param {number} targetValue - Final value to animate to
 * @param {number} duration - Animation duration in ms (default: 1000)
 */
export function animateStatValue(element, targetValue, duration = 1000) {
  const statEl = typeof element === 'string' ? document.getElementById(element) : element;
  if (!statEl) return;

  const steps = 30;
  const stepValue = targetValue / steps;
  const stepDuration = duration / steps;
  let currentValue = 0;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    currentValue = Math.round(stepValue * step);

    if (step >= steps) {
      currentValue = targetValue;
      clearInterval(interval);
    }

    statEl.textContent = currentValue.toLocaleString('id-ID');
  }, stepDuration);
}

/**
 * Format number with Indonesian locale
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  return num.toLocaleString('id-ID');
}

/**
 * View type constants
 */
export const VIEW_TYPE = {
  TABLE: 'table',
  GRID: 'grid'
};

/**
 * Stock type constants
 */
export const STOCK_TYPE = {
  BMP: 'BMP',
  BUKU_TEKS: 'Buku Teks'
};

/**
 * Animation duration constants (ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 600,
  STAT_COUNT: 1000
};

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
