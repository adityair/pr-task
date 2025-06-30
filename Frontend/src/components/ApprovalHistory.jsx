import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ApprovalHistory = ({ prId, isVisible, onClose }) => {
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchApprovalHistory = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        process.env.REACT_APP_API_URL + `api/approvals/history/${prId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setApprovalHistory(response.data);
    } catch (error) {
      toast.error("Gagal mengambil riwayat approval");
      console.error("Error fetching approval history:", error);
    } finally {
      setLoading(false);
    }
  }, [prId]);

  useEffect(() => {
    if (isVisible && prId) {
      fetchApprovalHistory();
    }
  }, [isVisible, prId, fetchApprovalHistory]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { class: "is-warning", text: "Pending", icon: "⏰" },
      APPROVED: { class: "is-success", text: "Approved", icon: "✅" },
      REJECTED: { class: "is-danger", text: "Rejected", icon: "❌" },
    };

    const config = statusConfig[status] || {
      class: "is-secondary",
      text: status,
      icon: "📄",
    };

    return (
      <span className={`tag ${config.class} is-small`}>
        <span className="icon is-small mr-1">
          <span>{config.icon}</span>
        </span>
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      staff: { class: "is-info", text: "Staff", icon: "👤" },
      manager: { class: "is-warning", text: "Manager", icon: "👔" },
      head_department: { class: "is-danger", text: "Head Dept", icon: "🎯" },
      admin: { class: "is-dark", text: "Admin", icon: "⚙️" },
    };

    const config = roleConfig[role] || {
      class: "is-secondary",
      text: role,
      icon: "👤",
    };

    return (
      <span className={`tag ${config.class} is-small`}>
        <span className="icon is-small mr-1">
          <span>{config.icon}</span>
        </span>
        {config.text}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-content">
        <div className="box">
          <div className="level mb-4">
            <div className="level-left">
              <div className="level-item">
                <h3 className="title is-5 mb-0">Riwayat Approval PR</h3>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <button className="button is-small" onClick={onClose}>
                  Tutup
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="has-text-centered py-6">
              <div className="loader"></div>
              <p className="mt-3">Loading riwayat approval...</p>
            </div>
          ) : approvalHistory.length === 0 ? (
            <div className="notification is-info is-light">
              <p>Belum ada riwayat approval untuk PR ini.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Status</th>
                    <th>Approver</th>
                    <th>Role</th>
                    <th>Waktu Approval</th>
                    <th>Komentar</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalHistory.map((approval, index) => (
                    <tr key={approval.id}>
                      <td>{index + 1}</td>
                      <td>{getStatusBadge(approval.status)}</td>
                      <td>
                        {approval.approver ? (
                          <div>
                            <strong>{approval.approver.name}</strong>
                            <br />
                            <small className="has-text-grey">
                              {approval.approver.email}
                            </small>
                          </div>
                        ) : (
                          <span className="has-text-grey">-</span>
                        )}
                      </td>
                      <td>
                        {approval.approver
                          ? getRoleBadge(approval.approver.role)
                          : "-"}
                      </td>
                      <td>
                        {approval.approvedAt ? (
                          <div className="has-text-centeredis-size-3">
                            {formatDateTime(approval.approvedAt)}
                          </div>
                        ) : (
                          <span className="has-text-grey">-</span>
                        )}
                      </td>
                      <td>
                        {approval.comment ? (
                          <span
                            className="has-text-truncated"
                            style={{
                              maxWidth: "200px",
                              display: "inline-block",
                            }}
                          >
                            {approval.comment}
                          </span>
                        ) : (
                          <span className="has-text-grey">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4">
            <div className="notification is-info is-light">
              <h6 className="title is-6">Informasi:</h6>
              <ul>
                <li>
                  ✅ <strong>Approved</strong> - PR telah disetujui oleh
                  approver
                </li>
                <li>
                  ❌ <strong>Rejected</strong> - PR telah ditolak oleh approver
                </li>
                <li>
                  ⏰ <strong>Pending</strong> - PR sedang menunggu approval
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={onClose}
      ></button>
    </div>
  );
};

export default ApprovalHistory;
