// App module for page-specific functionality

import { VIEW_MODE, ALERT_TYPE, ANIMATION, PAGE_URL, USER_ROLE, PROGRESS_MAX_JOURNEY_STEPS, STORAGE_KEY, IMG_DEFAULT_BOOK, RELATED_ITEMS_LIMIT } from './constants.js';
import { dataPengguna, dataBahanAjar, dataTracking } from './data.js';
import { Auth } from './auth.js';
import { UI } from './ui.js';

// Make data globally accessible for other modules
window.dataBahanAjar = dataBahanAjar;
window.dataPengguna = dataPengguna;
window.dataTracking = dataTracking;

export const App = {
  // Get greeting based on time of day
  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    return 'Selamat Sore';
  },

  // Initialize dashboard
  initDashboard() {
    const session = Auth.getSession();
    if (session) {
      const greetingText = `${this.getGreeting()}, ${session.userName}`;

      // Set greeting in header actions (desktop)
      const greetingEl = document.getElementById('greeting');
      if (greetingEl) {
        greetingEl.textContent = greetingText;
      }

      // Set greeting as data attribute for mobile display
      const headerContent = document.getElementById('headerContent');
      if (headerContent) {
        headerContent.setAttribute('data-greeting', greetingText);
      }
    }

    // Populate stats
    this.updateDashboardStats();
  },

  // Update dashboard statistics
  updateDashboardStats() {
    // Total bahan ajar
    const totalItemsEl = document.getElementById('statTotalItems');
    if (totalItemsEl) {
      totalItemsEl.textContent = dataBahanAjar.length;
    }

    // Total stok
    const totalStockEl = document.getElementById('statTotalStock');
    if (totalStockEl) {
      const totalStock = dataBahanAjar.reduce((sum, item) => sum + item.stok, 0);
      totalStockEl.textContent = totalStock.toLocaleString();
    }

    // Sedang dikirim (from tracking data)
    const shippingEl = document.getElementById('statShippingCount');
    if (shippingEl) {
      shippingEl.textContent = Object.keys(dataTracking).length;
    }

    // UPBJJ aktif (from user data)
    const upbjjEl = document.getElementById('statUpbjjCount');
    if (upbjjEl) {
      let upbjjCount = 0;
      for (const user of dataPengguna) {
        if (user.role === 'UPBJJ-UT') upbjjCount++;
      }
      upbjjEl.textContent = upbjjCount;
    }
  },

  // Initialize tracking page
  initTracking() {
    const searchForm = document.getElementById('trackingForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.searchTracking();
        return false;
      }, { passive: false });
    }
  },

  // Search tracking by DO number
  searchTracking() {
    const doNumber = document.getElementById('doNumber').value.trim();
    const resultsContainer = document.getElementById('trackingResults');

    if (!doNumber) {
      UI.showAlert('Masukkan Nomor DO', ALERT_TYPE.WARNING);
      return;
    }

    const result = dataTracking[doNumber];

    if (!result) {
      resultsContainer.innerHTML = `
        <div class="tracking-results-wrapper slide-up">
          <div class="tracking-empty-state">
            <div class="tracking-empty-icon">(>_<)</div>
            <p class="tracking-empty-text">データが見つかりません — Data tracking tidak ditemukan untuk Nomor DO: ${doNumber}</p>
          </div>
        </div>
      `;
      return;
    }

    // Calculate progress based on journey length
    const progress = Math.min((result.perjalanan.length / PROGRESS_MAX_JOURNEY_STEPS) * 100, 100);

    // Determine status styling
    const isCompleted = result.status === 'Selesai' || result.status === 'Dikirim';

    // Render journey timeline with Japanese aesthetic
    const journeyHTML = result.perjalanan.map((item, index) => `
      <div class="tracking-timeline-item ${index < result.perjalanan.length - 1 ? 'completed' : ''}">
        <div class="tracking-timeline-dot"></div>
        <div class="tracking-timeline-time">${item.waktu}</div>
        <div class="tracking-timeline-content">${item.keterangan}</div>
      </div>
    `).join('');

    resultsContainer.innerHTML = `
      <div class="tracking-results-wrapper slide-up">
        <div class="tracking-result-header">
          <div>
            <span class="tracking-result-badge">${result.status}</span>
          </div>
          <span class="tracking-result-title">検索結果</span>
        </div>

        <div class="tracking-info-grid">
          <div class="tracking-info-item">
            <div class="tracking-info-label">名前 / Nama</div>
            <div class="tracking-info-value">${result.nama}</div>
          </div>
          <div class="tracking-info-item">
            <div class="tracking-info-label">配送番号 / Nomor DO</div>
            <div class="tracking-info-value small">${result.nomorDO}</div>
          </div>
          <div class="tracking-info-item">
            <div class="tracking-info-label">配送業者 / Ekspedisi</div>
            <div class="tracking-info-value small">${result.ekspedisi}</div>
          </div>
        </div>

        <div class="tracking-info-grid" style="margin-bottom: var(--spacing-6);">
          <div class="tracking-info-item">
            <div class="tracking-info-label">発送日 / Tanggal Kirim</div>
            <div class="tracking-info-value small">${result.tanggalKirim}</div>
          </div>
          <div class="tracking-info-item">
            <div class="tracking-info-label">パケット種類 / Jenis Paket</div>
            <div class="tracking-info-value small">${result.paket}</div>
          </div>
          <div class="tracking-info-item">
            <div class="tracking-info-label">合計金額 / Total</div>
            <div class="tracking-info-value small">${result.total}</div>
          </div>
        </div>

        <div class="tracking-progress-section">
          <div class="tracking-progress-header">
            <span class="tracking-progress-title">進捗状況 / Progress</span>
            <span class="tracking-progress-percentage">${Math.round(progress)}</span>
          </div>
          <div class="tracking-progress-bar">
            <div class="tracking-progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="tracking-timeline-wrapper">
          ${journeyHTML}
        </div>
      </div>
    `;
  },

  // Initialize stock page
  initStock() {
    this.currentView = localStorage.getItem(STORAGE_KEY.STOCK_VIEW) || VIEW_MODE.TABLE;
    this.renderStock(dataBahanAjar);
    this.updateViewToggle();

    // View toggle functionality
    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) {
      viewToggle.addEventListener('click', () => {
        this.toggleView();
      });
    }

    // Search functionality
    const searchInput = document.getElementById('stockSearch');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.filterStock(e.target.value);
        }, ANIMATION.DURATION.FAST);
      });
    }

    // Add stock form
    const addForm = document.getElementById('addStockForm');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addStock();
      });
    }
  },

  // Toggle between table and grid view
  toggleView() {
    this.currentView = this.currentView === VIEW_MODE.TABLE ? VIEW_MODE.GRID : VIEW_MODE.TABLE;
    localStorage.setItem(STORAGE_KEY.STOCK_VIEW, this.currentView);
    this.renderStock(dataBahanAjar);
    this.updateViewToggle();
  },

  // Update view toggle button appearance
  updateViewToggle() {
    const viewToggle = document.getElementById('viewToggle');
    const viewIcon = document.getElementById('viewIcon');
    const tableView = document.getElementById('tableView');
    const gridView = document.getElementById('gridView');

    if (!viewToggle || !viewIcon) return;

    if (this.currentView === VIEW_MODE.GRID) {
      viewIcon.textContent = '▦';
      viewToggle.setAttribute('data-view', VIEW_MODE.GRID);
      if (tableView) tableView.classList.add('hidden');
      if (gridView) gridView.classList.remove('hidden');
    } else {
      viewIcon.textContent = '≡';
      viewToggle.setAttribute('data-view', VIEW_MODE.TABLE);
      if (tableView) tableView.classList.remove('hidden');
      if (gridView) gridView.classList.add('hidden');
    }
  },

  // Render stock (handles both table and grid view)
  renderStock(data) {
    if (this.currentView === VIEW_MODE.GRID) {
      this.renderStockGrid(data);
    } else {
      this.renderStockTable(data);
    }
  },

  // Render stock table
  renderStockTable(data) {
    const tbody = document.getElementById('stockTableBody');
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <p class="empty-state-text">Tidak ada data ditemukan</p>
          </td>
        </tr>
      `;
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    data.forEach((item) => {
      const tr = document.createElement('tr');
      tr.className = 'slide-up';

      tr.innerHTML = `
        <td>${item.kodeLokasi}</td>
        <td>${item.kodeBarang}</td>
        <td>${item.namaBarang}</td>
        <td>${item.jenisBarang}</td>
        <td>${item.edisi}</td>
        <td>${item.stok}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-ghost" data-action="view-item" data-kode="${item.kodeBarang}">Lihat</button>
            <button class="btn btn-sm btn-outline" data-action="edit-item" data-kode="${item.kodeBarang}">Edit</button>
            <button class="btn btn-sm btn-danger" data-action="delete-item" data-kode="${item.kodeBarang}">Hapus</button>
          </div>
        </td>
      `;
      fragment.appendChild(tr);
    });

    tbody.innerHTML = '';
    tbody.appendChild(fragment);
  },

  // Render stock grid (portrait thumbnails)
  renderStockGrid(data) {
    const gridBody = document.getElementById('stockGridBody');
    if (!gridBody) return;

    if (data.length === 0) {
      gridBody.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">(>_<)</div>
          <p class="empty-state-text">Tidak ada data ditemukan</p>
        </div>
      `;
      return;
    }

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    data.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'stock-card slide-up';
      card.dataset.kode = item.kodeBarang;

      card.innerHTML = `
        <div class="stock-card-cover" data-action="view-item" data-kode="${item.kodeBarang}" style="cursor: pointer;">
          <img src="${item.cover}" alt="${item.namaBarang}" onerror="this.src='${IMG_DEFAULT_BOOK}'">
          <span class="stock-card-badge">${item.stok}</span>
        </div>
        <div class="stock-card-content">
          <h3 class="stock-card-title" data-action="view-item" data-kode="${item.kodeBarang}" style="cursor: pointer;">${item.namaBarang}</h3>
          <span class="stock-card-code">${item.kodeBarang}</span>
          <div class="stock-card-actions">
            <button class="btn btn-sm btn-ghost" data-action="view-item" data-kode="${item.kodeBarang}">Lihat</button>
            <button class="btn btn-sm btn-outline" data-action="edit-item" data-kode="${item.kodeBarang}">Edit</button>
            <button class="btn btn-sm btn-danger" data-action="delete-item" data-kode="${item.kodeBarang}">Hapus</button>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });

    gridBody.innerHTML = '';
    gridBody.appendChild(fragment);
  },

  // Filter stock by search query
  filterStock(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = dataBahanAjar.filter(item =>
      item.kodeLokasi.toLowerCase().includes(lowerQuery) ||
      item.kodeBarang.toLowerCase().includes(lowerQuery) ||
      item.namaBarang.toLowerCase().includes(lowerQuery) ||
      item.jenisBarang.toLowerCase().includes(lowerQuery)
    );
    this.renderStock(filtered);
  },

  // Add new stock item
  addStock() {
    const form = document.getElementById('addStockForm');
    if (!UI.validateForm(form)) {
      return;
    }

    const stokValue = parseInt(UI.getFormValue('stok'), 10);
    if (isNaN(stokValue) || stokValue < 0) {
      UI.showAlert('(o_o)! Jumlah stok harus berupa angka yang valid', ALERT_TYPE.ERROR);
      return;
    }

    const newItem = {
      kodeLokasi: UI.getFormValue('kodeLokasi'),
      kodeBarang: UI.getFormValue('kodeBarang'),
      namaBarang: UI.getFormValue('namaBarang'),
      jenisBarang: UI.getFormValue('jenisBarang'),
      edisi: UI.getFormValue('edisi'),
      stok: stokValue,
      cover: IMG_DEFAULT_BOOK
    };

    // Add to data array
    dataBahanAjar.push(newItem);

    // Re-render
    this.renderStock(dataBahanAjar);

    // Close modal and reset form
    UI.hideModal('addStockModal');
    form.reset();
    UI.showAlert('(^_^) Stok berhasil ditambahkan', ALERT_TYPE.SUCCESS);
  },

  // Open edit modal with stock data
  openEditModal(kodeBarang) {
    const item = dataBahanAjar.find(b => b.kodeBarang === kodeBarang);
    if (!item) {
      UI.showAlert('(x_x) Data tidak ditemukan', ALERT_TYPE.ERROR);
      return;
    }

    // Populate form
    document.getElementById('editKodeBarangOriginal').value = item.kodeBarang;
    document.getElementById('editKodeLokasi').value = item.kodeLokasi;
    document.getElementById('editKodeBarang').value = item.kodeBarang;
    document.getElementById('editNamaBarang').value = item.namaBarang;
    document.getElementById('editJenisBarang').value = item.jenisBarang;
    document.getElementById('editEdisi').value = item.edisi;
    document.getElementById('editStok').value = item.stok;

    UI.showModal('editStockModal');
  },

  // Update existing stock
  updateStock() {
    const form = document.getElementById('editStockForm');
    if (!UI.validateForm(form)) {
      return;
    }

    const originalKode = document.getElementById('editKodeBarangOriginal').value;

    const stokValue = parseInt(UI.getFormValue('editStok'), 10);
    if (isNaN(stokValue) || stokValue < 0) {
      UI.showAlert('(o_o)! Jumlah stok harus berupa angka yang valid', ALERT_TYPE.ERROR);
      return;
    }

    // Find and update item
    const index = dataBahanAjar.findIndex(b => b.kodeBarang === originalKode);
    if (index === -1) {
      UI.showAlert('(x_x) Data tidak ditemukan', ALERT_TYPE.ERROR);
      return;
    }

    dataBahanAjar[index] = {
      kodeLokasi: UI.getFormValue('editKodeLokasi'),
      kodeBarang: UI.getFormValue('editKodeBarang'),
      namaBarang: UI.getFormValue('editNamaBarang'),
      jenisBarang: UI.getFormValue('editJenisBarang'),
      edisi: UI.getFormValue('editEdisi'),
      stok: stokValue,
      cover: dataBahanAjar[index].cover
    };

    // Re-render
    this.renderStock(dataBahanAjar);

    // Close modal and show alert
    UI.hideModal('editStockModal');
    UI.showAlert('(^_^) Stok berhasil diperbarui', ALERT_TYPE.SUCCESS);
  },

  // Open delete confirmation modal
  openDeleteModal(kodeBarang) {
    const item = dataBahanAjar.find(b => b.kodeBarang === kodeBarang);
    if (!item) {
      UI.showAlert('(x_x) Data tidak ditemukan', ALERT_TYPE.ERROR);
      return;
    }

    document.getElementById('deleteItemName').textContent = `${item.namaBarang} (${item.kodeBarang})`;
    document.getElementById('deleteModal').dataset.kodeBarang = kodeBarang;
    UI.showModal('deleteModal');
  },

  // Delete stock
  deleteStock() {
    const modal = document.getElementById('deleteModal');
    const kodeBarang = modal.dataset.kodeBarang;

    if (!kodeBarang) {
      UI.showAlert('(x_x) Kode barang tidak valid', ALERT_TYPE.ERROR);
      return;
    }

    const index = dataBahanAjar.findIndex(b => b.kodeBarang === kodeBarang);
    if (index === -1) {
      UI.showAlert('(x_x) Data tidak ditemukan', ALERT_TYPE.ERROR);
      return;
    }

    // Remove item
    dataBahanAjar.splice(index, 1);

    // Re-render
    this.renderStock(dataBahanAjar);

    // Close modal and show alert
    UI.hideModal('deleteModal');
    UI.showAlert('(^_^) Stok berhasil dihapus', ALERT_TYPE.SUCCESS);
  },

  // Initialize stock detail page
  initStockDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const kodeBarang = urlParams.get('kode');

    if (!kodeBarang) {
      UI.showAlert('(x_x) Kode barang tidak ditemukan', ALERT_TYPE.ERROR);
      setTimeout(() => {
        window.location.href = PAGE_URL.STOK;
      }, ANIMATION.DELAY.REDIRECT);
      return;
    }

    const item = dataBahanAjar.find(b => b.kodeBarang === kodeBarang);

    if (!item) {
      UI.showAlert('(x_x) Data barang tidak ditemukan', ALERT_TYPE.ERROR);
      setTimeout(() => {
        window.location.href = PAGE_URL.STOK;
      }, ANIMATION.DELAY.REDIRECT);
      return;
    }

    this.renderStockDetail(item);
  },

  // Render stock detail page
  renderStockDetail(item) {
    const container = document.getElementById('stockDetailContent');
    if (!container) return;

    // Find related items (same type)
    const relatedItems = dataBahanAjar
      .filter(b => b.jenisBarang === item.jenisBarang && b.kodeBarang !== item.kodeBarang)
      .slice(0, RELATED_ITEMS_LIMIT);

    // Determine stock status
    let stockStatus = 'Tersedia';
    let stockStatusClass = 'available';
    if (item.stok === 0) {
      stockStatus = 'Habis';
      stockStatusClass = 'empty';
    } else if (item.stok < 50) {
      stockStatus = 'Terbatas';
      stockStatusClass = 'limited';
    }

    container.innerHTML = `
      <!-- Hero Section -->
      <div class="stok-detail-hero washi-texture">
        <div class="stok-detail-hero-vertical">詳細</div>
        <div class="stok-detail-hero-content">
          <div class="stok-detail-hero-badge">
            <span>${item.jenisBarang}</span>
            <span>•</span>
            <span>Edisi ${item.edisi}</span>
          </div>
          <h2 class="stok-detail-hero-title">${item.namaBarang}</h2>
          <p class="stok-detail-hero-subtitle">Kode: ${item.kodeBarang} • Lokasi: ${item.kodeLokasi}</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="stok-detail-main">
        <!-- Cover Section -->
        <div class="stok-detail-cover-section">
          <div class="stok-detail-cover-wrapper">
            <div class="stok-detail-cover-image">
              <img src="${item.cover}" alt="${item.namaBarang}" onerror="this.src='${IMG_DEFAULT_BOOK}'">
              <div class="stok-detail-cover-badge">
                <span class="stok-detail-cover-badge-label">Stok</span>
                <span class="stok-detail-cover-badge-value">${item.stok}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="stok-detail-info-section">
          <!-- Title -->
          <div class="stok-detail-title-section">
            <h1 class="stok-detail-main-title">${item.namaBarang}</h1>
            <p class="stok-detail-subtitle">Bahan ajar untuk kode mata kuliah ${item.kodeBarang}</p>
          </div>

          <!-- Meta Grid -->
          <div class="stok-detail-meta-grid">
            <div class="stok-detail-meta-card">
              <div class="stok-detail-meta-label">
                <span class="stok-detail-meta-label-jp">場所</span>
                <span>Kode Lokasi</span>
              </div>
              <div class="stok-detail-meta-value code">${item.kodeLokasi}</div>
            </div>

            <div class="stok-detail-meta-card">
              <div class="stok-detail-meta-label">
                <span class="stok-detail-meta-label-jp">商品</span>
                <span>Kode Barang</span>
              </div>
              <div class="stok-detail-meta-value code">${item.kodeBarang}</div>
            </div>

            <div class="stok-detail-meta-card">
              <div class="stok-detail-meta-label">
                <span class="stok-detail-meta-label-jp">種類</span>
                <span>Jenis</span>
              </div>
              <div class="stok-detail-meta-value badge">${item.jenisBarang}</div>
            </div>

            <div class="stok-detail-meta-card">
              <div class="stok-detail-meta-label">
                <span class="stok-detail-meta-label-jp">版</span>
                <span>Edisi</span>
              </div>
              <div class="stok-detail-meta-value">Edisi ${item.edisi}</div>
            </div>
          </div>

          <!-- Stock Display -->
          <div class="stok-detail-stock-display">
            <div class="stok-detail-stock-label">Stok Tersedia</div>
            <div class="stok-detail-stock-value" data-unit="unit">${item.stok}</div>
            <div class="stok-detail-stock-status">${stockStatus}</div>
          </div>

          <!-- Actions -->
          <div class="stok-detail-actions">
            <a href="stok.html" class="stok-detail-action-btn primary" data-action="back-to-stock">
              <span>← Kembali ke Daftar</span>
            </a>
            <button class="stok-detail-action-btn secondary" data-action="edit-item" data-kode="${item.kodeBarang}">
              <span>Edit Data</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div class="stok-detail-description-section">
        <div class="stok-detail-description-header">
          <span class="stok-detail-description-label-jp">説明</span>
          <h3 class="stok-detail-description-title">Deskripsi Produk</h3>
        </div>
        <p class="stok-detail-description-text">
          Bahan ajar ${item.namaBarang} adalah materi pembelajaran untuk kode mata kuliah ${item.kodeBarang}.
          Bahan ajar ini termasuk dalam kategori ${item.jenisBarang} dan tersedia dalam edisi ke-${item.edisi}.
          Stok saat ini tersedia sebanyak ${item.stok} unit di lokasi ${item.kodeLokasi}.
        </p>
      </div>

      ${relatedItems.length > 0 ? `
        <!-- Related Items -->
        <div class="stok-detail-related-section">
          <div class="stok-detail-related-header">
            <span class="stok-detail-related-label-jp">関連</span>
            <h3 class="stok-detail-related-title">Bahan Ajar Lainnya (${item.jenisBarang})</h3>
          </div>
          <div class="stok-detail-related-grid">
            ${relatedItems.map(related => `
              <div class="stock-card" data-action="view-related-item" data-kode="${related.kodeBarang}" style="cursor: pointer;">
                <div class="stock-card-cover">
                  <img src="${related.cover}" alt="${related.namaBarang}" onerror="this.src='${IMG_DEFAULT_BOOK}'">
                  <span class="stock-card-badge">${related.stok}</span>
                </div>
                <div class="stock-card-content">
                  <h3 class="stock-card-title">${related.namaBarang}</h3>
                  <span class="stock-card-code">${related.kodeBarang}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div class="stok-detail-footer">
        <div class="stok-detail-footer-pattern"></div>
        <div class="stok-detail-footer-content">
          <span class="stok-detail-footer-text-jp">教材詳細システム</span>
          <span class="stok-detail-footer-divider">|</span>
          <span class="stok-detail-footer-text">Sistem Detail Bahan Ajar SITTA</span>
        </div>
      </div>
    `;
  }
};

// Make App available globally for onclick handlers
window.App = App;
