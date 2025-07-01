import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "../../utils/axios";
import ApprovalHistory from "../ApprovalHistory";

const PurchaseRequestTable = () => {
  const navigate = useNavigate();
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showApprovalHistory, setShowApprovalHistory] = useState(false);
  const [selectedPRForHistory, setSelectedPRForHistory] = useState(null);

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}api/purchase-request/list`
      );
      setPurchaseRequests(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Gagal mengambil data purchase request"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (pr) => {
    console.log(pr);

    try {
      setModalLoading(true);
      setSelectedPR(pr);
      setShowModal(true);
    } catch (error) {
      toast.error("Gagal memuat detail purchase request");
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewApprovalHistory = (pr) => {
    setSelectedPRForHistory(pr);
    setShowApprovalHistory(true);
  };

  const handleSubmit = async (pr) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}api/purchase-request/submit`,
        {
          id: pr.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Purchase request berhasil dikirim");
      fetchPurchaseRequests();
    } catch (error) {
      toast.error("Gagal mengirim purchase request");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (pr) => {
    navigate(`/purchase-request/edit/${pr.id}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { class: "is-secondary", text: "Draft", icon: "📄" },
      SUBMITTED: { class: "is-info", text: "Submitted", icon: "⏰" },
      APPROVED: { class: "is-success", text: "Approved", icon: "✅" },
      FINAL_APPROVED: {
        class: "is-success",
        text: "Final Approved",
        icon: "🎯",
      },
      REJECTED: { class: "is-danger", text: "Rejected", icon: "❌" },
    };

    const config = statusConfig[status] || {
      class: "is-secondary",
      text: status,
      icon: "📄",
    };

    return (
      <span className={`tag ${config.class} is-medium`}>
        <span className="icon is-small mr-1">
          <span>{config.icon}</span>
        </span>
        {config.text}
        {/* {status === "FINAL_APPROVED" && (
          <span className="icon is-small ml-1">
            <span>🛒</span>
          </span>
        )} */}
      </span>
    );
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

  if (loading) {
    return (
      <div className="has-text-centered" style={{ padding: "100px 0" }}>
        <div className="loader"></div>
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="level mb-4">
        <div className="level-left">
          <div className="level-item">
            <h4 className="title is-4 mb-0">Purchase Request</h4>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <a href="/purchase-request/add" className="button is-primary">
              <span className="icon">
                <span>➕</span>
              </span>
              <span>Tambah Purchase Request</span>
            </a>
          </div>
        </div>
      </div>

      <div className="container is-fullhd">
        <div className="card">
          <div className="card-content">
            <div className="table-container">
              <table className="table is-fullwidth is-striped is-hoverable">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Deskripsi</th>
                    <th>Pemohon</th>
                    <th>Departemen</th>
                    <th>Status</th>
                    <th>Jumlah Item</th>
                    <th>Total Nilai</th>
                    <th>Tanggal Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequests.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="has-text-centered py-6">
                        <p className="has-text-grey">
                          Belum ada purchase request
                        </p>
                      </td>
                    </tr>
                  ) : (
                    purchaseRequests.map((pr, index) => (
                      <tr key={pr.id}>
                        <td>{index + 1}</td>
                        <td
                          onClick={() => handleViewDetails(pr)}
                          className="cursor-pointer"
                        >
                          <strong>{pr.name}</strong>
                        </td>
                        <td>
                          {pr.description ? (
                            <span
                              className="has-text-truncated"
                              style={{
                                maxWidth: "150px",
                                display: "inline-block",
                              }}
                            >
                              {pr.description}
                            </span>
                          ) : (
                            <span className="has-text-grey">-</span>
                          )}
                        </td>
                        <td>
                          <div className="is-flex is-align-items-center">
                            <span className="icon is-small mr-1">
                              <span>👤</span>
                            </span>
                            {pr.User?.name || "-"}
                          </div>
                        </td>
                        <td>
                          <div className="is-flex is-align-items-center">
                            <span className="icon is-small mr-1">
                              <span>🏢</span>
                            </span>
                            {pr.Department?.name || "-"}
                          </div>
                        </td>
                        <td>{getStatusBadge(pr.status)}</td>
                        <td>
                          <span className="tag is-info">
                            {pr.purchase_request_items?.length || 0} item
                          </span>
                        </td>
                        <td>
                          {pr.purchase_request_items &&
                          pr.purchase_request_items.length > 0 ? (
                            <strong className="has-text-success">
                              {formatCurrency(
                                calculateTotal(pr.purchase_request_items)
                              )}
                            </strong>
                          ) : (
                            <span className="has-text-grey">-</span>
                          )}
                        </td>
                        <td>
                          {new Date(pr.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="is-flex is-align-items-center">
                          <button
                            className="button is-primary is-small mr-2"
                            onClick={() => handleViewDetails(pr)}
                            disabled={modalLoading}
                          >
                            <span>Detail</span>
                          </button>

                          {/* Tombol Riwayat Approval - hanya untuk PR yang sudah disubmit */}
                          {(pr.status === "SUBMITTED" ||
                            pr.status === "APPROVED" ||
                            pr.status === "FINAL_APPROVED" ||
                            pr.status === "REJECTED") && (
                            <button
                              className="button is-info is-small mr-2"
                              onClick={() => handleViewApprovalHistory(pr)}
                              disabled={modalLoading}
                              title="Lihat riwayat approval"
                            >
                              <span>📋</span>
                            </button>
                          )}

                          {pr.status === "DRAFT" && (
                            <>
                              <button
                                className="button is-warning is-small mr-2"
                                onClick={() => handleEdit(pr)}
                                disabled={modalLoading}
                              >
                                <span>Edit</span>
                              </button>
                              <button
                                className="button is-info is-small"
                                onClick={() => handleSubmit(pr)}
                                disabled={modalLoading}
                              >
                                <span>Submit</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      <div className={`modal ${showModal ? "is-active" : ""}`}>
        <div
          className="modal-background"
          onClick={() => setShowModal(false)}
        ></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Detail Purchase Request</p>
            <button
              className="delete"
              aria-label="close"
              onClick={() => setShowModal(false)}
            ></button>
          </header>
          <section className="modal-card-body">
            {selectedPR && (
              <div>
                <div className="columns mb-4">
                  <div className="column is-6">
                    <h6 className="title is-6">Informasi Purchase Request</h6>
                    <table className="table is-borderless is-fullwidth">
                      <tbody>
                        <tr>
                          <td width="40%">Nama:</td>
                          <td>
                            <strong>{selectedPR.name}</strong>
                          </td>
                        </tr>
                        <tr>
                          <td>Deskripsi:</td>
                          <td>{selectedPR.description || "-"}</td>
                        </tr>
                        <tr>
                          <td>Status:</td>
                          <td>{getStatusBadge(selectedPR.status)}</td>
                        </tr>
                        <tr>
                          <td>Pemohon:</td>
                          <td>
                            <div className="is-flex is-align-items-center">
                              <span className="icon is-small mr-1">
                                <span>👤</span>
                              </span>
                              {selectedPR.User?.name || "-"}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Departemen:</td>
                          <td>
                            <div className="is-flex is-align-items-center">
                              <span className="icon is-small mr-1">
                                <span>🏢</span>
                              </span>
                              {selectedPR.Department?.name || "-"}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Tanggal Dibuat:</td>
                          <td>
                            {new Date(selectedPR.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="column is-6">
                    <h6 className="title is-6">Ringkasan</h6>
                    <table className="table is-borderless is-fullwidth">
                      <tbody>
                        <tr>
                          <td>Jumlah Item :</td>
                          <td>
                            <span className="tag is-info">
                              {selectedPR.purchase_request_items?.length || 0}{" "}
                              item
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>Total Nilai :</td>
                          <td>
                            <strong className="has-text-success">
                              {selectedPR.purchase_request_items &&
                              selectedPR.purchase_request_items.length > 0
                                ? formatCurrency(
                                    calculateTotal(
                                      selectedPR.purchase_request_items
                                    )
                                  )
                                : "-"}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <hr />

                <h6 className="title is-6">Daftar Item</h6>
                {selectedPR.purchase_request_items &&
                selectedPR.purchase_request_items.length > 0 ? (
                  <div className="table-container">
                    <table className="table is-striped is-bordered is-fullwidth is-small">
                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Tipe</th>
                          <th>Nama Item</th>
                          <th>Qty</th>
                          <th>Unit</th>
                          <th>Harga/Unit</th>
                          <th>Total</th>
                          <th>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPR.purchase_request_items.map(
                          (item, index) => (
                            <tr key={item.id}>
                              <td>{index + 1}</td>
                              <td>
                                <span
                                  className={`tag ${
                                    item.item_type === "BARANG"
                                      ? "is-info"
                                      : "is-warning"
                                  }`}
                                >
                                  {item.item_type === "BARANG" ? "📦" : "🔧"}{" "}
                                  {item.item_type}
                                </span>
                              </td>
                              <td>{item.item_name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.unit}</td>
                              <td>{formatCurrency(item.price_per_unit)}</td>
                              <td>
                                <strong>
                                  {formatCurrency(
                                    item.quantity * item.price_per_unit
                                  )}
                                </strong>
                              </td>
                              <td>{item.note || "-"}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="has-background-light">
                          <td colSpan="6" className="has-text-right">
                            <strong>Total:</strong>
                          </td>
                          <td colSpan="2">
                            <strong className="has-text-success">
                              {formatCurrency(
                                calculateTotal(
                                  selectedPR.purchase_request_items
                                )
                              )}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="has-text-centered py-6">
                    <p className="has-text-grey">
                      Tidak ada item dalam purchase request ini
                    </p>
                  </div>
                )}

                <hr />
              </div>
            )}
          </section>
          <footer className="modal-card-foot">
            <button className="button" onClick={() => setShowModal(false)}>
              Tutup
            </button>
          </footer>
        </div>
      </div>

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

export default PurchaseRequestTable;
