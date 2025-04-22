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
  Button,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../utils/axiosInstance";

const MiniProfileModal = ({ open, onClose, userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setFriendRequestSent(false);
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
    if (friendRequestSent) return;
    try {
      await axiosInstance.post("/friends_request", { receiver_id: userId });
      setFriendRequestSent(true);
      setSnackbar({ open: true, message: "Friend request sent", severity: "success" });
    } catch (err) {
      console.error("Friend request error:", err);
      setSnackbar({ open: true, message: "Failed to send friend request", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="profile-dialog-title"
      PaperProps={{ sx: { bgcolor: "#121212", color: "#fff", borderRadius: 3 } }}
    >
      <DialogTitle
        id="profile-dialog-title"
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
        User Profile
        <IconButton onClick={onClose} sx={{ color: "#bbb" }} aria-label="close profile">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#888" }} />
          </Box>
        ) : profile ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Avatar
              src={profile.profilePic}
              sx={{ width: 90, height: 90, mx: "auto", mb: 2, border: "2px solid #555" }}
              alt={profile.display_name || profile.username}
            >
              {profile.display_name?.charAt(0) || profile.username?.charAt(0) || "U"}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {profile.display_name || profile.username || "Anonymous"}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#aaa" }}>
              @{profile.username || "unknown"}
            </Typography>
            <Divider sx={{ my: 2, bgcolor: "#333" }} />
            <Typography variant="body2" sx={{ fontStyle: "italic", color: "#ccc" }}>
              {profile.whoami || "No bio available."}
            </Typography>
            <Tooltip title={friendRequestSent ? "Request sent" : "Send Friend Request"} arrow>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleSendFriendRequest}
                  disabled={friendRequestSent}
                  sx={{ mt: 3 }}
                  aria-label={friendRequestSent ? "friend request sent" : "send friend request"}
                >
                  {friendRequestSent ? "Request Sent" : "Send Friend Request"}
                </Button>
              </span>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="error">Profile not available.</Typography>
            <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }} aria-label="close profile">
              Close
            </Button>
          </Box>
        )}
      </DialogContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default MiniProfileModal;