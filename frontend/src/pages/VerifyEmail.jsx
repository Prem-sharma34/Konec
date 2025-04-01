import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Container, Paper, CircularProgress, Alert } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

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
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 3
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={4} 
          sx={{ 
            borderRadius: 3,
            py: 5,
            px: 4,
            textAlign: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <EmailIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            We've sent a verification link to your email. Please check your inbox (and spam folder) to confirm your account.
          </Typography>
          
          {message && (
            <Alert severity={message.includes("not yet") ? "info" : "error"} sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}
          
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ py: 1.5, mb: 2 }} 
            onClick={checkVerification} 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "I’ve Verified My Email"}
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            Didn’t receive the email? Check spam or {" "}
            <Typography 
              component="span" 
              color="primary" 
              sx={{ cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
            >
              resend it
            </Typography>.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerifyEmail;