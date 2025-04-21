import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Button,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { ref, onChildAdded, push, off, update } from "firebase/database";
import { database } from "../utils/firebaseConfig";
import MiniProfileModal from "./MiniProfileModal";
import axiosInstance from "../utils/axiosInstance";

const RandomChatBox = ({ user, sessionId, otherUserId, onEnd }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesRef = ref(database, `random_sessions/${sessionId}/messages`);

  // Fetch other user's profile
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const res = await axiosInstance.get(`/profile/public/${otherUserId}`);
        setOtherUser(res.data);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    fetchOtherUser();
  }, [otherUserId]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const msg = snapshot.val();
      setMessages((prev) => [...prev, msg]);
    });

    setLoading(false);
    return () => off(messagesRef);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await push(messagesRef, {
        sender: user.id,
        text: newMessage.trim(),
        timestamp: Date.now(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Message send error", err);
    }
  };

  const handleEndChat = async () => {
    try {
      const sessionRef = ref(database, `random_sessions/${sessionId}`);
      await update(sessionRef, { ended: true });

      await axiosInstance.post("/log", {
        other_user_id: otherUserId,
        other_username: otherUser?.username,
        other_display_name: otherUser?.display_name,
        other_profile_pic: otherUser?.profilePic,
        ended_at: new Date().toISOString(),
      });

      if (onEnd) onEnd();
    } catch (err) {
      console.error("Error ending chat", err);
    }
  };

  if (loading || !otherUser) {
    return <CircularProgress sx={{ mt: 4 }} />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
        maxWidth: 800,
        mx: "auto",
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={otherUser.profilePic}
            sx={{ cursor: "pointer" }}
            onClick={() => setShowProfile(true)}
          >
            {otherUser.display_name?.charAt(0) || "U"}
          </Avatar>
          <Typography variant="h6">{otherUser.display_name}</Typography>
        </Box>
        <Button variant="contained" color="error" onClick={handleEndChat}>
          End Chat
        </Button>
      </Box>

      {/* Messages */}
      <Box
        sx={{ flexGrow: 1, p: 2, overflowY: "auto", bgcolor: "#f5f5f5" }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: msg.sender === user.id ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Paper
              sx={{
                p: 1.5,
                maxWidth: "70%",
                borderRadius: 2,
                bgcolor:
                  msg.sender === user.id ? "primary.light" : "grey.100",
              }}
            >
              <Typography>{msg.text}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderTop: "1px solid #ddd",
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <IconButton onClick={handleSend} color="primary" disabled={!newMessage.trim()}>
          <Send />
        </IconButton>
      </Box>

      <MiniProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        userId={otherUserId}
      />
    </Box>
  );
};

export default RandomChatBox;
