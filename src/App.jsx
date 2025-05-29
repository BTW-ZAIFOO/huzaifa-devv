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
  const { isAuthenticated, isAdmin, isAuthLoading } = useContext(Context);

  if (isAuthLoading) return children;
  if (!isAuthenticated) return <Navigate to="/admin/auth" />;
  if (!isAdmin) return <Navigate to="/chat" />;

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useContext(Context);

  if (isAuthLoading) return children;

  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const App = () => {
  const { setIsAuthenticated, setUser, isAdmin, setIsAuthLoading } = useContext(Context);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);

    let isMounted = true;

    (async () => {
      setIsAuthLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/api/v1/user/me", { withCredentials: true });
        if (isMounted) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } 
      catch (err) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } 
      finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      const link = document.querySelector('link[href*="font-awesome"]');
      if (link) document.head.appendChild(link);
    };
  }, [setIsAuthenticated, setUser, setIsAuthLoading]);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          <Route path="/otp-verification/:email" element={<OtpVerification />} />
          <Route path="/" element={<Navigate to={isAdmin ? "/admin" : "/chat"} />} />
          <Route path="/chat" element={<ProtectedRoute><ChatInterface adminMode={false} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><ChatInterface adminMode={true} /></AdminRoute>} />
        </Routes>
        <ToastContainer theme="colored" />
      </div>
    </Router>
  );
};

export default App;