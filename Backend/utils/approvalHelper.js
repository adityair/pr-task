import Users from "../models/UserModel.js";
import Departments from "../models/DepartmentModel.js";
import Approval from "../models/ApprovalModel.js";

/**
 * Mendapatkan approver berikutnya berdasarkan role user pembuat PR
 * @param {Object} user - User yang membuat PR
 * @returns {Object|null} - User approver berikutnya atau null jika tidak ditemukan
 */
export const getNextApprover = async (user) => {
  try {
    // Ambil departemen finance
    const financeDept = await Departments.findOne({
      where: { name: "Finance" },
    });
    if (!financeDept) {
      throw new Error("Departemen Finance tidak ditemukan");
    }

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
        // Head Department Finance bisa approve sendiri
        return null; // Tidak perlu approver lain
      } else {
        // Head Department selain finance → Head Department Finance
        approver = await Users.findOne({
          where: { role: "head_department", departmentId: financeDept.id },
        });
      }
    }

    return approver;
  } catch (error) {
    throw error;
  }
};

/**
 * Validasi apakah user bisa approve PR tertentu
 * @param {string} approverId - ID user yang akan approve
 * @param {string} prCreatorId - ID user pembuat PR
 * @returns {boolean} - True jika bisa approve, false jika tidak
 */
export const canApprovePR = async (approverId, prCreatorId) => {
  try {
    const approver = await Users.findOne({ where: { uuid: approverId } });
    const financeDept = await Departments.findOne({
      where: { name: "Finance" },
    });

    if (!approver || !financeDept) {
      return false;
    }

    // Head Department Finance bisa approve PR sendiri
    if (
      approver.role === "head_department" &&
      approver.departmentId === financeDept.id
    ) {
      return true;
    }

    // Head Department selain Finance tidak bisa approve PR sendiri
    if (
      approver.role === "head_department" &&
      approver.departmentId !== financeDept.id &&
      approverId === prCreatorId
    ) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Mendapatkan approver berikutnya setelah approval saat ini
 * @param {Object} currentApprover - User yang baru saja approve
 * @returns {Object|null} - User approver berikutnya atau null jika tidak ada
 */
export const getNextApproverAfterApproval = async (currentApprover) => {
  try {
    const financeDept = await Departments.findOne({
      where: { name: "Finance" },
    });
    if (!financeDept) {
      throw new Error("Departemen Finance tidak ditemukan");
    }

    let nextApprover = null;

    if (currentApprover.role === "manager") {
      // Manager → Head Department dari departemen yang sama
      nextApprover = await Users.findOne({
        where: {
          role: "head_department",
          departmentId: currentApprover.departmentId,
        },
      });
    } else if (currentApprover.role === "head_department") {
      // Head Department → Head Department Finance (level tertinggi)
      nextApprover = await Users.findOne({
        where: { role: "head_department", departmentId: financeDept.id },
      });
    }

    return nextApprover;
  } catch (error) {
    throw error;
  }
};

/**
 * Cek apakah approval sudah mencapai level tertinggi (Head Department Finance)
 * @param {Object} approver - User yang sedang approve
 * @returns {boolean} - True jika sudah level tertinggi
 */
export const isFinalApproval = async (approver) => {
  try {
    const financeDept = await Departments.findOne({
      where: { name: "Finance" },
    });
    if (!financeDept) {
      return false;
    }

    return (
      approver.role === "head_department" &&
      approver.departmentId === financeDept.id
    );
  } catch (error) {
    return false;
  }
};

/**
 * Mendapatkan status PR berdasarkan role pembuat dan status approval
 * @param {string} creatorRole - Role user pembuat PR
 * @param {string} creatorDeptId - ID departemen pembuat PR
 * @param {Array} approvals - Array approval untuk PR tersebut
 * @returns {string} - Status PR yang sesuai
 */
export const getPRStatus = (creatorRole, creatorDeptId, approvals) => {
  // Jika tidak ada approval, status adalah DRAFT atau SUBMITTED
  if (!approvals || approvals.length === 0) {
    return "DRAFT";
  }

  // Cek apakah ada approval yang rejected
  const hasRejected = approvals.some(
    (approval) => approval.status === "REJECTED"
  );
  if (hasRejected) {
    return "REJECTED";
  }

  // Cek apakah semua approval sudah approved
  const allApproved = approvals.every(
    (approval) => approval.status === "APPROVED"
  );
  if (allApproved) {
    return "FINAL_APPROVED";
  }

  // Jika ada approval yang pending
  const hasPending = approvals.some(
    (approval) => approval.status === "PENDING"
  );
  if (hasPending) {
    return "SUBMITTED";
  }

  return "APPROVED";
};
