import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";

const OtpVerification = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { email } = useParams();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const role = searchParams.get("role") || "user";

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendOtp = async () => {
    try {
      await axios.post(
        "https://huzaifa-devv-production.up.railway.app/api/v1/user/resend-otp",
        { email },
        { withCredentials: true }
      );
      console.log("OTP sent successfully");
      toast.info("A new OTP has been sent to your email");
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      console.error("Failed to resend OTP");
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const enteredOtp = otp.join("");
    const data = {
      email,
      otp: enteredOtp,
    };

    await axios
      .post("http://localhost:4000/api/v1/user/otp-verification", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(true);
        setUser(res.data.user);

        if (role === "admin" || res.data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/chat";
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isAuthenticated) {
    if (role === "admin") {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/chat" />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
      <div className="bg-white/95 p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Verify Your Account
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter the verification code sent to {email}
        </p>

        <form onSubmit={handleOtpVerification}>
          <div className="flex justify-center space-x-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="w-12 h-14 text-center text-xl border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join("").length !== 5}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner animate-spin"></i> Verifying...
              </span>
            ) : (
              "Verify Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">
            {countdown > 0
              ? `Resend code in ${countdown} seconds`
              : "Didn't receive the code?"}
          </p>
          <button
            onClick={handleResendOtp}
            disabled={!canResend}
            className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:hover:text-blue-600"
          >
            Resend Verification Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
