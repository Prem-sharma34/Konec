import { useEffect, useState } from "react";
import axios from "axios";

const FriendsList = ({ user, setSelectedFriend }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!user || !user.email) return;

    axios.get(`http://127.0.0.1:5000/api/friends/list?user=${user.email}`)
      .then((response) => {
        console.log("📋 Friends API Response:", response.data);  // ✅ Debugging line
        setFriends(response.data.friends || []);  // ✅ Ensure an empty array if no friends
      })
      .catch((error) => {
        console.error("❌ Error fetching friends:", error);
      });
  }, [user]);

  return (
    <div>
      <h2>Friends List</h2>
      {friends.length > 0 ? (
        <ul>
          {friends.map((friend) => (
            <li 
              key={friend.email} 
              onClick={() => setSelectedFriend(friend)} 
              className="cursor-pointer p-2 border-b hover:bg-gray-200"
            >
              {friend.display_name} ({friend.email})
            </li>
          ))}
        </ul>
      ) : (
        <p>No friends found.</p>
      )}
    </div>
  );
};

export default FriendsList;
