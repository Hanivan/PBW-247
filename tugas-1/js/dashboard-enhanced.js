// Dashboard Enhanced JavaScript - Japanese Creative Aesthetic
// Adds dynamic elements for Japanese date display and greetings

import { animateStatValue, formatNumber, ANIMATION_DURATION } from './utils.js';

// Japanese date characters
const JP_MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
];

const JP_DAYS = [
  '日', '月', '火', '水', '木', '金', '土'
];

// Time thresholds (extracted magic numbers)
const TIME_THRESHOLDS = {
  MORNING_END: 12,
  AFTERNOON_END: 18
};

// Japanese greetings by time of day
const JP_GREETINGS = {
  morning: 'おはようございます',
  afternoon: 'こんにちは',
  evening: 'こんばんは'
};

const ID_GREETINGS = {
  morning: 'Selamat Pagi',
  afternoon: 'Selamat Siang',
  evening: 'Selamat Sore'
};

// Update intervals (extracted magic numbers)
const UPDATE_INTERVALS = {
  MINUTE: 60000,
  HOUR: 3600000
};

// Reiwa era start year (extracted magic number)
const REIWA_ERA_START = 2018;

// Initialize dashboard enhancements
function initDashboardEnhanced() {
  updateJapaneseDate();
  updateGreetings();
  startClock();

  // Wait for data to be loaded before animating stats
  if (window.dataBahanAjar) {
    animateDashboardStats();
  } else {
    // Data not loaded yet, try again after a short delay
    setTimeout(() => {
      if (window.dataBahanAjar) {
        animateDashboardStats();
      }
    }, 100);
  }
}

// Animate dashboard stats with counting effect
function animateDashboardStats() {
  const statIds = [
    { id: 'statTotalItems', value: window.dataBahanAjar ? window.dataBahanAjar.length : 0 },
    { id: 'statTotalStock', value: window.dataBahanAjar ? window.dataBahanAjar.reduce((sum, item) => sum + (item.stok || 0), 0) : 0 },
    { id: 'statShippingCount', value: window.dataTracking ? Object.keys(window.dataTracking).length : 0 },
    { id: 'statUpbjjCount', value: window.dataPengguna ? window.dataPengguna.filter(u => u.role === 'UPBJJ-UT').length : 0 }
  ];

  statIds.forEach((stat, index) => {
    const element = document.getElementById(stat.id);
    if (element) {
      // Add staggered delay for each stat
      setTimeout(() => {
        if (stat.value > 0) {
          animateStatValue(element, stat.value);
        } else {
          element.textContent = '0';
        }
      }, index * 150);
    }
  });
}


// Update vertical Japanese date display
function updateJapaneseDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const dayOfWeek = now.getDay();

  // Update Japanese date display
  const yearEl = document.getElementById('jpYear');
  const monthEl = document.getElementById('jpMonth');
  const dayEl = document.getElementById('jpDay');

  if (yearEl) {
    // Convert to Japanese era year (approximate for Reiwa)
    const reiwaYear = year - REIWA_ERA_START;
    yearEl.textContent = `R${reiwaYear}`;
  }

  if (monthEl) {
    monthEl.textContent = JP_MONTHS[month];
  }

  if (dayEl) {
    dayEl.textContent = `${day}${JP_DAYS[dayOfWeek]}`;
  }
}

// Update greetings in Japanese and Indonesian
function updateGreetings() {
  const hour = new Date().getHours();
  let greetingKey;

  if (hour < TIME_THRESHOLDS.MORNING_END) {
    greetingKey = 'morning';
  } else if (hour < TIME_THRESHOLDS.AFTERNOON_END) {
    greetingKey = 'afternoon';
  } else {
    greetingKey = 'evening';
  }

  // Update hero greeting
  const heroGreetingJPEl = document.getElementById('heroGreetingJP');
  const heroGreetingIDEl = document.getElementById('heroGreetingID');

  if (heroGreetingJPEl) {
    heroGreetingJPEl.textContent = JP_GREETINGS[greetingKey];
  }

  if (heroGreetingIDEl) {
    heroGreetingIDEl.textContent = ID_GREETINGS[greetingKey];
  }

  // Update header greeting (from existing functionality)
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) {
    const session = JSON.parse(localStorage.getItem('sitta_session') || '{}');
    if (session.userName) {
      greetingEl.textContent = `${JP_GREETINGS[greetingKey]}、${session.userName}`;
    }
  }
}

// Clock interval references for cleanup
let clockIntervals = [];

// Start clock for real-time updates
function startClock() {
  // Update date every minute
  clockIntervals.push(setInterval(updateJapaneseDate, UPDATE_INTERVALS.MINUTE));

  // Update greeting every hour (in case time crosses threshold)
  clockIntervals.push(setInterval(updateGreetings, UPDATE_INTERVALS.HOUR));
}

// Stop clock intervals (call on page unload)
function stopClock() {
  clockIntervals.forEach(clearInterval);
  clockIntervals = [];
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboardEnhanced);
} else {
  initDashboardEnhanced();
}

// Export for potential module use
export { initDashboardEnhanced, updateJapaneseDate, updateGreetings, stopClock, animateDashboardStats };
