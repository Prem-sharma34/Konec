import { useEffect, useState } from "react";
import { ref, set, onValue, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { database } from "../utils/firebaseConfig";
import axios from "../utils/axiosInstance";
import ChatBox from "./ChatBox";

const RandomChatBox = ({ user, onExit }) => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== user.id) {
      console.error("User not authenticated or ID mismatch");
      onExit();
      return;
    }

    const queueRef = ref(database, "random_queue");
    const userRef = ref(database, `random_queue/${user.id}`);

    const enterQueue = async () => {
      try {
        await set(userRef, { timestamp: Date.now() });

        onValue(queueRef, async (snapshot) => {
          const users = snapshot.val();
          if (!users) return;

          const userIds = Object.keys(users);
          const otherUserId = userIds.find((uid) => uid !== user.id);

          if (otherUserId) {
            await remove(ref(database, `random_queue/${user.id}`));
            await remove(ref(database, `random_queue/${otherUserId}`));

            await axios.post("/chat/get_or_create_chat", {
              user_id_1: user.id,
              user_id_2: otherUserId,
            });

            setSelectedFriend({
              user_id: otherUserId,
              display_name: "Random Stranger",
              profile_pic: "/avatar.png",
            });
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error in queue logic:", err);
        onExit();
      }
    };

    enterQueue();

    return () => {
      remove(userRef);
    };
  }, []);

  if (loading || !selectedFriend) {
    return <div style={{ textAlign: "center", paddingTop: 100 }}>Matching you with someone...</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      <ChatBox user={user} selectedFriend={selectedFriend} isRandomChat onExit={onExit} />
    </div>
  );
};

export default RandomChatBox;
