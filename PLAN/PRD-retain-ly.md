# PRD: Retain-ly

## 1. Latar Belakang

Bisnis F&B menggunakan POS dengan fitur terbatas dan tanpa kendali penuh (tidak ada akses API/upgrade murah). No telp customer saat ini dicatat manual di kolom nama pada struk. Tidak ada cara untuk melacak repeat order, retensi, atau status churn customer.

**Masalah:**
- Pencatatan manual (buku/Excel) rawan human error dan tidak scalable
- Tidak ada identifier unik yang konsisten untuk melacak customer yang sama
- Tidak ada visibilitas retensi/churn
- Follow-up ke customer (ucapan terima kasih, ajakan repeat order) masih manual sepenuhnya

**Solusi:** Web-app eksternal (PWA) untuk mencatat data customer per transaksi, melacak repeat order berbasis nomor telepon, dan membantu follow-up customer.

## 2. Tujuan

- Mendigitalkan pencatatan data customer (tanggal, nama, channel order, no telp)
- Melacak repeat order dan status retensi/churn customer
- Mempercepat proses follow-up customer via WhatsApp
- Mempermudah penyimpanan kontak customer ke HP resto

## 3. Non-Tujuan (Out of Scope)

- Tidak mencatat nominal/item transaksi (data ini ada di POS, di luar kendali proyek ini)
- Tidak melakukan prediksi churn berbasis ML/DL (di-skip untuk saat ini — churn analytics menggunakan rule-based threshold)
- Tidak terintegrasi langsung dengan POS (tidak ada API yang tersedia)
- Tidak mengirim pesan WhatsApp otomatis tanpa aksi manual dari kasir (menghindari risiko banned WhatsApp API & isu consent)
- Tidak mendukung multi-kasir/multi-user login dalam satu cabang (satu akun = satu cabang)

## 4. Target Pengguna

Kasir/staff toko resmi yang menginput data customer secara real-time saat transaksi atau di akhir hari, menggunakan HP official toko.

## 5. Tech Stack

| Layer | Pilihan |
|---|---|
| Frontend | Vite + React (SPA) |
| PWA | vite-plugin-pwa |
| Backend & Database | Supabase (PostgreSQL) |
| Hosting | Vercel / Netlify |
| Auth | Supabase Auth (1 akun per cabang) |

**Alasan stack:** ringan (SPA tanpa overhead SSR), mudah deploy (git push → auto-build), mudah maintain (dashboard Supabase untuk lihat/edit data manual, tidak perlu server sendiri), scalable untuk volume ±50 transaksi/hari selama bertahun-tahun dengan indexing yang tepat.

## 6. Fitur

### 6.1 Input Order
- Form input: tanggal (default hari ini, bisa diubah), nama customer, no telp, channel order
- Channel order (dropdown): Gofood, Shopee, Grab, Dine-in, Takeaway, WhatsApp, Lainnya (custom text)
- Normalisasi otomatis no telp ke format `08xxxxxxxxx` (strip karakter non-digit, konversi `+62`/`62` prefix)
- **Autocomplete/suggestion**: saat mengetik no telp atau nama, sistem menampilkan dropdown customer yang sudah ada (nama, no telp, jumlah order sebelumnya) untuk dipilih langsung
- Warning/konfirmasi jika no telp yang diinput cocok dengan customer yang sudah terdaftar, untuk mencegah duplikasi data

### 6.2 Manajemen Customer
- Daftar seluruh customer unik (deduplikasi berdasarkan no telp)
- Detail per customer: nama, no telp, total order (repeat count), tanggal order pertama & terakhir, channel favorit
- Search dan filter (by nama, no telp, jumlah repeat, status retensi)
- Pagination (tidak memuat seluruh data sekaligus)

### 6.3 Retention Dashboard
- Total customer unik vs total transaksi
- Breakdown channel order (frekuensi pemakaian tiap channel)
- Repeat count per periode: harian, mingguan, bulanan, tahunan
- Tren order (grafik sederhana)

### 6.4 Churn Analytics (Rule-Based)
Segmentasi customer berdasarkan recency (hari sejak order terakhir), mengikuti standar pasar RFM untuk F&B:

| Status | Recency | 
|---|---|
| Active | 0–30 hari |
| At Risk | 31–60 hari |
| Churned | 61–90+ hari |

- Threshold dapat diubah di halaman Settings
- Tier frequency (opsional): New (1x), Repeat (2–4x), Loyal (5x+) — default, adjustable
- Dashboard menampilkan badge status per customer (warna: hijau/kuning/merah)

### 6.5 Follow-up WhatsApp
- Tombol per customer: generate link `wa.me/62xxx?text=...` dengan template pesan siap kirim (nama otomatis terisi)
- Template pesan dapat disesuaikan di Settings
- Tampilan "daftar customer hari ini" dengan tombol kirim di tiap baris untuk follow-up akhir hari

### 6.6 Contact Export
- Download file `.vcf` (vCard) per customer, untuk disimpan ke kontak HP resto
- Bulk export `.vcf` — seluruh customer dalam satu hari dalam satu file
- Format nama di vCard: `Nama (Channel)` untuk memudahkan identifikasi

### 6.7 PWA
- Installable ke homescreen (mobile) via "Add to Home Screen"
- Adaptif tampilan mobile dan desktop
- Dapat diakses langsung via browser tanpa instalasi

### 6.8 Data Integrity & Export
- Index database pada kolom `no_telp` dan `tanggal` untuk performa query
- Pagination pada seluruh list view
- Export data ke CSV untuk backup/analisis eksternal

## 7. Struktur Data (Ringkas)

**customers**
- id
- phone_normalized (unique, indexed)
- name
- first_order_date
- created_at

**orders**
- id
- customer_id (FK → customers)
- order_date (indexed)
- channel
- raw_phone_input
- created_at

## 8. Metrik Keberhasilan

- Berkurangnya duplikasi data customer (dibanding pencatatan manual)
- Kemampuan melihat repeat rate dan status churn tanpa kalkulasi manual
- Waktu follow-up customer via WhatsApp lebih cepat dari proses manual saat ini

## 9. Pertimbangan Masa Depan (Tidak Dibangun Sekarang)

- Integrasi API POS jika tersedia paket berlangganan yang lebih tinggi (untuk data nominal transaksi)
- Model prediksi churn berbasis machine learning, jika volume data sudah signifikan (ribuan customer, riwayat multi-tahun) dan ada kebutuhan spesifik yang tidak terjawab rule-based analytics
- Multi-kasir/multi-outlet login jika bisnis berkembang ke lebih dari satu cabang
