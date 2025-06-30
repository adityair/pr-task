import  Users  from "../models/UserModel.js";
import  Departments  from "../models/DepartmentModel.js";
import  PurchaseOrder  from "../models/PurchaseOrderModel.js";


// Head Departemen Purchasing: lihat PO OPEN
export const getOpenPOs = async (req, res) => {
    try {
      const user = await Users.findOne({ where: { uuid: req.userId } });
      if (!user || user.role !== 'head_department') return res.status(403).json({ msg: 'Akses hanya untuk head departemen' });
      // Pastikan departemen purchasing (misal: nama departemen 'Purchasing')
      const purchasingDept = await Departments.findOne({ where: { name: 'Purchasing' } });
      if (!purchasingDept || user.departmentId !== purchasingDept.id) return res.status(403).json({ msg: 'Akses hanya untuk head departemen purchasing' });
      const pos = await PurchaseOrder.findAll({ where: { status: 'OPEN' } });
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
      if (!user || user.role !== 'head_department') return res.status(403).json({ msg: 'Akses hanya untuk head departemen' });
      const purchasingDept = await Departments.findOne({ where: { name: 'Purchasing' } });
      if (!purchasingDept || user.departmentId !== purchasingDept.id) return res.status(403).json({ msg: 'Akses hanya untuk head departemen purchasing' });
      const staff = await Users.findOne({ where: { uuid: staffUuid, role: 'staff', departmentId: purchasingDept.id } });
      if (!staff) return res.status(404).json({ msg: 'Staff purchasing tidak ditemukan' });
      const po = await PurchaseOrder.findByPk(poId);
      if (!po) return res.status(404).json({ msg: 'PO tidak ditemukan' });
      await po.update({ assignedTo: staffUuid, status: 'ASSIGNED' });
      res.status(200).json({ msg: 'PO berhasil di-assign ke staff purchasing' });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  
  // Staff purchasing: lihat PO yang sudah di-assign ke dirinya
  export const getAssignedPOs = async (req, res) => {
    try {
      const user = await Users.findOne({ where: { uuid: req.userId } });
      if (!user || user.role !== 'staff') return res.status(403).json({ msg: 'Akses hanya untuk staff purchasing' });
      const pos = await PurchaseOrder.findAll({ where: { assignedTo: req.userId } });
      res.status(200).json(pos);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };