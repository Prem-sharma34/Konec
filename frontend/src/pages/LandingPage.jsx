import { useState, useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FriendsList from "../components/FriendsList";
import Profile from "../components/Profile";
import Notifications from "../components/Notifications";
import FindUsers from "../components/FindUsers";
import Random from "../components/Random"; // New placeholder component

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("friends"); // Default to friends
  const [user, setUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user") 
        ? JSON.parse(localStorage.getItem("user")) 
        : null;
        
      if (!storedUser) {
        navigate("/login"); // Redirect to login if user is missing
        return;
      }
      
      // Make sure the user object has the id field
      if (storedUser && !storedUser.id && storedUser.uid) {
        // If we have uid but not id, copy uid to id
        storedUser.id = storedUser.uid;
      }
      
      console.log("User set in LandingPage:", storedUser);
      setUser(storedUser);
    };

    // Check for user on initial load
    handleStorageChange();

    // Also set up listener for storage changes
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

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
        {activeSection === "profile" && <Profile user={user} />}
        {activeSection === "notifications" && <Notifications user={user} />}
      </Box>
    </Box>
  );
};

export default LandingPage;