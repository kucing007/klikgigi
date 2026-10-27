# 03 - Core Backend Business Logic & Algorithms

Dokumen ini membedah 4 logika bisnis paling krusial di dalam aplikasi agar tidak terjadi konflik jadwal, duplikasi input dokter, maupun sengketa bagi hasil.

---

## 1. Algoritma "Smart Slot Scheduling" (Doctor $\cap$ Chair $\cap$ Buffer)

Berbeda dengan aplikasi booking salon atau dokter umum, slot klinik gigi hanya tersedia apabila **Dokter memiliki shift aktif** DAN **setidaknya 1 Kursi Gigi di lokasi tersebut kosong** sepanjang durasi tindakan ditambah waktu sterilisasi (*buffer*).

### Langkah Kalkulasi Slot (TypeScript Pseudocode)
```typescript
interface SlotRequest {
  tenantId: string;
  locationId: string;
  serviceId: string;
  doctorId?: string; // Opsional jika pasien pilih "Dokter Siapa Saja"
  date: string;      // YYYY-MM-DD
}

async function getAvailableDentalSlots(req: SlotRequest): Promise<string[]> {
  // 1. Ambil durasi layanan + buffer sterilisasi kursi
  const service = await db.servicesCatalog.findUnique({ where: { id: req.serviceId } });
  const totalRequiredMinutes = service.duration_minutes + service.buffer_minutes;

  // 2. Ambil jadwal shift dokter pada hari tersebut di lokasi terkait
  const shifts = await db.doctorSchedules.findMany({
    where: {
      location_id: req.locationId,
      doctor_id: req.doctorId,
      day_of_week: new Date(req.date).getDay(),
    }
  });

  // 3. Ambil seluruh kursi gigi aktif di lokasi tersebut
  const activeChairs = await db.dentalChairs.findMany({
    where: { location_id: req.locationId, is_active: true }
  });

  // 4. Ambil seluruh appointment aktif pada tanggal tersebut (lintas lokasi untuk dokter ybs)
  const existingAppointments = await db.appointments.findMany({
    where: {
      date: req.date,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      OR: [
        { location_id: req.locationId }, // Semua pemakaian kursi di cabang ini
        { doctor_id: req.doctorId }      // Semua jadwal dokter ini (termasuk di cabang lain)
      ]
    }
  });

  // 5. Generate kandidat slot setiap interval 15 menit (misal 09:00, 09:15, 09:30...)
  const availableSlots: string[] = [];
  for (const shift of shifts) {
    let cursor = parseTime(req.date, shift.start_time);
    const shiftEnd = parseTime(req.date, shift.end_time);

    while (addMinutes(cursor, totalRequiredMinutes) <= shiftEnd) {
      const candidateEnd = addMinutes(cursor, totalRequiredMinutes);

      // Cek A: Apakah dokter sedang sibuk di rentang [cursor, candidateEnd)?
      const isDoctorBusy = existingAppointments.some(
        app => app.doctor_id === shift.doctor_id && overlaps(cursor, candidateEnd, app.time_slot)
      );

      // Cek B: Apakah masih ada minimal 1 kursi gigi yang kosong di rentang [cursor, candidateEnd)?
      const freeChair = activeChairs.find(chair => {
        const isChairOccupied = existingAppointments.some(
          app => app.chair_id === chair.id && overlaps(cursor, candidateEnd, app.time_slot)
        );
        return !isChairOccupied;
      });

      if (!isDoctorBusy && freeChair) {
        availableSlots.push(formatTimeHHMM(cursor));
      }

      cursor = addMinutes(cursor, 15); // Step 15 menit
    }
  }

  return Array.from(new Set(availableSlots)).sort();
}
```

---

## 2. Mesin "3-Tap Odontogram-to-Billing" & JSONB Schema

Saat dokter mengetuk permukaan gigi dan memilih kondisi serta tindakan di ruang periksa, backend menjalankan **Single Atomic Transaction** yang memperbarui 4 entitas sekaligus.

### Struktur Standar JSONB `chart_data`
Setiap gigi mengikuti penomoran FDI (`11-18, 21-28, 31-38, 41-48` untuk dewasa; `51-55, 61-65, 71-75, 81-85` untuk anak) dan memiliki 5 permukaan (`M` Mesial, `O` Occlusal/Incisal, `D` Distal, `B` Buccal/Labial, `L` Lingual/Palatal):

```json
{
  "version": "1.0",
  "teeth": {
    "36": {
      "presence": "PRESENT",
      "mobility_grade": 0,
      "whole_tooth_code": null,
      "surfaces": {
        "M": { "code": "CARIES_DENTIN", "layer": "COMPLETED", "color": "#3B82F6" },
        "O": { "code": "CARIES_DENTIN", "layer": "COMPLETED", "color": "#3B82F6" },
        "D": { "code": "NORMAL", "layer": "EXISTING", "color": null },
        "B": { "code": "NORMAL", "layer": "EXISTING", "color": null },
        "L": { "code": "NORMAL", "layer": "EXISTING", "color": null }
      }
    },
    "48": {
      "presence": "IMPACTED",
      "mobility_grade": 0,
      "whole_tooth_code": "MESIOANGULAR_IMPACTION",
      "surfaces": {}
    }
  }
}
```

### Automasi Saat Dokter Klik "Kerjakan Sekarang" pada Popover Gigi
1. **Update JSONB Snapshot:** Mengubah layer permukaan gigi terkait menjadi `COMPLETED` (warna biru) pada `patient_odontogram_snapshots`.
2. **Insert Audit History:** Menyimpan baris baru di `tooth_clinical_histories` (`tooth_number: 36`, `surfaces: ['M','O']`, `condition_code: 'CARIES_DENTIN'`, `service_id`).
3. **Auto-Append SOAP Notes:** Menambahkan teks terformat ke `encounters.objective_notes` & `plan_notes`:
   - *O:* `Gigi 36 (M,O): Karies Mencapai Dentin.`
   - *P:* `Gigi 36 (M,O): Restorasi Komposit Kelas II.`
4. **Auto-Create Draft Invoice Item:** Menambahkan item `Restorasi Komposit Kelas II` ke tabel `invoice_items` dengan `tooth_number = 36` dan `performed_by_doctor_id = currentDoctorId`.

---

## 3. Mesin Perhitungan Komisi Dokter (Anti-Sengketa)

Untuk menghindari sengketa antara pemilik klinik dan dokter *associate*, perhitungan komisi mengikuti aturan **Line-Item Attribution** dan **Proportional Collection Release**.

### Rumus Matematis
1. **Basis Perhitungan (`Net Base`):**
   $$\text{Base} = (\text{Harga Satuan} \times \text{Qty}) - \text{Biaya Bahan} - \text{Biaya Lab Gigi} - (\text{Diskon Item jika ditanggung Dokter})$$
2. **Total Hak Komisi (`Total Earned`):**
   $$\text{Total Earned} = \begin{cases} \text{Base} \times \frac{\text{Persentase}}{100}, & \text{jika tipe} = \text{PERCENTAGE} \\ \text{Nominal Flat}, & \text{jika tipe} = \text{FLAT} \end{cases}$$
3. **Komisi Cair Berdasarkan Pembayaran Masuk (`Releasable Commission`):**
   Jika pasien membayar secara cicilan (misal paket Behel Rp8.000.000 baru dibayar DP Rp2.000.000 atau $25\%$), maka komisi yang siap dicairkan ke dokter adalah:
   $$\text{RasIo Bayar} = \frac{\text{Total Uang Masuk Invoice (Termasuk Deposit)}}{\text{Grand Total Invoice}}$$
   $$\text{Releasable Commission} = \text{Total Earned} \times \text{Rasio Bayar}$$

*Setiap kali ada pembayaran cicilan baru di tabel `payments`, sistem memicu fungsi rekalkulasi `releasable_commission` pada `commission_ledgers`.*

---

## 4. Arsitektur Antrean Otomasi WhatsApp CRM & Recall

Gunakan *Job Queue* (seperti **BullMQ + Redis**) untuk memproses pengiriman pesan WhatsApp secara terjadwal:

| Trigger Event | Delay / Jadwal | Isi & Tujuan Pesan WhatsApp |
| :--- | :--- | :--- |
| `APPOINTMENT_BOOKED` | Instan (0 detik) | Detail jadwal, peta Google Maps, + **Link Digital Intake Form** (isi alergi/riwayat kesehatan dari HP). |
| `REMINDER_H_MINUS_1` | 24 Jam sebelum jadwal | Konfirmasi kehadiran interaktif (*Balas 1: Hadir, Balas 2: Reschedule*). Mengubah status jadwal otomatis menjadi `CONFIRMED`. |
| `POST_OP_CARE` | H+1 pukul 09:00 pagi | Khusus tindakan cabut gigi/bedah/PSA: Menanyakan kabar pasca-tindakan + instruksi pasca-perawatan + **Link Review Google Maps**. |
| `TREATMENT_PLAN_FOLLOWUP`| `recommended_interval_days - 2` | Mengingatkan pasien bahwa jadwal kunjungan lanjutan (misal Kunjungan ke-2 PSA atau Kontrol Behel) sudah dekat. |
| `SCALING_RECALL_6M` | +180 Hari sejak Scaling | *"Halo Kak [Nama], sudah 6 bulan sejak pembersihan karang gigi terakhir bersama drg. [Nama]. Yuk klaim slot pemeriksaan rutin di sini: [Link Landing Page]"*. |
