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
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 3,
          p: 4,
          bgcolor: "#121212",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)",
          backdropFilter: "blur(4px)",
        }}
      >
        <EmailIcon sx={{ fontSize: 50, mb: 2, color: "#90caf9" }} />
        <Typography
          variant="h5"
          fontWeight="500"
          gutterBottom
          sx={{ color: "#fff" }}
        >
          Verify Your Email
        </Typography>
        <Typography variant="body1" sx={{ color: "#bbb", mb: 3 }}>
          We've sent a verification link to your email. Please check your inbox
          (and spam folder) to confirm your account.
        </Typography>

        {message && (
          <Alert
            severity={message.includes("not yet") ? "info" : "error"}
            sx={{ mb: 3 }}
          >
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "I’ve Verified My Email"}
        </Button>

        <Typography variant="body2" sx={{ color: "#bbb" }}>
          Didn’t receive the email? Check spam or{" "}
          <Typography
            component="span"
            sx={{
              color: "#90caf9",
              cursor: "pointer",
              fontWeight: 500,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            resend it
          </Typography>
          .
        </Typography>
      </Paper>
    </Box>
  );
};

export default VerifyEmail;