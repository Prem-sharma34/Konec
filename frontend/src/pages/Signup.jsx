import { useState } from "react";
import axios from "axios";
import { auth, provider, signInWithPopup } from "../utils/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
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
      console.log("Sending Data:", {
        email: formData.email,
        password: formData.password,
        display_name: formData.displayName, 
      });

      const res = await axios.post(
        "http://127.0.0.1:5000/api/auth/signup",
        {
          email: formData.email,
          password: formData.password,
          display_name: formData.displayName, 
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response:", res.data);

      if (!res.data.token){
        console.log("No token received from backend!")
        setMessage("Signup successful, but no token received.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      navigate("/");
      setMessage(res.data.message);
      
    } catch (error) {
      console.log("Error Response:", error.response?.data);
      setMessage(error.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(); // ✅ Get Google ID Token
  
      console.log("Google ID Token:", idToken); // 🔥 Debugging - Check the token
  
      // ✅ Send ID Token to Google Signup API (FIXED)
      const res = await axios.post("http://127.0.0.1:5000/api/auth/google-signup", {
        idToken,
      });
  
      console.log("Google Signup Response:", res.data);
  
      // ✅ Check if the backend returned a token
      if (!res.data.token) {
        console.error("No token received from backend!");
        setMessage("Signup successful, but no token received.");
        return;
      }
  
      // ✅ Store JWT token for automatic login
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      console.log("Google Signup Error:", error);
      setMessage("Google signup failed");
    }
  };
  
  

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-80"
      >
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        
        {message && <p className="text-red-500">{message}</p>}
        <input
          type="text"
          name="displayName"
          placeholder="Display Name"
          value={formData.displayName}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-3"
        />
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
          {loading ? "Signing Up..." : "Signup"}
        </button>
      </form>

      <button
        onClick={handleGoogleSignup}
        className="bg-red-500 text-white p-2 mt-4 rounded w-80"
      >
        Signup with Google
      </button>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default Signup;
