# Retain-ly — plan.md

> **Version:** 1.0 | **Last Updated:** 2026-09-07 | **Status:** Planning
> This file is the single source of truth for this project. Keep it updated as the project evolves.

---

## 1. Project Overview

**Name:** Retain-ly
**Tagline:** Web-app PWA untuk mencatat customer F&B secara manual dan melacak repeat order/retensi berbasis nomor telepon.
**Purpose:** Bisnis F&B memakai POS dengan fitur terbatas dan tanpa akses API. No telp customer saat ini dicatat manual di kolom nama struk. Tidak ada cara melacak repeat order, retensi, atau churn. Retain-ly menggantikan pencatatan manual (buku/Excel) dengan web-app terstruktur yang bisa autocomplete customer lama, hitung repeat count, segmentasi retensi (Active/At Risk/Churned), dan mempermudah follow-up WhatsApp + simpan kontak. Sukses = kasir bisa input transaksi <30 detik, pemilik bisa lihat status retensi tanpa hitung manual.
**Type:** Web App (PWA)
**Stage:** Planning (PRD & UI prompt selesai, belum ada kode)
**Owner:** Alex
**Repo:** local (belum diinisialisasi)

---

## 2. Assumptions & Open Questions

### Assumptions Made
- Volume transaksi ±50/hari, diproyeksikan ±73.000 baris data dalam 4 tahun — tetap ringan untuk Postgres dengan indexing yang benar
- Satu akun Supabase Auth mewakili satu cabang/outlet, dipakai di HP official toko (bukan multi-user per cabang)
- Nominal/nilai transaksi TIDAK bisa diambil dari POS eksisting tanpa upgrade tier berbayar — di luar scope untuk saat ini
- No telp adalah satu-satunya identifier unik yang reliable untuk mendeteksi repeat customer (bukan nama, karena nama bisa duplikat/typo)
- Churn threshold memakai standar pasar RFM untuk F&B: Active 0–30 hari, At Risk 31–60 hari, Churned 61–90+ hari — adjustable di Settings
- Auto-kirim WhatsApp via API resmi tidak dipakai di fase ini (biaya + risiko banned + isu consent) — pakai wa.me link manual-send sebagai gantinya
- ML/DL untuk churn prediction di-skip untuk saat ini — dipertimbangkan lagi hanya jika data sudah signifikan (ribuan customer, multi-tahun) dan rule-based sudah tidak cukup

### Open Questions
| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | Design system final (warna, tipografi, komponen) — akan dicari manual, belum dipilih | Alex | TBD |
| 2 | Apakah perlu ekspansi multi-cabang di masa depan (saat ini: 1 akun = 1 cabang)? | Alex | TBD |
| 3 | Template pesan WhatsApp default — teks final belum ditentukan | Alex | Sebelum build fitur follow-up |

---

## 3. Tech Stack & Environment

### Core Stack
| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Language | TypeScript | latest stable | Type safety untuk data customer/order |
| Framework | React (Vite SPA) | Vite latest, React 18+ | Dipilih atas Next.js/Astro — lebih ringan untuk internal tool tanpa kebutuhan SSR/SEO |
| PWA | vite-plugin-pwa | latest | Installable, offline-cache dasar |
| Database | Supabase (PostgreSQL) | — | Dipilih atas Firebase — kebutuhan query relasional (JOIN, GROUP BY) dan partial-text search (`ilike`) untuk autocomplete no telp |
| Auth | Supabase Auth | — | Single account per cabang |
| Hosting | Vercel (atau Netlify) | — | Auto-deploy dari git push |
| CI/CD | Vercel built-in (git-based) | — | Tidak perlu pipeline custom di awal |

### Dev Environment
- **Node version:** Node 20 LTS
- **Package manager:** npm (atau pnpm jika tim terbiasa)
- **Required env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Local setup:** `npm install && npm run dev`

### Key Libraries / Dependencies
| Package | Purpose | Why chosen |
|---------|---------|-----------|
| `@supabase/supabase-js` | Client untuk Supabase (DB, Auth) | Official SDK |
| `vite-plugin-pwa` | PWA manifest + service worker | Matang, banyak dipakai untuk Vite |
| `react-router-dom` | Routing SPA (Home, Customer, Dashboard, dll) | Standar untuk Vite+React SPA |
| Chart library (misal `recharts`) | Grafik dashboard (tren order, breakdown channel) | Ringan, umum dipakai di React |
| `date-fns` | Kalkulasi recency/tanggal untuk churn logic | Ringan dibanding moment.js |

---

## 4. Architecture & System Design

### Overview
SPA murni (client-heavy) yang berkomunikasi langsung dengan Supabase lewat SDK — tanpa backend custom terpisah. Semua business logic (normalisasi no telp, kalkulasi churn/recency) dilakukan di client atau lewat Postgres function/view di Supabase untuk agregasi berat.

### Component Diagram (text)
```
[Kasir HP/PWA] → [React SPA (Vite)] → [Supabase Client SDK]
                                              ↓
                                    [Supabase: Postgres DB]
                                              ↓
                                    [Supabase Auth (per cabang)]
```

### Key Design Decisions
- **Pattern:** Client-side SPA, tanpa backend custom — Supabase berfungsi sebagai BaaS penuh
- **State management:** React Context atau state lokal per halaman (scope kecil, tidak butuh Redux/Zustand)
- **API style:** Supabase client query langsung (PostgREST di balik layar), bukan REST/GraphQL custom
- **Auth approach:** Supabase Auth, email+password sederhana per akun cabang
- **Data flow:** Input form → normalisasi no telp di client → insert/upsert ke Supabase → dashboard query agregat langsung dari tabel/view

### Constraints & Boundaries
- Tidak ada backend server custom — semua logic berat (agregasi churn, repeat count) sebisa mungkin didorong ke database (SQL view/function), bukan dihitung di client untuk data besar
- Semua list view WAJIB pakai pagination — dilarang fetch seluruh tabel sekaligus
- No telp harus dinormalisasi (`08xxxxxxxxx`) sebelum disimpan — validasi di client sebelum insert

---

## 5. Folder Structure & File Conventions

```
retain-ly/
├── src/
│   ├── components/       # Reusable UI (Button, Card, Badge status, dll)
│   ├── pages/             # Login, InputOrder, CustomerList, CustomerDetail,
│   │                      # Dashboard, FollowUp, Settings, ExportData
│   ├── services/          # supabaseClient.ts, customerService.ts, orderService.ts
│   ├── utils/              # normalizePhone.ts, churnStatus.ts, vcardGenerator.ts, waLinkBuilder.ts
│   ├── hooks/              # useCustomerSearch.ts (autocomplete), useChurnSegments.ts
│   ├── types/              # Customer, Order, ChannelType, RetentionStatus
│   └── constants/          # CHANNELS, DEFAULT_THRESHOLDS
├── public/
│   └── manifest.json       # PWA manifest
├── tests/
├── docs/
│   ├── PRD-retain-ly.md
│   └── P-UI-retainly.md
├── plan.md                 # This file
├── agents.md                # AI agent operating rules
└── [config files: vite.config.ts, tsconfig.json, .env.example]
```

### File Naming Rules
- Components: `PascalCase.tsx` (e.g., `CustomerCard.tsx`)
- Utilities/hooks: `camelCase.ts` (e.g., `normalizePhone.ts`, `useCustomerSearch.ts`)
- Tests: `*.test.ts` co-located dengan source
- Constants: `UPPER_SNAKE_CASE` untuk value, `camelCase.ts` untuk nama file

### Import Rules
- Absolute imports dari `src/` (misal `import { normalizePhone } from '@/utils/normalizePhone'`)
- Barrel export via `index.ts` di tiap folder utama (`components/`, `services/`, dst)

---

## 6. Code Conventions & Standards

### General
- **Language:** TypeScript strict mode
- **Linter:** ESLint (config React + TypeScript)
- **Formatter:** Prettier, auto-format on save
- **Line length:** 100 chars

### Naming
- Variabel/fungsi: `camelCase`
- Komponen/Type: `PascalCase`
- Kolom database: `snake_case` (`phone_normalized`, `order_date`)
- CSS classes: `kebab-case` (jika bukan Tailwind utility)

### Functions & Logic
- Fungsi normalisasi no telp dan kalkulasi status retensi harus pure function (testable tanpa side effect)
- Semua async function (Supabase call) wajib eksplisit handle error — tampilkan toast/error state, jangan silent fail
- Maks 3 parameter per fungsi — gunakan object jika lebih

### Comments & Docs
- Komentar menjelaskan KENAPA, bukan APA (misal kenapa threshold churn 60 hari, bukan "ini mengecek recency")
- TODO wajib format `// TODO(alex): deskripsi singkat`

### Git & Branching
- **Branch naming:** `feat/`, `fix/`, `chore/`, `docs/` prefix
- **Commit format:** Conventional Commits (`feat: add customer autocomplete`)
- **PR rules:** TBD (saat ini solo project — bisa disederhanakan jadi self-review sebelum merge ke `main`)

---

## 7. AI Assistant Context

> Read this section when starting a new AI session on this project.

### What This Project Is
Retain-ly adalah PWA untuk mencatat data customer F&B (tanggal, nama, channel order, no telp) secara manual oleh kasir, melacak repeat order berbasis no telp, dan menyegmentasikan customer berdasarkan status retensi (Active/At Risk/Churned) dengan rule-based threshold — bukan machine learning.

### How to Navigate the Codebase
- Entry point: `src/main.tsx`
- Routing: `src/App.tsx` (react-router-dom)
- Business logic inti: `src/services/` (customerService, orderService) dan `src/utils/` (normalizePhone, churnStatus)
- Koneksi database: `src/services/supabaseClient.ts`
- Skema database: lihat Section 13 (Dependencies) atau file migrasi SQL di `supabase/migrations/` (jika ada)

### Critical Rules (Never Violate)
- JANGAN pernah simpan no telp mentah tanpa normalisasi — selalu lewat `normalizePhone()` sebelum insert/query
- JANGAN fetch seluruh tabel `orders`/`customers` tanpa pagination/limit
- JANGAN implementasikan auto-send WhatsApp API — hanya wa.me link manual-trigger (keputusan sudah final, lihat Decision Log #5)
- JANGAN tambahkan model ML/DL untuk churn tanpa persetujuan eksplisit — churn logic HARUS tetap rule-based (recency threshold) kecuali ada instruksi baru
- JANGAN commit `.env` atau kredensial Supabase ke repo

### Common Patterns in This Codebase
```typescript
// Contoh: normalisasi no telp sebelum simpan
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  if (digits.startsWith('8')) return '0' + digits;
  return digits;
}

// Contoh: query Supabase dengan pagination
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .range(page * pageSize, (page + 1) * pageSize - 1);
```

### What NOT to Do
- Jangan bikin utility baru untuk cek duplikat/normalisasi tanpa cek `src/utils/normalizePhone.ts` dulu
- Jangan ubah skema database langsung tanpa mencatat di Decision Log dan bikin migrasi
- Jangan tambah dependency besar (state management library, UI kit berat) tanpa diskusi dulu — proyek ini sengaja ringan

### Current Focus
PRD dan daftar UI/prompt sudah selesai (lihat `docs/PRD-retain-ly.md`, `docs/P-UI-retainly.md`). Fokus berikutnya: setup project skeleton (Vite + Supabase connection), desain skema database, lalu build fitur Input Order (fitur inti, paling sering dipakai).

---

## 8. Scope & Feature List

### Must Have (MVP)
- [ ] Login (Supabase Auth, 1 akun per cabang)
- [ ] Input Order dengan autocomplete no telp/nama
- [ ] Normalisasi no telp otomatis
- [ ] Deteksi & warning duplikat customer
- [ ] Daftar Customer (list, search, filter status retensi, pagination)
- [ ] Detail Customer (riwayat order, statistik)
- [ ] Dashboard retensi (summary card, breakdown channel, tren periode)
- [ ] Churn analytics rule-based (Active/At Risk/Churned badge)
- [ ] Follow-up WhatsApp (wa.me link + template pesan)
- [ ] Download kontak `.vcf` (single & bulk)
- [ ] PWA installable, responsive mobile+desktop
- [ ] Settings (threshold retensi, template pesan, daftar channel)
- [ ] Export CSV

### Should Have (v1.1)
- [ ] Checklist "sudah di-follow up" di halaman Follow-up Harian
- [ ] Riwayat export sebelumnya di halaman Export Data
- [ ] Grafik tren lebih detail (perbandingan periode)

### Could Have (future)
- [ ] Integrasi API POS (jika upgrade tier tersedia) untuk data nominal transaksi
- [ ] Model statistik/ML ringan untuk prediksi churn (jika data sudah signifikan)
- [ ] Multi-kasir/multi-outlet login

### Will NOT Have (explicit out of scope)
- Auto-send WhatsApp via API resmi (biaya + risiko + consent issue)
- Native mobile app (React Native) — PWA sudah cukup
- Integrasi langsung ke POS tanpa API yang tersedia
- Machine learning/deep learning untuk churn prediction di fase ini

---

## 9. Milestones & Timeline

| Milestone | Description | Target Date | Status |
|-----------|-------------|-------------|--------|
| M0: Setup | Repo, Vite+React skeleton, Supabase project, skema DB awal, deploy skeleton ke Vercel | TBD | [ ] Not started |
| M1: Core Input | Fitur Input Order + autocomplete + normalisasi no telp | TBD | [ ] Not started |
| M2: Customer & Dashboard | Daftar Customer, Detail Customer, Dashboard retensi, churn badge | TBD | [ ] Not started |
| M3: Follow-up | WhatsApp link generator, export vCard, Settings | TBD | [ ] Not started |
| M4: Polish & PWA | PWA manifest/offline cache, export CSV, responsive QA | TBD | [ ] Not started |

**Status key:** [ ] Not started | [~] In progress | [x] Done | [!] Blocked

---

## 10. Task Breakdown

### M0: Setup [current milestone]

- [ ] Inisialisasi project Vite + React + TypeScript
- [ ] Setup ESLint + Prettier
- [ ] Buat project Supabase, catat `SUPABASE_URL` dan `ANON_KEY`
- [ ] Desain skema tabel `customers` dan `orders` (lihat Section 13)
- [ ] Buat index pada `phone_normalized` dan `order_date`
- [ ] Setup `.env.example` dan konfigurasi env var
- [ ] Konfigurasi `vite-plugin-pwa` dasar (manifest, ikon)
- [ ] Deploy skeleton kosong ke Vercel, pastikan connect ke Supabase
- [ ] Tulis README dengan instruksi setup lokal

### M1: Core Input

- [ ] Buat halaman Login (Supabase Auth)
- [ ] Buat fungsi `normalizePhone()` + unit test
- [ ] Buat halaman Input Order sesuai prompt di `P-UI-retainly.md`
- [ ] Implementasi autocomplete search (query `ilike` ke Supabase, debounce 300ms)
- [ ] Implementasi logic deteksi duplikat + modal konfirmasi
- [ ] Implementasi dropdown channel + opsi custom "Lainnya"
- [ ] Simpan order ke Supabase (insert customer jika baru, insert order selalu)

### Backlog (unprioritized)

- [ ] Daftar Customer + pagination + filter status
- [ ] Detail Customer + riwayat order
- [ ] Dashboard (summary card, chart channel, chart tren)
- [ ] Churn status calculation (SQL view atau client-side dari `order_date` terakhir)
- [ ] Follow-up Harian (list + wa.me generator + vCard generator)
- [ ] Settings (threshold retensi, template pesan, daftar channel custom)
- [ ] Export CSV
- [ ] QA responsive mobile/desktop
- [ ] Testing PWA install di HP Android/iOS

**Atomic task rule:** Jika satu task lebih dari setengah hari kerja, pecah lagi.

---

## 11. Decision Log

| # | Date | Decision | Rationale | Alternatives Considered |
|---|------|----------|-----------|--------------------------|
| 1 | 2026-09-07 | Pakai Supabase (Postgres), bukan Firebase | Butuh query relasional (JOIN, GROUP BY) untuk repeat count/agregasi, dan partial-text search (`ilike`) untuk autocomplete no telp — keduanya native di SQL, ribet di Firestore | Firebase (ditolak: Firestore tidak native support partial search & agregasi kompleks) |
| 2 | 2026-09-07 | Pakai Vite + React SPA, bukan Next.js/Astro | Internal tool tanpa kebutuhan SEO/SSR; SPA lebih ringan, gak ada overhead server-side rendering | Next.js (ditolak: lebih berat dari yang dibutuhkan), Astro (ditolak: manfaat "zero-JS" hilang karena app ini mayoritas interaktif) |
| 3 | 2026-09-07 | Repeat customer dideteksi berdasarkan no telp, bukan nama | No telp lebih reliable sebagai unique identifier; nama rawan duplikat/typo | Matching by nama (ditolak: false positive/negative tinggi) |
| 4 | 2026-09-07 | Churn threshold rule-based (30/60/90 hari), bukan ML/DL | Data belum cukup untuk model reliable; kompleksitas infra ML bertentangan dengan prioritas "mudah deploy & maintain" | ML/DL churn prediction (ditolak untuk fase ini — dipertimbangkan lagi di masa depan jika data signifikan) |
| 5 | 2026-09-07 | Follow-up WhatsApp pakai wa.me link manual-trigger, bukan API otomatis | Menghindari risiko banned WhatsApp (library gak resmi) dan biaya WhatsApp Business API resmi; juga isu consent karena no telp didapat dari struk, bukan opt-in eksplisit | WhatsApp Business API resmi (ditolak: biaya + approval template + scope belum butuh full automation) |
| 6 | 2026-09-07 | Nominal transaksi TIDAK dilacak di app ini | Data nominal hanya tersedia di tier POS berbayar lebih tinggi; fokus dulu ke retention/repeat tracking yang murah | Upgrade POS untuk akses API nominal (ditolak untuk saat ini: biaya) |
| 7 | 2026-09-07 | Satu akun = satu cabang (bukan multi-user login) | Dipakai di HP official toko, bukan device personal tiap kasir | Multi-user login per kasir (ditolak: belum perlu, nambah kompleksitas auth) |

---

## 12. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | No telp diinput salah/typo oleh kasir, merusak deteksi repeat customer | High | Medium | Normalisasi otomatis + autocomplete suggestion + warning duplikat sebelum simpan |
| 2 | Kasir lupa/malas input data di tengah kesibukan operasional | Medium | High | UI Input Order didesain sesederhana & secepat mungkin (autocomplete, tombol besar) |
| 3 | Volume data besar (73rb+ baris dalam 4 tahun) membuat query lambat jika tidak dioptimasi | Low (jika index dipasang) | High | Index pada `phone_normalized` dan `order_date`, pagination wajib di semua list, agregasi berat lewat SQL view bukan client-side |
| 4 | WhatsApp mendeteksi pola pengiriman manual berulang sebagai spam (meski manual-trigger) | Low | Medium | Tetap manual-trigger per pesan (bukan bulk-send otomatis), tidak pakai library automation |
| 5 | Scope creep — nambah fitur nominal/ML di tengah jalan | Medium | Medium | Scope sudah eksplisit di Section 8 "Will NOT Have"; re-evaluasi hanya lewat Decision Log baru |
| 6 | Perubahan struktur POS/no telp di receipt (vendor POS update) mengganggu workaround manual saat ini | Low | Medium | Proses input tetap manual by design, jadi tidak bergantung pada format struk POS |

**Likelihood/Impact:** Low / Medium / High

---

## 13. Dependencies & Integrations

### External Services
| Service | Purpose | Auth method | Status | Fallback |
|---------|---------|-------------|--------|---------|
| Supabase | Database + Auth | API key (anon key) + JWT session | Belum dikonfigurasi | Tidak ada — core dependency |
| Vercel | Hosting frontend | Git-based deploy | Belum dikonfigurasi | Netlify sebagai alternatif setara |
| WhatsApp (wa.me) | Follow-up messaging | Tidak perlu auth — link publik | N/A | Manual copy-paste nomor jika link gagal |

### Internal Dependencies
- Skema database (`customers`, `orders`) — lihat Section 5 struktur folder dan draft skema di bawah
- Design system — TBD, dicari manual terpisah (lihat Open Questions #1)

### Draft Skema Database
```sql
-- customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  phone_normalized text unique not null,
  name text not null,
  first_order_date date not null,
  created_at timestamptz default now()
);
create index idx_customers_phone on customers (phone_normalized);

-- orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  order_date date not null,
  channel text not null,
  raw_phone_input text,
  created_at timestamptz default now()
);
create index idx_orders_date on orders (order_date);
create index idx_orders_customer on orders (customer_id);
```

### Environment Variables Required
```env
# Required
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional (has defaults)
VITE_DEFAULT_CHURN_ACTIVE_DAYS=30
VITE_DEFAULT_CHURN_AT_RISK_DAYS=60
```

---

## 14. Testing Strategy

### Test Types
| Type | Tool | Coverage target | Location |
|------|------|----------------|----------|
| Unit | Vitest | 80%+ untuk `utils/` (normalizePhone, churnStatus, vcardGenerator) | `*.test.ts` co-located |
| Integration | Vitest + Supabase test client | Query customer/order (insert, search, dedup logic) | `tests/integration/` |
| E2E | Playwright (opsional, jika waktu memungkinkan) | Alur Input Order end-to-end | `tests/e2e/` |

### What Must Be Tested
- `normalizePhone()` — berbagai format input (`0812...`, `+62812...`, `62812...`, `812...`)
- Logic deteksi duplikat customer
- Kalkulasi status churn (Active/At Risk/Churned) berdasarkan recency
- Generator `wa.me` link dan `.vcf` — format output benar

### What Can Be Skipped
- Styling/visual regression (belum ada design system final)
- Halaman Export Data (utility sederhana, low risk)

### Running Tests
```bash
npm test              # Unit tests
npm run test:coverage # Coverage report
```

---

## 15. Deployment & Operations

### Environments
| Env | URL | Deploy trigger | Config |
|-----|-----|---------------|--------|
| Local | localhost:5173 | Manual (`npm run dev`) | `.env.local` |
| Production | TBD (Vercel default domain atau custom) | Push ke `main` | `.env.production` (Vercel dashboard) |

### Deploy Process
```bash
# Production (auto via Vercel git integration)
git push origin main
# Vercel otomatis build & deploy
```

### Monitoring & Observability
- **Error tracking:** Belum ada — pertimbangkan Sentry free tier jika sudah live
- **Logs:** Vercel deployment logs + Supabase dashboard logs
- **Uptime:** Belum ada — Vercel/Supabase punya status page masing-masing

### Rollback Plan
Revert ke deployment sebelumnya lewat Vercel dashboard (instant rollback tanpa perlu re-deploy dari git).

---

## 16. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-07 | Initial plan.md dibuat berdasarkan hasil diskusi PRD dan keputusan tech stack (Vite+React+Supabase+PWA) |

---

## How to Keep This File Updated

- Setelah tiap milestone: update status, pindahkan task ke Done, tambah entri changelog
- Setelah tiap keputusan arsitektur: tambahkan ke Decision Log dengan alasan
- Setelah menemukan risiko baru: tambahkan ke Risk Register
- Saat mulai sesi AI baru: paste plan.md sebagai context dengan pesan "Read this plan.md and use it as your project context"
