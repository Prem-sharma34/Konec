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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            py: 4,
            px: { xs: 3, sm: 5 },
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            fontWeight="500" 
            mb={4}
            color="primary"
          >
            Log In
          </Typography>
          
          {message.text && (
            <Alert 
              severity={message.isError ? "error" : "success"} 
              sx={{ mb: 3 }}
            >
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoFocus
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
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Log In"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>or</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : "Log In with Google"}
          </Button>
          
          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Typography 
                  component="span" 
                  color="primary"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  Sign up here
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;