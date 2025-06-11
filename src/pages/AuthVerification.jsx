import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AuthVerification = () => {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const verifyAccount = async () => {
      if (!token || !email) {
        setError("Invalid verification link");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:4000/api/v1/user/verify",
          { token, email },
          { withCredentials: true }
        );

        if (response.data.success) {
          setVerified(true);
          toast.success("Account verified successfully!");

          setTimeout(() => {
            navigate("/auth");
          }, 3000);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyAccount();
  }, [token, email, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Account Verification
          </h1>

          {loading && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Verifying your account...</p>
            </div>
          )}

          {!loading && verified && (
            <div className="flex flex-col items-center">
              <div className="bg-green-100 text-green-700 rounded-full p-4 mb-4">
                <i className="fas fa-check-circle text-4xl"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Verification Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your account has been verified successfully.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center">
              <div className="bg-red-100 text-red-700 rounded-full p-4 mb-4">
                <i className="fas fa-times-circle text-4xl"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Verification Failed
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => navigate("/auth")}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthVerification;
