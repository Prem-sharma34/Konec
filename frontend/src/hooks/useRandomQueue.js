import { useEffect, useState, useCallback } from "react";
import { getDatabase, ref, set, remove, onValue, get, push, update } from "firebase/database";
import { database } from "../utils/firebaseConfig";
import { v4 as uuidv4 } from "uuid";

const useRandomQueue = (user, onMatched) => {
  const [queueStatus, setQueueStatus] = useState("idle"); // idle | joining | waiting | matched | error
  const [sessionId, setSessionId] = useState(null);

  const joinQueue = useCallback(async () => {
    if (!user?.id) return;

    try {
      setQueueStatus("joining");
      const queueRef = ref(database, `random_queue/${user.id}`);
      await set(queueRef, {
        timestamp: Date.now(),
        display_name: user.display_name,
        profile_pic: user.profile_pic || user.profilePic || "",
      });

      setQueueStatus("waiting");

      const queueRootRef = ref(database, "random_queue");
      const unsubscribe = onValue(queueRootRef, async (snapshot) => {
        const queueData = snapshot.val();

        if (!queueData || Object.keys(queueData).length < 2) return;

        const availableUsers = Object.keys(queueData).filter((uid) => uid !== user.id);

        if (availableUsers.length > 0) {
          const partnerId = availableUsers[0];
          const sessionRef = ref(database, `random_sessions`);
          const sessionKey = uuidv4();

          const sessionData = {
            users: [user.id, partnerId],
            created_at: Date.now(),
            ended: false,
          };

          await set(ref(database, `random_sessions/${sessionKey}`), sessionData);

          await remove(ref(database, `random_queue/${user.id}`));
          await remove(ref(database, `random_queue/${partnerId}`));

          setSessionId(sessionKey);
          setQueueStatus("matched");

          if (onMatched) {
            onMatched(sessionKey, partnerId);
          }

          unsubscribe();
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error joining random queue:", err);
      setQueueStatus("error");
    }
  }, [user, onMatched]);

  const leaveQueue = useCallback(async () => {
    if (!user?.id) return;
    try {
      await remove(ref(database, `random_queue/${user.id}`));
      setQueueStatus("idle");
    } catch (err) {
      console.error("Error leaving queue:", err);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      leaveQueue(); // clean up on unmount
    };
  }, [leaveQueue]);

  return {
    joinQueue,
    leaveQueue,
    queueStatus,
    sessionId,
  };
};

export default useRandomQueue;
