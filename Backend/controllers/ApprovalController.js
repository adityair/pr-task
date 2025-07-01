import Approval from "../models/ApprovalModel.js";
import PurchaseRequest from "../models/PurchaseRequestModel.js";
import Users from "../models/UserModel.js";
import PurchaseRequestItem from "../models/PurchaseRequestItemModel.js";
import Departments from "../models/DepartmentModel.js";
import PurchaseOrder from "../models/PurchaseOrderModel.js";
import PurchaseOrderItem from "../models/PurchaseOrderItemModel.js";
import { Op } from "sequelize";

// Fungsi untuk generate nomor PO
const generatePONumber = async (departmentId) => {
  // Cari PO terakhir untuk departemen yang sama
  const lastPO = await PurchaseOrder.findOne({
    where: {
      po_number: {
        [Op.like]: `PO-${departmentId}-%`,
      },
    },
    order: [["po_number", "DESC"]],
  });

  let sequence = 1;
  if (lastPO) {
    const lastNumber = lastPO.po_number.split("-")[2];
    sequence = parseInt(lastNumber) + 1;
  }
  return `PO-${departmentId}-${sequence.toString().padStart(5, "0")}`;
};

// Ambil semua approval (opsional, untuk admin)
export const getAllApprovals = async (req, res) => {
  try {
    const approvals = await Approval.findAll();
    res.status(200).json(approvals);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getApprovalList = async (req, res) => {
  try {
    const approvals = await Approval.findAll({
      include: [PurchaseRequest, Users],
    });

    res.status(200).json({ approvals, purchaseRequests });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Ambil approval yang harus di-approve oleh user login
export const getUserApprovals = async (req, res) => {
  try {
    const approvals = await Approval.findAll({
      where: { approverId: req.userId, status: "PENDING" },
      include: [
        {
          model: PurchaseRequest,
          include: [
            PurchaseRequestItem,
            {
              model: Users,
              as: "User",
            },
            {
              model: Departments,
              as: "Department",
            },
          ],
        },
      ],
    });
    res.status(200).json(approvals);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Approve PR
export const approvePR = async (req, res) => {
  const { prId } = req.params;
  const { comment } = req.body;
  try {
    const approval = await Approval.findOne({
      where: { prId, approverId: req.userId, status: "PENDING" },
    });
    if (!approval)
      return res
        .status(403)
        .json({ msg: "Tidak berhak approve atau sudah diproses" });

    // Ambil PR dan user pembuat PR
    const pr = await PurchaseRequest.findByPk(prId);
    const user = await Users.findOne({ where: { uuid: pr.userId } });
    if (!user)
      return res.status(404).json({ msg: "User pembuat PR tidak ditemukan" });

    // Ambil user yang sedang approve
    const approver = await Users.findOne({ where: { uuid: req.userId } });
    if (!approver)
      return res.status(404).json({ msg: "User approver tidak ditemukan" });

    // Ambil departemen finance untuk validasi
    const financeDept = await Departments.findOne({
      where: { name: "Finance" },
    });
    if (!financeDept)
      return res
        .status(404)
        .json({ msg: "Departemen Finance tidak ditemukan" });

    // Validasi: Head Department tidak bisa approve PR yang dibuat oleh dirinya sendiri (kecuali head department finance)
    if (
      approver.role === "head_department" &&
      approver.departmentId !== financeDept.id &&
      pr.userId === req.userId
    ) {
      return res.status(403).json({
        msg: "Head Department tidak bisa approve PR yang dibuat oleh dirinya sendiri. Hanya Head Department Finance yang bisa approve PR sendiri.",
      });
    }

    approval.status = "APPROVED";
    approval.comment = comment;
    approval.approvedAt = new Date();
    await approval.save();

    // Cek apakah sudah sampai head departemen finance (level tertinggi)
    if (
      approver.role === "head_department" &&
      approver.departmentId === financeDept.id
    ) {
      // Sudah di-approve head dept finance, PR selesai
      await pr.update({ status: "FINAL_APPROVED" });

      // Ambil semua item PR
      const prItems = await PurchaseRequestItem.findAll({
        where: { prId: pr.id },
      });
      // Cek apakah semua item adalah JASA
      const semuaJasa = prItems.every((item) => item.item_type === "JASA");
      if (semuaJasa) {
        // Tidak perlu buat PO, cukup update status PR menjadi COMPLETED
        await pr.update({ status: "COMPLETED" });
        return res.status(200).json({
          msg: "PR Jasa Telah disetujui",
        });
      }

      // Jika ada BARANG, buat PO seperti biasa
      const poNumber = await generatePONumber(pr.departmentId);
      const po = await PurchaseOrder.create({
        po_number: poNumber,
        prId: pr.id,
        status: "OPEN",
      });
      const poItems = prItems.map((item) => ({
        poId: po.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        note: item.note,
        status: "PENDING",
      }));
      await PurchaseOrderItem.bulkCreate(poItems);

      return res.status(200).json({
        msg: "PR berhasil di-approve, PO otomatis dibuat dan FINAL APPROVED",
      });
    }

    // Buat approval berikutnya
    let nextApprover = null;
    if (approver.role === "manager") {
      // Manager → Head Department dari departemen yang sama
      nextApprover = await Users.findOne({
        where: { role: "head_department", departmentId: approver.departmentId },
      });
    } else if (approver.role === "head_department") {
      // Head Department → Head Department Finance (level tertinggi)
      nextApprover = await Users.findOne({
        where: { role: "head_department", departmentId: financeDept.id },
      });
    }

    if (nextApprover) {
      await Approval.create({
        prId: pr.id,
        approverId: nextApprover.uuid,
        level: "APPROVAL",
        status: "PENDING",
      });
    }

    res
      .status(200)
      .json({ msg: "PR berhasil di-approve, menunggu approval berikutnya" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Reject PR
export const rejectPR = async (req, res) => {
  const { prId } = req.params;
  const { comment } = req.body;
  try {
    const approval = await Approval.findOne({
      where: { prId, approverId: req.userId, status: "PENDING" },
    });
    if (!approval)
      return res
        .status(403)
        .json({ msg: "Tidak berhak reject atau sudah diproses" });

    approval.status = "REJECTED";
    approval.comment = comment;
    approval.approvedAt = new Date();
    await approval.save();

    // Update status PR menjadi REJECTED
    const pr = await PurchaseRequest.findByPk(prId);
    await pr.update({ status: "REJECTED" });

    res.status(200).json({ msg: "PR berhasil di-reject" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get approval history untuk 1 PR dengan detail approver
export const getApprovalHistory = async (req, res) => {
  const { prId } = req.params;
  try {
    const approvals = await Approval.findAll({
      where: { prId },
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["name", "role", "email"],
        },
      ],
      order: [["approvedAt", "ASC"]],
    });

    // Format data untuk frontend
    const approvalHistory = approvals.map((approval) => ({
      id: approval.id,
      status: approval.status,
      comment: approval.comment,
      approvedAt: approval.approvedAt,
      approver: approval.User
        ? {
            name: approval.User.name,
            role: approval.User.role,
            email: approval.User.email,
          }
        : null,
      level: approval.level,
    }));

    res.status(200).json(approvalHistory);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Get status approval untuk 1 PR
export const getApprovalStatus = async (req, res) => {
  const { prId } = req.params;
  try {
    const approvals = await Approval.findAll({ where: { prId } });
    res.status(200).json(approvals);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Contoh fungsi getOpenPOs
export const getOpenPOs = async (req, res) => {
  try {
    const pos = await PurchaseOrder.findAll({
      where: { status: "OPEN" },
      include: [
        {
          model: PurchaseRequest,
          as: "purchase_request",
          include: [
            { model: Users, as: "User", attributes: ["name", "email"] },
            { model: Departments, as: "Department", attributes: ["name"] },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(pos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
