# Flow Approval Purchase Request (PR)

## Aturan Umum

1. **Semua roles bisa membuat PR**: Staff, Manager, Head Department
2. **Head Department tidak bisa approve PR sendiri** (kecuali Head Department Finance)
3. **Hanya Head Department Finance yang bisa melakukan FINAL APPROVAL**

## Flow Approval Berdasarkan Role Pembuat PR

### 1. Staff membuat PR

```
Staff → Manager (dari departemen yang sama) → Head Department (dari departemen yang sama) → Head Department Finance → FINAL APPROVED
```

### 2. Manager membuat PR

```
Manager → Head Department (dari departemen yang sama) → Head Department Finance → FINAL APPROVED
```

### 3. Head Department (selain Finance) membuat PR

```
Head Department → Head Department Finance → FINAL APPROVED
```

### 4. Head Department Finance membuat PR

```
Head Department Finance → Langsung FINAL APPROVED (bisa approve sendiri)
```

## Validasi yang Diterapkan

### 1. Submit Purchase Request (`submitPurchaseRequest`)

- **Staff**: Approval ke Manager dari departemen yang sama
- **Manager**: Approval ke Head Department dari departemen yang sama
- **Head Department (selain Finance)**: Approval ke Head Department Finance
- **Head Department Finance**: Langsung FINAL APPROVED

### 2. Approve Purchase Request (`approvePR`)

- **Validasi**: Head Department (selain Finance) tidak bisa approve PR yang dibuat oleh dirinya sendiri
- **Manager**: Setelah approve, buat approval untuk Head Department dari departemen yang sama
- **Head Department (selain Finance)**: Setelah approve, buat approval untuk Head Department Finance
- **Head Department Finance**: Setelah approve, PR menjadi FINAL APPROVED dan PO otomatis dibuat

## Status PR

- `DRAFT`: PR baru dibuat, belum disubmit
- `SUBMITTED`: PR sudah disubmit, menunggu approval
- `APPROVED`: PR sudah diapprove (tapi belum final)
- `FINAL_APPROVED`: PR sudah diapprove oleh Head Department Finance
- `REJECTED`: PR ditolak

## Status Approval

- `PENDING`: Menunggu approval
- `APPROVED`: Sudah diapprove
- `REJECTED`: Ditolak

## Pembuatan Purchase Order (PO)

- PO otomatis dibuat ketika PR mencapai status `FINAL_APPROVED`
- Nomor PO format: `PO-[department_id]-[sequence]`
- Status PO: `OPEN`

## Contoh Flow Lengkap

### Scenario 1: Staff IT membuat PR

1. Staff IT membuat PR → Status: `DRAFT`
2. Staff IT submit PR → Status: `SUBMITTED`, Approval dibuat untuk Manager IT
3. Manager IT approve → Status: `APPROVED`, Approval dibuat untuk Head Department IT
4. Head Department IT approve → Status: `APPROVED`, Approval dibuat untuk Head Department Finance
5. Head Department Finance approve → Status: `FINAL_APPROVED`, PO otomatis dibuat

### Scenario 2: Head Department IT membuat PR

1. Head Department IT membuat PR → Status: `DRAFT`
2. Head Department IT submit PR → Status: `SUBMITTED`, Approval dibuat untuk Head Department Finance
3. Head Department Finance approve → Status: `FINAL_APPROVED`, PO otomatis dibuat

### Scenario 3: Head Department Finance membuat PR

1. Head Department Finance membuat PR → Status: `DRAFT`
2. Head Department Finance submit PR → Status: `FINAL_APPROVED`, PO otomatis dibuat

## Error Handling

- Jika Head Department (selain Finance) mencoba approve PR yang dibuat oleh dirinya sendiri → Error 403
- Jika departemen Finance tidak ditemukan → Error 404
- Jika approver tidak ditemukan → Error 404
- Jika PR sudah diproses → Error 400/403
