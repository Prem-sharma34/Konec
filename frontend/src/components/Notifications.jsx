import { useEffect, useState } from "react";
import axios from "axios";

const Notifications = ({ user }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!user || !user.email) return;

    const fetchRequests = async () => {
      try {
        console.log("📥 Fetching friend requests for:", user.email);
        const response = await axios.get(
          `http://127.0.0.1:5000/api/friend-requests/requests?user=${user.email}`
        );
        console.log("📋 Friend requests:", response.data);
        setRequests(response.data);
      } catch (error) {
        console.error("❌ Error fetching friend requests:", error);
      }
    };

    fetchRequests();
  }, [user]);

  const acceptRequest = async (senderEmail) => {
    try {
      console.log("✅ Accepting request from:", senderEmail);

      await axios.post("http://127.0.0.1:5000/api/friends/accept", {
        user: user.email,
        sender: senderEmail,
      });

      alert("Friend request accepted!");
      setRequests(requests.filter((r) => r.sender !== senderEmail)); // ✅ Remove from UI
    } catch (error) {
      console.error("❌ Error accepting request:", error);
    }
  };

  const rejectRequest = async (senderEmail) => {
    try {
      console.log("❌ Rejecting request from:", senderEmail);

      await axios.post("http://127.0.0.1:5000/api/friends/reject", {
        user: user.email,
        sender: senderEmail,
      });

      alert("Friend request rejected!");
      setRequests(requests.filter((r) => r.sender !== senderEmail)); // ✅ Remove from UI
    } catch (error) {
      console.error("❌ Error rejecting request:", error);
    }
  };

  return (
    <div>
      <h3>Notifications</h3>
      {requests.length === 0 ? (
        <p>No friend requests</p>
      ) : (
        <ul>
          {requests.map((r) => (
            <li key={r.sender}>
              {r.sender}{" "}
              <button onClick={() => acceptRequest(r.sender)}>Accept</button>
              <button onClick={() => rejectRequest(r.sender)}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
