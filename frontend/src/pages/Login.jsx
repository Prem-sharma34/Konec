import { useState } from "react";
import axios from "axios";
import { auth, provider, signInWithPopup } from "../utils/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/auth/login",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response:", res.data);
     

    if (!res.data.token) {
      console.error("❌ No token received from backend!");
      setMessage("Login successful, but no token received.");
      return;
    }

    const userData = {
      email: res.data.email,
      display_name: res.data.display_name,
    }
      localStorage.setItem("token", res.data.token); // 🔥 Store JWT Token
      localStorage.setItem("user", JSON.stringify(userData)); // 🔥 Store user object
      console.log("✅ User saved to localStorage:", userData);
      setMessage("Login successful!");
      navigate("/")
    } catch (error) {
      console.log("Error Response:", error.response?.data);
      setMessage(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post("http://127.0.0.1:5000/api/auth/google-login", {
        idToken,
      });

      console.log("Google Login Response:", res.data);

      if (!res.data.token) {
        console.error("No token received from backend!");
        setMessage("Google login successful, but no token received.");
        return;
      }

      localStorage.setItem("token", res.data.token); // 🔥 Store JWT Token
      localStorage.setItem("userEmail", result.user.email); // 🔥 Store user email
      navigate("/");
    } catch (error) {
      console.log("Google Login Error:", error.response?.data);
      setMessage(error.response?.data?.error || "Google login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>
    
        {message && <p className="text-red-500">{message}</p>}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <button
        onClick={handleGoogleLogin}
        className="bg-red-500 text-white p-2 mt-4 rounded w-80"
      >
        Login with Google
      </button>
      <p>Don't have an account? <Link to="/signup">Sign up here</Link></p> 
    </div>
  );
};

export default Login;
