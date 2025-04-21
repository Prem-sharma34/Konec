import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Tooltip,
  Divider,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../utils/axiosInstance";

const MiniProfileModal = ({ open, onClose, userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/random_chat/profile/public/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setSnackbar({ open: true, message: "Failed to load profile", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (open) fetchProfile();
  }, [userId, open]);

  const handleSendFriendRequest = async () => {
    try {
      await axiosInstance.post("/friends_request", { receiver_id: userId });
      setSnackbar({ open: true, message: "Friend request sent", severity: "success" });
    } catch (err) {
      console.error("Friend request error:", err);
      setSnackbar({ open: true, message: "Failed to send friend request", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { bgcolor: "#121212", color: "#fff", borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#1e1e1e",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          color: "#fff",
        }}
      >
        Profile
        <IconButton onClick={onClose} sx={{ color: "#bbb" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress sx={{ display: "block", mx: "auto", my: 4, color: "#888" }} />
        ) : profile ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Avatar
              src={profile.profilePic}
              sx={{ width: 90, height: 90, mx: "auto", mb: 2, border: "2px solid #555" }}
            >
              {profile.display_name?.charAt(0) || "U"}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>{profile.display_name}</Typography>
            <Typography variant="subtitle1" sx={{ color: "#aaa" }}>@{profile.username}</Typography>

            <Divider sx={{ my: 2, bgcolor: "#333" }} />

            <Typography variant="body2" sx={{ fontStyle: "italic", color: "#ccc" }}>
              {profile.whoami || "No bio available."}
            </Typography>

            <Tooltip title="Send Friend Request" arrow>
              <IconButton
                color="primary"
                onClick={handleSendFriendRequest}
                sx={{ mt: 3, bgcolor: "#1a73e8", color: "white", '&:hover': { bgcolor: "#1662c4" } }}
              >
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography color="error">Profile not available.</Typography>
        )}
      </DialogContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default MiniProfileModal;
