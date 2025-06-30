# Fitur Riwayat Approval Purchase Request

## Deskripsi

Fitur ini menambahkan kemampuan untuk melacak dan menampilkan riwayat lengkap approval untuk setiap Purchase Request (PR), termasuk siapa yang mengapprove, kapan, dan komentar yang diberikan.

## Perubahan Backend

### 1. Database Migration

- **File**: `migrations/20250629170000-add-approved-at-to-approvals.js`
- **Perubahan**: Menambahkan field `approvedAt` ke tabel `approvals`
- **Tipe**: `DATETIME`
- **Keterangan**: Menyimpan timestamp kapan approval/rejection dilakukan

### 2. Model Approval

- **File**: `models/ApprovalModel.js`
- **Perubahan**: Menambahkan field `approvedAt`

```javascript
approvedAt: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'Timestamp when approval was made'
}
```

### 3. Controller Approval

- **File**: `controllers/ApprovalController.js`
- **Perubahan**:
  - Menambahkan timestamp saat approve/reject
  - Menambahkan endpoint `getApprovalHistory` untuk mendapatkan riwayat lengkap

#### Endpoint Baru

```javascript
// GET /api/approvals/:prId/history
export const getApprovalHistory = async (req, res) => {
  // Mengembalikan riwayat approval dengan detail approver
};
```

#### Perubahan pada approvePR dan rejectPR

```javascript
// Menambahkan timestamp saat approval
approval.approvedAt = new Date();
```

### 4. Routes

- **File**: `routes/ApprovalRoute.js`
- **Perubahan**: Menambahkan route untuk approval history

```javascript
router.get("/:prId/history", verifyUser, getApprovalHistory);
```

## Perubahan Frontend

### 1. Komponen ApprovalHistory

- **File**: `Frontend/src/components/ApprovalHistory.jsx`
- **Fitur**:
  - Modal untuk menampilkan riwayat approval
  - Tabel dengan informasi lengkap: status, approver, role, waktu, komentar
  - Badge untuk status dan role
  - Format waktu dalam bahasa Indonesia
  - Loading state dan error handling

### 2. PurchaseRequestTable

- **File**: `Frontend/src/components/purchase-request/PurchaseRequestTable.jsx`
- **Perubahan**:
  - Menambahkan tombol "📋" untuk melihat riwayat approval
  - Tombol hanya muncul untuk PR dengan status SUBMITTED, APPROVED, FINAL_APPROVED, atau REJECTED
  - Integrasi dengan komponen ApprovalHistory

### 3. ApprovalList

- **File**: `Frontend/src/components/approval/ApprovalList.jsx`
- **Perubahan**:
  - Menambahkan tombol "📋" untuk melihat riwayat approval
  - Integrasi dengan komponen ApprovalHistory

## Format Tampilan Riwayat

### Informasi yang Ditampilkan

1. **No** - Urutan approval
2. **Status** - PENDING, APPROVED, REJECTED dengan badge berwarna
3. **Approver** - Nama dan email user yang mengapprove
4. **Role** - Role approver (Staff, Manager, Head Dept, Admin) dengan badge
5. **Waktu Approval** - Format: "29 Juni 2025, 16:30:45"
6. **Komentar** - Komentar yang diberikan saat approval/rejection

### Badge Status

- ⏰ **Pending** - Kuning
- ✅ **Approved** - Hijau
- ❌ **Rejected** - Merah

### Badge Role

- 👤 **Staff** - Biru
- 👔 **Manager** - Kuning
- 🎯 **Head Dept** - Merah
- ⚙️ **Admin** - Hitam

## Cara Penggunaan

### 1. Melihat Riwayat dari Purchase Request Table

1. Buka halaman Purchase Request
2. Cari PR yang sudah disubmit
3. Klik tombol "📋" di kolom Aksi
4. Modal riwayat approval akan muncul

### 2. Melihat Riwayat dari Approval List

1. Buka halaman Approval
2. Cari PR yang perlu diapprove
3. Klik tombol "📋" di kolom Aksi
4. Modal riwayat approval akan muncul

## Contoh Output

### Response API `/api/approvals/:prId/history`

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
  },
  {
    "id": 2,
    "status": "APPROVED",
    "comment": "Final approval diberikan",
    "approvedAt": "2025-06-29T17:15:30.000Z",
    "approver": {
      "name": "Jane Smith",
      "role": "head_department",
      "email": "jane.smith@company.com"
    },
    "level": "L2"
  }
]
```

### Tampilan Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                    Riwayat Approval PR                      │
├─────────────────────────────────────────────────────────────┤
│ No │ Status  │ Approver      │ Role     │ Waktu Approval    │
├────┼─────────┼───────────────┼──────────┼───────────────────┤
│ 1  │ ✅Approved│ John Doe      │ 👔Manager│ 29 Juni 2025,    │
│    │         │ john@company  │          │ 16:30:45          │
├────┼─────────┼───────────────┼──────────┼───────────────────┤
│ 2  │ ✅Approved│ Jane Smith    │ 🎯Head   │ 29 Juni 2025,    │
│    │         │ jane@company  │ Dept     │ 17:15:30          │
└─────────────────────────────────────────────────────────────┘
```

## Manfaat Fitur

1. **Transparansi** - Semua user bisa melihat siapa yang mengapprove dan kapan
2. **Audit Trail** - Meningkatkan akuntabilitas dalam proses approval
3. **Tracking** - Memudahkan tracking progress approval
4. **Komunikasi** - Komentar approval membantu komunikasi antar level
5. **Monitoring** - Admin bisa memantau efisiensi proses approval

## Teknis Implementasi

### Database

- Field `approvedAt` disimpan sebagai `DATETIME`
- Null untuk approval yang masih PENDING
- Timestamp disimpan dalam format UTC

### API

- Endpoint menggunakan authentication
- Response diurutkan berdasarkan waktu approval (ASC)
- Include relasi dengan tabel Users untuk data approver

### Frontend

- Modal responsive dengan Bulma CSS
- Loading state dan error handling
- Format waktu lokal Indonesia
- Badge dengan emoji untuk UX yang lebih baik

## Testing

### Manual Testing

1. Buat PR baru
2. Submit PR
3. Approve oleh manager
4. Approve oleh head department
5. Cek riwayat approval di kedua halaman

### Automated Testing

- Test endpoint `/api/approvals/:prId/history`
- Test komponen ApprovalHistory
- Test integrasi dengan PurchaseRequestTable dan ApprovalList
