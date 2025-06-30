import React from "react";
import { useSelector } from "react-redux";

const FinanceNotification = () => {
  const { user } = useSelector((state) => state.auth);

  // Helper function untuk cek apakah user adalah Head Department Finance
  const isHeadDepartmentFinance = () => {
    return (
      user?.role === "head_department" && user?.Department?.name === "Finance"
    );
  };

  if (!isHeadDepartmentFinance()) {
    return null;
  }

  return (
    <div className="notification is-success is-light mb-4">
      <div className="columns is-vcentered">
        <div className="column is-narrow">
          <span className="icon is-large">
            <span className="has-text-success">🎯</span>
          </span>
        </div>
        <div className="column">
          <h4 className="title is-5 has-text-success mb-2">
            Final Approver - Head Department Finance
          </h4>
          <p className="mb-2">
            Anda memiliki hak istimewa untuk melakukan{" "}
            <strong>FINAL APPROVAL</strong> pada semua Purchase Request.
          </p>
          <div className="content is-small">
            <ul>
              <li>✅ Dapat approve PR yang dibuat oleh diri sendiri</li>
              <li>✅ Dapat approve PR dari semua departemen</li>
              <li>✅ Setelah approval, PR langsung menjadi FINAL APPROVED</li>
              <li>✅ Purchase Order otomatis dibuat setelah final approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceNotification;
