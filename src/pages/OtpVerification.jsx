import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";

// OTP Verification component
const OtpVerification = () => {

  // Get authentication state and user setter from context
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  // Get email from URL params
  const { email } = useParams();

  // Get search params (for role)
  const [searchParams] = useSearchParams();

  // State for OTP input (5 digits)
  const [otp, setOtp] = useState(["", "", "", "", ""]);

  // Loading state for verification button
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for resend OTP
  const [countdown, setCountdown] = useState(60);

  // Whether the user can resend OTP
  const [canResend, setCanResend] = useState(false);

  // Get role from search params, default to 'user'
  const role = searchParams.get('role') || 'user';

  // Handle OTP input change
  const handleChange = (value, index) => {

    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next input if value entered
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  // Handle backspace to move focus to previous input
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  // Countdown timer effect for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Handle resend OTP button click
  const handleResendOtp = async () => {
    try {
      await axios.post(
        "https://huzaifa-devv-production.up.railway.app/api/v1/user/resend-otp",
        { email },
        { withCredentials: true }
      );
      console.log("OTP sent successfully");
      toast.info("A new OTP has been sent to your email");
      setCountdown(60); // Reset countdown
      setCanResend(false);
    }
    catch (error) {
      console.error("Failed to resend OTP");
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  // Handle OTP verification form submit
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Join OTP digits into a single string
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

        // Redirect based on role
        if (role === 'admin' || res.data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/chat';
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

  // If already authenticated, redirect to appropriate page
  if (isAuthenticated) {
    if (role === 'admin') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/chat" />;
  }

  // Render OTP verification UI
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 relative overflow-hidden font-sans">

      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-float" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* OTP verification card */}
      <div className="bg-black/40 backdrop-blur-md w-full max-w-md rounded-3xl shadow-xl z-10 overflow-hidden border border-white/10">
        <div className="p-8 md:p-10">

          {/* Envelope icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-envelope-open-text text-3xl text-white"></i>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2 text-white text-center">
            OTP Verification
          </h1>

          {/* Subtitle with email */}
          <p className="text-white/80 mb-8 leading-relaxed text-center font-normal">
            We've sent a 5-digit code to{" "}
            <span className="font-medium text-white">{email}</span>
          </p>

          {/* OTP input form */}
          <form onSubmit={handleOtpVerification} className="space-y-8">
            <div className="flex justify-between gap-2.5">

              {/* Render 5 OTP input boxes */}
              {otp.map((digit, index) => (
                <input
                  id={`otp-input-${index}`}
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-2xl text-center bg-white border border-white/20 rounded-lg outline-none transition-all text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white shadow-sm"
                />
              ))}
            </div>

            {/* Resend OTP section */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-indigo-200 hover:text-white transition-colors text-sm font-medium"
                >
                  <i className="fas fa-redo-alt mr-1.5"></i> Resend OTP
                </button>
              ) : (
                <p className="text-white/80 text-sm">
                  Resend OTP in <span className="font-medium text-white">{countdown}s</span>
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none rounded-xl text-base cursor-pointer transition-all duration-300 font-medium shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center"
            >
              {isLoading ? (

                // Loading spinner
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                <>
                  <i className="fas fa-shield-alt mr-2.5"></i>
                  Verify OTP
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;