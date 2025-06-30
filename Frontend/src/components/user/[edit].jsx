import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Layout from "../../pages/Layout";

const UserForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Deteksi mode: add atau edit
  const isEditMode = !!id;

  // Fetch departments saat component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(process.env.REACT_APP_API_URL + "api/departments", {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error("Gagal mengambil data departemen");
      }
    };

    fetchDepartments();
  }, []);

  // Fetch user data jika mode edit
  useEffect(() => {
    if (isEditMode) {
      const fetchUserData = async () => {
        setIsLoadingData(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(process.env.REACT_APP_API_URL + `api/users/${id}`, {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const userData = response.data;
          setName(userData.name || "");
          setEmail(userData.email || "");
          setRole(userData.role || "");
          setDepartmentId(userData.departmentId || 0);
          
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error("Gagal mengambil data user");
          navigate("/users");
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchUserData();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi untuk add mode
    if (!isEditMode) {
      if (!name || !email || !password || !confPassword || !role || !departmentId) {
        toast.error("Semua field harus diisi");
        return;
      }

      if (password !== confPassword) {
        toast.error("Password dan Confirm Password tidak cocok");
        return;
      }

      if (password.length < 6) {
        toast.error("Password minimal 6 karakter");
        return;
      }
    } else {
      // Validasi untuk edit mode
      if (!name || !email || !role || !departmentId) {
        toast.error("Name, Email, Role, dan Department harus diisi");
        return;
      }

      // Jika password diisi, validasi password
      if (password || confPassword) {
        if (password !== confPassword) {
          toast.error("Password dan Confirm Password tidak cocok");
          return;
        }

        if (password.length < 6) {
          toast.error("Password minimal 6 karakter");
          return;
        }
      }
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: name,
        email: email,
        role: role,
        departmentId: departmentId
      };

      // Tambahkan password jika diisi (untuk edit mode)
      if (password) {
        payload.password = password;
        payload.confPassword = confPassword;
      }

      if (isEditMode) {
        // Update user
        await axios.patch(process.env.REACT_APP_API_URL + `api/users/${id}`, payload, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success("User berhasil diupdate!");
      } else {
        // Create user
        await axios.post(process.env.REACT_APP_API_URL + "api/users", payload, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success("User berhasil ditambahkan!");
      }
      
      navigate("/users");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg || "Terjadi kesalahan");
      } else {
        toast.error("Terjadi kesalahan koneksi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state saat fetch data user
  if (isLoadingData) {
    return (
      <Layout>
        <div className="hero is-fullheight is-fullwidth">
          <div className="hero-body">
            <div className="container">
              <div className="columns is-centered">
                <div className="column is-4">
                  <div className="box has-text-centered">
                    <div className="loader"></div>
                    <p className="mt-3">Loading user data...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <h1 className="title">Users</h1>
        <h2 className="subtitle">{isEditMode ? "Edit User" : "Add New User"}</h2>
        <div className="card is-shadowless">
          <div className="card-content">
            <div className="content">
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Name</label>
                  <div className="control">
                    <input
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      required
                      minLength={3}
                      maxLength={100}
                    />
                  </div>
                </div>
                
                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input
                      type="email"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>
                
                <div className="field">
                  <label className="label">
                    Password {isEditMode && "(masukan password login atau password baru)"}
                  </label>
                  <div className="control">
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      required={!isEditMode}
                      minLength={6}
                    />
                  </div>
                </div>
                
                <div className="field">
                  <label className="label">
                    Confirm Password {isEditMode && "(masukan password login atau password baru)"}
                  </label>
                  <div className="control">
                    <input
                      type="password"
                      className="input"
                      value={confPassword}
                      onChange={(e) => setConfPassword(e.target.value)}
                      placeholder="******"
                      required={!isEditMode}
                      minLength={6}
                    />
                  </div>
                </div>
                
                <div className="field">
                  <label className="label">Role</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      >
                        <option value="">Pilih Role</option>
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="head_department">Head Department</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="field">
                  <label className="label">Department</label>
                  <div className="control">
                    <div className="select is-fullwidth">
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(Number(e.target.value) || 0)}
                        required
                      >
                        <option value="">Pilih Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="field">
                  <div className="control">
                    <button 
                      type="submit" 
                      className={`button is-success ${isLoading ? 'is-loading' : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : (isEditMode ? "Update" : "Save")}
                    </button>
                    <button 
                      type="button" 
                      className="button is-light ml-2"
                      onClick={() => navigate("/users")}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserForm; 