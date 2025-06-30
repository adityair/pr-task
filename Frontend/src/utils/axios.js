import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor untuk menangani error secara global
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Error dari server dengan response
            const { status, data } = error.response;
            
            switch (status) {
                case 401:
                    // Unauthorized - hapus token dan redirect ke login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
                    window.location.href = '/login';
                    break;
                case 403:
                    // Forbidden
                    toast.error("Akses ditolak");
                    break;
                case 404:
                    // Not found
                    toast.error("Data tidak ditemukan");
                    break;
                case 500:
                    // Server error
                    toast.error("Kesalahan server");
                    break;
                default:
                    const message = data.message || data.msg || "Terjadi kesalahan";
                    toast.error(message);
            }
        } else if (error.request) {
            // Error tanpa response (network error)
            toast.error("Kesalahan koneksi. Silakan cek internet Anda.");
        } else {
            // Error lainnya
            toast.error("Terjadi kesalahan");
        }
        
        return Promise.reject(error);
    }
);

export default api; 