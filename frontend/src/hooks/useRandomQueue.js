import { useEffect, useState, useCallback } from "react";
import { getDatabase, ref, set, remove, onValue } from "firebase/database";
import { database } from "../utils/firebaseConfig";
import { v4 as uuidv4 } from "uuid";

const useRandomQueue = () => {
  const [queueStatus, setQueueStatus] = useState("idle"); // idle | joining | waiting | matched | error

  const joinQueue = async (user) => {
    if (!user?.id) return null;

    try {
      setQueueStatus("joining");

      // Add user to the queue
      const userQueueRef = ref(database, `random_queue/${user.id}`);
      await set(userQueueRef, {
        timestamp: Date.now(),
        display_name: user.display_name,
        profile_pic: user.profile_pic || user.profilePic || "",
      });

      setQueueStatus("waiting");

      return new Promise((resolve, reject) => {
        const queueRootRef = ref(database, "random_queue");

        const unsubscribe = onValue(queueRootRef, async (snapshot) => {
          const queueData = snapshot.val();

          if (!queueData || Object.keys(queueData).length < 2) return;

          const availableUsers = Object.keys(queueData).filter((uid) => uid !== user.id);

          if (availableUsers.length > 0) {
            const partnerId = availableUsers[0];
            const sessionKey = uuidv4();

            const sessionData = {
              users: [user.id, partnerId],
              created_at: Date.now(),
              ended: false,
            };

            // Create session
            await set(ref(database, `random_sessions/${sessionKey}`), sessionData);

            // Clean queue
            await remove(ref(database, `random_queue/${user.id}`));
            await remove(ref(database, `random_queue/${partnerId}`));

            setQueueStatus("matched");

            unsubscribe(); // Stop listening
            resolve({ sessionId: sessionKey, partnerId });
          }
        }, (error) => {
          console.error("Firebase onValue error:", error);
          unsubscribe();
          reject(error);
        });

        // Timeout after 30 seconds (optional)
        setTimeout(() => {
          unsubscribe();
          remove(userQueueRef);
          reject(new Error("Timeout finding a match."));
        }, 30000);
      });
    } catch (err) {
      console.error("Error in joinQueue:", err);
      setQueueStatus("error");
      return null;
    }
  };

  const leaveQueue = useCallback(async (userId) => {
    if (!userId) return;
    try {
      await remove(ref(database, `random_queue/${userId}`));
      setQueueStatus("idle");
    } catch (err) {
      console.error("Error leaving queue:", err);
    }
  }, []);

  useEffect(() => {
    // Optional: global queue cleanup on unmount
    return () => {};
  }, []);

  return {
    joinQueue,
    leaveQueue,
    queueStatus,
  };
};

export default useRandomQueue;
  