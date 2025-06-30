import React from "react";
import { useSelector } from "react-redux";

const NonFinanceNotification = () => {
  const { user } = useSelector((state) => state.auth);

  // Helper function untuk cek apakah user adalah Head Department selain Finance
  const isHeadDepartmentNonFinance = () => {
    return (
      user?.role === "head_department" && user?.Department?.name !== "Finance"
    );
  };

  if (!isHeadDepartmentNonFinance()) {
    return null;
  }

  return (
    <div className="notification is-warning is-light mb-4">
      <div className="columns is-vcentered">
        <div className="column is-narrow">
          <span className="icon is-large">
            <span className="has-text-warning">⚠️</span>
          </span>
        </div>
        <div className="column">
          <h4 className="title is-5 has-text-warning mb-2">
            Approval Restriction - Head Department
          </h4>
          <p className="mb-2">
            Sebagai Head Department, Anda memiliki{" "}
            <strong>pembatasan approval</strong> untuk memastikan transparansi.
          </p>
          <div className="content is-small">
            <ul>
              <li>❌ Tidak dapat approve PR yang dibuat oleh diri sendiri</li>
              <li>
                ✅ Dapat approve PR dari staff dan manager di departemen Anda
              </li>
              <li>
                ✅ Setelah approval, PR akan dikirim ke Head Department Finance
              </li>
              <li>
                ℹ️ Hanya Head Department Finance yang dapat melakukan final
                approval
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonFinanceNotification;
