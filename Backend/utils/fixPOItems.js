import PurchaseOrder from "../models/PurchaseOrderModel.js";
import PurchaseOrderItem from "../models/PurchaseOrderItemModel.js";
import PurchaseRequestItem from "../models/PurchaseRequestItemModel.js";
import db from "../config/Database.js";

// Script untuk memperbaiki PO yang sudah ada tapi belum memiliki item
const fixPOItems = async () => {
  try {
    console.log("Memulai perbaikan item PO...");

    // Test koneksi database
    await db.authenticate();
    console.log("Koneksi database berhasil");

    // Ambil semua PO
    const pos = await PurchaseOrder.findAll();
    console.log(`Ditemukan ${pos.length} PO`);

    for (const po of pos) {
      console.log(`Memeriksa PO ${po.id} (${po.po_number})`);

      // Cek apakah PO sudah memiliki item
      const existingItems = await PurchaseOrderItem.findAll({
        where: { poId: po.id },
      });

      if (existingItems.length === 0) {
        console.log(
          `PO ${po.id} (${po.po_number}) tidak memiliki item, menambahkan...`
        );

        // Ambil item dari PR
        const prItems = await PurchaseRequestItem.findAll({
          where: { prId: po.prId },
        });

        console.log(`Ditemukan ${prItems.length} item di PR ${po.prId}`);

        if (prItems.length > 0) {
          // Copy item dari PR ke PO
          const poItems = prItems.map((item) => ({
            poId: po.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit: item.unit,
            note: item.note,
            status: "PENDING",
          }));

          await PurchaseOrderItem.bulkCreate(poItems);
          console.log(
            `Berhasil menambahkan ${poItems.length} item ke PO ${po.id}`
          );
        } else {
          console.log(`PR ${po.prId} tidak memiliki item`);
        }
      } else {
        console.log(`PO ${po.id} sudah memiliki ${existingItems.length} item`);
      }
    }

    console.log("Perbaikan item PO selesai!");
  } catch (error) {
    console.error("Error saat memperbaiki item PO:", error);
  } finally {
    await db.close();
    console.log("Koneksi database ditutup");
  }
};

// Jalankan script
console.log("Menjalankan script fixPOItems...");
fixPOItems();

export default fixPOItems;
