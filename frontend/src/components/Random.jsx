import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Card,
  CardActionArea,
  CircularProgress,
  Button,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CallIcon from "@mui/icons-material/Call";
import { motion } from "framer-motion";

import useRandomQueue from "../hooks/useRandomQueue";
import RandomChatBox from "./RandomChatBox";
import RandomChatHistory from "./RandomChatHistory";

const Random = ({ user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [view, setView] = useState("chooser"); // chooser | chat | history
  const [sessionId, setSessionId] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  const { joinQueue, leaveQueue, createSession, listenForMatch } = useRandomQueue();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelect = async (type) => {
    if (!user?.id) {
      console.error("User not loaded yet");
      return;
    }
  
    if (type === "chat") {
      try {
        setIsMatching(true);
        const { sessionId, partnerId } = await joinQueue(user.id);
        setSessionId(sessionId);
        setPartnerId(partnerId);
        setView("chat");
      } catch (err) {
        console.error("Error joining queue:", err);
      } finally {
        setIsMatching(false);
      }
    } else {
      alert("Random call is not implemented yet.");
    }
  };
  

  const handleEndChat = () => {
    setView("chooser");
    setSessionId(null);
    setPartnerId(null);
  };

  // UI for chooser
  const renderChooser = () => {
    const options = [
      {
        label: "Random Chat",
        icon: <ChatIcon sx={{ fontSize: 60, color: "#1976d2" }} />,
        type: "chat",
      },
      {
        label: "Random Call",
        icon: <CallIcon sx={{ fontSize: 60, color: "#1976d2" }} />,
        type: "call",
      },
    ];

    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 120px)",
          p: 2,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 600 }}>
          Choose Your Random Experience
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 4,
            mt: 4,
            width: "100%",
            maxWidth: 1000,
            justifyContent: "center",
          }}
        >
          {options.map((option) => (
            <Card
              key={option.type}
              sx={{
                flex: 1,
                minHeight: 250,
                backgroundColor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(8px)",
                borderRadius: 4,
                boxShadow: 3,
                transition: "transform 0.3s ease",
                cursor: "pointer",
                ":hover": { transform: "scale(1.03)" },
              }}
              onClick={() => handleSelect(option.type)}
            >
              <CardActionArea
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 3,
                }}
              >
                {option.icon}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
                  {option.label}
                </Typography>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body2"
            sx={{
              textDecoration: "underline",
              cursor: "pointer",
              color: "#90caf9",
              fontWeight: 500,
            }}
            onClick={() => setView("history")}
          >
            View Random Chat History
          </Typography>
        </Box>

        {isMatching && (
          <Box sx={{ mt: 3 }}>
            <CircularProgress />
            <Typography sx={{ mt: 1, fontSize: 14, color: "#999" }}>
              Finding someone to chat with...
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      {view === "chooser" && renderChooser()}
      {view === "chat" && sessionId && partnerId && (
        <RandomChatBox
          sessionId={sessionId}
          partnerId={partnerId}
          user={user}
          onEnd={handleEndChat}
        />
      )}
      {view === "history" && (
        <RandomChatHistory user={user} onBack={() => setView("chooser")} />
      )}
    </>
  );
};

export default Random;
