# 05 - UI/UX Architecture & Design System Blueprint (KlikGigi.id)

Dirancang dengan standar **Studio-Grade Medical & Hospitality Craft** (mengacu pada benchmark global **Archy**, **Tend Dental Studio**, **Linear**, dan **Zendenta**) serta mematuhi filosofi **"Gloved-Hand, Zero-Tab Switching & Zero AI-Slop"**.

---

## 1. Prinsip Utama Desain Klinis & Anti-AI-Slop

1. **Gloved-Hand Friendly (Ramah Sarung Tangan Medis):**
   - Seluruh elemen interaktif di layar pemeriksaan (permukaan gigi `M/O/D/B/L`, kondisi patologi, dan *quick chips* SOAP) wajib memiliki ukuran sentuh minimum **`48px × 48px`** dengan jarak antar elemen minimal `8px`.
2. **Zero-Tab Switching (Tanpa Pindah Tab Browser):**
   - Resepsionis dan Dokter menyelesaikan 95% alur kerja dari **1 layar utama** menggunakan komponen *Slide-Over Drawer*, *Popover Kontekstual*, dan *Split-View Panel*.
3. **Adaptive Workspace (Solo Mode vs. Clinic Mode):**
   - Pada **Solo Mode**, tombol `Selesai Tindakan` di layar dokter langsung membuka *Drawer Kasir & Pembayaran* di sisi kanan layar yang sama tanpa perlu berpindah ke menu Kasir.
4. **Strict Anti-AI-Slop Visual Discipline (`frontend-design` & `ui-ux-pro-max`):**
   - **Zero Emoji Icons:** Dilarang menggunakan karakter emoji (`🦷`, `⚡`, `😁`, `✨`, `📅`, `👨‍⚕️`) sebagai ikon struktural. Seluruh ikon wajib menggunakan SVG vektor presisi (`lucide-react` 1.5px stroke atau ilustrasi SVG anatomis).
   - **Product-First Hero:** Halaman utama tidak dibuka dengan kartu generik, melainkan langsung menampilkan **Interactive Live Odontogram & Billing Workbench** yang dapat diklik langsung oleh pengunjung.
   - **No Fake Placeholders:** Seluruh komponen visual (Rontgen Periapikal, Perbandingan Senyum *Before–After*, dan kode QRIS Dinamis) dirender menggunakan grafik vektor SVG medis/teknis asli, bukan kotak abu-abu bertuliskan `[ Placeholder ]`.

---

## 2. Sistem Tipografi (Tri-Stack Typography)

| Peran Tipografi | Typeface | Penggunaan & Aturan |
| :--- | :--- | :--- |
| **Editorial Display** (`--font-serif`) | `Instrument Serif` | Headline utama di halaman marketing `KlikGigi.id` serta template klinik bergaya *Hospitality / Boutique* (*Aura Studio* & *Atelier Noir*). Memberikan kontras hangat dan berwibawa. |
| **Geometric UI & Clinical Display** (`--font-display` / `--font-sans`) | `Plus Jakarta Sans` & `Geist` | Antarmuka aplikasi klinis, navigasi, tabel pasien, dan formulir. Line-height ketat (`1.1`–`1.2`) untuk judul, nyaman dibaca (`1.5`) untuk catatan medis SOAP. |
| **Technical Telemetry & Numerals** (`--font-mono`) | `Geist Mono` (`tabular-nums`) | Wajib digunakan untuk **Kode Gigi FDI (`#11`–`#85`)**, nominal Rupiah (`Rp 450.000`), nomor izin **STR/SIP**, kode invoice, dan *live stopwatch* ruang tunggu. |

---

## 3. Sistem Warna & Token Status (Semantic Color Tokens)

### A. Palet Inti Aplikasi (Core Base Palette)
- **Paper Canvas (`#FAFBFC`):** Latar belakang utama ruang kerja yang meredam silau lampu *dental unit*.
- **Pure Surface (`#FFFFFF`):** Permukaan kartu kerja, kanvas Odontogram, dan *Slide-Over Drawer*.
- **Carbon Ink (`#111418`):** Teks primer dengan kontras tinggi (> 14:1 AAA).
- **Clinical Teal (`#0F766E`):** Aksen fokus utama, indikator pilihan aktif, dan tindakan primer klinis.
- **Hairline Structural Grid (`#E6E8EC`):** Garis pembatas arsitektural `1px solid` yang memisahkan panel tanpa bayangan kabur berlebih.

### B. Status Kartu Jadwal (Chair-Grid Calendar)
| Status | Warna Badge / Border | Indikator Visual Vektor |
| :--- | :--- | :--- |
| `BOOKED` | Slate (`#64748B`) | Ikon `Calendar` + Label Jam |
| `CONFIRMED` | Sky Blue (`#0284C7`) | Ikon `CheckCircle2` Terkonfirmasi via WA |
| `ARRIVED` (Ruang Tunggu) | Amber (`#D97706`) | Ikon `Clock` + **Live Stopwatch** (`Menunggu 14m`) |
| `IN_CHAIR` (Sedang Tindakan)| Violet (`#7C3AED`) | Ikon `Stethoscope` + Indikator Kursi Aktif |
| `COMPLETED` (Belum Bayar) | Orange (`#EA580C`) | Ikon `CreditCard` Menunggu di Kasir |
| `PAID` (Selesai & Lunas) | Emerald (`#059669`) | Ikon `Check` Lunas |

### C. Warna Layer Odontogram (Standar Visual Klinis FDI)
- **Biru Muda (`#38BDF8`) - `EXISTING`:** Restorasi atau kondisi lama dari luar klinik.
- **Merah (`#EF4444`) - `PATHOLOGY / PLANNED`:** Karies aktif, lesi, pulpitis, atau masalah yang butuh tindakan.
- **Biru Tua (`#1D4ED8`) - `COMPLETED`:** Perawatan yang telah diselesaikan oleh klinik.
- **Abu-abu Silang (`#94A3B8`) - `MISSING`:** Gigi hilang / agenesis / telah dicabut.

---

## 4. Arsitektur 4 Template Situs Klinik (No-Code Dental Page Builder)

Untuk menghindari tampilan web klinik yang seragam/monoton, modul **Landing Page Builder (`/app/situs`)** dan **Public Microsite (`/s/[slug]`)** menyediakan **4 Template Arsitektural Berbeda** yang merender skema JSON yang sama ke dalam identitas visual yang kontras:

1. **`AURA_BOUTIQUE` (Hospitality & Aesthetic Studio — Terinspirasi *Tend*):**
   - Palet: *Warm Alabaster* (`#FAF7F2`), *Deep Espresso* (`#1C1917`), *Botanical Sage* (`#2E5A44`).
   - Tipografi: `Instrument Serif` (Display) + `Plus Jakarta Sans` (Body).
   - Karakter: Tata letak majalah editorial, bahasa ramah bebas kecemasan, menu perawatan bergaya *transparent menu board*, dan *Before–After Smile Slider* interaktif.
2. **`ZURICH_CLINICAL` (Swiss International Precision Grid):**
   - Palet: *Crisp White* (`#FFFFFF`), *Carbon Ink* (`#090D16`), *Surgical Cobalt* (`#0052FF`), garis grid ekspos `1px`.
   - Tipografi: `Geist` + `Geist Mono` untuk metrik sterilisasi dan nomor STR/SIP.
   - Karakter: Presisi tinggi, tabel kredensial dokter terstruktur, dan telemetri ketersediaan kursi *real-time*.
3. **`KIN_FAMILY` (Warm Family & Pediatric Dental Care):**
   - Palet: *Soft Oat* (`#FDFBF7`), *Forest Slate* (`#132A26`), *Teal Mint* (`#0D9488`), *Warm Amber* (`#F59E0B`).
   - Karakter: Sudut membulat lembut, kartu keluhan berbasis ilustrasi vektor duotone ramah keluarga, dan panduan persiapan kunjungan anak/dewasa.
4. **`ATELIER_NOIR` (Luxury Cosmetic & Orthodontics Studio):**
   - Palet: *Obsidian* (`#0D0E11`), *Champagne Ivory* (`#F4EFE6`), *Brushed Bronze* (`#C5A059`).
   - Karakter: Estetika klinik *veneer* & *clear aligner* premium dengan fokus pada *Digital Smile Design* dan perbandingan anatomi estetika gigi anterior.

---

## 5. Spesifikasi Wireframe & Interaksi Layar Utama

### Layar 1: Chair-Grid Calendar & Slide-Over Drawer (Front-Desk)

```
+---------------------------------------------------------------------------------------+
| [<] Senin, 26 Okt 2026 [>]  [Lokasi: Cabang Utama v]  [Filter Dokter v] [+ Walk-In]   |
+--------+-------------------------+-------------------------+--------------------------+
| WAKTU  | KURSI 1 (drg. Budi)     | KURSI 2 (drg. Siti)     | DRAWER DETAIL (Slide-In) |
+--------+-------------------------+-------------------------+--------------------------+
| 09:00  | [PAID] Rina W. (Scaling)| [CONF] Ahmad (Tambal)   | Rina Wijaya (28 Thn)     |
| 09:30  |    Lunas - Rp350.000    |    Confirmed via WA     | ALERGI: Amoxicillin      |
| 09:40  | //// Buffer Steril //// |                         | ------------------------ |
| 10:00  | [WAIT] Dedi K. (PSA 2)  | [ + Slot Kosong ]       | Status: [Di Lobi 09m]    |
| 10:30  |    Menunggu 9 mnt       |                         | Deposit: Rp 50.000 (QRIS)|
| 11:00  | [CHAIR] Maya S.         | [ + Slot Kosong ]       | ------------------------ |
|        |    Sedang di Kursi 1    |                         | [Masuk Ruang Periksa]    |
|        |                         |                         | [Chat WA] [Reschedule]   |
+--------+-------------------------+-------------------------+--------------------------+
```

---

### Layar 2: 3-Panel Clinical Workspace & Odontogram (Tablet/Desktop)

```
+---------------------------------------------------------------------------------------+
| Dedi Kurniawan (34 Th) | ALERGI: NSAID | HIPERTENSI (150/95)      | [Mode Presentasi] |
+---------------------------------------------------+-----------------------------------+
| PANEL KIRI/TENGAH (60%): INTERACTIVE ODONTOGRAM   | PANEL KANAN (40%): SOAP & TINDAKAN|
|                                                   |                                   |
| [Dewasa (11-48)] [Anak (51-85)] [Foto & Rontgen]  | TINDAKAN HARI INI (Auto-Sync):    |
|                                                   | 1. Gigi #36 (M,O) - Karies Dentin |
|   [18][17][16][15][14][13][12][11]|[21][22]...    |    -> Restorasi Komposit Kelas II |
|   --------------------------------------------    |    -> Dokter: drg. Budi | Rp450rb |
|   [48][47][46][45][44][43][42][41]|[31]...[36]    |    [+ Bahan/BMHP] [+ Order Lab]   |
|                                            ^      |                                   |
|   +--------------------------------------------+  | QUICK-TAP SOAP CHIPS:             |
|   | Popover Gigi #36 (Tap-Friendly 48x48px):   |  | S: [Ngilu Dingin] [Nyeri Spontan] |
|   | 1. Permukaan: [M] [O] [D] [B] [L] [Semua]  |  | O: [Sondasi (+)] [Perkusi (-)]    |
|   | 2. Kondisi  : [Karies] [Pulpitis]          |  |    [Vitalitas (+)] [Goyang Gr.1]  |
|   |               [Sisa Akar] [Crown]          |  |                                   |
|   | 3. Eksekusi : [Kerjakan Sekarang]          |  | RENCANA KUNJUNGAN BERIKUTNYA:     |
|   |               [Masuk Treatment Plan]       |  | [+ Tambah Tahap Treatment Plan]   |
|   +--------------------------------------------+  |                                   |
|                                                   | [Tanda Tangan Informed Consent]   |
| Riwayat Gigi #36: 12 Jan 2025 - Scaling           | [Selesai & Kirim ke Kasir]        |
+---------------------------------------------------+-----------------------------------+
```

---

### Layar 3: Split-Screen Checkout & Next-Visit Retention Prompt (Kasir)

```
+---------------------------------------------------------------------------------------+
| PENYELESAIAN TAGIHAN - INV/2026/10/0089                         Pasien: Dedi Kurniawan|
+---------------------------------------------------+-----------------------------------+
| RINCIAN TINDAKAN & ATRIBUSI MEDIS                 | PEMBAYARAN & RETENSI PASIEN       |
|                                                   |                                   |
| 1. Restorasi Komposit Kelas II (Gigi #36)         | Subtotal         : Rp 450.000     |
|    Dokter : [drg. Budi Santoso v]                 | Potongan Deposit : -Rp 50.000     |
|    Perawat: [Suster Rini       v]                 | --------------------------------- |
|    Harga  : Rp 450.000                            | TAGIHAN AKHIR    : Rp 400.000     |
|                                                   |                                   |
| [+ Tambah Obat / Resep / Alkes]                   | Tipe Bayar: [x Lunas] [o Cicilan] |
|                                                   | Metode    : [QRIS] [Kartu] [Tunai]|
| ------------------------------------------------- |                                   |
| PROMPT RETENSI OTOMATIS (Dari Ruang Periksa):     | [KONFIRMASI LUNAS & KIRIM WA]     |
| "drg. Budi menjadwalkan Kontrol Evaluasi dalam    |                                   |
|  7 hari (Senin, 2 Nov 2026). Kunci jadwal         | (Otomatis mengirim PDF kwitansi   |
|  sekarang selagi pasien di depan kasir?"          |  & menghitung komisi Net          |
|  [Pilih Jam: 10:00 v] [Booking Sekarang]          |  Collection drg. Budi)            |
+---------------------------------------------------+-----------------------------------+
```

---

## 6. Tech Stack Implementasi
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling & Design System:** Tailwind CSS v4 + OKLCH Semantic Tokens + `shadcn/ui` + `lucide-react`.
- **State Management:** `Zustand` (mengelola sinkronisasi real-time antara Odontogram, Treatment Plan, Kasir, dan konfigurasi Studio Page Builder).
