import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Context } from "./main";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChatInterface from "./pages/ChatInterface";
import OtpVerification from "./pages/OtpVerification";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";
import AuthVerification from "./pages/AuthVerification";
import { Toaster } from "react-hot-toast";
import "./App.css";
import UserProfile from "./components/UserProfile";

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
  const { setIsAuthenticated, setUser, isAdmin, setIsAuthLoading } =
    useContext(Context);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
    document.head.appendChild(link);

    let isMounted = true;

    const checkAuthStatus = async () => {
      setIsAuthLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/api/v1/user/me", {
          withCredentials: true,
        });
        if (isMounted) {
          setUser(res.data.user);
          setIsAuthenticated(true);

          try {
            await axios.post(
              "http://localhost:4000/api/v1/user/status",
              { status: "online" },
              { withCredentials: true }
            );
          } catch (statusErr) {
            console.error("Failed to update status on app load:", statusErr);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
      const linkElement = document.querySelector('link[href*="font-awesome"]');
      if (linkElement) document.head.removeChild(linkElement);
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
          <Route
            path="/otp-verification/:email"
            element={<OtpVerification />}
          />
          <Route
            path="/"
            element={<Navigate to={isAdmin ? "/admin" : "/chat"} />}
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatInterface adminMode={false} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <ChatInterface adminMode={true} />
              </AdminRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/verify" element={<AuthVerification />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
};

export default App;
