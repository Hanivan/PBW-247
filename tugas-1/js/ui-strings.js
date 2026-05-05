// UI String Constants
// Centralized management of all user-facing strings

export const MESSAGES = {
  EMPTY_STATE: 'Tidak ada data ditemukan',
  ERROR_NOT_FOUND: '(x_x) Data tidak ditemukan',
  ERROR_STOCK_NOT_FOUND: '(x_x) Kode barang tidak ditemukan',
  SUCCESS_ADD: '(^^) Stok berhasil ditambahkan',
  SUCCESS_UPDATE: '(^^) Data berhasil diupdate',
  SUCCESS_DELETE: '(^^) Data berhasil dihapus',
  WARNING_SEARCH: '(o_o)! Masukkan email Anda',
  WARNING_FORM: '(o_o)! Mohon lengkapi semua field',
  INFO_RESET: '(^_^) Link reset password telah dikirim ke ',
  INFO_REGISTER: '(^^) Pendaftaran berhasil! Silakan login',
  CONFIRM_LOGOUT: 'Apakah Anda yakin ingin keluar dari aplikasi?',
  CONFIRM_DELETE: 'Apakah Anda yakin ingin menghapus stok ini?',
  LOGIN_SUCCESS: '(^^) Login berhasil! Mengalihkan...',
  LOGIN_FAILED: '(x_x) Email atau password yang Anda masukkan salah'
};

export const BUTTONS = {
  VIEW: 'Lihat',
  EDIT: 'Edit',
  DELETE: 'Hapus',
  SAVE: 'Simpan',
  CANCEL: 'Batal',
  BACK: 'Kembali',
  ADD: 'Tambah',
  SEARCH: 'Cari',
  CONFIRM: 'Ya',
  CLOSE: '×'
};

export const LABELS = {
  STOCK: 'Stok',
  LOCATION: 'Kode Lokasi',
  ITEM_CODE: 'Kode Barang',
  ITEM_NAME: 'Nama Barang',
  TYPE: 'Jenis',
  EDITION: 'Edisi',
  STATUS: 'Status',
  ACTIONS: 'Aksi'
};

export const PLACEHOLDERS = {
  SEARCH_STOCK: 'Masukkan nama atau kode barang...',
  SEARCH_TRACKING: 'Masukkan nomor DO...',
  EMAIL: 'Masukkan email',
  PASSWORD: 'Masukkan password'
};

// Element IDs used across the application
export const ELEMENT_IDS = {
  TRACKING_FORM: 'trackingForm',
  DO_NUMBER_INPUT: 'doNumber',
  TRACKING_RESULTS: 'trackingResults',
  STOCK_SEARCH: 'stockSearch',
  VIEW_TOGGLE: 'viewToggle',
  VIEW_ICON: 'viewIcon'
};
