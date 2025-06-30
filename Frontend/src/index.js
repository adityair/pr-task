import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import "bulma/css/bulma.css";
import axios from "axios";

// Custom CSS untuk loader dan penyesuaian
const customCSS = `
  .loader {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3273dc;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .has-text-truncated {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .mr-1 {
    margin-right: 0.25rem !important;
  }
  
  .mt-3 {
    margin-top: 0.75rem !important;
  }
  
  .mb-0 {
    margin-bottom: 0 !important;
  }
  
  .py-6 {
    padding-top: 1.5rem !important;
    padding-bottom: 1.5rem !important;
  }
  
  .is-size-4 {
    font-size: 1.5rem !important;
  }
`;

// Inject custom CSS
const style = document.createElement('style');
style.textContent = customCSS;
document.head.appendChild(style);

axios.defaults.withCredentials = true;

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

