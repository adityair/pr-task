import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { reset } from '../features/authSlice';
import { toast } from 'react-hot-toast';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Hapus data dari localStorage terlebih dahulu
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset Redux state
    dispatch(reset());
    
    toast.success("Logout berhasil!");
    
    // Redirect ke /, biarkan ProtectedRoute yang menangani redirect ke login
    navigate('/');
  };

  return (
    <button 
      className="button is-danger" 
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton; 