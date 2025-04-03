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
        p: 2,
        bgcolor: "white",
        borderRadius: 2,
        boxShadow: 1,
        width: "100%",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        Notifications
      </Typography>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
          {error}
        </Typography>
      )}
      {message && (
        <Typography color="success.main" sx={{ mb: 2, textAlign: "center" }}>
          {message}
        </Typography>
      )}

      {requests.length === 0 ? (
        <Typography color="textSecondary" sx={{ textAlign: "center" }}>
          No friend requests
        </Typography>
      ) : (
        <List>
          {requests.map((r) => (
            <ListItem
              key={r.sender_id}
              secondaryAction={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<Check />}
                    onClick={() => acceptRequest(r.sender_id)}
                    disabled={loading}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Close />}
                    onClick={() => rejectRequest(r.sender_id)}
                    disabled={loading}
                  >
                    Reject
                  </Button>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar src={r.profile_pic} alt={r.display_name}>
                  {r.display_name?.charAt(0) || "U"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={r.display_name}
                secondary={`@${r.sender_username}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Notifications;