import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { auth, provider, signInWithPopup } from "../utils/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Divider,
  Alert,
  CircularProgress
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

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

      // Ensure we use a consistent id field (use the backend's uid as id)
      const userData = {
        email: res.data.email,
        username: res.data.username,
        display_name: res.data.display_name,
        id: res.data.uid,
        uid: res.data.uid // Keep uid as well for compatibility
      };
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User stored in localStorage:", userData);
      
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

      // Ensure we use a consistent id field
      const userData = {
        email: result.user.email,
        username: res.data.username,
        display_name: res.data.display_name,
        id: res.data.uid,
        uid: res.data.uid // Keep uid as well for compatibility
      };
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User stored in localStorage:", userData);
      
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
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Left Side: Background image with overlay */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          display: { xs: "none", md: "block" },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("/chat.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.2))",
            zIndex: 2,
          }}
        />
      </Box>

      {/* Right Side: Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          backgroundColor: "#000",
          zIndex: 3,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 3,
            p: 4,
            bgcolor: "#121212",
            color: "#fff",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            fontWeight="500"
            mb={4}
          >
            Login
          </Typography>

          {message.text && (
            <Alert severity={message.isError ? "error" : "success"} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoFocus
              InputLabelProps={{ style: { color: "#bbb" } }}
              InputProps={{ style: { color: "#fff" } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ style: { color: "#bbb" } }}
              InputProps={{ style: { color: "#fff" } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
            </Button>
          </Box>

          <Divider
  sx={{
    my: 3,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    "&::before": {
      content: '""',
      flex: 1,
      borderBottom: "1px solid #444", 
      marginRight: "8px", 
    },
    "&::after": {
      content: '""',
      flex: 1,
      borderBottom: "1px solid #444", 
      marginLeft: "8px", 
    },
  }}
>
  or
</Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{
              py: 1.5,
              borderColor: "#888",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              '&:hover': { borderColor: "#fff" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <Box
                  component="img"
                  src="/google-logo.png"
                  alt="Google logo"
                  sx={{ width: 20, height: 20, mr: 1 }}
                />
                Sign in with Google
              </>
            )}
          </Button>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" sx={{ color: "#bbb" }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ textDecoration: "none", color: "#90caf9" }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};


export default Login;