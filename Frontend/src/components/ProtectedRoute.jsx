import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../features/authSlice';

const ProtectedRoute = ({ children }) => {
  const { user, isError } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (token && !user) {
      dispatch(getMe());
    } else if (user) {
      setIsChecking(false);
    }
  }, [dispatch, navigate, user]);

  useEffect(() => {
    if (isError) {
      navigate('/login');
    }
  }, [isError, navigate]);

  useEffect(() => {
    if (user) {
      setIsChecking(false);
    }
  }, [user]);

  if (!localStorage.getItem('token')) {
    return null;
  }

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

  if (user) {
    return children;
  }

  return null;
};

export default ProtectedRoute; 