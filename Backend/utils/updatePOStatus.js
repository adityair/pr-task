import db from "../config/Database.js";

// Script untuk mengupdate enum status PO
const updatePOStatus = async () => {
  try {
    console.log("Memulai update status PO...");

    // Test koneksi database
    await db.authenticate();
    console.log("Koneksi database berhasil");

    // Update enum status di database
    await db.query(`
      ALTER TABLE purchase_orders 
      MODIFY COLUMN status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED') 
      DEFAULT 'OPEN' NOT NULL;
    `);

    console.log("Status PO berhasil diupdate dengan menambahkan CLOSED");
  } catch (error) {
    console.error("Error saat update status PO:", error);
  } finally {
    await db.close();
    console.log("Koneksi database ditutup");
  }
};

// Jalankan script
console.log("Menjalankan script updatePOStatus...");
updatePOStatus();
