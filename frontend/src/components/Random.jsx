// file: src/components/Random.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRandom } from "../context/RandomContext";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ChatBubbleOutline as MessageIcon,
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteVolumeIcon,
  Close as CloseIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

const Random = () => {
  console.log("Random component rendering");
  
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Debug what values we're getting from useRandom
  const randomContext = useRandom();
  console.log("Random context received:", randomContext);
  
  const { 
    connected, 
    startRandomChat, 
    startRandomCall, 
    endChat, 
    endCall, 
    cancelSearch, 
    chatStatus, 
    callStatus, 
    currentPartner,
    callDuration 
  } = randomContext;
  
  const [view, setView] = useState("options");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  // Handle UI updates based on status changes
  useEffect(() => {
    console.log("Status change effect:", { chatStatus, callStatus });
    
    if (chatStatus === "searching") {
      setView("searching-chat");
    } else if (callStatus === "searching") {
      setView("searching-call");
    } else if (callStatus === "connected") {
      setView("connected-call");
    } else if (callStatus === "ended") {
      setView("call-ended");
    } else if (chatStatus === "connected") {
      navigate("/random-chat");
    } else if (chatStatus === "ended" && view !== "options" && view !== "call-ended") {
      setView("chat-ended");
    }
  }, [chatStatus, callStatus, navigate, view]);
  
  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
  
  // Handle chat button click
  const handleRandomChatClick = () => {
    console.log("Random chat button clicked");
    startRandomChat();
  };
  
  // Handle call button click
  const handleRandomCallClick = () => {
    console.log("Random call button clicked");
    
    // First request microphone permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log("Microphone permission granted");
          
          // Store the stream for later use
          window.localStream = stream;
          
          // Now start the random call
          startRandomCall();
        })
        .catch(err => {
          console.error("Microphone permission denied:", err);
          alert("Please allow microphone access to use the call feature.");
        });
    } else {
      alert("Your browser doesn't support microphone access. Voice calls may not work properly.");
      startRandomCall();
    }
  };
  
  // Handle end call
  const handleEndCall = () => {
    console.log("End call button clicked");
    endCall();
  };

  const resetToOptions = () => {
    console.log("Resetting to options view");
    setView("options");
    
    // Clean up any ongoing calls or chats
    if (callStatus !== "idle") {
      endCall();
    }
    
    if (chatStatus !== "idle") {
      endChat();
    }
    
    // Reset context if available
    if (randomContext.resetToOptions) {
      randomContext.resetToOptions();
    }
  };
  
  // Handle cancel search
  const handleCancelSearch = () => {
    console.log("Cancel search button clicked");
    cancelSearch();
    setView("options");
  };
  
  // Handle find new call
  const handleFindNewCall = () => {
    console.log("Find new call button clicked");
    setView("searching-call");
    startRandomCall();
  };
  
  // Handle toggle mute
  const handleToggleMute = () => {
    console.log("Toggle mute button clicked");
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Use the toggleMute function from context
    if (randomContext.toggleMute) {
      randomContext.toggleMute(newMuteState);
    }
  };
  
  // Handle toggle speaker
  const handleToggleSpeaker = () => {
    console.log("Toggle speaker button clicked");
    setIsSpeakerOn(!isSpeakerOn);
    // Implement actual speaker toggle logic here
  };
  
  // Handle back to options
  const handleBackToOptions = () => {
    console.log("Back to options button clicked");
    setView("options");
  };
  
  console.log("Current view:", view);
  
  // Home button (shown on all screens)
  const HomeButton = () => (
    <IconButton
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        bgcolor: 'rgba(255,255,255,0.1)',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.2)',
        },
      }}
      onClick={() => navigate('/')}
    >
      <HomeIcon />
    </IconButton>
  );


  
  // Render initial options view
  if (view === "options") {
    console.log("Rendering options view");
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 120px)",
          position: "relative",
        }}
      >
        <HomeButton />
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: "600px",
            width: "100%",
            bgcolor: "#1c1c1c",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom 
            sx={{ 
              color: "#4db6ac",
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Random Connections
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              color: "rgba(255,255,255,0.6)",
              mb: 4
            }}
          >
            Connect with random people around the world. Chat anonymously or have voice conversations.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={2}
                onClick={handleRandomChatClick}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#0f0f0f",
                  border: "2px solid #4db6ac",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  '&:hover': {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 20px rgba(77, 182, 172, 0.3)",
                  }
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(77, 182, 172, 0.15)",
                    borderRadius: "50%",
                    p: 2,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageIcon fontSize="large" sx={{ color: "#4db6ac" }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: "#4db6ac",
                    fontWeight: 'bold',
                    mb: 1
                  }}
                >
                  Random Chat
                </Typography>
                <Typography 
                  variant="body2" 
                  align="center"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Text chat with someone new
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={2}
                onClick={handleRandomCallClick}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#0f0f0f",
                  border: "2px solid #5c6bc0",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  '&:hover': {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 20px rgba(92, 107, 192, 0.3)",
                  }
                }}
              >
                <Box
                  sx={{
                    bgcolor: "rgba(92, 107, 192, 0.15)",
                    borderRadius: "50%",
                    p: 2,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CallIcon fontSize="large" sx={{ color: "#5c6bc0" }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: "#5c6bc0",
                    fontWeight: 'bold',
                    mb: 1
                  }}
                >
                  Random Call
                </Typography>
                <Typography 
                  variant="body2" 
                  align="center"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Voice call with someone new
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Typography 
            variant="caption" 
            align="center" 
            sx={{ 
              display: "block", 
              mt: 4, 
              color: "rgba(255,255,255,0.4)" 
            }}
          >
            All connections are anonymous and secure
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  // Render searching call/chat view
  if (view === "searching-call" || view === "searching-chat") {
    console.log("Rendering searching view:", view);
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 120px)",
          position: "relative",
        }}
      >
        <HomeButton />
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: "400px",
            width: "100%",
            bgcolor: "#1c1c1c",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress 
            sx={{ 
              color: view === "searching-chat" ? "#4db6ac" : "#5c6bc0",
              mb: 3
            }}
            size={60}
          />
          
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2
            }}
          >
            {view === "searching-chat" 
              ? "Finding someone to chat with..." 
              : "Finding someone to call..."}
          </Typography>
          
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              color: "rgba(255,255,255,0.6)",
              mb: 4
            }}
          >
            This may take a moment while we find a match for you
          </Typography>
          
          <Button
            variant="outlined"
            onClick={handleCancelSearch}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              '&:hover': {
                borderColor: "rgba(255,255,255,0.6)",
                bgcolor: "rgba(255,255,255,0.05)",
              }
            }}
          >
            Cancel Search
          </Button>
        </Paper>
      </Box>
    );
  }
  
  // Render connected call view
  if (view === "connected-call") {
    console.log("Rendering connected call view");
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 120px)",
          background: "linear-gradient(to bottom, #0f0f0f, #061a2a)",
          position: "relative",
        }}
      >
        <HomeButton />
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: "400px",
            width: "100%",
            bgcolor: "#1c1c1c",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4db6ac, #5c6bc0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              fontSize: "3rem",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 0 15px rgba(92, 107, 192, 0.5)",
            }}
          >
            {currentPartner?.username?.[0]?.toUpperCase() || 'A'}
          </Box>
          
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              mb: 1
            }}
          >
            {currentPartner?.username || 'Anonymous User'}
          </Typography>
          
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.07)",
              px: 2,
              py: 0.5,
              borderRadius: 5,
              mb: 1,
              display: "inline-block",
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#5c6bc0",
                fontWeight: 'medium',
              }}
            >
              {formatDuration(callDuration)}
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: "rgba(255,255,255,0.5)",
              mb: 4,
            }}
          >
            Voice call
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {/* Mute Button */}
            <Grid item>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <IconButton 
                  onClick={handleToggleMute}
                  sx={{
                    bgcolor: isMuted ? "rgba(244, 67, 54, 0.15)" : "rgba(255,255,255,0.07)",
                    '&:hover': {
                      bgcolor: isMuted ? "rgba(244, 67, 54, 0.25)" : "rgba(255,255,255,0.15)",
                    },
                    p: 2,
                    mb: 1
                  }}
                >
                  {isMuted ? 
                    <MicOffIcon sx={{ color: "#f44336", fontSize: 28 }} /> : 
                    <MicIcon sx={{ color: "white", fontSize: 28 }} />
                  }
                </IconButton>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                  {isMuted ? 'Unmute' : 'Mute'}
                </Typography>
              </Box>
            </Grid>
            
            {/* End Call Button */}
            <Grid item>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <IconButton 
                  onClick={handleEndCall}
                  sx={{
                    bgcolor: "#f44336",
                    '&:hover': {
                      bgcolor: "#d32f2f",
                    },
                    p: 2,
                    mb: 1
                  }}
                >
                  <CallEndIcon sx={{ color: "white", fontSize: 28 }} />
                </IconButton>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                  End Call
                </Typography>
              </Box>
            </Grid>
            
            {/* Speaker Toggle Button */}
            <Grid item>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <IconButton 
                  onClick={handleToggleSpeaker}
                  sx={{
                    bgcolor: !isSpeakerOn ? "rgba(244, 67, 54, 0.15)" : "rgba(255,255,255,0.07)",
                    '&:hover': {
                      bgcolor: !isSpeakerOn ? "rgba(244, 67, 54, 0.25)" : "rgba(255,255,255,0.15)",
                    },
                    p: 2,
                    mb: 1
                  }}
                >
                  {isSpeakerOn ? 
                    <VolumeIcon sx={{ color: "white", fontSize: 28 }} /> : 
                    <MuteVolumeIcon sx={{ color: "#f44336", fontSize: 28 }} />
                  }
                </IconButton>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                  {isSpeakerOn ? 'Speaker' : 'Earpiece'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography
            variant="caption"
            align="center"
            sx={{
              color: "rgba(255,255,255,0.3)",
              mt: 4,
              display: "block",
            }}
          >
            All calls are end-to-end encrypted
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  // Render call/chat ended view
  if (view === "call-ended" || view === "chat-ended") {
    console.log("Rendering ended view:", view);
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 120px)",
          position: "relative",
          bgcolor: "#000000", // Ensure dark background
        }}
      >
        <IconButton
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            },
          }}
          onClick={() => navigate('/')}
        >
          <HomeIcon />
        </IconButton>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            maxWidth: "400px",
            width: "100%",
            bgcolor: "#1c1c1c",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3
            }}
          >
            <Box
              sx={{
                bgcolor: "rgba(244, 67, 54, 0.15)",
                borderRadius: "50%",
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseIcon fontSize="large" sx={{ color: "#f44336" }} />
            </Box>
            
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                mb: 1
              }}
            >
              {view === "call-ended" ? "Call Ended" : "Chat Ended"}
            </Typography>
            
            <Typography 
              variant="body2" 
              align="center" 
              sx={{ 
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Your {view === "call-ended" ? "call" : "chat"} has been disconnected
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => {
                if (view === "call-ended") {
                  handleFindNewCall();
                } else {
                  handleRandomChatClick();
                }
              }}
              sx={{
                bgcolor: view === "call-ended" ? "#5c6bc0" : "#4db6ac",
                '&:hover': {
                  bgcolor: view === "call-ended" ? "#3f51b5" : "#00897b",
                }
              }}
            >
              Find New {view === "call-ended" ? "Call" : "Chat"}
            </Button>
            
            <Button
  variant="outlined"
  onClick={resetToOptions}
  sx={{
    color: "white",
    borderColor: "rgba(255,255,255,0.3)",
    '&:hover': {
      borderColor: "rgba(255,255,255,0.6)",
      bgcolor: "rgba(255,255,255,0.05)",
    }
  }}
>
  Back to Options
</Button>
          </Box>
        </Paper>
      </Box>
    );
  }
  
  // Default fallback view
  console.log("Rendering fallback view");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 120px)",
        position: "relative",
      }}
    >
      <HomeButton />
      
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: "400px",
          width: "100%",
          bgcolor: "#1c1c1c",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
      >
        <Typography 
          variant="h5" 
          align="center"
          sx={{ 
            color: "#4db6ac",
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Random Chat/Call
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Current view: {view}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>Chat status: {chatStatus}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>Call status: {callStatus}</Typography>
          <Typography variant="body2">Connected: {connected ? 'Yes' : 'No'}</Typography>
        </Box>
        
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleBackToOptions}
            sx={{
              bgcolor: "#5c6bc0",
              '&:hover': {
                bgcolor: "#3f51b5",
              }
            }}
          >
            Back to Options
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Random;