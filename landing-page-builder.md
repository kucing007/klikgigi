# 04 - No-Code Dental Landing Page Builder & Multi-Template Studio Spec

Modul ini dirancang agar dokter gigi mandiri (TPMDG) maupun klinik multi-cabang dapat mempublikasikan situs klinik berstandar studio desain internasional dalam waktu **kurang dari 10 menit** — lengkap dengan **4 Template Arsitektural**, **Interactive Before–After Smile SVG**, dan **4-Step Mobile Booking Drawer (< 45 detik)**.

---

## 1. Arsitektur Multi-Tenant Routing (Next.js App Router)

Setiap tenant mendapatkan subdomain bawaan (`senyumsehat.klikgigi.id` atau `drg-budi.klikgigi.id`) dan dapat menghubungkan *Custom Domain* (`senyumsehat.id`).

### Alur `middleware.ts` di Next.js
1. Baca header `host` dari setiap *incoming request*.
2. Jika `host` adalah `app.klikgigi.id` $\rightarrow$ arahkan ke rute internal `/app` (Aplikasi SaaS Klinik).
3. Jika `host` adalah subdomain tenant atau *custom domain* $\rightarrow$ *rewrite* URL secara internal ke `/s/[slug]`.
4. Halaman `/s/[slug]/page.tsx` memuat konfigurasi *Structured Block Schema* dan merendernya menggunakan `ClinicTemplateRenderer` sesuai template arsitektural yang dipilih klinik.

---

## 2. 4 Curated Architectural Templates (`template_id`)

Alih-alih hanya mengganti warna tombol pada satu tata letak generik, KlikGigi menyediakan **4 Template Arsitektural** yang dirancang khusus untuk berbagai segmen praktik dokter gigi:

| Template ID | Nama Studio | Benchmark Referensi | Karakter Visual & Tipografi |
| :--- | :--- | :--- | :--- |
| `AURA_BOUTIQUE` | **01 — Aura Dental Studio** | *Tend Dental* / *Mythology* | Latar *Warm Alabaster* (`#FAF7F2`), aksen *Botanical Sage* (`#2E5A44`), tipografi `Instrument Serif` + `Plus Jakarta Sans`. Nuansa *hospitality* hangat bebas rasa takut ke dokter gigi. |
| `ZURICH_CLINICAL` | **02 — Zurich Precision Grid** | *Swiss International Style* | Latar *Crisp Paper* (`#FFFFFF`), aksen *Surgical Cobalt* (`#0052FF`), garis grid ekspos `1px`, tipografi `Geist` + `Geist Mono`. Fokus pada presisi klinis, sterilisasi, dan implan/bedah mulut. |
| `KIN_FAMILY` | **03 — Kin Family & Kids** | *Modern Healthcare Bento* | Latar *Soft Oat* (`#FDFBF7`), aksen *Teal Mint* (`#0D9488`) & *Sunlit Amber* (`#F59E0B`). Ramah keluarga & anak, kartu keluhan ilustratif, dan alur edukasi perawatan preventif. |
| `ATELIER_NOIR` | **04 — Atelier Veneer & Ortho** | *Luxury Cosmetic Studio* | Latar *Obsidian* (`#0D0E11`), teks *Champagne Ivory* (`#F4EFE6`), aksen *Brushed Bronze* (`#C5A059`). Dirancang untuk klinik estetika gigi, *Porcelain Veneer*, dan *Clear Aligner*. |

---

## 3. Arsitektur 3-Pane Studio Builder (`/app/situs`)

Antarmuka builder mengadopsi pola **3-Pane Visual Studio** (setara *Framer* / *Linear* / *21st.dev*):
1. **Left Rail (Template & Block Tree):**
   - Pemilih 4 Template Arsitektural secara *real-time*.
   - Pohon blok terstruktur (*Hero Profile*, *Layman Services Menu*, *Before–After Smile Transformation*, *Verified Doctor Credentials*, *Branch Locations & Live Slots*) dengan tombol urutan (*Move Up/Down*) dan visibilitas (*Switch*).
2. **Center Canvas (Interactive Device Stage):**
   - Bingkai peramban interaktif (`Mobile 390px`, `Tablet 768px`, `Desktop 100%`) dengan *Click-to-Inspect*: mengklik bagian mana pun pada pratinjau langsung membuka properti blok tersebut di panel kanan.
3. **Right Rail (Contextual Property Inspector):**
   - Editor kontekstual untuk teks *Headline*, *Subheadline*, *Social Proof*, harga layanan bahasa awam, kasus *Before–After*, aturan **Deposit QRIS Anti-Ghosting**, serta pratinjau SEO Lokal Google Search.

---

## 4. Skema JSON Konfigurasi Landing Page (`landing_pages.page_config`)

```json
{
  "template_id": "AURA_BOUTIQUE",
  "theme": {
    "primary_color": "#2E5A44",
    "font_pair": "EDITORIAL_SERIF"
  },
  "seo": {
    "title": "Klinik Gigi Senyum Sehat — Dokter Gigi Estetik & Keluarga Jakarta Selatan",
    "description": "Booking jadwal scaling, tambal gigi estetik, veneer, dan behel tanpa antre.",
    "city_keywords": ["Dokter Gigi Senopati", "Klinik Gigi Jakarta Selatan"]
  },
  "booking_policy": {
    "require_qris_deposit": true,
    "deposit_amount": 50000,
    "hide_watermark": true
  },
  "blocks": [
    { "id": "blk_hero", "type": "HERO_PROFILE", "enabled": true },
    { "id": "blk_services", "type": "LAYMAN_SERVICES_GRID", "enabled": true },
    { "id": "blk_before_after", "type": "BEFORE_AFTER_SLIDER", "enabled": true },
    { "id": "blk_doctors", "type": "DOCTOR_CREDENTIALS", "enabled": true },
    { "id": "blk_locations", "type": "PRACTICE_LOCATIONS", "enabled": true }
  ]
}
```

---

## 5. Spesifikasi "4-Step Mobile Booking Drawer" (Konversi < 45 Detik)

1. **Langkah 1: Pilih Keluhan (Bahasa Awam + Ikon Vektor Medis)**
   - Menggunakan kartu bahasa awam (*Bersihkan Karang Gigi*, *Sakit Gigi / Tambal Estetik*, *Pasang / Kontrol Behel*, *Bleaching & Veneer*, *Cabut Gigi / Bungsu*, *Konsultasi Awal*) dengan estimasi durasi kursi dan harga transparan.
2. **Langkah 2: Pilih Lokasi Cabang & Dokter Gigi**
   - Mendukung opsi **Dokter Siapa Saja yang Tersedia Paling Cepat** maupun pemilihan dokter spesifik beserta nomor SIP resmi.
3. **Langkah 3: Pilih Tanggal & Jam Kosong (Real-Time Smart Slots)**
   - *Horizontal Date Scroller* 14 hari ke depan + *Smart Slot Pills* hasil kalkulasi $\text{Slot} = \text{Shift Dokter} \cap \text{Kursi Gigi} \cap (\text{Durasi} + \text{Buffer Sterilisasi})$.
4. **Langkah 4: Data Ringkas & Komitmen Deposit QRIS Dinamis**
   - Input Nama Lengkap, Nomor WhatsApp, dan Catatan Keluhan.
   - Menampilkan **Kode QRIS Vektor Dinamis** (Rp50.000) yang otomatis memotong tagihan akhir di kasir klinik, diikuti tautan langsung ke **Formulir Digital Pre-Visit Intake (`/intake/[id]`)**.
