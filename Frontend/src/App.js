import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Users from "./pages/user/Users";
import IndexPurchaseRequest from "./pages/purchase-request/index";
import PurchaseRequestForm from "./components/purchase-request/[edit]";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import UserForm from "./components/user/[edit]";
import Approval from "./pages/approval";
import PurchaseOrder from "./pages/purchase-order";
import ApprovedList from "./pages/approval/history";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/users/add" element={
            <ProtectedRoute>
              <UserForm />
            </ProtectedRoute>
          } />
          <Route path="/users/edit/:id" element={
            <ProtectedRoute>
              <UserForm />
            </ProtectedRoute>
          } />
          
          <Route path="/purchase-request" element={
            <ProtectedRoute>
              <IndexPurchaseRequest />
            </ProtectedRoute>
          } />
          <Route path="/purchase-request/add" element={
            <ProtectedRoute>
              <PurchaseRequestForm />
            </ProtectedRoute>
          } />
          <Route path="/purchase-request/edit/:id" element={
            <ProtectedRoute>
              <PurchaseRequestForm />
            </ProtectedRoute>
          } />
          <Route path="/approval" element={
            <ProtectedRoute>
              <Approval />
            </ProtectedRoute>
          } />

          <Route path="/purchase-order" element={
            <ProtectedRoute>
              <PurchaseOrder />
            </ProtectedRoute>
          } />
          <Route path="/approval-history" element={
            <ProtectedRoute>
              <ApprovedList />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: '#ff4b4b',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
