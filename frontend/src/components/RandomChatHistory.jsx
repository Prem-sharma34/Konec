import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import MiniProfileModal from "./MiniProfileModal";

const RandomChatHistory = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axiosInstance.get("/random_chat/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchHistory();
  }, [user]);

  const handleOpenProfile = (userId) => {
    setSelectedUserId(userId);
  };

  const handleCloseProfile = () => {
    setSelectedUserId(null);
  };

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Random Chat History
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mx: "auto", display: "block", my: 6 }} />
      ) : history.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          You haven't had any random chats yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {history.map((session, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{ bgcolor: "#1e1e1e", color: "#fff", borderRadius: 3 }}
              >
                <CardActionArea onClick={() => handleOpenProfile(session.other_user_id)}>
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={session.other_profile_pic}
                      sx={{ width: 48, height: 48, bgcolor: "#333" }}
                    >
                      {session.other_display_name?.charAt(0) || "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                        {session.other_display_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#bbb" }}>
                        @{session.other_username}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888" }}>
                        {new Date(session.ended_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <MiniProfileModal
        open={Boolean(selectedUserId)}
        onClose={handleCloseProfile}
        userId={selectedUserId}
      />
    </Box>
  );
};

export default RandomChatHistory;
