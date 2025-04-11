import { useState, useEffect } from "react";
import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FriendsList from "../components/FriendsList";
import ChatBox from "../components/ChatBox"; // Import the new ChatBox component
import Profile from "../components/Profile";
import Notifications from "../components/Notifications";
import FindUsers from "../components/FindUsers";
import Random from "../components/Random";

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("friends"); // Default to friends
  const [user, setUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Function to handle when a friend is selected
  const handleFriendSelection = (friend) => {
    setSelectedFriend(friend);
    if (isMobile) {
      setActiveSection("chat");
    }
  };

  // Function to go back to friends list on mobile
  const handleBackToFriends = () => {
    setActiveSection("friends");
    setSelectedFriend(null);
  };

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
        }}
      >
        {activeSection === "friends" && (
          <Box sx={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            height: "calc(100vh - 120px)",
          }}>
            {/* Friends List (Left Side) */}
            <Box sx={{ 
              width: isMobile ? "100%" : "30%", 
              minWidth: isMobile ? "auto" : "300px",
              display: (isMobile && selectedFriend && activeSection === "chat") ? "none" : "block"
            }}>
              <FriendsList user={user} setSelectedFriend={handleFriendSelection} />
            </Box>
            
            {/* Chat Area (Right Side) */}
            <Box sx={{ 
              width: isMobile ? "100%" : "70%",
              display: (isMobile && !selectedFriend && activeSection !== "chat") ? "none" : "block",
              flexGrow: 1
            }}>
              {selectedFriend ? (
                <ChatBox 
                  user={user} 
                  selectedFriend={selectedFriend} 
                  onBack={isMobile ? handleBackToFriends : undefined}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: "100%", 
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "white",
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <img 
                      src="/api/placeholder/200/200" 
                      alt="Select a chat" 
                      style={{ 
                        opacity: 0.5, 
                        maxWidth: '100%',
                        borderRadius: '50%',
                        marginBottom: '16px'
                      }} 
                    />
                    <p>Select a friend to start chatting</p>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
        
        {activeSection === "chat" && (
          <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
            {selectedFriend ? (
              <ChatBox user={user} selectedFriend={selectedFriend} onBack={isMobile ? handleBackToFriends : undefined} />
            ) : (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <p>Select a friend to start chatting.</p>
              </Box>
            )}
          </Box>
        )}
        
        {activeSection === "search" && <FindUsers user={user} />}
        {activeSection === "profile" && <Profile user={user} />}
        {activeSection === "notifications" && <Notifications user={user} />}
        {activeSection === "random" && <Random />}
      </Box>
    </Box>
  );
};

export default LandingPage;