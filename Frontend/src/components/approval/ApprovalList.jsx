import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import ApprovalHistory from "../ApprovalHistory";

const ApprovalList = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPR, setSelectedPR] = useState(null);
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const [selectedPRForHistory, setSelectedPRForHistory] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        process.env.REACT_APP_API_URL + "api/approvals/user",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setApprovals(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

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

  // Helper function untuk cek apakah user bisa approve PR ini
  const canApprovePR = (approval) => {
    const prCreatorId = approval.purchase_request?.userId;
    const currentUserId = user?.uuid;

    // Head Department Finance bisa approve semua PR
    if (isHeadDepartmentFinance()) {
      return true;
    }

    // Head Department selain Finance tidak bisa approve PR sendiri
    if (isHeadDepartmentNonFinance() && prCreatorId === currentUserId) {
      return false;
    }

    return true;
  };

  const handleApprove = async (prId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        process.env.REACT_APP_API_URL + `api/approvals/approve/${prId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // Pesan sukses yang berbeda berdasarkan role
      if (isHeadDepartmentFinance()) {
        toast.success(
          "PR berhasil di-approve dan FINAL APPROVED! PO otomatis dibuat."
        );
      } else {
        toast.success("PR berhasil di-approve, menunggu approval berikutnya");
      }

      fetchApprovals();
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Gagal approve PR";
      toast.error(errorMessage);
    }
  };

  const handleReject = async (prId) => {
    const comment = prompt("Alasan reject (opsional):");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        process.env.REACT_APP_API_URL + `api/approvals/reject/${prId}`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("PR berhasil di-reject");
      fetchApprovals();
    } catch (error) {
      toast.error("Gagal reject PR");
    }
  };

  const openModal = (pr) => setSelectedPR(pr);
  const closeModal = () => setSelectedPR(null);

  const handleViewApprovalHistory = (pr) => {
    setSelectedPRForHistory(pr);
    setShowApprovalHistory(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.price_per_unit;
    }, 0);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      staff: { class: "is-info", text: "Staff", icon: "👨‍💼" },
      manager: { class: "is-warning", text: "Manager", icon: "👔" },
      head_department: { class: "is-danger", text: "Head Dept", icon: "🎯" },
      admin: { class: "is-dark", text: "Admin", icon: "⚙️" },
    };

    const config = roleConfig[role] || {
      class: "is-secondary",
      text: role,
      icon: "👨‍💼",
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

  if (loading) return <div>Loading approval list...</div>;

  return (
    <div>
      <div className="level mb-4">
        <div className="level-left">
          <div className="level-item">
            <h2 className="title">Daftar Approval PR</h2>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            {isHeadDepartmentFinance() && (
              <div className="notification is-success is-light">
                <p className="has-text-weight-bold">🎯 Final Approver</p>
                <p className="is-size-7">
                  Anda dapat melakukan final approval untuk semua PR
                </p>
              </div>
            )}
            {isHeadDepartmentNonFinance() && (
              <div className="notification is-warning is-light">
                <p className="has-text-weight-bold">⚠️ Approval Restriction</p>
                <p className="is-size-7">
                  Anda tidak dapat approve PR yang dibuat sendiri
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="notification is-info is-light">
          <p>Tidak ada PR yang perlu di-approve.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Nama PR</th>
                <th>Pemohon</th>
                <th>Role Pemohon</th>
                <th>Departemen</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => {
                const canApprove = canApprovePR(approval);

                return (
                  <tr key={approval.id}>
                    <td>{approval.purchase_request?.name || "-"}</td>
                    <td>{approval.purchase_request?.User?.name || "-"}</td>
                    <td>
                      {getRoleBadge(approval.purchase_request?.User?.role)}
                    </td>
                    <td>
                      {approval.purchase_request?.Department?.name || "-"}
                    </td>
                    <td>
                      {approval.purchase_request?.description ? (
                        <span
                          className="has-text-truncated"
                          style={{
                            maxWidth: "150px",
                            display: "inline-block",
                          }}
                        >
                          {approval.purchase_request.description}
                        </span>
                      ) : (
                        <span className="has-text-grey">-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`tag ${
                          approval.status === "PENDING"
                            ? "is-warning"
                            : approval.status === "APPROVED"
                            ? "is-success"
                            : "is-danger"
                        }`}
                      >
                        {approval.status}
                      </span>
                    </td>
                    <td className="is-flex is-flex-direction-row">
                      <button
                        className="button is-success is-small mr-2"
                        onClick={() => handleApprove(approval.prId)}
                        disabled={approval.status !== "PENDING" || !canApprove}
                        title={
                          !canApprove ? "Tidak dapat approve PR sendiri" : ""
                        }
                      >
                        {isHeadDepartmentFinance()
                          ? "Final Approve"
                          : "Approve"}
                      </button>
                      <button
                        className="button is-danger is-small mr-2"
                        onClick={() => handleReject(approval.prId)}
                        disabled={approval.status !== "PENDING"}
                      >
                        Reject
                      </button>
                      <button
                        className="button is-info is-small mr-2"
                        onClick={() => openModal(approval.purchase_request)}
                      >
                        Detail
                      </button>
                      <button
                        className="button is-warning is-small"
                        onClick={() =>
                          handleViewApprovalHistory(approval.purchase_request)
                        }
                        title="Lihat riwayat approval"
                      >
                        <span>📋</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedPR && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeModal}></div>
          <div className="modal-content">
            <div className="box">
              <h3 className="title is-5 mb-2">Detail Purchase Request</h3>
              <div className="mb-2">
                <strong>Nama PR :</strong> {selectedPR.name}
                <br />
                <strong>Pemohon :</strong> {selectedPR.User?.name || "-"}
                <br />
                <strong>Departemen :</strong>{" "}
                {selectedPR.Department?.name || "-"} <br />
                <strong>Status :</strong> {selectedPR.status} <br />
                <strong>Tanggal Dibuat :</strong>{" "}
                {new Date(selectedPR.createdAt).toLocaleDateString("id-ID")}
              </div>
              <table className="table is-fullwidth is-striped">
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Qty</th>
                    <th>Satuan</th>
                    <th>Harga per Unit</th>
                    <th>Subtotal</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPR.purchase_request_items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{formatCurrency(item.price_per_unit)}</td>
                      <td>
                        {formatCurrency(item.quantity * item.price_per_unit)}
                      </td>
                      <td>{item.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="has-text-right mt-2">
                <strong>
                  Total:{" "}
                  {formatCurrency(
                    calculateTotal(selectedPR.purchase_request_items || [])
                  )}
                </strong>
              </div>
              <button className="button mt-3" onClick={closeModal}>
                Tutup
              </button>
            </div>
          </div>
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={closeModal}
          ></button>
        </div>
      )}

      {/* Modal Riwayat Approval */}
      <ApprovalHistory
        prId={selectedPRForHistory?.id}
        isVisible={showApprovalHistory}
        onClose={() => {
          setShowApprovalHistory(false);
          setSelectedPRForHistory(null);
        }}
      />
    </div>
  );
};

export default ApprovalList;
