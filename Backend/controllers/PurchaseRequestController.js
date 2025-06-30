import PurchaseRequest from "../models/PurchaseRequestModel.js";
import PurchaseRequestItem from "../models/PurchaseRequestItemModel.js";
import Users from "../models/UserModel.js";
import Departments from "../models/DepartmentModel.js";
import { Op } from "sequelize";
import Approval from "../models/ApprovalModel.js";
import PurchaseOrder from "../models/PurchaseOrderModel.js";

// Fungsi untuk generate nomor PR
const generatePRNumber = async (departmentId) => {
  // Cari PR terakhir dengan id departemen yang sama
  const lastPR = await PurchaseRequest.findOne({
    where: {
      pr_number: {
        [Op.like]: `PR-${departmentId}-%`,
      },
    },
    order: [["pr_number", "DESC"]],
  });

  let sequence = 1;
  if (lastPR) {
    // Ambil nomor urut dari PR terakhir
    const lastNumber = lastPR.pr_number.split("-")[2];
    sequence = parseInt(lastNumber) + 1;
  }

  // Format: PR-[id departemen]-[nomer urut 5 digit]
  return `PR-${departmentId}-${sequence.toString().padStart(5, "0")}`;
};

// Generate nomor PR untuk form add
export const generatePRNumberForForm = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { uuid: req.userId } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const prNumber = await generatePRNumber(user.departmentId);
    res.status(200).json({ pr_number: prNumber });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getPurchaseRequestsList = async (req, res) => {
  try {
    const purchaseRequests = await PurchaseRequest.findAll({
      where: {
        userId: req.userId, // hanya PR milik user yang sedang login
      },
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["name", "email"],
        },
        {
          model: Departments,
          as: "Department",
          attributes: ["name"],
        },
        {
          model: PurchaseRequestItem,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(purchaseRequests);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getPurchaseRequestsData = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseRequest = await PurchaseRequest.findOne({
      where: { id: id },
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["name", "email"],
        },
        {
          model: Departments,
          as: "Department",
          attributes: ["name"],
        },
        {
          model: PurchaseRequestItem,
          as: "purchase_request_items",
        },
      ],
    });

    if (!purchaseRequest) {
      return res.status(404).json({ msg: "Purchase Request tidak ditemukan" });
    }

    res.status(200).json(purchaseRequest);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getPurchaseRequestsDetailList = async (req, res) => {
  try {
    const purchaseRequests = await PurchaseRequest.findAll();

    const purchaseRequestItems = await PurchaseRequestItem.findAll({
      where: {
        prId: {
          [Op.in]: purchaseRequests.map(
            (purchaseRequest) => purchaseRequest.id
          ),
        },
      },
    });

    const purchaseRequestsWithItems = purchaseRequests.map(
      (purchaseRequest) => {
        const items = purchaseRequestItems.filter(
          (item) => item.prId === purchaseRequest.id
        );
        return { ...purchaseRequest, items };
      }
    );

    res.status(200).json(purchaseRequestsWithItems);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createPurchaseRequest = async (req, res) => {
  const { name, description, items, userId } = req.body;

  // Validasi: tidak boleh kosong
  if (!name || !name.trim()) {
    return res.status(400).json({ msg: "Nama purchase request harus diisi" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ msg: "Item tidak boleh kosong" });
  }

  // Validasi setiap item
  for (const item of items) {
    if (!item.item_name || !item.item_type) {
      return res.status(400).json({ msg: "Item tidak valid" });
    }
    if (!["BARANG", "JASA"].includes(item.item_type)) {
      return res.status(400).json({ msg: "Tipe item harus BARANG atau JASA" });
    }
    if (item.item_type === "BARANG") {
      if (!item.unit || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          msg: "Barang: quantity dan unit wajib diisi dan quantity > 0",
        });
      }
    }
    if (item.item_type === "JASA") {
      if (!item.note || !item.note.trim()) {
        return res.status(400).json({ msg: "Jasa: note wajib diisi" });
      }
    }
  }

  try {
    // Ambil user yang login
    const user = await Users.findOne({ where: { uuid: userId } });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    // Ambil departemen untuk kode departemen
    const department = await Departments.findByPk(user.departmentId);
    if (!department)
      return res.status(404).json({ msg: "Departemen tidak ditemukan" });

    // Generate nomor PR
    const prNumber = await generatePRNumber(user.departmentId);

    // Simpan PR (status default: DRAFT)
    const pr = await PurchaseRequest.create({
      pr_number: prNumber,
      name: name.trim(),
      description: description?.trim() || null,
      userId: user.uuid,
      departmentId: user.departmentId,
      status: "DRAFT",
    });

    // Simpan semua item
    const prItems = items.map((item) => ({
      ...item,
      prId: pr.id,
    }));
    await PurchaseRequestItem.bulkCreate(prItems);

    res.status(201).json({ msg: "Purchase Request berhasil dibuat", pr });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const submitPurchaseRequest = async (req, res) => {
  const { id } = req.body;
  try {
    const pr = await PurchaseRequest.findOne({
      where: { id: id },
      include: [
        {
          model: Users,
          as: "User",
        },
        {
          model: Departments,
          as: "Department",
          attributes: ["name"],
        },
      ],
    });

    if (!pr) return res.status(404).json({ msg: "PR tidak ditemukan" });
    if (pr.status !== "DRAFT")
      return res.status(400).json({ msg: "PR bukan status DRAFT" });

    // Ambil user pembuat PR
    const user = await Users.findOne({ where: { uuid: pr.userId } });
    if (!user)
      return res.status(404).json({ msg: "User pembuat PR tidak ditemukan" });

    // Ambil departemen finance untuk validasi
    const financeDept = await Departments.findOne({
      where: { name: "Finance" },
    });
    if (!financeDept)
      return res
        .status(404)
        .json({ msg: "Departemen Finance tidak ditemukan" });

    let approver = null;

    if (user.role === "staff") {
      // Staff → Manager dari departemen yang sama
      approver = await Users.findOne({
        where: { role: "manager", departmentId: user.departmentId },
      });
    } else if (user.role === "manager") {
      // Manager → Head Department dari departemen yang sama
      approver = await Users.findOne({
        where: { role: "head_department", departmentId: user.departmentId },
      });
    } else if (user.role === "head_department") {
      // Head Department → Cek apakah ini head department finance
      if (user.departmentId === financeDept.id) {
        // Head Department Finance bisa approve sendiri (FINAL APPROVAL)
        await pr.update({ status: "FINAL_APPROVED" });
        return res.status(200).json({
          msg: "PR berhasil disubmit dan langsung FINAL APPROVED (Head Department Finance)",
        });
      } else {
        // Head Department selain finance → Head Department Finance
        approver = await Users.findOne({
          where: { role: "head_department", departmentId: financeDept.id },
        });
      }
    }

    if (!approver)
      return res.status(404).json({ msg: "Approver tidak ditemukan" });

    // Hapus approval lama jika ada (jaga-jaga)
    await Approval.destroy({ where: { prId: pr.id } });

    // Buat approval baru
    await Approval.create({
      prId: pr.id,
      approverId: approver.uuid,
      level: "APPROVAL",
      status: "PENDING",
    });

    // Ubah status PR
    await pr.update({ status: "SUBMITTED" });

    res.status(200).json({ msg: "PR berhasil disubmit untuk approval" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const approvePurchaseRequest = async (req, res) => {
  const { id } = req.params; // prId
  const { comment } = req.body;

  try {
    const approval = await Approval.findOne({
      where: { prId: id, approverId: req.userId },
    });

    if (!approval)
      return res
        .status(403)
        .json({ msg: "Anda tidak memiliki akses untuk approve PR ini" });

    if (approval.status !== "PENDING")
      return res.status(400).json({ msg: "Approval sudah diproses" });

    approval.status = "APPROVED";
    approval.comment = comment;
    await approval.save();

    const pr = await PurchaseRequest.findByPk(id);

    // LOGIKA PER LEVEL
    if (approval.level === "L1") {
      await pr.update({ status: "APPROVED_L1" });
    }

    if (approval.level === "L2") {
      const allL2 = await Approval.findAll({
        where: { prId: id, level: "L2" },
      });
      const allApproved = allL2.every((a) => a.status === "APPROVED");

      if (allApproved) {
        await pr.update({ status: "APPROVED_L2" });
      }
    }

    if (approval.level === "L3") {
      await pr.update({ status: "FINAL_APPROVED" });
      // Buat PO otomatis jika sudah FINAL_APPROVED
      // Gunakan nomor PO format: PO-[department_id]-[sequence]
      const lastPO = await PurchaseOrder.findOne({
        where: {
          po_number: {
            [Op.like]: `PO-${pr.departmentId}-%`,
          },
        },
        order: [["po_number", "DESC"]],
      });
      let sequence = 1;
      if (lastPO) {
        const lastNumber = lastPO.po_number.split("-")[2];
        sequence = parseInt(lastNumber) + 1;
      }
      const poNumber = `PO-${pr.departmentId}-${sequence
        .toString()
        .padStart(5, "0")}`;
      await PurchaseOrder.create({
        po_number: poNumber,
        prId: pr.id,
        status: "OPEN",
      });
    }

    res.status(200).json({ msg: "Approval berhasil" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updatePurchaseRequest = async (req, res) => {
  const { id } = req.params;
  const { name, description, items } = req.body;

  try {
    // Cari PR milik user yang sedang login dan status DRAFT
    const pr = await PurchaseRequest.findOne({
      where: { id: id, userId: req.userId, status: "DRAFT" },
      include: [PurchaseRequestItem],
    });
    if (!pr)
      return res
        .status(404)
        .json({ msg: "PR tidak ditemukan atau tidak bisa diedit" });

    // Update PR
    pr.name = name || pr.name;
    pr.description = description || pr.description;
    await pr.save();

    // Update items (hapus semua, insert ulang)
    if (Array.isArray(items)) {
      await PurchaseRequestItem.destroy({ where: { prId: pr.id } });
      const prItems = items.map((item) => ({ ...item, prId: pr.id }));
      await PurchaseRequestItem.bulkCreate(prItems);
    }

    res.status(200).json({ msg: "Purchase Request berhasil diupdate", pr });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deletePurchaseRequest = async (req, res) => {
  const { id } = req.params;
  try {
    // Cari PR milik user yang sedang login dan status DRAFT
    const pr = await PurchaseRequest.findOne({
      where: { id: id, userId: req.userId, status: "DRAFT" },
    });
    if (!pr)
      return res
        .status(404)
        .json({ msg: "PR tidak ditemukan atau tidak bisa dihapus" });

    // Hapus semua item PR
    await PurchaseRequestItem.destroy({ where: { prId: pr.id } });
    // Hapus PR
    await pr.destroy();

    res.status(200).json({ msg: "Purchase Request berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getApprovedPurchaseRequests = async (req, res) => {
  try {
    const purchaseRequests = await PurchaseRequest.findAll({
      where: {
        status: {
          [Op.notIn]: ["DRAFT", "SUBMITTED"],
        },
      },
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["name", "email"],
        },
        {
          model: Departments,
          as: "Department",
          attributes: ["name"],
        },
        {
          model: Approval,
          as: "Approvals",
          include: [
            {
              model: Users,
              as: "User",
              attributes: ["name", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(purchaseRequests);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
