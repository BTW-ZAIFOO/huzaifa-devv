import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "./main";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatInterface from "./pages/ChatInterface";
import UserProfile from "./pages/UserProfile";
import OtpVerification from "./pages/OtpVerification";
import "./App.css";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useContext(Context);

  if (!isAuthenticated) return <Navigate to="/admin/auth" />;
  if (!isAdmin) return <Navigate to="/chat" />;

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(Context);

  if (!isAuthenticated) return <Navigate to="/auth" />;

  return children;
};

const App = () => {
  const { setIsAuthenticated, setUser, isAdmin } = useContext(Context);

  useEffect(() => {
    loadFontAwesome();

    authenticateUser();

    return () => {
      const link = document.querySelector('link[href*="font-awesome"]');
      if (link) document.head.removeChild(link);
    };
  }, []);

  const loadFontAwesome = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);
  };

  const authenticateUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/v1/user/me",
        { withCredentials: true }
      );

      setUser(res.data.user);
      setIsAuthenticated(true);

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
    <>
      <Router>
        <div className="max-h-screen overflow-y-scroll bg-gray-100">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/password/forgot" element={<ForgotPassword />} />
            <Route path="/password/reset/:token" element={<ResetPassword />} />
            <Route path="/otp-verification/:email" element={<OtpVerification />} />
            <Route path="/" element={
              <Navigate to={isAdmin ? "/admin" : "/chat"} />
            } />

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

            <Route path="/admin" element={
              <AdminRoute>
                <ChatInterface adminMode={true} />
              </AdminRoute>
            } />
          </Routes>
          <ToastContainer theme="colored" />
        </div>
      </Router>
    </>
  );
};

export default App;