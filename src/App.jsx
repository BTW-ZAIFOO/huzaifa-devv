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

// AdminRoute: Protects admin routes, only allows access if user is authenticated and is an admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isAuthLoading } = useContext(Context);

  // While authentication status is loading, render children (could be a loader)
  if (isAuthLoading) return children;

  // If not authenticated, redirect to admin login
  if (!isAuthenticated) return <Navigate to="/admin/auth" />;

  // If authenticated but not admin, redirect to user chat
  if (!isAdmin) return <Navigate to="/chat" />;

  // If authenticated and admin, render children
  return children;
};

// ProtectedRoute: Protects user routes, only allows access if user is authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useContext(Context);

  // While authentication status is loading, render children (could be a loader)
  if (isAuthLoading) return children;

  // If authenticated, render children; otherwise, redirect to login
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const App = () => {
  // Destructure context values for authentication and user management
  const { setIsAuthenticated, setUser, isAdmin, setIsAuthLoading } = useContext(Context);

  useEffect(() => {
    // Dynamically add Font Awesome stylesheet to the document head
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(link);

    let isMounted = true; // To prevent state updates on unmounted component

    // Immediately-invoked async function to fetch user authentication status
    (async () => {
      setIsAuthLoading(true); // Set loading state
      try {

        // Fetch current user info from backend
        const res = await axios.get("http://localhost:4000/api/v1/user/me", { withCredentials: true });
        if (isMounted) {
          setUser(res.data.user); // Set user data in context
          setIsAuthenticated(true); // Set authenticated flag
        }
      }
      catch (err) {
        if (isMounted) {
          setUser(null); // Clear user data on error
          setIsAuthenticated(false); // Set not authenticated
        }
      }
      finally {
        if (isMounted) {
          setIsAuthLoading(false); // Clear loading state
        }
      }
    })();

    // Cleanup function to avoid memory leaks and remove stylesheet if needed
    return () => {
      isMounted = false;
      const link = document.querySelector('link[href*="font-awesome"]');
      if (link) document.head.appendChild(link);
    };
  }, [setIsAuthenticated, setUser, setIsAuthLoading]);

  return (
    <Router>
      <div>

        {/* Define application routes */}
        <Routes>

          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ResetPassword />} />
          <Route path="/otp-verification/:email" element={<OtpVerification />} />

          {/* Redirect root path based on admin status */}
          <Route path="/" element={<Navigate to={isAdmin ? "/admin" : "/chat"} />} />

          {/* Protected user chat route */}
          <Route path="/chat" element={<ProtectedRoute><ChatInterface adminMode={false} /></ProtectedRoute>} />

          {/* Protected user profile route */}
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Protected admin chat route */}
          <Route path="/admin" element={<AdminRoute><ChatInterface adminMode={true} /></AdminRoute>} />
        </Routes>

        {/* Toast notifications container */}
        <ToastContainer theme="colored" />
      </div>
    </Router>
  );
};

export default App;