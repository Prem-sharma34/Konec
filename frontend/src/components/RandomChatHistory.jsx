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
  Pagination,
} from "@mui/material";
import axiosInstance from "../utils/axiosInstance";
import MiniProfileModal from "./MiniProfileModal";

const RandomChatHistory = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        console.log("Fetching random chat history");
        const res = await axiosInstance.get("/random_chat/history");
        console.log("History response:", res.data);
        
        // Ensure history is always an array
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchHistory();
  }, [user]);
  const handleOpenProfile = (userId) => {
    setSelectedUserId(userId);
  };

  const handleCloseProfile = () => {
    setSelectedUserId(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedHistory = history.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Random Chat History
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
          <CircularProgress />
        </Box>
      ) : history.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          You haven't had any random chats yet. Start one now!
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedHistory.map((session, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ bgcolor: "#1e1e1e", color: "#fff", borderRadius: 3 }}>
                  <CardActionArea onClick={() => handleOpenProfile(session.other_user_id)}>
                    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={session.other_profile_pic}
                        sx={{ width: 48, height: 48, bgcolor: "#333" }}
                        alt={session.other_display_name || session.other_username}
                      >
                        {session.other_display_name?.charAt(0) || session.other_username?.charAt(0) || "U"}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                          {session.other_display_name || session.other_username || "Anonymous"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#bbb" }}>
                          @{session.other_username || "unknown"}
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
          {history.length > itemsPerPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={Math.ceil(history.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                aria-label="chat history pagination"
              />
            </Box>
          )}
        </>
      )}

      <MiniProfileModal
        open={!!selectedUserId}
        onClose={handleCloseProfile}
        userId={selectedUserId}
      />
    </Box>
  );
};

export default RandomChatHistory;