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
} from "@mui/material";
import {
  People as FriendsIcon,
  Casino as RandomIcon,
  Search as SearchIcon,
  Person as ProfileIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

const Navbar = ({ setActiveSection, activeSection, user }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

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

  return (
    <>
      {/* Top Bar */}
      <AppBar position="static" sx={{ bgcolor: "white", color: "black", boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          {/* Centered Logo */}
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Konec
          </Typography>

          {/* Right Avatar */}
          <Avatar
            sx={{
              position: "absolute",
              right: 16,
              bgcolor: "grey.300",
              cursor: "pointer",
            }}
            onClick={handleMenuOpen}
          >
            {user?.display_name?.charAt(0) || "U"}
          </Avatar>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled>{userEmail || "User"}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Bottom Navigation */}
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
          bgcolor: "white",
          boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <BottomNavigationAction
          label="Friends"
          value="friends"
          icon={<FriendsIcon />}
        />
        <BottomNavigationAction
          label="Random"
          value="random"
          icon={<RandomIcon />}
        />
        <BottomNavigationAction
          label="Search"
          value="search"
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label="Profile"
          value="profile"
          icon={<ProfileIcon />}
        />
        <BottomNavigationAction
          label="Notifications"
          value="notifications"
          icon={<NotificationsIcon />}
        />
      </BottomNavigation>
    </>
  );
};

export default Navbar;