import { useEffect, useState } from "react";
import axios from "axios";

const MessageList = ({ user, selectedFriend }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user || !selectedFriend) return;

    const fetchMessages = async () => {
      try {
        console.log("📥 Fetching messages for:", user.email, "with", selectedFriend.email);
        const response = await axios.get(
          `http://127.0.0.1:5000/api/chat/get_messages?user1=${user.email}&user2=${selectedFriend.email}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [user, selectedFriend]);

  return (
    <div className="p-4 bg-gray-100 h-64 overflow-auto">
      {messages.length === 0 ? (
        <p className="text-center text-gray-500">No messages yet.</p>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded ${
              msg.sender === user.email ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black self-start"
            }`}
          >
            {msg.text}
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;
