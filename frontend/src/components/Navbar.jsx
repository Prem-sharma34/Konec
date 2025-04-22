import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Box,
} from "@mui/material";
import {
  People as FriendsIcon,
  Casino as RandomIcon,
  Search as SearchIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { deepPurple } from "@mui/material/colors";
import axiosInstance from "../utils/axiosInstance";

const Navbar = ({ setActiveSection, activeSection, user }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileData, setProfileData] = useState({
    profile_pic: null,
    display_name: "",
  });
  const navigate = useNavigate();

  // Get user details including correct profile pic from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const response = await axiosInstance.get("/profile/get");
        if (response.data) {
          setProfileData({
            profile_pic: response.data.profilePic || response.data.profile_pic,
            display_name: response.data.display_name || user.display_name
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);
      } catch (error) {
        console.log("Invalid token:", error);
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("uid");
    setUserEmail(null);
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Use the profile pic from our fetched profile data
  const profilePic = profileData.profile_pic || 
                    user?.profilePic || 
                    user?.profile_pic;
                    
  const displayLetter = (profileData.display_name || user?.display_name || "")
                        .charAt(0)
                        .toUpperCase() || "U";

                        return (
                          <>
                            {/* Top App Bar */}
                            <AppBar
                              position="static"
                              sx={{
                                bgcolor: "#141414",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.8)",
                              }}
                            >
                              <Toolbar
                                sx={{
                                  justifyContent: "space-between",
                                  px: 2,
                                }}
                              >
                                <Typography
                                  variant="h5"
                                  sx={{
                                    fontWeight: "bold",
                                    color: "white",
                                    fontFamily: "Netflix Sans, Helvetica Neue, Segoe UI, Roboto, Ubuntu, sans-serif",
                                    letterSpacing: 1,
                                  }}
                                >
                                  Konec
                                </Typography>
                      
                                <Box>
                                  <Avatar
                                    src={profilePic || undefined}
                                    onClick={handleMenuOpen}
                                    sx={{
                                      bgcolor: profilePic ? "transparent" : deepPurple[700],
                                      color: "white",
                                      cursor: "pointer",
                                      width: 44,
                                      height: 44,
                                      border: "2px solid white",
                                      boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
                                    }}
                                  >
                                    {!profilePic && displayLetter}
                                  </Avatar>
                      
                                  <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                                    PaperProps={{
                                      sx: {
                                        bgcolor: "#1a1a1a",
                                        color: "white",
                                        border: "1px solid #333",
                                        mt: 1,
                                      },
                                    }}
                                  >
                                    <MenuItem disabled>{userEmail || "User"}</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                  </Menu>
                                </Box>
                              </Toolbar>
                            </AppBar>
                      
                            {/* Bottom Navigation Bar */}
                            <BottomNavigation
                              showLabels
                              value={activeSection}
                              onChange={(event, newValue) => {
                                setActiveSection(newValue);
                              }}
                              sx={{
                                position: "fixed",
                                bottom: 0,
                                width: "100%",
                                bgcolor: "#141414",
                                borderTop: "1px solid #333",
                                boxShadow: "0 -2px 10px rgba(0,0,0,0.8)",
                              }}
                            >
                              <BottomNavigationAction
                                label="Friends"
                                value="friends"
                                icon={<FriendsIcon />}
                                sx={{ color: activeSection === "friends" ? "#E50914" : "#aaa" }}
                              />
                              <BottomNavigationAction
                                label="Random"
                                value="random"
                                icon={<RandomIcon />}
                                sx={{ color: activeSection === "random" ? "#E50914" : "#aaa" }}
                              />
                              <BottomNavigationAction
                                label="Search"
                                value="search"
                                icon={<SearchIcon />}
                                sx={{ color: activeSection === "search" ? "#E50914" : "#aaa" }}
                              />
                              <BottomNavigationAction
                                label="Profile"
                                value="profile"
                                icon={<ProfileIcon />}
                                sx={{ color: activeSection === "profile" ? "#E50914" : "#aaa" }}
                              />
                              <BottomNavigationAction
                                label="Notifications"
                                value="notifications"
                                icon={<NotificationsIcon />}
                                sx={{ color: activeSection === "notifications" ? "#E50914" : "#aaa" }}
                              />
                            </BottomNavigation>
                          </>
                        );
                      };
                      
                      export default Navbar;