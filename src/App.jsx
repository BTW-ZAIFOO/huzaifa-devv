import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { Context } from "./main";

// Pages
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatInterface from "./pages/ChatInterface";
import UserProfile from "./pages/UserProfile";
import OtpVerification from "./pages/OtpVerification";

// Styles
import "./App.css";

/**
 * Admin route protection component
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useContext(Context);

  if (!isAuthenticated) return <Navigate to="/admin/auth" />;
  if (!isAdmin) return <Navigate to="/chat" />;

  return children;
};

/**
 * Protected route component for authenticated users
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(Context);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return children;
};

/**
 * Main App component with routing configuration
 */
const App = () => {
  const { setIsAuthenticated, setUser, isAdmin } = useContext(Context);

  useEffect(() => {
    // Add Font Awesome icons
    loadFontAwesome();

    // Authenticate user on app load
    authenticateUser();

    return () => {
      // Clean up font awesome when component unmounts
      const link = document.querySelector('link[href*="font-awesome"]');
      if (link) document.head.removeChild(link);
    };
  }, []);

  /**
   * Load Font Awesome icons
   */
  const loadFontAwesome = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);
  };

  /**
   * Authenticate user on app load
   */
  const authenticateUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/v1/user/me",
        { withCredentials: true }
      );

      // Set user data
      setUser(res.data.user);
      setIsAuthenticated(true);

      // Redirect based on role
      if (res.data.user.role === "admin" && window.location.pathname === "/") {
        window.location.href = "/admin";
      } else if (res.data.user.role !== "admin" && window.location.pathname === "/") {
        window.location.href = "/chat";
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <Router>
      <div className="h-screen bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          <Route path="/otp-verification/:email" element={<OtpVerification />} />

          {/* Redirects for root path based on auth status */}
          <Route path="/" element={
            <Navigate to={isAdmin ? "/admin" : "/chat"} />
          } />

          {/* Protected Routes */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatInterface adminMode={false} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <ChatInterface adminMode={true} />
            </AdminRoute>
          } />
        </Routes>
        <ToastContainer theme="colored" />
      </div>
    </Router>
  );
};

export default App;