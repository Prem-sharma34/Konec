import { useEffect } from "react";
import { Box, Typography, useMediaQuery, useTheme, Card, CardActionArea } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CallIcon from "@mui/icons-material/Call";
import { motion } from "framer-motion";

const Random = ({ onSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
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
              ":hover": {
                transform: "scale(1.03)",
              },
            }}
            onClick={() => onSelect(option.type)}
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
    </Box>
  );
};

export default Random;