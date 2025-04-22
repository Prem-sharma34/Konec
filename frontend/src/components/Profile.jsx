import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  CameraAlt,
  Close,
} from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    display_name: "",
    username: "",
    email: "",
    profilePic: "",
    whoami: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isWhoamiHidden, setIsWhoamiHidden] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("/profile/get");
        setProfileData(res.data);
        setEditData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes in edit mode
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axiosInstance.put("/profile/update", {
        display_name: editData.display_name,
        whoami: editData.whoami,
        profilePic: editData.profilePic,
      });
      setProfileData({ ...profileData, ...editData });
      setMessage(res.data.msg || "Profile updated successfully");
      // Update localStorage to reflect changes in parent components
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          display_name: editData.display_name,
        })
      );
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Toggle show/hide for whoami
  const togglePrivacy = () => {
    setIsWhoamiHidden(!isWhoamiHidden);
  };

  // Copy username to clipboard
  const copyUsername = () => {
    navigator.clipboard.writeText(profileData.username);
    setMessage("Username copied to clipboard!");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 160px)", // Match other sections' height
        overflow: "auto", // Add scrolling for content
        pb: 8, // Add padding to the bottom for the fixed navigation
      }}
    >
      <Box
        sx={{
          p: 4,
          mt: 2, // Reduced from mt: 8 to mt: 2
          mb: 4, // Add margin bottom
          bgcolor: "rgba(30,30,47,0.85)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          borderRadius: 4,
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "'Inter', 'Roboto', sans-serif",
        }}
      >
        {loading && <CircularProgress sx={{ mb: 2, color: "#00FFD1" }} />}
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        {/* Snackbar */}
        <Snackbar
          open={!!message}
          autoHideDuration={3000}
          onClose={() => setMessage("")}
          message={message}
          action={
            <IconButton size="small" onClick={() => setMessage("")} sx={{ color: "#fff" }}>
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{ "& .MuiSnackbarContent-root": { backgroundColor: "#333", color: "#00FFD1" } }}
        />

        {/* Avatar and Info */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Box sx={{ position: "relative", width: 120, height: 120 }}>
            <Avatar
              src={profileData.profilePic}
              alt="Profile"
              sx={{
                width: "100%",
                height: "100%",
                border: "3px solid #00FFD1",
                boxShadow: "0 0 12px rgba(0,255,209,0.4)",
              }}
            >
              {profileData.display_name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            {isEditing && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.3)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CameraAlt sx={{ color: "#fff" }} />
              </Box>
            )}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 500, mt: 2 }}>
            {profileData.display_name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ color: "#ccc" }}>@{profileData.username}</Typography>
            <IconButton onClick={copyUsername} size="small">
              <ContentCopy sx={{ fontSize: 18, color: "#00FFD1" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Email */}
        <TextField
          label="Email"
          value={profileData.email}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
          variant="filled"
          sx={{
            input: { color: "#fff" },
            label: { color: "#aaa" },
            backgroundColor: "#2B2B3C",
            borderRadius: 2,
            mb: 2,
          }}
        />

        {/* Editable Fields */}
        {isEditing ? (
          <>
            <TextField
              label="Display Name"
              name="display_name"
              value={editData.display_name}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              variant="filled"
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
                backgroundColor: "#2B2B3C",
                borderRadius: 2,
              }}
            />
            <TextField
              label="Profile Picture URL"
              name="profilePic"
              value={editData.profilePic}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              variant="filled"
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
                backgroundColor: "#2B2B3C",
                borderRadius: 2,
              }}
            />
            <TextField
              label="Who Am I"
              name="whoami"
              value={editData.whoami}
              onChange={handleEditChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              variant="filled"
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
                backgroundColor: "#2B2B3C",
                borderRadius: 2,
              }}
            />
          </>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ color: "#aaa", whiteSpace: "pre-line" }}>
              {isWhoamiHidden ? "••••••••••••••" : profileData.whoami || "No bio set"}
            </Typography>
            <Button
              onClick={togglePrivacy}
              startIcon={isWhoamiHidden ? <Visibility /> : <VisibilityOff />}
              sx={{ mt: 1, color: "#00BFFF", textTransform: "none" }}
            >
              {isWhoamiHidden ? "Show Bio" : "Hide Bio"}
            </Button>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
          {isEditing ? (
            <>
              <Button
                variant="contained"
                onClick={saveProfileChanges}
                disabled={loading}
                sx={{
                  background: "#00FFD1",
                  color: "#000",
                  fontWeight: 600,
                  "&:hover": { background: "#00ddb7" },
                }}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({ ...profileData });
                }}
                sx={{
                  borderColor: "#555",
                  color: "#aaa",
                  "&:hover": {
                    borderColor: "#777",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setIsEditing(true)}
              sx={{
                borderColor: "#00FFD1",
                color: "#00FFD1",
                fontWeight: 500,
                "&:hover": {
                  borderColor: "#00ddb7",
                  backgroundColor: "rgba(0, 255, 209, 0.1)",
                },
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;