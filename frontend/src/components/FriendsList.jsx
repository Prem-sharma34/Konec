import { useState, useEffect, useRef } from "react";
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
// Import Firebase modules
import { getDatabase, ref, onValue, off } from "firebase/database";
import { database } from "../utils/firebaseConfig"; // Ensure this matches the updated export


const FriendsList = ({ user, setSelectedFriend }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Keep track of active listeners to clean up
  const activeListeners = useRef({});

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.id) return;
      
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
          
          // Set up listeners for each friend's chat
          setupChatListeners(friendsWithChatInfo, user.id);
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
    
    // Cleanup function to remove all listeners when component unmounts
    return () => {
      Object.values(activeListeners.current).forEach(listenerRef => {
        if (listenerRef) {
          off(listenerRef);
        }
      });
      activeListeners.current = {};
    };
  }, [user]);

  // Set up real-time listeners for each friend's chat
  const setupChatListeners = (friendsList, userId) => {
    if (!friendsList || !userId) return;
    
    // Clean up any existing listeners first
    Object.values(activeListeners.current).forEach(listenerRef => {
      if (listenerRef) {
        off(listenerRef);
      }
    });
    activeListeners.current = {};
    
    // Set up listeners for each friend
    friendsList.forEach(friend => {
      const chatId = `chat_${
        userId < friend.user_id ? userId : friend.user_id
      }_${
        userId < friend.user_id ? friend.user_id : userId
      }`;
      
      // Listen for last message updates
      const lastMessageRef = ref(database, `chats/${chatId}/last_message`);
      onValue(lastMessageRef, (snapshot) => {
        if (snapshot.exists()) {
          const lastMessageData = snapshot.val();
          
          // Update the friends state with the new last message
          setFriends(prevFriends => 
            prevFriends.map(f => {
              if (f.user_id === friend.user_id) {
                return {
                  ...f,
                  last_message: lastMessageData.message,
                  last_message_timestamp: lastMessageData.timestamp,
                };
              }
              return f;
            })
          );
        }
      }, (error) => {
        console.error(`Error listening to last message for ${chatId}:`, error);
      });
      
      // Store reference to clean up later
      activeListeners.current[`last_message_${chatId}`] = lastMessageRef;
      
      // Listen for unread messages count
      const unreadRef = ref(database, `unread/${userId}/${chatId}`);
      onValue(unreadRef, (snapshot) => {
        if (snapshot.exists()) {
          const unreadData = snapshot.val();
          
          // Update the friends state with the unread count
          setFriends(prevFriends => 
            prevFriends.map(f => {
              if (f.user_id === friend.user_id) {
                return {
                  ...f,
                  unread_count: unreadData.count || 0,
                };
              }
              return f;
            })
          );
        }
      }, (error) => {
        console.error(`Error listening to unread count for ${chatId}:`, error);
      });
      
      // Store reference to clean up later
      activeListeners.current[`unread_${chatId}`] = unreadRef;
    });
  };

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setSelectedFriendId(friend.user_id);
    
    // Reset unread count when a friend is selected
    if (user?.id) {
      const chatId = `chat_${
        user.id < friend.user_id ? user.id : friend.user_id
      }_${
        user.id < friend.user_id ? friend.user_id : user.id
      }`;
      
      // Reset unread count in friends list UI
      setFriends(prevFriends => 
        prevFriends.map(f => {
          if (f.user_id === friend.user_id) {
            return {
              ...f,
              unread_count: 0,
            };
          }
          return f;
        })
      );
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Sort friends by last message timestamp (most recent first)
  const sortedFriends = [...friends].sort((a, b) => {
    if (a.last_message_timestamp && b.last_message_timestamp) {
      return b.last_message_timestamp - a.last_message_timestamp;
    }
    if (a.last_message_timestamp) return -1;
    if (b.last_message_timestamp) return 1;
    return 0;
  });

  // Filter friends based on search query
  const filteredFriends = searchQuery
    ? sortedFriends.filter(friend => 
        friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedFriends;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "rgba(30,30,47,0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: 2,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
        height: "100%",
        overflow: "hidden",
        color: "#fff",
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          p: 2, 
          textAlign: "center", 
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          fontWeight: 500
        }}
      >
        Friends
      </Typography>

      {/* Search box */}
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
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
                <Search fontSize="small" sx={{ color: "#aaa" }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch} sx={{ color: "#aaa" }}>
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              color: "#fff",
              "&::placeholder": {
                color: "#aaa",
                opacity: 1,
              },
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#2B2B3C",
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.1)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255,255,255,0.2)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#00FFD1",
              },
            },
            "& .MuiInputBase-input": {
              color: "#fff",
            },
          }}
        />
      </Box>

      {/* Friends list */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#00FFD1" }} />
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
                    bgcolor: selectedFriendId === friend.user_id ? "rgba(0, 255, 209, 0.1)" : "transparent",
                    color: "#fff",
                    "&:hover": { 
                      bgcolor: selectedFriendId === friend.user_id 
                        ? "rgba(0, 255, 209, 0.2)" 
                        : "rgba(255,255,255,0.05)" 
                    },
                    py: 1.5,
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      badgeContent={friend.unread_count}
                      invisible={!friend.unread_count}
                    >
                      <Avatar 
                        src={friend.profile_pic} 
                        alt={friend.display_name}
                        sx={{ 
                          width: 45, 
                          height: 45,
                          border: selectedFriendId === friend.user_id 
                            ? "2px solid #00FFD1" 
                            : "2px solid rgba(255,255,255,0.2)",
                          boxShadow: selectedFriendId === friend.user_id
                            ? "0 0 10px rgba(0,255,209,0.3)"
                            : "none"
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
                      color: "#fff",
                    }}
                    secondaryTypographyProps={{
                      color: selectedFriendId === friend.user_id ? '#00FFD1' : 'rgba(255, 255, 255, 0.7)',
                      fontWeight: friend.unread_count ? 'medium' : 'normal',
                    }}
                  />
                </ListItem>
                {index < filteredFriends.length - 1 && (
                  <Divider 
                    variant="inset" 
                    component="li" 
                    sx={{ borderColor: "rgba(255,255,255,0.05)" }} 
                  />
                )}
              </Box>
            ))}
          </List>
        ) : (
          !loading && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="rgba(255, 255, 255, 0.7)">
                {searchQuery ? "No matching friends found" : (error || "No friends found")}
              </Typography>
              {searchQuery && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1, 
                    cursor: "pointer",
                    color: "#00FFD1"
                  }} 
                  onClick={clearSearch}
                >
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
        <Alert 
          onClose={handleSnackbarClose} 
          severity="error" 
          sx={{ 
            width: "100%",
            bgcolor: "#2B2B3C",
            color: "#FF5252",
            border: "1px solid #FF5252",
            "& .MuiAlert-icon": {
              color: "#FF5252"
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendsList;