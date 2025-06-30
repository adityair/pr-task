# 🧪 Panduan Testing Approval Flow

## 📋 Prerequisites

Sebelum menjalankan test, pastikan:

1. **Database sudah ter-setup** dan berjalan
2. **Dependencies sudah diinstall**: `npm install`
3. **Konfigurasi database** sudah benar di `config/Database.js`

## 🚀 Cara Menjalankan Test

### **Opsi 1: Menggunakan npm script (Recommended)**

```bash
# Masuk ke direktori Backend
cd Backend

# Jalankan test
npm test

# Atau
npm run test:approval
```

### **Opsi 2: Langsung dengan Node.js**

```bash
# Masuk ke direktori Backend
cd Backend

# Jalankan test file langsung
node test/approvalFlow.test.js
```

### **Opsi 3: Import dan jalankan dari file lain**

```javascript
import { runTests } from "./test/approvalFlow.test.js";

// Jalankan test
await runTests();
```

## 📊 Apa yang Di-Test

Test ini akan memvalidasi:

### 1. **Flow Approval (`getNextApprover`)**

- ✅ Staff → Manager (dari departemen yang sama)
- ✅ Manager → Head Department (dari departemen yang sama)
- ✅ Head Department → Head Department Finance
- ✅ Head Department Finance → Langsung FINAL APPROVED

### 2. **Permission Approval (`canApprovePR`)**

- ✅ Head Department (selain Finance) tidak bisa approve PR sendiri
- ✅ Head Department Finance bisa approve PR sendiri
- ✅ Head Department bisa approve PR dari role lain

### 3. **Final Approval (`isFinalApproval`)**

- ✅ Hanya Head Department Finance yang bisa final approval
- ✅ Role lain bukan final approver

## 🔧 Setup Test Data

Test akan otomatis membuat data test:

### **Departemen yang Dibuat:**

- IT
- Finance
- HR

### **Users yang Dibuat:**

- Staff IT (`staff.it@test.com`)
- Manager IT (`manager.it@test.com`)
- Head IT (`head.it@test.com`)
- Head Finance (`head.finance@test.com`)

## 🧹 Cleanup

Test akan otomatis membersihkan data test setelah selesai:

- Menghapus approval yang dibuat
- Menghapus PR yang dibuat
- Menghapus users test
- Menghapus departments test (jika tidak ada user lain)

## 📝 Output Test

Contoh output yang diharapkan:

```
🚀 Starting Approval Flow Tests...

🔄 Setting up test data...
✅ Test data setup completed

🧪 Testing getNextApprover function...
✅ Staff IT → Next approver: Manager IT
✅ Manager IT → Next approver: Head IT
✅ Head IT → Next approver: Head Finance
✅ Head Finance → Next approver: None (FINAL APPROVED)

🧪 Testing canApprovePR function...
✅ Head IT approve PR sendiri: TIDAK BISA (Expected: TIDAK BISA)
✅ Head Finance approve PR sendiri: BISA (Expected: BISA)
✅ Head IT approve PR staff: BISA (Expected: BISA)

🧪 Testing isFinalApproval function...
✅ Head Finance is final approver: true (Expected: true)
✅ Head IT is final approver: false (Expected: false)
✅ Manager IT is final approver: false (Expected: false)

🎉 All tests completed successfully!

📋 Test Summary:
✅ getNextApprover - Flow approval berjalan sesuai hierarki
✅ canApprovePR - Validasi permission approval berfungsi
✅ isFinalApproval - Hanya Head Finance yang bisa final approval

🧹 Cleaning up test data...
✅ Test data cleanup completed
🔌 Database connection closed
```

## ⚠️ Troubleshooting

### **Error: "Departemen Finance tidak ditemukan"**

- Pastikan departemen Finance sudah ada di database
- Test akan otomatis membuat departemen Finance jika belum ada

### **Error: "Database connection failed"**

- Cek konfigurasi database di `config/Database.js`
- Pastikan database server berjalan

### **Error: "Module not found"**

- Jalankan `npm install` untuk install dependencies
- Pastikan menggunakan Node.js versi 14+ (untuk ES modules)

## 🔄 Manual Testing

Jika ingin test manual melalui API:

### **1. Setup Data Manual**

```sql
-- Buat departemen Finance
INSERT INTO departments (name) VALUES ('Finance');

-- Buat user Head Finance
INSERT INTO users (name, email, password, role, departmentId)
VALUES ('Head Finance', 'head.finance@test.com', 'password123', 'head_department', 2);
```

### **2. Test via API Endpoints**

```bash
# Login sebagai Head Finance
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"head.finance@test.com","password":"password123"}'

# Submit PR sebagai Head Finance
curl -X POST http://localhost:5000/api/purchase-requests/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"id": 1}'
```

## 📚 Referensi

- [Dokumentasi Flow Approval](./APPROVAL_FLOW.md)
- [Helper Functions](./utils/approvalHelper.js)
- [Controller Purchase Request](./controllers/PurchaseRequestController.js)
- [Controller Approval](./controllers/ApprovalController.js)
