import Users from "../models/UserModel.js";
import Departments from "../models/DepartmentModel.js";
import PurchaseOrder from "../models/PurchaseOrderModel.js";
import PurchaseRequest from "../models/PurchaseRequestModel.js";
import PurchaseOrderItem from "../models/PurchaseOrderItemModel.js";
import PurchaseRequestItem from "../models/PurchaseRequestItemModel.js";

// Head Departemen Purchasing: lihat PO OPEN
export const getOpenPOs = async (req, res) => {
  // Batasi akses hanya untuk Head Department Purchasing
  const user = await Users.findOne({ where: { uuid: req.userId } });
  if (!user || user.role !== "head_department")
    return res.status(403).json({ msg: "Akses hanya untuk head departemen" });
  const purchasingDept = await Departments.findOne({
    where: { name: "Purchasing" },
  });
  if (!purchasingDept || user.departmentId !== purchasingDept.id)
    return res
      .status(403)
      .json({ msg: "Akses hanya untuk head departemen purchasing" });

  try {
    const pos = await PurchaseOrder.findAll({
      where: { status: "OPEN" },
      include: [
        { model: Users, as: "AssignedStaff", attributes: ["name", "email"] },
        {
          model: PurchaseRequest,
          as: "purchase_request",
          include: [
            { model: Users, as: "User", attributes: ["name", "email"] },
            { model: Departments, as: "Department", attributes: ["name"] },
          ],
        },
      ],
    });
    res.status(200).json(pos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Head Departemen Purchasing: assign PO ke staff
export const assignPO = async (req, res) => {
  const { poId } = req.params;
  const { staffUuid } = req.body;
  try {
    const user = await Users.findOne({ where: { uuid: req.userId } });
    if (!user || user.role !== "head_department")
      return res.status(403).json({ msg: "Akses hanya untuk head departemen" });
    const purchasingDept = await Departments.findOne({
      where: { name: "Purchasing" },
    });
    if (!purchasingDept || user.departmentId !== purchasingDept.id)
      return res
        .status(403)
        .json({ msg: "Akses hanya untuk head departemen purchasing" });
    const staff = await Users.findOne({
      where: {
        uuid: staffUuid,
        role: "staff",
        departmentId: purchasingDept.id,
      },
    });
    if (!staff)
      return res.status(404).json({ msg: "Staff purchasing tidak ditemukan" });
    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ msg: "PO tidak ditemukan" });
    await po.update({ assignedTo: staffUuid, status: "ASSIGNED" });
    res.status(200).json({ msg: "PO berhasil di-assign ke staff purchasing" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Staff purchasing: lihat PO yang sudah di-assign ke dirinya
export const getAssignedPOs = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { uuid: req.userId } });
    if (!user || user.role !== "staff")
      return res
        .status(403)
        .json({ msg: "Akses hanya untuk staff purchasing" });
    const pos = await PurchaseOrder.findAll({
      where: { assignedTo: req.userId },
      include: [
        { model: Users, as: "AssignedStaff", attributes: ["name", "email"] },
        {
          model: PurchaseRequest,
          as: "purchase_request",
          include: [
            { model: Users, as: "User", attributes: ["name", "email"] },
            { model: Departments, as: "Department", attributes: ["name"] },
          ],
        },
      ],
    });
    res.status(200).json(pos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Head Departemen Purchasing: lihat PO COMPLETED
export const getCompletedPOs = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { uuid: req.userId } });
    if (!user || user.role !== "head_department")
      return res.status(403).json({ msg: "Akses hanya untuk head departemen" });
    const purchasingDept = await Departments.findOne({
      where: { name: "Purchasing" },
    });
    if (!purchasingDept || user.departmentId !== purchasingDept.id)
      return res
        .status(403)
        .json({ msg: "Akses hanya untuk head departemen purchasing" });
    const pos = await PurchaseOrder.findAll({
      where: { status: "COMPLETED" },
      include: [
        { model: Users, as: "AssignedStaff", attributes: ["name", "email"] },
        {
          model: PurchaseRequest,
          as: "purchase_request",
          include: [
            { model: Users, as: "User", attributes: ["name", "email"] },
            { model: Departments, as: "Department", attributes: ["name"] },
          ],
        },
      ],
    });
    res.status(200).json(pos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Head Departemen Purchasing: approve/close PO yang sudah selesai
export const approvePO = async (req, res) => {
  const { poId } = req.params;
  try {
    const user = await Users.findOne({ where: { uuid: req.userId } });
    if (!user || user.role !== "head_department")
      return res.status(403).json({ msg: "Akses hanya untuk head departemen" });
    const purchasingDept = await Departments.findOne({
      where: { name: "Purchasing" },
    });
    if (!purchasingDept || user.departmentId !== purchasingDept.id)
      return res
        .status(403)
        .json({ msg: "Akses hanya untuk head departemen purchasing" });
    const po = await PurchaseOrder.findByPk(poId);
    if (!po) return res.status(404).json({ msg: "PO tidak ditemukan" });
    if (po.status !== "COMPLETED")
      return res.status(400).json({ msg: "PO belum selesai oleh staff" });
    await po.update({ status: "CLOSED" });

    // Update status PR juga
    const pr = await PurchaseRequest.findByPk(po.prId);
    if (pr) {
      await pr.update({ status: "COMPLETED" });
    }

    res.status(200).json({ msg: "PO sudah di-approve/closed oleh Head Dept" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Head Departemen Purchasing: lihat PO CLOSED
export const getClosedPOs = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { uuid: req.userId } });
    if (!user || user.role !== "head_department")
      return res.status(403).json({ msg: "Akses hanya untuk head departemen" });
    const purchasingDept = await Departments.findOne({
      where: { name: "Purchasing" },
    });
    if (!purchasingDept || user.departmentId !== purchasingDept.id)
      return res
        .status(403)
        .json({ msg: "Akses hanya untuk head departemen purchasing" });
    const pos = await PurchaseOrder.findAll({
      where: { status: "CLOSED" },
      include: [
        { model: Users, as: "AssignedStaff", attributes: ["name", "email"] },
        {
          model: PurchaseRequest,
          as: "purchase_request",
          include: [
            { model: Users, as: "User", attributes: ["name", "email"] },
            { model: Departments, as: "Department", attributes: ["name"] },
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    res.status(200).json(pos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
