// file: src/components/RandomChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRandom } from "../context/RandomContext";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
} from "@mui/material";
import {
  Send as SendIcon,
  Close as CloseIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

const RandomChat = () => {
  const navigate = useNavigate();
  const { messages, sendMessage, endChat, chatStatus, currentPartner } = useRandom();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    // If chat is not connected, go back to random page
    if (chatStatus !== "connected") {
      navigate("/random");
    }
  }, [chatStatus, navigate]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    
    sendMessage(newMessage);
    setNewMessage("");
  };
  
  const handleEndChat = () => {
    endChat();
    navigate("/random");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
        bgcolor: "#0f0f0f",
        position: "relative",
      }}
    >
      {/* Header Bar */}
      <AppBar position="static" sx={{ bgcolor: "#1a1a1a", boxShadow: "none" }}>
        <Toolbar>
          <Box
            sx={{ 
              display: "flex", 
              alignItems: "center",
              flexGrow: 1 
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4db6ac, #5c6bc0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2,
                fontWeight: "bold",
              }}
            >
              {currentPartner?.username?.[0]?.toUpperCase() || 'A'}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                {currentPartner?.username || 'Anonymous User'}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Random Chat
              </Typography>
            </Box>
          </Box>
          
          {/* Action buttons */}
          <IconButton
            color="inherit"
            onClick={handleEndChat}
            sx={{ mr: 1 }}
          >
            <CloseIcon />
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
          >
            <HomeIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            bgcolor: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.7)",
            p: 2,
            borderRadius: 2,
            textAlign: "center",
            alignSelf: "center",
            maxWidth: "80%",
          }}
        >
          <Typography variant="body2">
            You're chatting anonymously<br />
            Say hello to start the conversation!
          </Typography>
        </Paper>
        
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              justifyContent: message.isMine ? "flex-end" : "flex-start",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                maxWidth: "70%",
                bgcolor: message.isMine ? "#5c6bc0" : "rgba(255,255,255,0.09)",
                color: message.isMine ? "#fff" : "rgba(255,255,255,0.9)",
                ...(message.isMine
                  ? { borderBottomRightRadius: 0 }
                  : { borderBottomLeftRadius: 0 }),
              }}
            >
              <Typography variant="body2">{message.content}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
      
      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          bgcolor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          size="small"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4db6ac',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.5)',
              opacity: 1,
            },
          }}
          InputProps={{
            sx: { py: 0.75, px: 2 },
          }}
        />
        
        <IconButton
          type="submit"
          disabled={newMessage.trim() === ""}
          sx={{
            bgcolor: "#4db6ac",
            color: "white",
            '&:hover': {
              bgcolor: "#00897b",
            },
            '&.Mui-disabled': {
              bgcolor: "rgba(77, 182, 172, 0.3)",
              color: "rgba(255,255,255,0.3)",
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default RandomChat;