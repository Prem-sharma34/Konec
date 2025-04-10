import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";

const FindUsers = ({ user }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!search.trim()) {
      setError("Please enter a search query");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axiosInstance.get("/find_user/find", {
        params: { search: search.trim() },
      });
      console.log("Search Response:", response.data); // Debug log
      if (response.data.success) {
        setUsers(response.data.users || []);
        if (response.data.users.length === 0) {
          setMessage("No users found");
        }
      } else {
        setError(response.data.message || "Failed to search users");
      }
    } catch (error) {
      console.error("Search Error:", error); // Debug log
      setError(
        error.response?.data?.message || 
        error.message || 
        "Error searching users"
      );
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiver_id) => {
    if (!user?.id) {
      setError("You must be logged in to send friend requests");
      return;
    }
    if (receiver_id === user.id) {
      setError("You cannot send a friend request to yourself");
      return;
    }

    console.log("Sending Friend Request to:", receiver_id);
    console.log("Current User ID:", user?.id);

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axiosInstance.post("/friends/friends_request", {
        receiver_id, // Ensure this is the UID
      });
      console.log("Friend Request Response:", response.data); // Debug log
      setMessage(response.data.message || "Friend request sent!");
      setUsers(users.filter((u) => u.id !== receiver_id)); // Filter by UID
    } catch (error) {
      console.error("Friend Request Error:", error); // Debug log
      setError(
        error.response?.data?.error || 
        error.message || 
        "Error sending friend request"
      );
    } finally {
      setLoading(false);
    }
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
        mx: "auto",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        Find Friends
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Search by username or display name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          variant="outlined"
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Search"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}
      {message && (
        <Typography color="success.main" sx={{ mb: 2, textAlign: "center" }}>
          {message}
        </Typography>
      )}

      {users.length > 0 ? (
        <List>
          {users.map((u) => (
            <ListItem
              key={u.id || u.username} // Ensure the key is unique
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => sendFriendRequest(u.id)} // Pass UID as receiver_id
                  disabled={loading || (user?.id && u.id === user.id)} // Disable for self
                >
                  <PersonAdd color="primary" />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar src={u.profilePic} alt={u.display_name}>
                  {u.display_name?.charAt(0) || "U"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={u.display_name}
                secondary={`@${u.username}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        !loading && !message && (
          <Typography color="textSecondary" sx={{ textAlign: "center" }}>
            No users to display
          </Typography>
        )
      )}
    </Box>
  );
};

export default FindUsers;