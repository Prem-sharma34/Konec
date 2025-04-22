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
        id: res.data.uid, 
        uid: res.data.uid 
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
            Sign Up
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
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
              helperText="Password must be at least 8 characters"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>or</Divider>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up with Google"}
          </Button>
          
          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography 
                  component="span" 
                  color="primary"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  Login here
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;