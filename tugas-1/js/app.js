// App module for page-specific functionality

import { VIEW_MODE, ALERT_TYPE, ANIMATION, PAGE_URL, USER_ROLE, PROGRESS_MAX_JOURNEY_STEPS, STORAGE_KEY, IMG_DEFAULT_BOOK, RELATED_ITEMS_LIMIT } from './constants.js';

const App = {
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
        this.searchTracking();
      });
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
        <div class="empty-state">
          <div class="empty-state-icon">(>_<)</div>
          <p class="empty-state-text">Data tracking tidak ditemukan untuk Nomor DO: ${doNumber}</p>
        </div>
      `;
      return;
    }

    // Calculate progress based on journey length
    const progress = Math.min((result.perjalanan.length / PROGRESS_MAX_JOURNEY_STEPS) * 100, 100);
    const statusClass = result.status === 'Selesai' || result.status === 'Dikirim' ? ALERT_TYPE.SUCCESS : ALERT_TYPE.WARNING;

    // Render journey timeline
    const journeyHTML = result.perjalanan.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-time">${item.waktu}</div>
        <div class="timeline-content">${item.keterangan}</div>
      </div>
    `).join('');

    resultsContainer.innerHTML = `
      <div class="card slide-up">
        <h3 class="card-title">Hasil Pencarian</h3>
        <div style="margin-bottom: var(--spacing-lg);">
          <p><strong>Nama:</strong> ${result.nama}</p>
          <p><strong>Nomor DO:</strong> ${result.nomorDO}</p>
          <p><strong>Status:</strong> ${result.status}</p>
          <div class="progress" style="margin-top: var(--spacing-sm);">
            <div class="progress-bar ${statusClass}" style="width: ${progress}%"></div>
          </div>
        </div>

        <div style="margin-bottom: var(--spacing-lg);">
          <h4 style="margin-bottom: var(--spacing-sm);">Detail Ekspedisi</h4>
          <table class="table">
            <tr><td>Ekspedisi</td><td>${result.ekspedisi}</td></tr>
            <tr><td>Tanggal Kirim</td><td>${result.tanggalKirim}</td></tr>
            <tr><td>Jenis Paket</td><td>${result.paket}</td></tr>
            <tr><td>Total Pembayaran</td><td>${result.total}</td></tr>
          </table>
        </div>

        <div>
          <h4 style="margin-bottom: var(--spacing-sm);">Riwayat Perjalanan</h4>
          <div class="timeline">
            ${journeyHTML}
          </div>
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

    tbody.innerHTML = data.map((item, index) => `
      <tr class="slide-up" style="animation-delay: ${index * ANIMATION.DELAY.STAGGER_TABLE}ms">
        <td>${item.kodeLokasi}</td>
        <td>${item.kodeBarang}</td>
        <td>${item.namaBarang}</td>
        <td>${item.jenisBarang}</td>
        <td>${item.edisi}</td>
        <td>${item.stok}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-ghost" onclick="window.location.href='${PAGE_URL.STOK_DETAIL}?kode=${item.kodeBarang}'">Lihat</button>
            <button class="btn btn-sm btn-outline" onclick="App.openEditModal('${item.kodeBarang}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.openDeleteModal('${item.kodeBarang}')">Hapus</button>
          </div>
        </td>
      </tr>
    `).join('');
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

    gridBody.innerHTML = data.map((item, index) => `
      <div class="stock-card slide-up" style="animation-delay: ${index * ANIMATION.DELAY.STAGGER_GRID}ms">
        <div class="stock-card-cover" onclick="window.location.href='${PAGE_URL.STOK_DETAIL}?kode=${item.kodeBarang}'" style="cursor: pointer;">
          <img src="${item.cover}" alt="${item.namaBarang}" onerror="this.src='${IMG_DEFAULT_BOOK}'">
          <span class="stock-card-badge">${item.stok}</span>
        </div>
        <div class="stock-card-content">
          <h3 class="stock-card-title" onclick="window.location.href='${PAGE_URL.STOK_DETAIL}?kode=${item.kodeBarang}'" style="cursor: pointer;">${item.namaBarang}</h3>
          <span class="stock-card-code">${item.kodeBarang}</span>
          <div class="stock-card-actions">
            <button class="btn btn-sm btn-ghost" onclick="window.location.href='${PAGE_URL.STOK_DETAIL}?kode=${item.kodeBarang}'">Lihat</button>
            <button class="btn btn-sm btn-outline" onclick="App.openEditModal('${item.kodeBarang}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="App.openDeleteModal('${item.kodeBarang}')">Hapus</button>
          </div>
        </div>
      </div>
    `).join('');
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

    container.innerHTML = `
      <div class="stock-detail slide-up">
        <div class="stock-detail-header">
          <div class="stock-detail-cover">
            <img src="${item.cover}" alt="${item.namaBarang}" onerror="this.src='${IMG_DEFAULT_BOOK}'">
          </div>
          <div class="stock-detail-info">
            <h1 class="stock-detail-title">${item.namaBarang}</h1>

            <div class="stock-detail-meta">
              <div class="stock-detail-meta-item">
                <span class="stock-detail-meta-label">Kode Lokasi</span>
                <span class="stock-detail-meta-value stock-detail-code">${item.kodeLokasi}</span>
              </div>
              <div class="stock-detail-meta-item">
                <span class="stock-detail-meta-label">Kode Barang</span>
                <span class="stock-detail-meta-value stock-detail-code">${item.kodeBarang}</span>
              </div>
              <div class="stock-detail-meta-item">
                <span class="stock-detail-meta-label">Jenis</span>
                <span class="stock-detail-meta-value">${item.jenisBarang}</span>
              </div>
              <div class="stock-detail-meta-item">
                <span class="stock-detail-meta-label">Edisi</span>
                <span class="stock-detail-meta-value">Edisi ${item.edisi}</span>
              </div>
            </div>

            <div class="stock-detail-stock">
              <span class="stock-detail-meta-label">Stok Tersedia</span>
              <span class="stock-detail-stock-badge">${item.stok}</span>
            </div>

            <div class="stock-detail-actions">
              <button class="btn btn-primary" onclick="window.location.href='${PAGE_URL.STOK}'">Kembali ke Daftar</button>
            </div>
          </div>
        </div>

        <div class="stock-detail-description">
          <h3>Deskripsi</h3>
          <p>
            Bahan ajar ${item.namaBarang} adalah materi pembelajaran untuk kode mata kuliah ${item.kodeBarang}.
            Bahan ajar ini termasuk dalam kategori ${item.jenisBarang} dan tersedia dalam edisi ke-${item.edisi}.
            Stok saat ini tersedia sebanyak ${item.stok} unit.
          </p>
        </div>

        ${relatedItems.length > 0 ? `
          <div class="stock-detail-related">
            <h3>Bahan Ajar Lainnya (${item.jenisBarang})</h3>
            <div class="stock-grid-container">
              ${relatedItems.map(related => `
                <div class="stock-card" onclick="window.location.href='${PAGE_URL.STOK_DETAIL}?kode=${related.kodeBarang}'" style="cursor: pointer;">
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
      </div>
    `;
  }
};
