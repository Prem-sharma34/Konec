import { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";

const MessageInput = ({ user }) => {
  const [message, setMessage] = useState("");
  const db = getDatabase();
  
  const sendMessage = () => {
    if (!message.trim() || !user) return;
  
    const messagesRef = ref(db, "messages");
  
    push(messagesRef, {
      text: message.trim(), // Trim to avoid empty messages
      sender: user.email, 
      timestamp: Date.now(),
    });
  
    setMessage(""); // Clear input after sending
  };
  

  return (
    <div className="p-4 border-t flex">
      <input
        type="text"
        className="flex-1 p-2 border rounded"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white p-2 ml-2 rounded"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
