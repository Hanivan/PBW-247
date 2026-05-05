// Stock Enhanced JavaScript - Japanese Creative Aesthetic
// Adds interactive features for the stock page

import { animateStatValue, formatNumber, VIEW_TYPE, debounce } from './utils.js';

// Initialize stock enhancements
function initStockEnhanced() {
  initSearchAnimation();
  initViewToggleAnimation();
  initStatsAnimation();
  updateStockStats();
}

// Search input animations
function initSearchAnimation() {
  const searchInput = document.getElementById('stockSearch');

  if (!searchInput) return;

  // Focus effects
  searchInput.addEventListener('focus', () => {
    searchInput.closest('.stok-search-input-wrapper').style.borderColor = 'var(--accent-primary)';
  });

  searchInput.addEventListener('blur', () => {
    searchInput.closest('.stok-search-input-wrapper').style.borderColor = 'var(--border-default)';
  });
}

// View toggle animations
function initViewToggleAnimation() {
  const viewToggle = document.getElementById('viewToggle');
  const viewIcon = document.getElementById('viewIcon');

  if (!viewToggle || !viewIcon) return;

  viewToggle.addEventListener('click', () => {
    const currentView = viewToggle.dataset.view;
    const newView = currentView === VIEW_TYPE.TABLE ? VIEW_TYPE.GRID : VIEW_TYPE.TABLE;

    // Animate icon
    viewIcon.style.transform = 'rotate(180deg)';
    setTimeout(() => {
      viewIcon.textContent = newView === VIEW_TYPE.TABLE ? '▦' : '▤';
      viewIcon.style.transform = 'rotate(0deg)';
    }, 150);

    // Update view
    viewToggle.dataset.view = newView;
  });
}

// Stats animation on page load
function initStatsAnimation() {
  const statCards = document.querySelectorAll('.stok-stat-card');

  statCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    setTimeout(() => {
      card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * (index + 1));
  });
}

// Update stock statistics
function updateStockStats() {
  if (typeof window !== 'undefined' && window.dataBahanAjar) {
    const stockData = window.dataBahanAjar;

    // Calculate stats (single pass through data)
    const stats = stockData.reduce((acc, item) => {
      acc.totalStock += parseInt(item.stok || 0);
      if (item.jenisBarang === 'BMP') acc.totalBMP++;
      if (item.jenisBarang === 'Buku Teks') acc.totalBuku++;
      return acc;
    }, { totalStock: 0, totalBMP: 0, totalBuku: 0 });

    stats.totalItems = stockData.length;

    // Animate stat values
    animateStatValue('statTotal', stats.totalItems);
    animateStatValue('statStock', stats.totalStock);
    animateStatValue('statBMP', stats.totalBMP);
    animateStatValue('statBuku', stats.totalBuku);
  }
}

// Enhance table row rendering with Japanese styling
function enhanceTableRow(row) {
  row.style.animation = 'fadeInUp 0.3s ease-out';
}

// Enhance grid card rendering with Japanese styling
function enhanceGridCard(card) {
  card.style.animation = 'fadeInUp 0.4s ease-out';
}

// Add fade in animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .stok-add-btn-jp {
    display: none;
  }

  @media (min-width: 768px) {
    .stok-add-btn-jp {
      display: inline;
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStockEnhanced);
} else {
  initStockEnhanced();
}

// Wait for App to be available, then hook into the methods
function hookIntoAppMethods() {
  if (window.App) {
    const originalAddStock = window.App.addStock;
    const originalUpdateStock = window.App.updateStock;
    const originalDeleteStock = window.App.deleteStock;

    if (originalAddStock) {
      window.App.addStock = function() {
        const result = originalAddStock.apply(this, arguments);
        setTimeout(updateStockStats, 100);
        return result;
      };
    }

    if (originalUpdateStock) {
      window.App.updateStock = function() {
        const result = originalUpdateStock.apply(this, arguments);
        setTimeout(updateStockStats, 100);
        return result;
      };
    }

    if (originalDeleteStock) {
      window.App.deleteStock = function() {
        const result = originalDeleteStock.apply(this, arguments);
        setTimeout(updateStockStats, 100);
        return result;
      };
    }
  } else {
    // App not ready yet, try again with MutationObserver for better performance
    const observer = new MutationObserver((mutations, obs) => {
      if (window.App) {
        obs.disconnect();
        hookIntoAppMethods();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  }
}

// Start hooking into App methods
hookIntoAppMethods();

// Export for potential module use
export {
  initStockEnhanced,
  updateStockStats,
  enhanceTableRow,
  enhanceGridCard
};
