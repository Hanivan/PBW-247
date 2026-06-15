# SITTA — Teaching Material Tracking & Inventory System

Assignment 3 for the **PBW-247 (Web Programming)** course. A **single-page**
web application for managing the inventory and tracking the shipment of
Universitas Terbuka (UT) teaching materials across each UPBJJ (regional
learning unit).

This assignment refactors Assignment 2 (Vue.js 2 multi-page port) into a true
**single-page application** built around custom Vue components, external HTML
templates (`x-template`), JSON-loaded seed data, and reusable Vue filters.

## Assignment Goals

- Convert the multi-page Vue app into a single Vue instance with tab-based
  views (`tab === 'dashboard' | 'stok' | 'stok-detail' | 'tracking' | 'order' | 'login'`).
- Decompose each screen into **custom components** (`Vue.component`) with
  scoped templates loaded from `templates/*.html` via `<script type="text/x-template">`.
- Use **Vue filters** (`rupiah`, `uppercase`, `statusStok`, `tanggal`) for
  formatting in templates.
- Apply core Vue concepts: `data`, `computed`, `methods`, `watch`, `props`,
  `$emit`, and the directives `v-for`, `v-if`/`v-show`, `v-model`, `v-bind` (`:`),
  `v-on` (`@`), `v-html`, `v-cloak`.
- Load seed data and templates asynchronously from JSON / HTML files at bootstrap
  (`js/services/api.js`) — no inline data file.
- Client-side CRUD (add / edit / delete) without a backend — data is held
  in-memory, hydrated from `data/dataBahanAjar.json`.

## Tech Stack

- **Vue.js 2.7.16** — vendored locally at `js/vendor/vue.min.js` (no build step).
- Plain **HTML5 + CSS3** (vanilla), no bundler/transpiler.
- **localStorage** for the login session & theme preference.
- Japanese-accented visual theme (Noto Serif JP, Zen Maru Gothic, Shippori Mincho fonts).

## Views (SPA Tabs)

Everything is served from a single `index.html`. The root Vue instance switches
visible content via the `tab` data prop (`v-show`); the sidebar `goTab(name)`
updates it.

| Tab          | Components mounted                                | Purpose                                                       |
| ------------ | ------------------------------------------------- | ------------------------------------------------------------- |
| `login`      | (root only — login form lives in `index.html`)    | Authentication, forgot-password & registration modals (dummy).|
| `dashboard`  | `<stat-card>`                                     | Summary statistics, Japanese-style date + greeting (4 periods).|
| `stok`       | `<ba-stock-table>`                                | Stock list (table/grid), search, CRUD, statistics.            |
| `stok-detail`| `<stok-detail-panel>`, `<stok-badge>`             | Single-item detail (by `kode`), related items, edit modal.    |
| `tracking`   | `<do-tracking>`                                   | Look up a Delivery Order (DO), show progress + timeline.      |
| `order`      | `<order-form>`                                    | Build a multi-item order, pick package, submit.               |

## Architecture

### Bootstrap

`js/services/api.js` exposes `api.loadApp()`, which in parallel:

1. Fetches `data/dataBahanAjar.json` → assigns to `window.AppData`.
2. Fetches each `templates/*.html` → injects each as a
   `<script type="text/x-template" id="tpl-…">` into `<head>`.

Once both finish, `js/app.js` creates `new Vue({ el: '#app', … })`. Components
reference their templates via `template: '#tpl-…'`.

### Data Source

`data/dataBahanAjar.json` is the single seed file. Top-level keys:

- `dataPengguna` — user accounts for login (email, password, role, location).
- `stok` — teaching material list: `kode`, `judul`, `kategori`, `upbjj`,
  `lokasiRak`, `harga`, `qty`, `safety`, `catatanHTML`.
- `tracking` — shipment data keyed by DO number: `nim`, `nama`, `status`,
  `ekspedisi`, `tanggalKirim`, `paket`, `total`, `perjalanan[]` (timeline).
- `paket` — material bundle packages (`kode`, `nama`, `isi`, `harga`).
- `kategoriList`, `upbjjList`, `pengirimanList` — option lists for dropdowns/forms.

> CRUD is in-memory: changes mutate `window.AppData` but are not persisted back
> to the JSON file, in line with the frontend scope of this assignment.

### Auth

`window.SittaAuth` (in `js/app.js`) handles login validation, session creation,
`localStorage` persistence, and logout. The root instance gates the post-login
shell via `v-show="tab !== 'login'"`.

### Filters

Defined once in `js/app.js`:

- `rupiah` — number → `Rp 1.234`
- `uppercase` — string → `UPPER`
- `statusStok` — stock item → `Tersedia` / `Terbatas` / `Habis`
- `tanggal` — ISO string → localized Indonesian date

## Login Accounts (Demo)

| Email          | Password   | Role          |
| -------------- | ---------- | ------------- |
| rina@ut.ac.id  | `rina123`  | UPBJJ-UT      |
| agus@ut.ac.id  | `agus123`  | UPBJJ-UT      |
| siti@ut.ac.id  | `siti123`  | Puslaba       |
| doni@ut.ac.id  | `doni123`  | Fakultas      |
| admin@ut.ac.id | `admin123` | Administrator |

## Running It

Because templates and data are loaded via `fetch()`, **`file://` will not work**
— you must serve over HTTP:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000` and log in with one of the demo accounts.

## Folder Structure

```
tugas-3/
├── index.html                       # single SPA shell
├── data/
│   └── dataBahanAjar.json           # all seed data (loaded at bootstrap)
├── templates/                       # x-template HTML for each component
│   ├── stok-badge.html
│   ├── stat-card.html
│   ├── stock-table.html
│   ├── do-tracking.html
│   ├── order-form.html
│   └── stok-detail.html
├── assets/css/
│   ├── style.css                    # entrypoint (@imports the rest)
│   ├── variables.css
│   ├── layout.css
│   ├── animations.css
│   ├── japanese-aesthetic.css
│   ├── components/                  # one file per Vue component
│   │   ├── stok-badge.css
│   │   ├── stat-card.css
│   │   ├── stock-table.css
│   │   ├── do-tracking.css
│   │   ├── order-form.css
│   │   ├── app-modal.css
│   │   └── stok-detail-panel.css
│   └── pages/                       # one file per SPA tab
│       ├── login.css
│       ├── dashboard.css
│       ├── stok.css
│       ├── stok-detail.css
│       ├── tracking.css
│       └── pemesanan.css
├── img/
│   └── default-book.svg             # placeholder cover
└── js/
    ├── vendor/vue.min.js            # Vue 2.7.16
    ├── services/
    │   └── api.js                   # async bootstrap: data + templates
    ├── components/                  # one file per Vue component
    │   ├── stok-badge.js
    │   ├── stat-card.js
    │   ├── stock-table.js
    │   ├── do-tracking.js
    │   ├── order-form.js
    │   └── stok-detail-panel.js
    └── app.js                       # filters + auth + root Vue instance
```

## Key Features

- **Component-driven SPA** — each screen is a custom Vue component with an
  external `x-template`; the root instance only orchestrates tabs and shared
  state (alerts, theme, session).
- **Async bootstrap** — data and templates are fetched on load; no inline
  `.js` data file.
- **Vue reactivity** — dashboard/inventory statistics, search filters, tracking
  progress, and stock status (`Tersedia` / `Terbatas` / `Habis`) are all computed
  automatically.
- **Reusable filters** — `rupiah`, `uppercase`, `statusStok`, `tanggal`.
- **Stock CRUD** — add, edit, delete with form validation (required fields + numbers ≥ 0).
- **Two inventory view modes**: table & grid (preference saved in `localStorage`).
- **Shipment tracking** — look up by DO number, progress bar, and journey timeline.
- **Order builder** — multi-item picker with package presets, totals via filters.
- **Dark theme** & responsive sidebar driven from the root instance.
- **Page protection** — anything other than the login tab requires an active session.
