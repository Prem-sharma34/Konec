import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, ContentCopy, CameraAlt } from "@mui/icons-material";
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
        p: 2,
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 1,
        width: "100%",
        maxWidth: 600,
        textAlign: "center",
        mx: "auto",
      }}
    >
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {message && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}

      {/* Avatar */}
      <Box sx={{ position: "relative", width: 128, height: 128, mx: "auto", mb: 2 }}>
        <Avatar
          src={profileData.profilePic || ""}
          alt="Profile"
          sx={{
            width: "100%",
            height: "100%",
            border: "4px solid",
            borderColor: "primary.main",
            boxShadow: 1,
            transition: "transform 0.3s",
            "&:hover": { transform: "scale(1.1)" },
          }}
        >
          {profileData.display_name?.charAt(0) || "U"}
        </Avatar>
        {isEditing && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.3s",
              "&:hover": { opacity: 1 },
            }}
          >
            <CameraAlt sx={{ color: "white" }} />
          </Box>
        )}
      </Box>

      {/* User Info */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        {profileData.display_name}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography color="textSecondary">{profileData.username}</Typography>
        <IconButton onClick={copyUsername} size="small">
          <ContentCopy fontSize="small" color="primary" />
        </IconButton>
      </Box>
      <TextField
        label="Email"
        value={profileData.email}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
        variant="outlined"
        sx={{ maxWidth: 400, mx: "auto" }}
      />
      {isEditing ? (
        <>
          <TextField
            label="Display Name"
            name="display_name"
            value={editData.display_name}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ maxWidth: 400, mx: "auto" }}
          />
          <TextField
            label="Profile Picture URL"
            name="profilePic"
            value={editData.profilePic}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ maxWidth: 400, mx: "auto" }}
          />
          <TextField
            label="Who Am I"
            name="whoami"
            value={editData.whoami}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            variant="outlined"
            sx={{ maxWidth: 400, mx: "auto" }}
          />
        </>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Typography
            color="textSecondary"
            sx={{ display: isWhoamiHidden ? "none" : "block" }}
          >
            {profileData.whoami || "No bio set"}
          </Typography>
          <Button
            onClick={togglePrivacy}
            startIcon={isWhoamiHidden ? <Visibility /> : <VisibilityOff />}
            sx={{ mt: 1 }}
          >
            {isWhoamiHidden ? "Show Bio" : "Hide Bio"}
          </Button>
        </Box>
      )}

      {/* Edit/Save Button */}
      <Box sx={{ mt: 2 }}>
        {isEditing ? (
          <Button
            variant="contained"
            color="primary"
            onClick={saveProfileChanges}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setIsEditing(true)}
            disabled={loading}
          >
            Edit Profile
          </Button>
        )}
        {isEditing && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setIsEditing(false);
              setEditData({ ...profileData });
            }}
            sx={{ ml: 1 }}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Profile;