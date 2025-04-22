import { useEffect, useState } from "react";
import { ref, set, onValue, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { database } from "../utils/firebaseConfig";
import axios from "../utils/axiosInstance";
import ChatBox from "./ChatBox";
import { Box, Typography, CircularProgress } from "@mui/material";

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
    return (
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "50vh",
          color: "#fff",
          p: 4
        }}
      >
        <CircularProgress sx={{ color: "#E50914", mb: 3 }} />
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Matching you with someone...
        </Typography>
        <Typography variant="body2" sx={{ color: "#ccc", mt: 1 }}>
          Please wait while we find you a random chat partner
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      <ChatBox user={user} selectedFriend={selectedFriend} isRandomChat onExit={onExit} />
    </Box>
  );
};

export default RandomChatBox;