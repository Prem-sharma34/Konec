import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  CircularProgress,
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import axiosInstance from "../utils/axiosInstance";

const Notifications = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?.uid) return;

    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/friends/pending_requests");
        setRequests(response.data.requests || []);
      } catch (error) {
        setError(error.response?.data?.error || "Error fetching friend requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const acceptRequest = async (sender_id) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axiosInstance.post("/friends/accept_request", {
        sender_id,
      });
      setMessage(response.data.message || "Friend request accepted!");
      setRequests(requests.filter((r) => r.sender_id !== sender_id));
    } catch (error) {
      setError(error.response?.data?.error || "Error accepting request");
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (sender_id) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await axiosInstance.post("/friends/reject_request", {
        sender_id,
      });
      setMessage(response.data.message || "Friend request rejected!");
      setRequests(requests.filter((r) => r.sender_id !== sender_id));
    } catch (error) {
      setError(error.response?.data?.error || "Error rejecting request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        mt: { xs: 0, sm: 2, md: 4 },
        mb: { xs: 7, sm: 7, md: 7 }, // Add bottom margin to avoid overlap with navbar
        bgcolor: "rgba(30,30,47,0.85)",
        backdropFilter: "blur(12px)",
        color: "#fff",
        borderRadius: 4,
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "'Inter', 'Roboto', sans-serif",
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, textAlign: "center", fontWeight: 500 }}>
        Notifications
      </Typography>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", mb: 2, color: "#00FFD1" }} />}
      {error && (
        <Typography sx={{ mb: 2, textAlign: "center", color: "#FF5252" }}>
          {error}
        </Typography>
      )}
      {message && (
        <Typography sx={{ mb: 2, textAlign: "center", color: "#00FFD1" }}>
          {message}
        </Typography>
      )}

      {requests.length === 0 ? (
        <Typography sx={{ textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
          No friend requests
        </Typography>
      ) : (
        <List sx={{ 
          bgcolor: "rgba(43,43,60,0.5)",
          borderRadius: 2,
          p: 1
        }}>
          {requests.map((r) => (
            <ListItem
              key={r.sender_id}
              sx={{
                mb: 1,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.05)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
              secondaryAction={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Check />}
                    onClick={() => acceptRequest(r.sender_id)}
                    disabled={loading}
                    sx={{
                      bgcolor: "#00FFD1",
                      color: "#000",
                      fontWeight: 500,
                      "&:hover": { 
                        bgcolor: "#00ddb7" 
                      },
                      "&.Mui-disabled": {
                        bgcolor: "rgba(0, 255, 209, 0.3)",
                        color: "rgba(0, 0, 0, 0.5)"
                      }
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Close />}
                    onClick={() => rejectRequest(r.sender_id)}
                    disabled={loading}
                    sx={{
                      borderColor: "#FF5252",
                      color: "#FF5252",
                      "&:hover": { 
                        borderColor: "#ff3333",
                        bgcolor: "rgba(255, 82, 82, 0.1)" 
                      },
                      "&.Mui-disabled": {
                        borderColor: "rgba(255, 82, 82, 0.3)",
                        color: "rgba(255, 82, 82, 0.3)"
                      }
                    }}
                  >
                    Reject
                  </Button>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar 
                  src={r.profile_pic} 
                  alt={r.display_name}
                  sx={{
                    border: "2px solid rgba(255,255,255,0.2)",
                    width: 40,
                    height: 40
                  }}
                >
                  {r.display_name?.charAt(0) || "U"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={r.display_name}
                secondary={`@${r.sender_username}`}
                primaryTypographyProps={{
                  color: "#fff",
                  fontWeight: 500
                }}
                secondaryTypographyProps={{
                  color: "rgba(255,255,255,0.7)"
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Notifications;