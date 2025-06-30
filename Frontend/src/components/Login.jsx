import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { reset } from "../features/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user || isSuccess) {
      navigate("/");
    }
    dispatch(reset());
  }, [user, isSuccess, dispatch, navigate]);

  // Effect untuk menampilkan error dari Redux
  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + 'api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();
      
      if (response.ok && data.status) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          uuid: data.user.uuid,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          departmentId: data.user.departmentId
        }));
        
        toast.success("Login berhasil!");
        
        // Redirect ke dashboard
        navigate('/');
      } else {
        // Handle error dari backend
        const errorMessage = data.message || "Terjadi kesalahan saat login";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="hero is-fullheight is-fullwidth">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-4">
              <form onSubmit={handleLogin} className="box">
                <h1 className="title is-2">Sign In</h1>
                <div className="field">
                  <label className="label">Email</label>
                  <div className="control">
                    <input
                      type="text"
                      className="input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="label">Password</label>
                  <div className="control">
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      required
                    />
                  </div>
                </div>
                <div className="field mt-5">
                  <button
                    type="submit"
                    className={`button is-success is-fullwidth ${isLoading ? 'is-loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Login"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
