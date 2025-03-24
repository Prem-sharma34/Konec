import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const Navbar = ({ setActiveSection }) => {
  const [userEmail, setUserEmail] = useState(null);
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
    localStorage.removeItem("user"); // Clear userEmail from localStorage
    setUserEmail(null);
    navigate("/login");
  };

  return (
    <nav>
      <h1>Konec</h1>
      <div>
        <button onClick={() => setActiveSection("chat")}>Chat</button>
        <button onClick={() => setActiveSection("friends")}>Friends</button>
        <button onClick={() => setActiveSection("profile")}>Profile</button>
        <button onClick={() => setActiveSection("notifications")}>Notifications</button>
        <button onClick={() => setActiveSection("findUsers")}>Find Users</button>
      </div>
      <div>
        {userEmail && <span>{userEmail}</span>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
