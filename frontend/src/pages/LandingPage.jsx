import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";
import FriendsList from "../components/FriendsList";
import Profile from "../components/Profile";
import Notifications from "../components/Notifications";
import FindUsers from "../components/FindUsers";

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("chat");
  const [user, setUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);  // ✅ Track selected friend

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
    <div>
      <Navbar setActiveSection={setActiveSection} />
      <div>
        {activeSection === "chat" && (
          selectedFriend ? (
            <ChatBox user={user} selectedFriend={selectedFriend} />
          ) : (
            <p>Select a friend to start chatting.</p>
          )
        )}
        {activeSection === "friends" && <FriendsList user={user} setSelectedFriend={setSelectedFriend} />}
        {activeSection === "profile" && <Profile />}
        {activeSection === "notifications" && <Notifications user={user} />}
        {activeSection === "findUsers" && <FindUsers user={user} />}
      </div>
    </div>
  );
};

export default LandingPage;
