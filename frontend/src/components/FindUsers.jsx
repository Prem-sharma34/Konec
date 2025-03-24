import { useState } from "react";
import axios from "axios";

const FindUsers = ({ user }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/users/search?name=${search}`
      );
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error searching users:", error);
    }
    setLoading(false);
  };

  const sendFriendRequest = async (receiverEmail) => {
    if (!user) {
      console.error("❌ No logged-in user found, cannot send request.");
      return;
    }

    console.log("📤 Sending friend request to:", receiverEmail);
    console.log("🟢 Sender:", user.email);  // ✅ Debugging sender email

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/friends/request", {
        sender: user.email,  // ✅ Ensure `user.email` is correct
        receiver: receiverEmail,
      });

      console.log("✅ Friend request sent successfully!", response.data);
      alert("Friend request sent!");
    } catch (error) {
      console.error("❌ Error sending friend request:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h3>Find Friends</h3>
      <input
        type="text"
        placeholder="Enter name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      <ul>
        {users.map((u) => (
          <li key={u.email}>
            {u.display_name} ({u.email}){" "}
            <button onClick={() => sendFriendRequest(u.email)}>Add Friend</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FindUsers;