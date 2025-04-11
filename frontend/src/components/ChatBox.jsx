import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Send,
  MoreVert,
  Delete,
  ArrowBack,
} from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";

const ChatBox = ({ user, selectedFriend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize or get existing chat
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id || !selectedFriend?.user_id) return;
      
      try {
        const response = await axiosInstance.post("/chat/get_or_create_chat", {
          user_id_1: user.id,
          user_id_2: selectedFriend.user_id,
        });
        
        console.log("Chat initialized:", response.data);
        setChatId(response.data.chat_id);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Failed to initialize chat");
        showSnackbar("Failed to initialize chat", "error");
      }
    };

    initializeChat();
  }, [user, selectedFriend]);

  // Fetch messages when chatId is available
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      
      setLoadingMessages(true);
      try {
        const response = await axiosInstance.get("/chat/get_messages", {
          params: { chat_id: chatId }
        });
        
        console.log("Messages fetched:", response.data);
        setMessages(response.data.messages || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
        showSnackbar("Failed to load messages", "error");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !chatId) return;
    
    setLoading(true);
    try {
      const messageData = {
        chat_id: chatId,
        sender: user.id,
        message: newMessage.trim(),
      };
      
      const response = await axiosInstance.post("/chat/send_message", messageData);
      console.log("Message sent:", response.data);
      
      // Optimistically add message to UI
      const tempMessage = {
        message_id: response.data.message_id,
        sender: user.id,
        message: newMessage.trim(),
        timestamp: Date.now(),
      };
      
      setMessages([...messages, tempMessage]);
      setNewMessage("");
      
      // Fetch latest messages to ensure everything is in sync
      refreshMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      showSnackbar("Failed to send message", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshMessages = async () => {
    if (!chatId) return;
    
    try {
      const response = await axiosInstance.get("/chat/get_messages", {
        params: { chat_id: chatId }
      });
      
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Error refreshing messages:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!chatId || !messageId) return;
    
    try {
      await axiosInstance.delete("/chat/delete_message", {
        data: {
          chat_id: chatId,
          message_id: messageId
        }
      });
      
      // Remove message from UI
      setMessages(messages.filter(msg => msg.message_id !== messageId));
      showSnackbar("Message deleted", "success");
      handleCloseMenu();
    } catch (err) {
      console.error("Error deleting message:", err);
      showSnackbar("Failed to delete message", "error");
    }
  };

  const handleMessageMenu = (event, message) => {
    // Only allow menu for user's own messages
    if (message.sender === user.id) {
      setAnchorEl(event.currentTarget);
      setSelectedMessage(message);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedFriend) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography>Select a friend to start chatting</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "calc(100vh - 120px)",
      width: "100%", 
      maxWidth: 800, 
      mx: "auto", 
      bgcolor: "white",
      borderRadius: 2,
      boxShadow: 1,
      overflow: "hidden"
    }}>
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: "1px solid #eee", 
        display: "flex", 
        alignItems: "center",
        bgcolor: "primary.main",
        color: "white" 
      }}>
        <Avatar 
          src={selectedFriend.profile_pic} 
          sx={{ mr: 2 }}
        >
          {selectedFriend.display_name?.charAt(0) || "U"}
        </Avatar>
        <Typography variant="h6">
          {selectedFriend.display_name}
        </Typography>
      </Box>

      {/* Messages Container */}
      <Box 
        ref={chatContainerRef}
        sx={{ 
          flexGrow: 1, 
          p: 2, 
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f5f5f5"
        }}
      >
        {loadingMessages ? (
          <CircularProgress sx={{ alignSelf: "center", my: 4 }} />
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const isCurrentUser = message.sender === user.id;
            
            return (
              <Box
                key={message.message_id}
                sx={{
                  display: "flex",
                  justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                {!isCurrentUser && (
                  <Avatar
                    src={selectedFriend.profile_pic}
                    sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}
                  >
                    {selectedFriend.display_name?.charAt(0) || "U"}
                  </Avatar>
                )}
                
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: "70%",
                    bgcolor: isCurrentUser ? "primary.light" : "white",
                    color: isCurrentUser ? "primary.contrastText" : "text.primary",
                    position: "relative",
                    wordBreak: "break-word",
                    cursor: isCurrentUser ? "pointer" : "default",
                    "&:hover": isCurrentUser 
                      ? { 
                          bgcolor: "primary.main",
                          "& .message-options": { display: "flex" }
                        } 
                      : {}
                  }}
                  onClick={(e) => handleMessageMenu(e, message)}
                >
                  <Typography variant="body1">{message.message}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      textAlign: "right",
                      color: isCurrentUser ? "rgba(255,255,255,0.7)" : "text.secondary",
                    }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            );
          })
        ) : (
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mt: 4,
            }}
          >
            No messages yet. Start the conversation!
          </Typography>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          bgcolor: "white",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading || !chatId}
          sx={{
            mr: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 4,
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={loading || !newMessage.trim() || !chatId}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&.Mui-disabled": {
              bgcolor: "grey.300",
              color: "grey.500",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
        </IconButton>
      </Box>

      {/* Message Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleDeleteMessage(selectedMessage?.message_id)}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Error/Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatBox;