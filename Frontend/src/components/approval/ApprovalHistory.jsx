import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";
import { toast } from "react-hot-toast";

const ApprovalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("api/purchase-request/approval-list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      toast.error("Gagal mengambil data approval history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading approval history...</div>;

  return (
    <div>
      <h2 className="title">Approval History</h2>
      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>PR</th>
            <th>Pemohon</th>
            <th>Departemen</th>
            <th>Level</th>
            <th>Status</th>
            <th>Approver</th>
            <th>Waktu</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id}>
              <td>{item.purchase_request?.name || '-'}</td>
              <td>{item.purchase_request?.User?.name || '-'}</td>
              <td>{item.purchase_request?.Department?.name || '-'}</td>
              <td>{item.level}</td>
              <td>{item.status}</td>
              <td>{item.User?.name || '-'}</td>
              <td>{new Date(item.createdAt).toLocaleString('id-ID')}</td>
              <td>{item.comment || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovalHistory;
