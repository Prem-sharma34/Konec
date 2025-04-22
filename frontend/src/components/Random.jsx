import { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Container, 
  Card, 
  CardContent, 
  Avatar, 
  Grid, 
  Tab, 
  Tabs, 
  LinearProgress,
  Divider
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import VideocamIcon from "@mui/icons-material/Videocam";
import HistoryIcon from "@mui/icons-material/History";
import axios from "../utils/axiosInstance";
import RandomChatBox from "./RandomChatBox";
import RandomChatHistory from "./RandomChatHistory";

const Random = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeMode, setActiveMode] = useState(null); // null, "chat", "call"
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const response = await axios.get("/random_chat/history");
        setChatHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [user]);

  // Handle tab change
  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle mode selection
  const handleModeSelect = (mode) => {
    setActiveMode(mode);
  };

  // Handle exiting active mode
  const handleExitMode = () => {
    setActiveMode(null);
    // Refresh history when exiting chat
    if (user?.id) {
      setLoading(true);
      axios.get("/random_chat/history")
        .then(response => {
          setChatHistory(response.data);
        })
        .catch(error => {
          console.error("Failed to refresh chat history:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 160px)",
        overflow: "auto",
        pb: 8,
      }}
    >
      <Container maxWidth="lg" sx={{ flex: 1 }}>
        {activeMode === "chat" ? (
          <RandomChatBox user={user} onExit={handleExitMode} />
        ) : activeMode === "call" ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: "center", 
              borderRadius: 2,
              bgcolor: "rgba(30,30,47,0.85)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Random Call Feature
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ color: "#ccc" }}>
              This feature is coming soon! Check back later.
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleExitMode}
              sx={{ 
                mt: 2,
                bgcolor: "#E50914",
                "&:hover": { bgcolor: "#b2070f" }
              }}
            >
              Go Back
            </Button>
          </Paper>
        ) : (
          <>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2, 
                overflow: "hidden", 
                mb: 4, 
                mt: 2,
                bgcolor: "rgba(30,30,47,0.85)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="random interactions tabs"
                sx={{ 
                  borderBottom: 1, 
                  borderColor: "rgba(255,255,255,0.1)",
                  bgcolor: "#141414",
                  "& .MuiTab-root": { 
                    color: "#aaa",
                  },
                  "& .Mui-selected": {
                    color: "#E50914 !important",
                  },
                  "& .MuiTabs-indicator": {
                    bgcolor: "#E50914",
                  }
                }}
              >
                <Tab icon={<ChatIcon />} label="Random" />
                <Tab icon={<HistoryIcon />} label="History" />
              </Tabs>
              
              {activeTab === 0 ? (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Connect with New People
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ color: "#ccc" }}>
                    Start a conversation with someone new! Choose how you want to connect:
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Card 
                        elevation={3} 
                        sx={{ 
                          height: "100%", 
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-5px)"
                          },
                          bgcolor: "#1c1c1c",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onClick={() => handleModeSelect("chat")}
                      >
                        <CardContent sx={{ textAlign: "center", p: 4 }}>
                          <ChatIcon sx={{ fontSize: 60, color: "#E50914", mb: 2 }} />
                          <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>
                            Random Chat
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            Start a text conversation with someone new
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card 
                        elevation={3} 
                        sx={{ 
                          height: "100%", 
                          cursor: "pointer",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "translateY(-5px)"
                          },
                          bgcolor: "#1c1c1c",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onClick={() => handleModeSelect("call")}
                      >
                        <CardContent sx={{ textAlign: "center", p: 4 }}>
                          <VideocamIcon sx={{ fontSize: 60, color: "#E50914", mb: 2 }} />
                          <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>
                            Random Call
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#ccc" }}>
                            Start a video call with someone new (Coming Soon)
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Your Random Chat History
                  </Typography>
                  {loading && <LinearProgress sx={{ mb: 3, "& .MuiLinearProgress-bar": { bgcolor: "#E50914" } }} />}
                  <RandomChatHistory history={chatHistory} />
                </Box>
              )}
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Random;