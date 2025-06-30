import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoPerson, IoLogOut, IoHome, IoCheckmark, IoAddCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, reset } from "../features/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);


  const logout = () => {
    dispatch(LogOut());
    dispatch(reset());
    navigate("/");
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
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="/gif/user.gif" alt="users icon" width="24" height="24" style={{ marginRight: '8px' }} />
                  Users
                </div>
                
              </NavLink>
            </li>
          </>
        )}

        {/* Staff: Buat / lihat PR */}
        {(user?.role === "staff" || user?.role === "manager" || user?.role === "head_department" || user?.role === "admin") && (
          <>
            <p className="menu-label">Purchase Request</p>
            <li className="colums is-vcentered">
              <NavLink to="/purchase-request">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="/gif/paper.gif" alt="pr icon" width="24" height="24" style={{ marginRight: '8px' }} />
                  Purchase Request
                </div>
              </NavLink>
            </li>
          </>
        )}

        {/* Approval History */}
        {/* {user?.role && (
          <>
            <p className="menu-label">History</p>
            <li>
              <NavLink to="/approval-history">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="/gif/history.gif" alt="history icon" width="24" height="24" style={{ marginRight: '8px' }} />
                  Approval History
                </div>
              </NavLink>
            </li>
          </>
        )} */}

        


        {/* Manager & Head Department: Approve PR */}
        {(user?.role === "manager" || user?.role === "head_department" || user?.role === "admin" )&& (
          <>
            <p className="menu-label">Approval</p>
            <li>
              <NavLink to="/approval">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="/gif/approval.gif" alt="approval icon" width="24" height="24" style={{ marginRight: '8px' }} />
                  PR Approval
                </div>
              </NavLink>
            </li>
          </>
        )}
      </ul>

      {/* Head Department: Purchase Order */}
      {user?.role === "head_department" && user?.department === "Purchasing" && (
        <>
          <p className="menu-label">Purchase Order</p>
          <li>
            <NavLink to="/purchase-order">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/gif/purchase-order.gif" alt="purchase order icon" width="24" height="24" style={{ marginRight: '8px' }} />
                Purchase Order
              </div>
            </NavLink>
          </li>
        </>
      )}

      {/* Logout */}
      <p className="menu-label">Settings</p>
      <ul className="menu-list">
        <li>
          <button onClick={logout} className="button is-white">
            <IoLogOut /> Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
