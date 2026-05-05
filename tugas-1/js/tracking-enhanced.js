// Tracking Enhanced JavaScript - Japanese Creative Aesthetic
// Adds interactive features for the tracking page

// Initialize tracking enhancements
function initTrackingEnhanced() {
  initExampleDOClick();
  initSearchAnimation();
  initKeyboardShortcuts();
}

// Click handlers for example DO numbers
function initExampleDOClick() {
  const exampleDOs = document.querySelectorAll('.example-do');
  const searchInput = document.getElementById('doNumber');
  const form = document.getElementById('trackingForm');

  exampleDOs.forEach(example => {
    example.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const doNumber = example.getAttribute('data-do');
      if (searchInput) {
        searchInput.value = doNumber;
        searchInput.focus();

        // Add highlight animation
        searchInput.style.animation = 'none';
        setTimeout(() => {
          searchInput.style.animation = 'pulse 0.3s ease';
        }, 10);

        // Auto-submit after brief delay
        setTimeout(() => {
          if (form) {
            // Create and dispatch a proper submit event with bubbles
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
          }
        }, 500);
      }

      return false;
    });
  });
}

// Search input animations
function initSearchAnimation() {
  const searchInput = document.getElementById('doNumber');
  const searchBtn = document.querySelector('.tracking-search-btn');

  if (!searchInput || !searchBtn) return;

  // Animate button on input
  searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 0) {
      searchBtn.style.transform = 'scale(1.05)';
    } else {
      searchBtn.style.transform = 'scale(1)';
    }
  });

  // Focus effects
  searchInput.addEventListener('focus', () => {
    searchInput.parentElement.style.borderColor = 'var(--accent-primary)';
  });

  searchInput.addEventListener('blur', () => {
    searchInput.parentElement.style.borderColor = 'var(--border-default)';
  });
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
  const searchInput = document.getElementById('doNumber');

  if (!searchInput) return;

  // Focus search with Ctrl/Cmd + K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
}

// Add loading state to search button
function addLoadingState() {
  const searchBtn = document.querySelector('.tracking-search-btn');
  if (searchBtn) {
    searchBtn.disabled = true;
    searchBtn.innerHTML = `
      <span class="search-btn-icon" style="animation: rotate 1s linear infinite;">⏳</span>
      <span class="search-btn-text">検索中...</span>
    `;
  }
}

// Remove loading state from search button
function removeLoadingState() {
  const searchBtn = document.querySelector('.tracking-search-btn');
  if (searchBtn) {
    searchBtn.disabled = false;
    searchBtn.innerHTML = `
      <span class="search-btn-text">検索</span>
      <span class="search-btn-icon">(°_°)</span>
    `;
  }
}

// Enhance the existing search form
function enhanceSearchForm() {
  const form = document.getElementById('trackingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const doNumber = document.getElementById('doNumber').value.trim();
    if (!doNumber) return false;

    // Show loading state
    addLoadingState();

    // Add a small delay for animation
    await new Promise(resolve => setTimeout(resolve, 600));

    // Remove loading state
    removeLoadingState();

    // Focus on results
    const resultsContainer = document.getElementById('trackingResults');
    if (resultsContainer) {
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return false;
  }, { passive: false });
}

// Add staggered animation to results
function animateResults() {
  const resultsContainer = document.getElementById('trackingResults');
  if (!resultsContainer) return;

  const cards = resultsContainer.querySelectorAll('.tracking-result-card, .tracking-timeline-item');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 100}ms`;
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTrackingEnhanced();
    enhanceSearchForm();
  });
} else {
  initTrackingEnhanced();
  enhanceSearchForm();
}

// Export for potential module use
export {
  initTrackingEnhanced,
  addLoadingState,
  removeLoadingState,
  animateResults
};
