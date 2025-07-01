# Aplikasi Purchase Request & Purchase Order

Aplikasi web untuk mengelola Purchase Request (PR) dengan sistem approval multi-level dan Purchase Order (PO) dengan checklist item untuk staff purchasing.

## 🚀 Fitur Utama

### Purchase Request (PR)

- ✅ **Master Detail**: Header PR dengan detail item barang/jasa
- ✅ **Approval Multi Level**: Staff → Manager → Head Department → Head Department Finance
- ✅ **CRUD Operations**: Create, Read, Update, Delete untuk header dan detail
- ✅ **Validasi**: Multiple validasi input dan business rules
- ✅ **Status Tracking**: DRAFT → SUBMITTED → APPROVED → FINAL_APPROVED → COMPLETED

### Purchase Order (PO)

- ✅ **Otomatis Generate**: PO dibuat otomatis saat PR FINAL_APPROVED
- ✅ **Assignment System**: Head Dept Purchasing assign PO ke staff
- ✅ **Item Checklist**: Staff bisa checklist item yang sudah dibeli
- ✅ **Progress Tracking**: OPEN → ASSIGNED → COMPLETED → CLOSED

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/adityair/pr-task.git
cd pr-task
```

### 2. Backend Setup

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
npm install

# Jalankan server dengan nodemon
nodemon index
```

**Backend akan berjalan di:** `http://localhost:5000`

### 3. Frontend Setup

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Jalankan aplikasi
npm start
```

**Frontend akan berjalan di:** `http://localhost:3000`

## 🔐 Login Default

Semua user menggunakan password: **123456**

| Role             | Email                        |
| ---------------- | ---------------------------- |
| Admin            | admin@example.com            |
| Staff IT         | staff_it@example.com         |
| Manager IT       | manager_it@example.com       |
| Head IT          | head_it@example.com          |
| Head Finance     | head_finance@example.com     |
| Head Purchasing  | head_purchasing@example.com  |
| Staff Purchasing | staff_purchasing@example.com |

## 📱 Cara Penggunaan

### 1. Purchase Request (PR)

#### **Staff/Manager/Head Dept:**

1. Login ke aplikasi
2. Menu: **Purchase Request**
3. Klik **"Tambah Purchase Request"**
4. Isi form header dan tambah item barang/jasa
5. Klik **"Submit"** untuk kirim ke approval

#### **Approver (Manager/Head Dept/Head Finance):**

1. Menu: **PR Approval**
2. Lihat daftar PR yang menunggu approval
3. Klik **"Approve"** atau **"Reject"**
4. PR akan otomatis lanjut ke level berikutnya

### 2. Purchase Order (PO)

#### **Head Dept Purchasing:**

1. Menu: **Purchase Order**
2. Lihat daftar PO dengan status **OPEN**
3. Klik **"Assign ke Staff"** untuk assign ke staff purchasing
4. Lihat daftar PO **COMPLETED** untuk approve/close

#### **Staff Purchasing:**

1. Menu: **Purchase Order**
2. Lihat daftar PO yang di-assign ke dirinya
3. Klik **"Detail & Checklist"**
4. Checklist item yang sudah dibeli
5. Klik **"Laporkan Selesai"** jika semua item sudah dibeli

## 📁 Struktur Project

```
pr-task/
├── backend/
│   ├── config/
│   │   ├── Database.js
│   │   └── config.json
│   ├── controllers/
│   │   ├── ApprovalController.js
│   │   ├── PurchaseOrderController.js
│   │   ├── PurchaseOrderItemController.js
│   │   └── PurchaseRequestController.js
│   ├── models/
│   │   ├── ApprovalModel.js
│   │   ├── PurchaseOrderModel.js
│   │   ├── PurchaseOrderItemModel.js
│   │   └── PurchaseRequestModel.js
│   ├── routes/
│   │   ├── ApprovalRoute.js
│   │   └── PurchaseOrderRoute.js
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── purchase-order/
│   │   │   └── purchase-request/
│   │   └── pages/
│   └── package.json
└── README.md
```
