# SITTA — Teaching Material Tracking & Inventory System

Assignment 2 for the **PBW-247 (Web Programming)** course. A multi-page web
application for managing the inventory and tracking the shipment of Universitas
Terbuka (UT) teaching materials across each UPBJJ (regional learning unit).

This assignment is a **port of Assignment 1 to Vue.js 2** — same functionality,
but the DOM/templating is handled declaratively via Vue instead of manual DOM
manipulation.

## Assignment Goals

- Rebuild the Assignment 1 application using the **Vue.js 2 (Options API)** framework.
- Apply core Vue concepts: `data`, `computed`, `methods`, `watch`, `mixins`, and
  the directives `v-for`, `v-if`/`v-show`, `v-model`, `v-bind` (`:`), `v-on` (`@`),
  `v-html`, `v-cloak`.
- Demonstrate reactivity: statistics, search filters, progress, and stock status
  are computed automatically via `computed` whenever the data changes.
- Client-side CRUD (add / edit / delete) without a backend — data is held
  in-memory from a single centralized data source.

## Tech Stack

- **Vue.js 2.7.16** — vendored locally at `js/vendor/vue.min.js` (no build step).
- Plain **HTML5 + CSS3** (vanilla), no bundler/transpiler.
- **localStorage** for the login session & theme/view preferences.
- Japanese-accented visual theme (Noto Serif JP, Zen Maru Gothic, Shippori Mincho fonts).

## Pages

| Page                | File              | App JS                  | Purpose                                                       |
| ------------------- | ----------------- | ----------------------- | ------------------------------------------------------------- |
| Redirect            | `index.html`      | —                       | Immediately redirects to `login.html`.                        |
| Login               | `login.html`      | `js/login-app.js`       | Authentication, forgot-password & registration modals (dummy).|
| Dashboard           | `dashboard.html`  | `js/dashboard-app.js`   | Summary statistics, Japanese-style date + greeting (4 periods).|
| Inventory           | `stok.html`       | `js/stok-app.js`        | Stock list (table/grid), search, CRUD, statistics.            |
| Material Detail     | `stok-detail.html`| `js/stok-detail-app.js` | Single-item detail via `?kode=`, related items, edit modal.   |
| Shipment Tracking   | `tracking.html`   | `js/tracking-app.js`    | Look up a Delivery Order (DO), show progress + timeline.      |

## Data Architecture

A single centralized data source lives in **`js/dataBahanAjar.js`**. This file
creates a Vue instance (`window.app`) holding all data; each page reads from it
via `window.app.<key>`.

Main data keys:

- `dataPengguna` — user accounts for login (email, password, role, location).
- `stok` — teaching material list: `kode`, `judul`, `kategori`, `upbjj`,
  `lokasiRak`, `harga`, `qty`, `safety`, `catatanHTML`.
- `tracking` — shipment data keyed by DO number: `nim`, `nama`, `status`,
  `ekspedisi`, `tanggalKirim`, `paket`, `total`, `perjalanan[]` (timeline).
- `paket` — material bundle packages (`kode`, `nama`, `isi`, `harga`).
- `kategoriList`, `upbjjList`, `pengirimanList` — option lists for dropdowns/forms.

> Note: CRUD is in-memory (changes are lost on page reload), in line with the
> scope of this frontend assignment.

### Shared Modules

- **`js/shared.js`**
  - `window.SittaAuth` — login, session (`localStorage`), page protection.
  - `window.appShellMixin` — shared mixin: dark-theme toggle, sidebar, alerts, logout.

## Login Accounts (Demo)

| Email          | Password   | Role          |
| -------------- | ---------- | ------------- |
| rina@ut.ac.id  | `rina123`  | UPBJJ-UT      |
| agus@ut.ac.id  | `agus123`  | UPBJJ-UT      |
| siti@ut.ac.id  | `siti123`  | Puslaba       |
| doni@ut.ac.id  | `doni123`  | Fakultas      |
| admin@ut.ac.id | `admin123` | Administrator |

## Running It

Since there is no build step, just serve the folder with any static server:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000` in a browser and log in with one of the demo
accounts above.

> Opening the files directly (`file://`) also works, but a static server is
> recommended so relative paths & redirects behave consistently.

## Folder Structure

```
tugas-2/
├── index.html              # redirect → login
├── login.html
├── dashboard.html
├── stok.html
├── stok-detail.html
├── tracking.html
├── css/                    # variables, layout, components, animations, pages, theme
├── img/                    # assets (placeholder cover: default-book.svg)
└── js/
    ├── vendor/vue.min.js   # Vue 2.7.16
    ├── dataBahanAjar.js    # centralized data source (window.app)
    ├── shared.js           # Auth + appShellMixin
    ├── login-app.js
    ├── dashboard-app.js
    ├── stok-app.js
    ├── stok-detail-app.js
    └── tracking-app.js
```

## Key Features

- **Vue reactivity** — dashboard/inventory statistics, search filters, tracking
  progress, and stock status (`Tersedia` / `Terbatas` / `Habis`) are all computed
  automatically.
- **Stock CRUD** — add, edit, delete with form validation (required fields + numbers ≥ 0).
- **Two inventory view modes**: table & grid (preference saved in `localStorage`).
- **Shipment tracking** — look up by DO number, progress bar, and journey timeline.
- **Dark theme** & responsive sidebar via the shared mixin.
- **Page protection** — every page except login requires an active session.
