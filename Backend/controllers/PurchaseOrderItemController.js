import PurchaseOrderItem from "../models/PurchaseOrderItemModel.js";
import PurchaseOrder from "../models/PurchaseOrderModel.js";
import Users from "../models/UserModel.js";
import PurchaseRequest from "../models/PurchaseRequestModel.js";
import PurchaseRequestItem from "../models/PurchaseRequestItemModel.js";

// Ambil semua item untuk 1 PO
export const getItemsByPO = async (req, res) => {
  const { poId } = req.params;
  try {
    const items = await PurchaseOrderItem.findAll({ where: { poId } });

    // Jika tidak ada item, coba copy dari PR
    if (items.length === 0) {
      const po = await PurchaseOrder.findByPk(poId);
      if (po) {
        const prItems = await PurchaseRequestItem.findAll({
          where: { prId: po.prId },
        });
        if (prItems.length > 0) {
          const poItems = prItems.map((item) => ({
            poId: po.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit: item.unit,
            note: item.note,
            status: "PENDING",
          }));
          await PurchaseOrderItem.bulkCreate(poItems);

          // Ambil item yang baru dibuat
          const newItems = await PurchaseOrderItem.findAll({ where: { poId } });
          return res.status(200).json(newItems);
        }
      }
    }

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Checklist item sudah dibeli
export const checkItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const item = await PurchaseOrderItem.findByPk(itemId);
    if (!item) return res.status(404).json({ msg: "Item tidak ditemukan" });
    await item.update({ status: "BOUGHT" });
    res.status(200).json({ msg: "Item sudah dichecklist sebagai dibeli" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Staff melaporkan PO sudah selesai ke Head Dept
export const completePO = async (req, res) => {
  const { poId } = req.params;
  try {
    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ msg: "PO tidak ditemukan" });
    // Cek semua item sudah BOUGHT
    const items = await PurchaseOrderItem.findAll({ where: { poId } });
    const allBought = items.every((item) => item.status === "BOUGHT");
    if (!allBought)
      return res.status(400).json({ msg: "Masih ada item yang belum dibeli" });
    await po.update({ status: "COMPLETED" });
    // Update status PR juga
    const pr = await PurchaseRequest.findByPk(po.prId);
    if (pr) {
      await pr.update({ status: "COMPLETED" });
    }
    res.status(200).json({
      msg: "PO sudah dilaporkan selesai ke Head Dept dan status PR sudah COMPLETED",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
