import { useState, useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";
import FriendsList from "../components/FriendsList";
import Profile from "../components/Profile";
import Notifications from "../components/Notifications";
import FindUsers from "../components/FindUsers";
import Random from "../components/Random"; // New placeholder component

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("friends"); // Default to friends since chat needs a selected friend
  const [user, setUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      {/* Top Bar */}
      <Navbar setActiveSection={setActiveSection} activeSection={activeSection} user={user} />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          bgcolor: "grey.100",
          overflowY: "auto",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {activeSection === "chat" && (
          selectedFriend ? (
            <ChatBox user={user} selectedFriend={selectedFriend} />
          ) : (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <p>Select a friend to start chatting.</p>
            </Box>
          )
        )}
        {activeSection === "friends" && (
          <FriendsList user={user} setSelectedFriend={setSelectedFriend} />
        )}
        {activeSection === "random" && <Random />}
        {activeSection === "search" && <FindUsers user={user} />}
        {activeSection === "profile" && <Profile />}
        {activeSection === "notifications" && <Notifications user={user} />}
      </Box>
    </Box>
  );
};

export default LandingPage;