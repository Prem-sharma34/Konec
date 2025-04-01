import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { auth, provider, signInWithPopup } from "../utils/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input change
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) return "Display Name is required";
    if (!/[^@]+@[^@]+\.[^@]+/.test(formData.email)) return "Invalid email format";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/auth/signup", {
        email: formData.email,
        password: formData.password,
        display_name: formData.displayName,
      });

      if (!res.data.token || !res.data.uid) {
        throw new Error("No token or UID received from backend");
      }

      // Store token and uid for verification flow
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("uid", res.data.uid);
      localStorage.setItem("pendingUser", JSON.stringify({
        email: res.data.email,
        username: res.data.username,
        displayName: formData.displayName,
      }));

      navigate("/verify-email");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Signup failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await axiosInstance.post("/auth/google-signup", { idToken });

      if (!res.data.token) {
        throw new Error("No token received from backend");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({
        email: result.user.email,
        username: res.data.username,
        displayName: res.data.display_name,
      }));

      navigate("/");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Google signup failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Sign Up</h2>
        
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="displayName"
              placeholder="Display Name"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignup}
            className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition disabled:bg-red-400 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.24 10.32v3.36h5.52c-.24 1.44-.96 2.64-2.16 3.36v2.88h3.36c1.92-1.68 3.12-4.32 3.12-7.44 0-.72-.12-1.44-.24-2.16h-9.6z"
              />
              <path
                fill="currentColor"
                d="M12 21.6c3.36 0 6.24-1.2 8.4-3.12l-3.36-2.88c-1.2.84-2.64 1.44-4.32 1.44-3.36 0-6.24-2.28-7.2-5.52H2.16v3.36C4.32 19.44 8.04 21.6 12 21.6z"
              />
              <path
                fill="currentColor"
                d="M4.8 12.72c-.24-.72-.36-1.44-.36-2.16s.12-1.44.36-2.16V5.04H2.16C1.44 6.48 1 8.04 1 9.6s.48 3.12 1.2 4.56l2.64-1.44z"
              />
              <path
                fill="currentColor"
                d="M12 2.4c2.04 0 3.84.72 5.28 1.92l3.12-3.12C18.24.72 15.36 0 12 0 8.04 0 4.32 2.16 2.16 5.04l2.64 1.44C6 4.32 8.88 2.4 12 2.4z"
              />
            </svg>
            <span>{loading ? "Processing..." : "Sign Up with Google"}</span>
          </button>
        </div>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;