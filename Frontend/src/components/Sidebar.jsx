import React from "react";
import { Link } from "react-router-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  IoPerson,
  IoLogOut,
  IoHome,
  IoCheckmark,
  IoAddCircle,
  IoDocumentText,
  IoPeople,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";
import FinanceNotification from "./FinanceNotification";
import NonFinanceNotification from "./NonFinanceNotification";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const logout = () => {
    dispatch(LogOut());
    dispatch(reset());
    navigate("/");
  };

  // Helper function untuk cek apakah user adalah Head Department Finance
  const isHeadDepartmentFinance = () => {
    return (
      user?.role === "head_department" && user?.Department?.name === "Finance"
    );
  };

  // Helper function untuk cek apakah user adalah Head Department selain Finance
  const isHeadDepartmentNonFinance = () => {
    return (
      user?.role === "head_department" && user?.Department?.name !== "Finance"
    );
  };

  return (
    <aside className="menu pl-2 has-shadow">
      <p className="menu-label">General</p>
      <ul className="menu-list">
        {/* Semua user bisa lihat Dashboard */}
        <li>
          <NavLink to="/">
            <IoHome /> Dashboard
          </NavLink>
        </li>

        {/* Admin: Users Management */}
        {user?.role === "admin" && (
          <>
            <p className="menu-label">Admin</p>
            <li>
              <NavLink to="/users">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src="/gif/user.gif"
                    alt="users icon"
                    width="24"
                    height="24"
                    style={{ marginRight: "8px" }}
                  />
                  Users
                </div>
              </NavLink>
            </li>
          </>
        )}

        {/* Semua roles bisa buat/lihat PR */}
        {(user?.role === "staff" ||
          user?.role === "manager" ||
          user?.role === "head_department" ||
          user?.role === "admin") && (
          <>
            <p className="menu-label">Purchase Request</p>
            <li className="colums is-vcentered">
              <NavLink to="/purchase-request">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src="/gif/paper.gif"
                    alt="pr icon"
                    width="24"
                    height="24"
                    style={{ marginRight: "8px" }}
                  />
                  Purchase Request
                </div>
              </NavLink>
            </li>
          </>
        )}

        {/* Manager & Head Department: Approve PR */}
        {(user?.role === "manager" ||
          user?.role === "head_department" ||
          user?.role === "admin") && (
          <>
            <p className="menu-label">Approval</p>
            <li>
              <NavLink to="/approval">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src="/gif/approval.gif"
                    alt="approval icon"
                    width="24"
                    height="24"
                    style={{ marginRight: "8px" }}
                  />
                  PR Approval
                  {isHeadDepartmentFinance() && (
                    <span className="tag is-success is-small ml-2">
                      Final Approver
                    </span>
                  )}
                </div>
              </NavLink>
            </li>
          </>
        )}

        {/* Head Department Purchasing: Purchase Order */}
        {(user?.role === "head_department" &&
          user?.department === "Purchasing") ||
        (user?.role === "staff" && user?.department === "Purchasing") ? (
          <li>
            <NavLink to="/purchase-order">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src="/gif/add.gif"
                  alt="purchase order icon"
                  width="24"
                  height="24"
                  style={{ marginRight: "8px" }}
                />
                Purchase Order
              </div>
            </NavLink>
          </li>
        ) : null}

        {/* Approval History - Semua yang bisa approve */}
        {/* {(user?.role === "manager" ||
          user?.role === "head_department" ||
          user?.role === "admin") && (
          <>
            <p className="menu-label">History</p>
            <li>
              <NavLink to="/approval-history">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src="/gif/history.gif"
                    alt="history icon"
                    width="24"
                    height="24"
                    style={{ marginRight: "8px" }}
                  />
                  Approval History
                </div>
              </NavLink>
            </li>
          </>
        )} */}
      </ul>

      {/* Logout */}
      <p className="menu-label">Settings</p>
      <ul className="menu-list">
        <li>
          <button onClick={logout} className="button is-white">
            <IoLogOut /> Logout
          </button>
        </li>
      </ul>

      {/* Info User */}
      <div className="p-3 has-background-light mt-4">
        <p className="menu-label">User Info</p>
        <div className="content is-small">
          <p>
            <strong>Name:</strong> {user?.name}
          </p>
          <p>
            <strong>Role:</strong> {user?.role}
          </p>
          <p>
            <strong>Department:</strong>{" "}
            {user?.Department?.name || user?.department || "N/A"}
          </p>
          {isHeadDepartmentFinance() && (
            <div className="notification is-success is-small mt-2">
              <p className="has-text-black has-text-weight-bold">
                🎯 Final Approver
              </p>
              <p className="has-text-black is-size-7">
                Anda dapat melakukan final approval untuk semua PR
              </p>
            </div>
          )}
          {isHeadDepartmentNonFinance() && (
            <div className="notification is-warning is-small mt-2">
              <p className="has-text-black has-text-weight-bold">
                ⚠️ Approval Restriction
              </p>
              <p className="has-text-black is-size-7">
                Anda tidak dapat approve PR yang dibuat sendiri
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
