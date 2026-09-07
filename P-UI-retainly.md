# P-UI: Retain-ly

Daftar screen yang perlu dibuat + prompt siap pakai untuk generate tiap UI (Figma AI, v0, Claude, Lovable, dsb). Design system dicari manual terpisah — prompt ini fokus struktur & fungsi tiap layar, bukan styling detail.

---

## 1. Login / Akses Cabang

**Fungsi:** single account per cabang, akses via HP official toko.

**Prompt:**
```
Buatkan UI login screen untuk aplikasi PWA bernama "Retain-ly" (customer retention tracker untuk resto/F&B).
Konteks: satu akun mewakili satu cabang toko, dipakai di HP official toko oleh kasir.
Elemen yang harus ada:
- Logo/nama app "Retain-ly" di atas
- Input email/username cabang
- Input password
- Tombol "Masuk"
- Teks kecil "Lupa password?" (opsional)
Layout: mobile-first, single column, centered vertically. Harus tetap rapi kalau dibuka di desktop (max-width container, centered).
Style: bersih, minim distraksi, karena akan dipakai kasir buru-buru di tengah operasional toko.
```

---

## 2. Home / Input Order (Layar Utama Kasir)

**Fungsi:** layar paling sering dipakai — input data customer per transaksi secara cepat.

**Prompt:**
```
Buatkan UI form "Input Order" untuk aplikasi Retain-ly — form ini yang paling sering dipakai kasir tiap transaksi, harus super cepat diisi.

Field yang harus ada:
1. Tanggal — default terisi hari ini, bisa diklik untuk ubah (date picker)
2. Input "Nama atau No. Telp" — SATU input field dengan autocomplete/suggestion dropdown yang muncul saat mengetik. Dropdown menampilkan: nama, no telp (format 08xxxxxxxxx), dan badge kecil "Sudah order Nx" jika customer sudah pernah tercatat. Kalau customer baru, tidak ada suggestion dan field tetap bisa diisi manual.
3. Setelah pilih/isi customer, muncul field "No. Telp" (auto-terisi kalau pilih dari suggestion, atau manual kalau customer baru) dan field "Nama" terpisah jika belum ada di suggestion.
4. Dropdown "Channel Order" dengan pilihan: Gofood, Shopee, Grab, Dine-in, Takeaway, WhatsApp, Lainnya. Kalau pilih "Lainnya", muncul input teks kecil di bawahnya.
5. Tombol besar full-width "Simpan Order" di bagian bawah, sticky/fixed di layar HP.

Kondisi khusus: kalau no telp yang diketik sudah ada di database tapi user menekan "Simpan" sebagai entry baru (bukan pilih dari suggestion), tampilkan modal konfirmasi kecil: "Nomor ini sudah terdaftar atas nama [Nama]. Gunakan data ini atau tetap buat entry baru?" dengan 2 tombol: "Pakai data ini" / "Tetap buat baru".

Layout: mobile-first (PWA di HP kasir), tapi tetap nyaman dilihat di desktop (form di tengah, max-width, tidak melebar penuh layar).
Style: tombol besar, jarak antar elemen cukup lega (mudah ditekan jari), feedback visual jelas saat tersimpan (misal toast "Order tersimpan").
```

---

## 3. Daftar Customer

**Fungsi:** lihat semua customer unik, cari, filter status retensi.

**Prompt:**
```
Buatkan UI "Daftar Customer" untuk aplikasi Retain-ly.

Elemen yang harus ada:
1. Search bar di atas — cari by nama atau no telp
2. Filter chip/dropdown: "Semua", "Active", "At Risk", "Churned" (status retensi berbasis warna: hijau/kuning/merah)
3. List/card per customer, tiap item menampilkan:
   - Nama
   - No telp (format 08xxxxxxxxx)
   - Badge jumlah order (misal "5x order")
   - Badge status retensi berwarna (Active/At Risk/Churned)
   - Channel favorit (ikon kecil atau teks, misal "Sering: Gofood")
   - Tanggal order terakhir
4. Pagination di bawah list (misal 20 customer per halaman) — bukan infinite scroll, karena data akan terus bertambah selama bertahun-tahun
5. Tap salah satu customer akan membuka Detail Customer (screen terpisah)

Layout: mobile-first list view (card stack), di desktop bisa jadi tabel atau grid 2 kolom.
Style: badge warna jelas terlihat (untuk scan cepat status customer), informasi padat tapi tidak berantakan.
```

---

## 4. Detail Customer

**Fungsi:** riwayat lengkap satu customer + aksi follow-up.

**Prompt:**
```
Buatkan UI "Detail Customer" untuk aplikasi Retain-ly.

Bagian atas (header info):
- Nama customer (besar)
- No telp
- Badge status retensi (Active/At Risk/Churned)
- Statistik ringkas: total order, tanggal order pertama, tanggal order terakhir, channel favorit

Bagian tengah (riwayat order):
- List riwayat order (tanggal + channel), urut dari terbaru, dengan pagination jika banyak

Bagian bawah (aksi):
- Tombol "Kirim WhatsApp" — membuka wa.me link dengan pesan template siap kirim
- Tombol "Download Kontak (.vcf)" — download vCard customer ini

Layout: mobile-first, scrollable single column. Di desktop, header info dan riwayat order bisa side-by-side (2 kolom).
Style: aksi (tombol WhatsApp, download vcf) harus mencolok dan mudah dijangkau jempol di HP.
```

---

## 5. Dashboard / Retention Overview

**Fungsi:** insight ringkas untuk pemilik/manajer — bukan dipakai kasir tiap transaksi.

**Prompt:**
```
Buatkan UI "Dashboard" untuk aplikasi Retain-ly, ditujukan untuk pemilik/manajer resto melihat insight retensi customer.

Elemen yang harus ada:
1. Kartu ringkasan (summary cards) di baris atas:
   - Total customer unik
   - Total transaksi
   - Repeat rate (% customer yang order lebih dari 1x)
   - Jumlah customer "At Risk" (perlu perhatian)
2. Filter periode di atas: Harian / Mingguan / Bulanan / Tahunan (tab atau dropdown)
3. Grafik sederhana: tren jumlah order per periode yang dipilih (line atau bar chart)
4. Breakdown channel order: chart (pie/bar) menunjukkan proporsi Gofood/Shopee/Grab/Dine-in/Takeaway/WhatsApp/Lainnya
5. Section "Segmentasi Customer": jumlah customer per status (Active/At Risk/Churned) dalam bentuk bar horizontal atau donut chart dengan warna hijau/kuning/merah
6. Section "Perlu Follow-up": list singkat 5 customer dengan status At Risk paling lama tidak order, dengan tombol cepat "Kirim WA" di tiap baris

Layout: mobile-first tapi didesain agar juga nyaman dilihat di desktop/tablet (grid multi-kolom untuk summary cards dan chart berdampingan di layar lebar).
Style: data-dense tapi tetap scannable, warna status konsisten dengan Daftar Customer (hijau/kuning/merah).
```

---

## 6. Follow-up Harian (Daily Send List)

**Fungsi:** akhir hari, kasir kirim WA + simpan kontak semua customer hari itu sekaligus.

**Prompt:**
```
Buatkan UI "Follow-up Hari Ini" untuk aplikasi Retain-ly.

Elemen yang harus ada:
1. Header: tanggal hari ini + jumlah customer yang order hari ini
2. Tombol aksi bulk di atas: "Download Semua Kontak (.vcf)" — export semua customer hari itu jadi satu file vCard
3. List customer hari ini, tiap baris menampilkan:
   - Nama
   - No telp
   - Channel order
   - Tombol kecil "Kirim WA" (membuka wa.me link dengan pesan template)
   - Tombol kecil "Simpan Kontak" (download vcf individual)
4. Checkbox opsional di tiap baris untuk menandai "sudah di-follow up" (state lokal, biar kasir tau mana yang sudah dikirim)

Layout: mobile-first list, checklist-style biar kasir gampang tracking mana yang sudah dikerjakan.
Style: baris yang sudah di-checklist berubah warna redup/strikethrough biar jelas progress-nya.
```

---

## 7. Settings

**Fungsi:** atur threshold churn, template pesan WA, dan preferensi lain.

**Prompt:**
```
Buatkan UI "Settings" untuk aplikasi Retain-ly.

Section yang harus ada:
1. "Threshold Retensi" — input angka hari untuk:
   - Active: 0 - [input] hari (default 30)
   - At Risk: [input] - [input] hari (default 31-60)
   - Churned: lebih dari [input] hari (default 60)
2. "Threshold Loyalitas" — input jumlah order untuk kategori:
   - New: [input] order (default 1)
   - Repeat: [input] - [input] order (default 2-4)
   - Loyal: lebih dari [input] order (default 5)
3. "Template Pesan WhatsApp" — textarea untuk edit template pesan follow-up, dengan placeholder variable seperti {nama} yang otomatis diganti nama customer saat dikirim. Tampilkan preview pesan di bawah textarea.
4. "Channel Order" — list channel yang bisa ditambah/dihapus/diedit (default: Gofood, Shopee, Grab, Dine-in, Takeaway, WhatsApp, Lainnya)
5. Tombol "Simpan Perubahan" di bawah

Layout: mobile-first, form vertikal dengan section yang jelas dipisah (card atau divider).
Style: input field jelas dengan label dan default value ter-highlight agar user tahu ini bisa diubah.
```

---

## 8. Export Data

**Fungsi:** backup/export CSV untuk analisis eksternal.

**Prompt:**
```
Buatkan UI "Export Data" untuk aplikasi Retain-ly.

Elemen yang harus ada:
1. Filter rentang tanggal: date range picker (dari - sampai)
2. Pilihan data yang mau di-export (checkbox): "Data Customer", "Data Order/Transaksi"
3. Tombol "Export ke CSV"
4. Riwayat export sebelumnya (opsional): list file yang pernah di-generate dengan tanggal generate

Layout: mobile-first, form simpel single column.
Style: minimalis, fokus fungsi bukan dekorasi — ini halaman utility, bukan halaman yang sering dibuka.
```

---

## Navigasi Keseluruhan

**Prompt tambahan (struktur navigasi/shell app):**
```
Buatkan struktur navigasi utama untuk PWA "Retain-ly".

Untuk mobile: bottom navigation bar dengan 4-5 ikon: Home (Input Order), Customer (Daftar Customer), Dashboard, Follow-up, Settings (bisa digabung ke dalam menu "More" jika ikon terlalu banyak).

Untuk desktop: sidebar navigasi kiri dengan label teks + ikon untuk item yang sama.

App harus responsive: layout otomatis berubah dari bottom-nav (mobile, <768px) ke sidebar (desktop, >=768px).
Sertakan header/top bar yang menampilkan nama cabang yang sedang login dan tombol logout.
```
