import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const PurchaseOrderList = () => {
  const { user } = useSelector((state) => state.auth);
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [poItems, setPoItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [completedPOs, setCompletedPOs] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  useEffect(() => {
    fetchPOs();
    if (user.role === "head_department") {
      fetchCompletedPOs();
    }
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      if (user.role === "head_department") {
        url = "/api/approvals/po/open";
      } else if (user.role === "staff") {
        url = "/api/purchase-order/assigned";
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setPoList(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data PO");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedPOs = async () => {
    setLoadingCompleted(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/purchase-order/completed", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCompletedPOs(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data PO completed");
    } finally {
      setLoadingCompleted(false);
    }
  };

  const openAssignModal = async (po) => {
    setSelectedPO(po);
    setShowAssignModal(true);
    setSelectedStaff("");
    // Fetch staff purchasing
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "/api/users?role=staff&department=Purchasing",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setStaffList(res.data);
    } catch (error) {
      toast.error("Gagal mengambil data staff purchasing");
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) return toast.error("Pilih staff terlebih dahulu");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/purchase-order/assign/${selectedPO.id}`,
        { staffUuid: selectedStaff },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("PO berhasil di-assign");
      setShowAssignModal(false);
      fetchPOs();
    } catch (error) {
      toast.error("Gagal assign PO");
    }
  };

  const handleViewDetail = async (po) => {
    setSelectedPO(po);
    setShowDetailModal(true);
    setLoadingItems(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/purchase-order/items/${po.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setPoItems(res.data);
    } catch (error) {
      toast.error("Gagal mengambil item PO");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCheckItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/purchase-order/check/${itemId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Item sudah dichecklist");
      handleViewDetail(selectedPO);
    } catch (error) {
      toast.error("Gagal checklist item");
    }
  };

  const handleCompletePO = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/purchase-order/complete/${selectedPO.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("PO sudah dilaporkan selesai");
      setShowDetailModal(false);
      fetchPOs();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal melaporkan selesai");
    }
  };

  const handleApprovePO = async (poId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/purchase-order/approve/${poId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("PO sudah di-approve/closed");
      fetchCompletedPOs();
      fetchPOs();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal approve PO");
    }
  };

  if (loading) return <div>Loading PO...</div>;

  return (
    <div>
      <h2 className="title">Daftar Purchase Order</h2>
      {/* Tabel PO OPEN/ASSIGNED */}
      {poList.length === 0 ? (
        <div className="has-text-centered">
          <p>Tidak ada PO.</p>
        </div>
      ) : (
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>PR ID</th>
              <th>Nama PR</th>
              <th>Pemohon</th>
              <th>Departemen</th>
              <th>Assigned To</th>
              {user.role === "head_department" && <th>Aksi</th>}
              {user.role === "staff" && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {poList.map((po) => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{po.status}</td>
                <td>{po.prId}</td>
                <td>{po.purchase_request?.name || "-"}</td>
                <td>{po.purchase_request?.User?.name || "-"}</td>
                <td>{po.purchase_request?.Department?.name || "-"}</td>
                <td>
                  {po.AssignedStaff?.name || po.AssignedStaff?.email || "-"}
                </td>
                {user.role === "head_department" && (
                  <td>
                    {po.status === "OPEN" && (
                      <button
                        className="button is-info is-small"
                        onClick={() => openAssignModal(po)}
                      >
                        Assign ke Staff
                      </button>
                    )}
                  </td>
                )}
                {user.role === "staff" && (
                  <td>
                    <button
                      className="button is-info is-small"
                      onClick={() => handleViewDetail(po)}
                    >
                      Detail & Checklist
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Tabel PO COMPLETED untuk Head Dept Purchasing */}
      {user.role === "head_department" && (
        <div className="mt-5">
          <h3 className="subtitle">PO Selesai oleh Staff (Menunggu Approve)</h3>
          {loadingCompleted ? (
            <div>Loading PO completed...</div>
          ) : completedPOs.length === 0 ? (
            <div className="has-text-centered">
              <p>Tidak ada PO yang menunggu approve.</p>
            </div>
          ) : (
            <table className="table is-striped is-fullwidth">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>PR ID</th>
                  <th>Nama PR</th>
                  <th>Pemohon</th>
                  <th>Departemen</th>
                  <th>Assigned To</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {completedPOs.map((po) => (
                  <tr key={po.id}>
                    <td>{po.id}</td>
                    <td>{po.status}</td>
                    <td>{po.prId}</td>
                    <td>{po.purchase_request?.name || "-"}</td>
                    <td>{po.purchase_request?.User?.name || "-"}</td>
                    <td>{po.purchase_request?.Department?.name || "-"}</td>
                    <td>
                      {po.AssignedStaff?.name || po.AssignedStaff?.email || "-"}
                    </td>
                    <td>
                      <button
                        className="button is-success is-small"
                        onClick={() => handleApprovePO(po.id)}
                      >
                        Approve/Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Assign */}
      {showAssignModal && (
        <div className="modal is-active">
          <div
            className="modal-background"
            onClick={() => setShowAssignModal(false)}
          ></div>
          <div className="modal-content">
            <div className="box">
              <h3 className="title is-5">
                Assign PO #{selectedPO.id} ke Staff Purchasing
              </h3>
              <div className="field">
                <label className="label">Pilih Staff</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                      <option value="">Pilih Staff</option>
                      {staffList.map((staff) => (
                        <option key={staff.uuid} value={staff.uuid}>
                          {staff.name} ({staff.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button className="button is-success" onClick={handleAssign}>
                Assign
              </button>
              <button
                className="button ml-2"
                onClick={() => setShowAssignModal(false)}
              >
                Batal
              </button>
            </div>
          </div>
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={() => setShowAssignModal(false)}
          ></button>
        </div>
      )}

      {/* Modal Detail & Checklist untuk staff */}
      {showDetailModal && (
        <div className="modal is-active">
          <div
            className="modal-background"
            onClick={() => setShowDetailModal(false)}
          ></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">
                Detail & Checklist PO #{selectedPO.id}
              </p>
              <button
                className="delete"
                aria-label="close"
                onClick={() => setShowDetailModal(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              {loadingItems ? (
                <div>Loading item...</div>
              ) : (
                <table className="table is-fullwidth is-bordered">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Item</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{idx + 1}</td>
                        <td>{item.item_name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>
                          {item.status === "BOUGHT" ? (
                            <span className="tag is-success">Sudah Dibeli</span>
                          ) : (
                            <span className="tag is-warning">Belum</span>
                          )}
                        </td>
                        <td>
                          {item.status === "PENDING" && (
                            <button
                              className="button is-success is-small"
                              onClick={() => handleCheckItem(item.id)}
                            >
                              Checklist
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
            <footer className="modal-card-foot">
              {poItems.length > 0 &&
                poItems.every((item) => item.status === "BOUGHT") && (
                  <button
                    className="button is-primary"
                    onClick={handleCompletePO}
                  >
                    Laporkan Selesai ke Head Dept
                  </button>
                )}
              <button
                className="button"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
