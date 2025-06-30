# Panduan Lengkap Fitur Riwayat Approval

## Deskripsi

Fitur riwayat approval memungkinkan user untuk melihat siapa yang mengapprove Purchase Request (PR), kapan approval dilakukan, dan komentar yang diberikan. Fitur ini memberikan transparansi penuh dalam proses approval.

## Setup Database

### 1. Jalankan Migration

```bash
cd Backend
npx sequelize-cli db:migrate
```

Migration akan menambahkan field `approvedAt` ke tabel `approvals`.

### 2. Pastikan Database Terhubung

Pastikan database MySQL berjalan dan konfigurasi di `config/config.json` sudah benar.

## API Endpoints

### 1. Get Approval History

```
GET /api/approvals/:prId/history
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": 1,
    "status": "APPROVED",
    "comment": "Disetujui, barang diperlukan untuk project",
    "approvedAt": "2025-06-29T16:30:45.000Z",
    "approver": {
      "name": "John Doe",
      "role": "manager",
      "email": "john.doe@company.com"
    },
    "level": "L1"
  }
]
```

## Frontend Components

### 1. ApprovalHistory Component

**File:** `Frontend/src/components/ApprovalHistory.jsx`

**Props:**

- `prId` - ID Purchase Request
- `isVisible` - Boolean untuk menampilkan/menyembunyikan modal
- `onClose` - Function untuk menutup modal

**Fitur:**

- Modal responsive
- Tabel riwayat approval
- Badge status dan role
- Format waktu Indonesia
- Loading state

### 2. Integrasi dengan PurchaseRequestTable

**File:** `Frontend/src/components/purchase-request/PurchaseRequestTable.jsx`

**Tombol Riwayat Approval:**

- Muncul untuk PR dengan status: SUBMITTED, APPROVED, FINAL_APPROVED, REJECTED
- Icon: 📋
- Tooltip: "Lihat riwayat approval"

### 3. Integrasi dengan ApprovalList

**File:** `Frontend/src/components/approval/ApprovalList.jsx`

**Tombol Riwayat Approval:**

- Muncul untuk semua PR di approval list
- Icon: 📋
- Tooltip: "Lihat riwayat approval"

## Cara Penggunaan

### 1. Melihat Riwayat dari Purchase Request Table

1. **Login sebagai user yang memiliki akses ke PR**
2. **Buka halaman Purchase Request**
3. **Cari PR yang sudah disubmit**
4. **Klik tombol "📋" di kolom Aksi**
5. **Modal riwayat approval akan muncul**

**Contoh Flow:**

```
Staff → Submit PR → Manager → Approve → Head Dept → Approve → Head Finance → Final Approve
```

**Riwayat yang Ditampilkan:**

```
1. ✅ Approved - by John Manager - 29 Juni 2025, 16:30:45
   Comment: "Disetujui, barang diperlukan untuk project"

2. ✅ Approved - by Jane HeadDept - 29 Juni 2025, 17:15:30
   Comment: "Disetujui oleh head department"

3. ✅ Final Approved - by Bob Finance - 29 Juni 2025, 18:00:00
   Comment: "Final approval diberikan, PO dibuat"
```

### 2. Melihat Riwayat dari Approval List

1. **Login sebagai approver (manager/head department)**
2. **Buka halaman Approval**
3. **Cari PR yang perlu diapprove**
4. **Klik tombol "📋" di kolom Aksi**
5. **Modal riwayat approval akan muncul**

### 3. Informasi yang Ditampilkan

**Tabel Riwayat:**
| No | Status | Approver | Role | Waktu Approval | Komentar |
|----|--------|----------|------|----------------|----------|
| 1 | ✅Approved | John Doe | 👔Manager | 29 Juni 2025, 16:30:45 | Disetujui |
| 2 | ✅Approved | Jane Smith | 🎯Head Dept | 29 Juni 2025, 17:15:30 | Disetujui |

**Badge Status:**

- ⏰ **Pending** - Kuning (masih menunggu approval)
- ✅ **Approved** - Hijau (sudah diapprove)
- ❌ **Rejected** - Merah (ditolak)

**Badge Role:**

- 👤 **Staff** - Biru
- 👔 **Manager** - Kuning
- 🎯 **Head Dept** - Merah
- ⚙️ **Admin** - Hitam

## Testing

### 1. Manual Testing

**Setup Test Data:**

1. Buat user dengan role berbeda:
   - Staff: `staff@test.com`
   - Manager: `manager@test.com`
   - Head Department: `headdept@test.com`
   - Head Finance: `headfinance@test.com`

**Test Flow:**

1. **Staff login dan buat PR**
2. **Staff submit PR**
3. **Manager login dan approve PR**
4. **Head Department login dan approve PR**
5. **Head Finance login dan final approve PR**
6. **Cek riwayat approval di semua halaman**

### 2. Automated Testing

**Jalankan Test:**

```bash
cd Backend
node test/approvalHistory.test.js
```

**Test yang Dilakukan:**

- Login semua user
- Buat dan submit PR
- Approve oleh setiap level
- Get approval history
- Validate response format
- Test error cases

### 3. API Testing dengan Postman

**Request:**

```
GET http://localhost:5000/api/approvals/1/history
Headers:
  Authorization: Bearer <token>
```

**Expected Response:**

```json
[
  {
    "id": 1,
    "status": "APPROVED",
    "comment": "Test approval",
    "approvedAt": "2025-06-29T16:30:45.000Z",
    "approver": {
      "name": "Test Manager",
      "role": "manager",
      "email": "manager@test.com"
    },
    "level": "L1"
  }
]
```

## Troubleshooting

### 1. Migration Error

**Error:** "Unknown database 'purchase_request_db'"
**Solution:** Buat database terlebih dahulu

```sql
CREATE DATABASE purchase_request_db;
```

### 2. API Error 404

**Error:** "Not Found" saat get approval history
**Solution:** Pastikan PR ID valid dan user memiliki akses

### 3. API Error 401

**Error:** "Unauthorized"
**Solution:** Pastikan token valid dan tidak expired

### 4. Frontend Error

**Error:** "Failed to fetch approval history"
**Solution:**

- Cek koneksi backend
- Cek environment variable `REACT_APP_API_URL`
- Cek token di localStorage

### 5. Modal Tidak Muncul

**Error:** Modal riwayat approval tidak muncul
**Solution:**

- Cek console browser untuk error
- Pastikan komponen ApprovalHistory diimport dengan benar
- Pastikan props `isVisible` dan `prId` dikirim dengan benar

## Best Practices

### 1. Performance

- Riwayat approval di-cache untuk PR yang sering diakses
- Pagination untuk PR dengan riwayat approval yang panjang
- Lazy loading untuk modal riwayat

### 2. Security

- Validasi user memiliki akses ke PR
- Sanitasi input komentar
- Rate limiting untuk API calls

### 3. UX/UI

- Loading state saat fetch data
- Error handling yang informatif
- Responsive design untuk mobile
- Keyboard navigation untuk modal

### 4. Data Integrity

- Timestamp disimpan dalam UTC
- Validasi data sebelum save
- Backup riwayat approval

## Monitoring dan Analytics

### 1. Metrics yang Bisa Dimonitor

- Jumlah approval per hari/minggu/bulan
- Rata-rata waktu approval per level
- Approval rate (approved vs rejected)
- User yang paling sering approve/reject

### 2. Logs

- Log setiap approval action
- Log error saat get approval history
- Log performance metrics

### 3. Alerts

- Alert jika approval terlalu lama
- Alert jika ada error berulang
- Alert untuk suspicious activity

## Future Enhancements

### 1. Fitur yang Bisa Ditambahkan

- Export riwayat approval ke PDF/Excel
- Filter riwayat berdasarkan tanggal/status/approver
- Search dalam riwayat approval
- Email notification untuk setiap approval
- Dashboard analytics untuk approval metrics

### 2. Integrasi

- Integrasi dengan sistem HR untuk data approver
- Integrasi dengan sistem accounting untuk PO
- Integrasi dengan sistem notification

### 3. Mobile App

- Mobile app untuk approval on-the-go
- Push notification untuk approval pending
- Offline capability untuk review approval

## Kesimpulan

Fitur riwayat approval memberikan transparansi penuh dalam proses approval Purchase Request. Dengan fitur ini, semua stakeholder dapat melacak siapa yang mengapprove, kapan, dan mengapa approval diberikan atau ditolak.

Fitur ini meningkatkan akuntabilitas, memudahkan tracking, dan membantu komunikasi antar level dalam organisasi. Implementasi yang sudah dilakukan sudah mencakup semua aspek teknis dan fungsional yang diperlukan.
