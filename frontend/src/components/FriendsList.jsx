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
  Badge,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";

const FriendsList = ({ user, setSelectedFriend }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          // Add a placeholder for last message
          const friendsWithChatInfo = response.data.friends.map(friend => ({
            ...friend,
            last_message: null,
            unread_count: 0,
          }));
          setFriends(friendsWithChatInfo);
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Filter friends based on search query
  const filteredFriends = searchQuery
    ? friends.filter(friend => 
        friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 1,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Typography variant="h6" sx={{ p: 2, textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
        Friends
      </Typography>

      {/* Search box */}
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #f0f0f0" }}>
        <TextField
          fullWidth
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* Friends list */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && filteredFriends.length > 0 ? (
          <List disablePadding>
            {filteredFriends.map((friend, index) => (
              <Box key={friend.user_id}>
                <ListItem
                  onClick={() => handleFriendClick(friend)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: selectedFriendId === friend.user_id ? "primary.light" : "transparent",
                    color: selectedFriendId === friend.user_id ? "primary.contrastText" : "inherit",
                    "&:hover": { bgcolor: selectedFriendId === friend.user_id ? "primary.main" : "grey.100" },
                    py: 1.5,
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="primary"
                      badgeContent={friend.unread_count}
                      invisible={!friend.unread_count}
                    >
                      <Avatar 
                        src={friend.profile_pic} 
                        alt={friend.display_name}
                        sx={{ 
                          width: 45, 
                          height: 45,
                          border: selectedFriendId === friend.user_id ? "2px solid white" : "none"
                        }}
                      >
                        {friend.display_name?.charAt(0) || "U"}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={friend.display_name} 
                    secondary={
                      friend.last_message ? 
                        (friend.last_message.length > 25 ? 
                          friend.last_message.substring(0, 25) + "..." : 
                          friend.last_message) : 
                        `@${friend.username}`
                    }
                    primaryTypographyProps={{
                      fontWeight: friend.unread_count ? 'bold' : 'normal',
                    }}
                    secondaryTypographyProps={{
                      color: selectedFriendId === friend.user_id ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      fontWeight: friend.unread_count ? 'medium' : 'normal',
                    }}
                  />
                </ListItem>
                {index < filteredFriends.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </Box>
            ))}
          </List>
        ) : (
          !loading && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="textSecondary">
                {searchQuery ? "No matching friends found" : (error || "No friends found")}
              </Typography>
              {searchQuery && (
                <Typography variant="body2" color="primary" sx={{ mt: 1, cursor: "pointer" }} onClick={clearSearch}>
                  Clear search
                </Typography>
              )}
            </Box>
          )
        )}
      </Box>

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