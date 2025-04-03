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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState(null);

  useEffect(() => {
    if (!user?.username) {
      setError("You must be logged in to view your friends list");
      return;
    }

    const fetchFriends = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/friends_list/friends_list", {
          params: { username: user.username },
        });
        console.log("📋 Friends API Response:", response.data);
        setFriends(response.data.friends || []);
      } catch (error) {
        console.error("❌ Error fetching friends:", error);
        setError(error.response?.data?.error || "Error fetching friends list");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setSelectedUsername(friend.username);
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
        height: "calc(100vh - 120px)", // Adjust for navbar and padding
        overflowY: "auto",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        Friends
      </Typography>

      {loading && (
        <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />
      )}

      {friends.length > 0 ? (
        <List>
          {friends.map((friend) => (
            <ListItem
              key={friend.username}
              onClick={() => handleFriendClick(friend)}
              sx={{
                cursor: "pointer",
                bgcolor:
                  selectedUsername === friend.username
                    ? "primary.light"
                    : "transparent",
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
              <ListItemText
                primary={friend.display_name}
                secondary={`@${friend.username}`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        !loading && (
          <Typography color="textSecondary" sx={{ textAlign: "center" }}>
            No friends found
          </Typography>
        )
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendsList;