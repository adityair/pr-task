import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../../utils/axios';
import { useSelector } from 'react-redux';
import Layout from '../../pages/Layout';

const PurchaseRequestForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [prNumber, setPrNumber] = useState('');
  const [items, setItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    item_type: 'BARANG',
    item_name: '',
    quantity: 1,
    unit: '',
    price_per_unit: 0,
    note: ''
  });
  const [editingIndex, setEditingIndex] = useState(-1);

  const { user } = useSelector((state) => state.auth);
  
  // Deteksi mode: edit jika ada ID, add jika tidak ada
  const isEditMode = !!id;
  
  useEffect(() => {
    fetchDepartments();
    
    // Jika mode edit, fetch data PR
    if (isEditMode) {
      fetchPurchaseRequest();
    } else {
      // Jika mode add, fetch nomor PR
      fetchPRNumber();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('api/departments');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Gagal mengambil data departemen');
    }
  };

  const fetchPurchaseRequest = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`api/purchase-request/${id}`);
      
      const pr = response.data;
      
      // Isi form dengan data PR
      setFormData({
        name: pr.name || '',
        description: pr.description || ''
      });
      
      // Set nomor PR untuk mode edit
      setPrNumber(pr.pr_number || '');
      
      // Isi items dengan data PR items
      if (pr.purchase_request_items && pr.purchase_request_items.length > 0) {
        setItems(pr.purchase_request_items.map(item => ({
          item_type: item.item_type || 'BARANG',
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: item.price_per_unit,
          note: item.note || ''
        })));
      }
    } catch (error) {
      toast.error('Gagal mengambil data purchase request');
      navigate('/purchase-request');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchPRNumber = async () => {
    try {
      const response = await axios.get('api/purchase-request/generate-number');
      setPrNumber(response.data.pr_number);
    } catch (error) {
      toast.error('Gagal mengambil nomor PR');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price_per_unit' ? parseInt(value) || 0 : value
    }));
  };

  const addItem = () => {
    if (!currentItem.item_name || !currentItem.item_type) {
      toast.error('Mohon lengkapi nama dan tipe item');
      return;
    }
    if (currentItem.item_type === 'BARANG') {
      if (!currentItem.unit || !currentItem.quantity || currentItem.quantity <= 0) {
        toast.error('Barang: quantity dan unit wajib diisi dan quantity > 0');
        return;
      }
    }
    if (currentItem.item_type === 'JASA') {
      if (!currentItem.note || !currentItem.note.trim()) {
        toast.error('Jasa: catatan wajib diisi');
        return;
      }
    }

    if (editingIndex >= 0) {
      // Edit existing item
      const updatedItems = [...items];
      updatedItems[editingIndex] = { ...currentItem };
      setItems(updatedItems);
      setEditingIndex(-1);
    } else {
      // Add new item
      setItems(prev => [...prev, { ...currentItem }]);
    }

    // Reset form
    setCurrentItem({
      item_type: 'BARANG',
      item_name: '',
      quantity: 1,
      unit: '',
      price_per_unit: 0,
      note: ''
    });
    setShowItemModal(false);
  };

  const editItem = (index) => {
    setCurrentItem({ ...items[index] });
    setEditingIndex(index);
    setShowItemModal(true);
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.price_per_unit);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nama purchase request harus diisi');
      return;
    }

    if (items.length === 0) {
      toast.error('Minimal harus ada 1 item');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        items,
        userId: user.uuid
      }

      if (isEditMode) {
        await axios.put(`api/purchase-request/${id}`, payload, 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        toast.success('Purchase request berhasil diupdate');
      } else {
        await axios.post('api/purchase-request', payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        toast.success('Purchase request berhasil dibuat');
      }
      navigate('/purchase-request');
    } catch (error) {
      toast.error(error.response?.data?.msg || (isEditMode ? 'Gagal mengupdate purchase request' : 'Gagal membuat purchase request'));
    } finally {
      setLoading(false);
    }
  };

  // Loading state untuk mode edit
  if (initialLoading) {
    return (
      <div className="has-text-centered" style={{ padding: '100px 0' }}>
        <div className="loader"></div>
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div>
        <div className="level mb-4">
          <div className="level-left">
            <div className="level-item">
              <h4 className="title is-4 mb-0">
                {isEditMode ? 'Edit Purchase Request' : 'Tambah Purchase Request'}
              </h4>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <button className="button is-outlined" onClick={() => navigate('/purchase-request')}>
                <span className="icon">
                  <span>⬅️</span>
                </span>
                <span>Kembali</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="columns">
            <div className="column is-8">
              <div className="card mb-4">
                <header className="card-header">
                  <p className="card-header-title">Informasi Purchase Request</p>
                </header>
                <div className="card-content">
                  <div className="columns">
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Nomor PR</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            value={prNumber || 'Loading...'}
                            disabled
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    <div className="column is-6">
                      <div className="field">
                        <label className="label">Departemen</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            value={departments.find(d => d.id === 1)?.name || 'Loading...'}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="columns">
                    <div className="column is-12">
                      <div className="field">
                        <label className="label">Nama Purchase Request *</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Masukkan nama purchase request"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Deskripsi</label>
                    <div className="control">
                      <textarea
                        className="textarea"
                        rows="3"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Masukkan deskripsi purchase request (opsional)"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <header className="card-header">
                  <p className="card-header-title">Daftar Item</p>
                  <div className="card-header-icon">
                    <button
                      type="button"
                      className="button is-primary is-small"
                      onClick={() => setShowItemModal(true)}
                    >
                      <span className="icon is-small">
                        <span>➕</span>
                      </span>
                      <span>Tambah Item</span>
                    </button>
                  </div>
                </header>
                <div className="card-content">
                  {items.length === 0 ? (
                    <div className="has-text-centered py-6">
                      <p className="has-text-grey">Belum ada item. Silakan tambah item terlebih dahulu.</p>
                    </div>
                  ) : (
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
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                <span className={`tag ${item.item_type === 'BARANG' ? 'is-info' : 'is-warning'}`}>
                                  {item.item_type === 'BARANG' ? '📦' : '🔧'} {item.item_type}
                                </span>
                              </td>
                              <td>{item.item_name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.unit}</td>
                              <td>{formatCurrency(item.price_per_unit)}</td>
                              <td>
                                <strong>{formatCurrency(item.quantity * item.price_per_unit)}</strong>
                              </td>
                              <td>{item.note || '-'}</td>
                              <td>
                                <div className="buttons are-small">
                                  <button
                                    type="button"
                                    className="button is-outlined is-primary"
                                    onClick={() => editItem(index)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="button is-outlined is-danger"
                                    onClick={() => removeItem(index)}
                                  >
                                    <span className="icon is-small">
                                      <span>🗑️</span>
                                    </span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="has-background-light">
                            <td colSpan="6" className="has-text-right"><strong>Total:</strong></td>
                            <td colSpan="3">
                              <strong className="has-text-success">
                                {formatCurrency(calculateTotal())}
                              </strong>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="column is-4">
              <div className="card">
                <header className="card-header">
                  <p className="card-header-title">Ringkasan</p>
                </header>
                <div className="card-content">
                  <div className="field">
                    <label className="label">Jumlah Item</label>
                    <div className="control">
                      <span className="tag is-info is-medium">{items.length} item</span>
                    </div>
                  </div>
                  <div className="field">
                    <label className="label">Total Nilai</label>
                    <div className="control">
                      <span className="has-text-success is-size-4">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                  <hr />
                  <button
                    type="submit"
                    className={`button is-success is-fullwidth ${loading ? 'is-loading' : ''}`}
                    disabled={items.length === 0}
                  >
                    <span className="icon">
                      <span>{isEditMode ? '✏️' : '💾'}</span>
                    </span>
                    <span>{isEditMode ? 'Update Purchase Request' : 'Simpan Purchase Request'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Tambah/Edit Item */}
        <div className={`modal ${showItemModal ? 'is-active' : ''}`}>
          <div className="modal-background" onClick={() => {
            setShowItemModal(false);
            setEditingIndex(-1);
            setCurrentItem({
              item_type: 'BARANG',
              item_name: '',
              quantity: 1,
              unit: '',
              price_per_unit: 0,
              note: ''
            });
          }}></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">
                {editingIndex >= 0 ? 'Edit Item' : 'Tambah Item'}
              </p>
              <button 
                className="delete" 
                aria-label="close"
                onClick={() => setShowItemModal(false)}
              ></button>
            </header>
            <section className="modal-card-body">
              <div className="field">
                <label className="label">Tipe Item *</label>
                <div className="control">
                  <div className="select is-fullwidth">
                    <select
                      name="item_type"
                      value={currentItem.item_type}
                      onChange={handleItemInputChange}
                    >
                      <option value="BARANG">Barang</option>
                      <option value="JASA">Jasa</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">Nama Item *</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    name="item_name"
                    value={currentItem.item_name}
                    onChange={handleItemInputChange}
                    placeholder="Masukkan nama item"
                  />
                </div>
              </div>
              <div className="columns">
                <div className="column is-6">
                  <div className="field">
                    <label className="label">
                      Quantity{currentItem.item_type === 'BARANG' ? ' *' : ''}
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="number"
                        name="quantity"
                        value={currentItem.quantity}
                        onChange={handleItemInputChange}
                        min="1"
                        required={currentItem.item_type === 'BARANG'}
                        disabled={currentItem.item_type === 'JASA'}
                      />
                    </div>
                  </div>
                </div>
                <div className="column is-6">
                  <div className="field">
                    <label className="label">
                      Unit{currentItem.item_type === 'BARANG' ? ' *' : ''}
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        name="unit"
                        value={currentItem.unit}
                        onChange={handleItemInputChange}
                        placeholder="pcs, kg, m, dll"
                        required={currentItem.item_type === 'BARANG'}
                        disabled={currentItem.item_type === 'JASA'}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="field">
                <label className="label">
                  {currentItem.item_type === 'BARANG' ? 'Harga/Unit *' : 'Harga/Jasa *'}
                </label>
                <div className="control">
                  <input
                    className="input"
                    type="number"
                    name="price_per_unit"
                    value={currentItem.price_per_unit}
                    onChange={handleItemInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">
                  Catatan{currentItem.item_type === 'JASA' ? ' *' : ''}
                </label>
                <div className="control">
                  <textarea
                    className="textarea"
                    rows="2"
                    name="note"
                    value={currentItem.note}
                    onChange={handleItemInputChange}
                    placeholder="Catatan tambahan (opsional)"
                    required={currentItem.item_type === 'JASA'}
                  ></textarea>
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
              <button 
                type="button"
                className="button" 
                onClick={() => setShowItemModal(false)}
              >
                Batal
              </button>
              <button 
                type="button"
                className="button is-primary" 
                onClick={addItem}
              >
                {editingIndex >= 0 ? 'Update' : 'Tambah'}
              </button>
            </footer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PurchaseRequestForm; 