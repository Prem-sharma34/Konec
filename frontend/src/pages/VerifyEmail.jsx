import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const uid = localStorage.getItem("uid");

  const checkVerification = async () => {
    if (!uid) {
      setMessage("No user session found. Please sign up again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axiosInstance.post("/auth/verify-email", { uid });
      localStorage.setItem("user", localStorage.getItem("pendingUser"));
      localStorage.removeItem("pendingUser");
      navigate("/");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "An error occurred";
      if (error.response?.status === 400) {
        setMessage("Email not yet verified. Please check your inbox.");
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!uid) {
      navigate("/signup");
    }
  }, [uid, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          We’ve sent a verification link to your email. Please check your inbox (and spam folder) to confirm your account.
        </p>
        
        {message && (
          <p className={`text-sm mb-4 ${message.includes("not yet") ? "text-gray-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <button
          onClick={checkVerification}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? "Checking..." : "I’ve Verified My Email"}
        </button>

        <p className="mt-4 text-gray-600">
          Didn’t receive the email? Check spam or{" "}
          <span className="text-blue-600 hover:underline cursor-pointer">resend it</span>.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;