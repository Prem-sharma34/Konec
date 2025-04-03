import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";

const FriendsList = ({ user, setSelectedFriend }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  useEffect(() => {

    const fetchFriends = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axiosInstance.get("/friends_list/friends_list");
        console.log("✅ Friends API Response:", response.data);

        if (response.data.friends) {
          setFriends(response.data.friends);
        } else {
          setFriends([]);
          setError("No friends found");
        }
      } catch (err) {
        console.error("❌ Error fetching friends:", err);
        setError(err.response?.data?.error || "Failed to fetch friends");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setSelectedFriendId(friend.user_id);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 1,
        height: "calc(100vh - 120px)",
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        Friends
      </Typography>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />}

      {!loading && friends.length > 0 ? (
        <List>
          {friends.map((friend) => (
            <ListItem
              key={friend.user_id}
              onClick={() => handleFriendClick(friend)}
              sx={{
                cursor: "pointer",
                bgcolor: selectedFriendId === friend.user_id ? "primary.light" : "transparent",
                "&:hover": { bgcolor: "grey.100" },
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemAvatar>
                <Avatar src={friend.profile_pic} alt={friend.display_name}>
                  {friend.display_name?.charAt(0) || "U"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={friend.display_name} secondary={`@${friend.username}`} />
            </ListItem>
          ))}
        </List>
      ) : (
        !loading && (
          <Typography color="textSecondary" sx={{ textAlign: "center" }}>
            {error || "No friends found"}
          </Typography>
        )
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendsList;
