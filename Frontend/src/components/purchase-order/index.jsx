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

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = "";
      if (user.role === "head_department") {
        url = "/api/approvals/po/open";
      } else if (user.role === "staff") {
        url = "/api/approvals/po/assigned";
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setPoList(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data PO");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (po) => {
    setSelectedPO(po);
    setShowAssignModal(true);
    setSelectedStaff("");
    // Fetch staff purchasing
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/users?role=staff&department=Purchasing", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setStaffList(res.data);
    } catch (error) {
      toast.error("Gagal mengambil data staff purchasing");
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) return toast.error("Pilih staff terlebih dahulu");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/approvals/po/${selectedPO.id}/assign`, { staffUuid: selectedStaff }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success("PO berhasil di-assign");
      setShowAssignModal(false);
      fetchPOs();
    } catch (error) {
      toast.error("Gagal assign PO");
    }
  };

  if (loading) return <div>Loading PO...</div>;

  return (
    <div>
      <h2 className="title">Daftar Purchase Order</h2>
      {poList.length === 0 ? (
        <>
        <div className="has-text-centered">
        <p>Tidak ada PO.</p>
        </div>
        </>
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
            </tr>
          </thead>
          <tbody>
            {poList.map((po) => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{po.status}</td>
                <td>{po.prId}</td>
                <td>{po.purchase_request?.name || '-'}</td>
                <td>{po.purchase_request?.User?.name || '-'}</td>
                <td>{po.purchase_request?.Department?.name || '-'}</td>
                <td>{po.assignedTo || '-'}</td>
                {user.role === "head_department" && (
                  <td>
                    {po.status === "OPEN" && (
                      <button className="button is-info is-small" onClick={() => openAssignModal(po)}>
                        Assign ke Staff
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Assign */}
      {showAssignModal && (
        <div className="modal is-active">
          <div className="modal-background" onClick={() => setShowAssignModal(false)}></div>
          <div className="modal-content">
            <div className="box">
              <h3 className="title is-5">Assign PO #{selectedPO.id} ke Staff Purchasing</h3>
              <div className="field">
                <label className="label">Pilih Staff</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                      <option value="">Pilih Staff</option>
                      {staffList.map(staff => (
                        <option key={staff.uuid} value={staff.uuid}>{staff.name} ({staff.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button className="button is-success" onClick={handleAssign}>Assign</button>
              <button className="button ml-2" onClick={() => setShowAssignModal(false)}>Batal</button>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={() => setShowAssignModal(false)}></button>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList; 