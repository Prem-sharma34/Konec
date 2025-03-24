import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatBox = ({ user, selectedFriend }) => {
  return (
    <div className="border rounded-lg p-4 w-full">
      <h2 className="text-lg font-bold">Chat with {selectedFriend.display_name}</h2>
      <MessageList user={user} selectedFriend={selectedFriend} />
      <MessageInput user={user} selectedFriend={selectedFriend} />
    </div>
  );
};

export default ChatBox;
