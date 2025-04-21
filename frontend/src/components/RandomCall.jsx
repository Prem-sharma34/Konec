// file: src/components/RandomCall.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRandom } from "../context/RandomContext";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Grid,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import {
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteVolumeIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

const RandomCall = () => {
  const navigate = useNavigate();
  const { 
    endCall, 
    callStatus, 
    currentPartner, 
    callDuration, 
    toggleMute, 
    toggleSpeaker 
  } = useRandom();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [micPermissionError, setMicPermissionError] = useState(false);
  const [micStream, setMicStream] = useState(null);
  
  // Create a ref for the audio element
  const audioElementRef = useRef(null);
  
  // Request microphone access when component mounts
  useEffect(() => {
    // If call is not connected, go back to random page
    if (callStatus !== "connected") {
      navigate("/random");
      return;
    }
    
    // Setup an audio element to play the remote stream
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.autoplay = true;
    }
    
    // Function to request microphone access
    const requestMicAccess = async () => {
      console.log("Requesting microphone access in RandomCall component");
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("Microphone access granted in call component");
          setMicStream(stream);
          setMicPermissionError(false);
        } catch (err) {
          console.error("Microphone access error:", err);
          setMicPermissionError(true);
        }
      }
    };
    
    // Call the function immediately
    requestMicAccess();
    
    // Clean up function
    return () => {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = null;
      }
    };
  }, [callStatus, navigate]);
  
  // Function to manually request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setMicPermissionError(false);
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicPermissionError(true);
    }
  };
  
  const handleEndCall = () => {
    // Cleanup microphone stream
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }
    
    endCall();
    navigate("/random");
  };
  
  const handleToggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Use both direct mic control and WebRTC mute
    if (micStream) {
      micStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuteState;
      });
    }
    
    if (toggleMute) {
      toggleMute(newMuteState);
    }
  };
  
  const handleToggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);
    
    // Toggle speaker using context function
    if (toggleSpeaker) {
      toggleSpeaker(newSpeakerState);
    }
  };
  
  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 120px)",
        background: "linear-gradient(to bottom, #0f0f0f, #061a2a)",
        position: "relative",
        bgcolor: "#000000", // Ensure dark background
      }}
    >
      {/* Hidden audio element for remote stream */}
      <audio ref={audioElementRef} autoPlay playsInline style={{ display: 'none' }} />
      
      {/* Microphone permission prompt */}
      <Snackbar
        open={micPermissionError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mb: 8 }}
      >
        <Alert
          severity="warning"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={requestMicrophonePermission}
            >
              Allow Mic
            </Button>
          }
        >
          Microphone access is required for voice calls
        </Alert>
      </Snackbar>
      
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
      
      {/* Microphone permission error notification */}
      <Snackbar 
        open={micPermissionError} 
        autoHideDuration={6000} 
        onClose={() => setMicPermissionError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setMicPermissionError(false)} 
          severity="error" 
          sx={{ width: '100%', bgcolor: '#d32f2f', color: 'white' }}
        >
          Microphone access denied. Please enable it in your browser settings.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RandomCall;