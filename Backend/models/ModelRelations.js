import User from "./UserModel.js";
import Department from "./DepartmentModel.js";
import PurchaseRequest from "./PurchaseRequestModel.js";
import PurchaseRequestItem from "./PurchaseRequestItemModel.js";
import Approval from "./ApprovalModel.js";
import PurchaseOrder from "./PurchaseOrderModel.js";
import PurchaseOrderItem from "./PurchaseOrderItemModel.js";

// Department → User
Department.hasMany(User, { foreignKey: "departmentId" });
User.belongsTo(Department, { foreignKey: "departmentId" });

// User → PurchaseRequest
User.hasMany(PurchaseRequest, { foreignKey: "userId" });
PurchaseRequest.belongsTo(User, { foreignKey: "userId", as: "User" });

// Department → PurchaseRequest
Department.hasMany(PurchaseRequest, { foreignKey: "departmentId" });
PurchaseRequest.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "Department",
});

// PurchaseRequest → Item
PurchaseRequest.hasMany(PurchaseRequestItem, { foreignKey: "prId" });
PurchaseRequestItem.belongsTo(PurchaseRequest, { foreignKey: "prId" });

// User → Approval
User.hasMany(Approval, { foreignKey: "approverId" });
Approval.belongsTo(User, { foreignKey: "approverId", as: "User" });

// PR → Approval
PurchaseRequest.hasMany(Approval, { foreignKey: "prId", as: "Approvals" });
Approval.belongsTo(PurchaseRequest, { foreignKey: "prId" });

// Relasi PurchaseOrder ke PurchaseRequest
PurchaseOrder.belongsTo(PurchaseRequest, {
  foreignKey: "prId",
  as: "purchase_request",
});
PurchaseRequest.hasOne(PurchaseOrder, {
  foreignKey: "prId",
  as: "purchase_order",
});

// PurchaseOrder → PurchaseOrderItem
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: "poId", as: "items" });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "poId" });

// PurchaseOrder → AssignedTo (User)
User.hasMany(PurchaseOrder, { foreignKey: "assignedTo", as: "AssignedPOs" });
PurchaseOrder.belongsTo(User, {
  foreignKey: "assignedTo",
  as: "AssignedStaff",
});

export {
  User,
  Department,
  PurchaseRequest,
  PurchaseRequestItem,
  Approval,
  PurchaseOrder,
  PurchaseOrderItem,
};
