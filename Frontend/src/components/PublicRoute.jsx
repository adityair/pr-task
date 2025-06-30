import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../features/authSlice';

const PublicRoute = ({ children }) => {
  const { user, isError } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !user) {
      dispatch(getMe());
    } else {
      setIsChecking(false);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isError) {
      setIsChecking(false);
    }
  }, [isError]);

  // Jika masih checking, tampilkan loading
  if (isChecking) {
    return (
      <div className="hero is-fullheight is-fullwidth">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-centered">
              <div className="column is-4">
                <div className="box has-text-centered">
                  <div className="loader"></div>
                  <p className="mt-3">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jika user belum login, render children (login form)
  if (!user) {
    return children;
  }

  // Loading state
  return (
    <div className="hero is-fullheight is-fullwidth">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-4">
              <div className="box has-text-centered">
                <div className="loader"></div>
                <p className="mt-3">Redirecting...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRoute; 