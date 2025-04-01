import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { auth, provider, signInWithPopup } from "../utils/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!/[^@]+@[^@]+\.[^@]+/.test(formData.email)) return "Invalid email format";
    if (!formData.password.trim()) return "Password is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    const validationError = validateForm();
    if (validationError) {
      setMessage({ text: validationError, isError: true });
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (!res.data.token) {
        throw new Error("Invalid response from server: Missing token");
      }

      const userData = {
        email: res.data.email,
        username: res.data.username,
        display_name: res.data.display_name,
      };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setMessage({ text: "Login successful!", isError: false });
      navigate("/");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login failed. Please try again.";
      setMessage({ text: errorMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await axiosInstance.post("/auth/google-login", { idToken });

      if (!res.data.token) {
        throw new Error("Invalid response from server: Missing token");
      }

      const userData = {
        email: result.user.email,
        username: res.data.username,
        display_name: res.data.display_name,
      };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      setMessage({ text: "Google login successful!", isError: false });
      navigate("/");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Google login failed. Please try again.";
      setMessage({ text: errorMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log In</h2>

        {message.text && (
          <p className={`text-sm mb-4 text-center ${message.isError ? "text-red-500" : "text-green-500"}`}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 text-white p-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.917v3.418h5.637c-.23,1.223-.906,2.258-1.908,2.977v2.475h3.082c1.805-1.664,2.854-4.11,2.854-6.908c0-.664-.066-1.318-.19-1.962h-9.475Z"
              />
              <path
                fill="currentColor"
                d="M12,21.5c-2.695,0-5.13-1.027-6.977-2.695l-3.082,2.475C4.318,23.682,8.023,25,12,25c3.49,0,6.627-1.318,9-3.477v-3.082h-3.082C16.627,20.182,14.49,21.5,12,21.5Z"
              />
              <path
                fill="currentColor"
                d="M5.023,7.318L1.941,9.793C3.789,11.462,6.223,12.5,9,12.5c1.223,0,2.34-.27,3.418-.705v-3.418H5.477c-.066.664-.477,1.258-.477,1.962s.412,1.298.477,1.962h6.941c.23-1.223.906-2.258,1.908-2.977l-9.305-.004Z"
              />
            </svg>
            <span>{loading ? "Processing..." : "Log In with Google"}</span>
          </button>
        </div>

        <p className="mt-4 text-center text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;