import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ApprovalList = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPR, setSelectedPR] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(process.env.REACT_APP_API_URL + "api/approvals/user", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
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

  const handleApprove = async (prId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(process.env.REACT_APP_API_URL + `api/approvals/${prId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success("PR berhasil di-approve");
      fetchApprovals();
    } catch (error) {
      toast.error("Gagal approve PR");
    }
  };

  const handleReject = async (prId) => {
    const comment = prompt("Alasan reject (opsional):");
    try {
      const token = localStorage.getItem("token");
      await axios.post(process.env.REACT_APP_API_URL + `api/approvals/${prId}/reject`, { comment }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success("PR berhasil di-reject");
      fetchApprovals();
    } catch (error) {
      toast.error("Gagal reject PR");
    }
  };

  const openModal = (pr) => setSelectedPR(pr);
  const closeModal = () => setSelectedPR(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.price_per_unit);
    }, 0);
  };

  if (loading) return <div>Loading approval list...</div>;

  return (
    <div>
      <h2 className="title">Daftar Approval PR</h2>
      {approvals.length === 0 ? (
        <p>Tidak ada PR yang perlu di-approve.</p>
      ) : (
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Nama PR</th>
              <th>Pemohon</th>
              <th>Departemen</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => (
              <tr key={approval.id}>
                <td>{approval.purchase_request?.name || '-'}</td>
                <td>{approval.purchase_request?.User?.name || '-'}</td>
                <td>{approval.purchase_request?.Department?.name || '-'}</td>
                <td>{approval.purchase_request?.description || '-'}</td>
                <td>{approval.status}</td>
                <td className="is-flex is-flex-direction-row">
                  <button className="button is-success is-small mr-2" onClick={() => handleApprove(approval.prId)} disabled={approval.status !== 'PENDING'}>
                    Approve
                  </button>
                  <button className="button is-danger is-small mr-2" onClick={() => handleReject(approval.prId)} disabled={approval.status !== 'PENDING'}>
                    Reject
                  </button>
                  <button className="button is-info is-small" onClick={() => openModal(approval.purchase_request)}>
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedPR && (
        <div className="modal is-active">
          <div className="modal-background" onClick={closeModal}></div>
          <div className="modal-content">
            <div className="box">
              <h3 className="title is-5 mb-2">Detail Purchase Request</h3>
              <div className="mb-2">
                <strong>Nama PR :</strong> {selectedPR.name} <br />
                <strong>Pemohon :</strong> {selectedPR.User?.name || '-'} <br />
                <strong>Departemen :</strong> {selectedPR.Department?.name || '-'} <br />
                <strong>Status :</strong> {selectedPR.status} <br />
                <strong>Tanggal Dibuat :</strong> {new Date(selectedPR.createdAt).toLocaleDateString('id-ID')}
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
                  {selectedPR.purchase_request_items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.item_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>{formatCurrency(item.price_per_unit)}</td>
                      <td>{formatCurrency(item.quantity * item.price_per_unit)}</td>
                      <td>{item.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="has-text-right mt-2">
                <strong>Total: {formatCurrency(calculateTotal(selectedPR.purchase_request_items || []))}</strong>
              </div>
              <button className="button mt-3" onClick={closeModal}>Tutup</button>
            </div>
          </div>
          <button className="modal-close is-large" aria-label="close" onClick={closeModal}></button>
        </div>
      )}
    </div>
  );
};

export default ApprovalList; 