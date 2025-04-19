import { getDatabase, ref, update, onValue, off, set, push, remove, get, query, orderByChild, limitToLast } from "firebase/database";
import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase (with error handling for multiple initializations)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Handle case where app is already initialized
  const existingApps = initializeApp();
  app = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);
}

const database = getDatabase(app);

/**
 * Get a consistent chat ID for two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} - The chat ID
 */
export const getChatId = (userId1, userId2) => {
  return `chat_${userId1 < userId2 ? userId1 : userId2}_${userId1 < userId2 ? userId2 : userId1}`;
};

/**
 * Get or create a chat between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<string>} - The chat ID
 */
export const getOrCreateChat = async (userId1, userId2) => {
  const chatId = getChatId(userId1, userId2);
  const chatRef = ref(database, `chats/${chatId}`);
  
  try {
    const snapshot = await get(chatRef);
    if (!snapshot.exists()) {
      // Create new chat if it doesn't exist
      await set(chatRef, {
        users: [userId1, userId2],
        created_at: Date.now(),
        last_message: null
      });
    }
    return chatId;
  } catch (error) {
    console.error("Error getting/creating chat:", error);
    throw error;
  }
};

/**
 * Send a message in a chat
 * @param {string} chatId - Chat ID
 * @param {string} senderId - Sender's user ID
 * @param {string} message - Message content
 * @returns {Promise<string>} - Message ID
 */
export const sendMessage = async (chatId, senderId, message) => {
  try {
    // Validate inputs
    if (!chatId || !senderId || !message.trim()) {
      throw new Error("Invalid message data");
    }
    
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    const timestamp = Date.now();
    
    // Create message object
    const messageData = {
      sender: senderId,
      message: message.trim(),
      timestamp: timestamp
    };
    
    // Save message
    await set(newMessageRef, messageData);
    const messageId = newMessageRef.key;
    
    // Update last message for quick access
    const lastMessageRef = ref(database, `chats/${chatId}/last_message`);
    await set(lastMessageRef, {
      message: message.trim(),
      sender: senderId,
      timestamp: timestamp,
      message_id: messageId
    });
    
    return messageId;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Delete a message from a chat
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID to delete
 * @param {string} userId - User ID of the person deleting (for authorization)
 * @returns {Promise<boolean>} - Success status
 */
export const deleteMessage = async (chatId, messageId, userId) => {
  try {
    // Get the message to check ownership
    const messageRef = ref(database, `chats/${chatId}/messages/${messageId}`);
    const snapshot = await get(messageRef);
    
    if (!snapshot.exists()) {
      throw new Error("Message not found");
    }
    
    const messageData = snapshot.val();
    
    // Only message sender can delete
    if (messageData.sender !== userId) {
      throw new Error("Unauthorized: can only delete your own messages");
    }
    
    // Delete the message
    await remove(messageRef);
    
    // Check if this was the last message and update accordingly
    const lastMessageRef = ref(database, `chats/${chatId}/last_message`);
    const lastMessageSnapshot = await get(lastMessageRef);
    
    if (lastMessageSnapshot.exists() && lastMessageSnapshot.val().message_id === messageId) {
      // Find new last message
      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const messagesSnapshot = await get(messagesRef);
      
      if (messagesSnapshot.exists()) {
        const messages = messagesSnapshot.val();
        const messageEntries = Object.entries(messages);
        
        if (messageEntries.length > 0) {
          // Sort by timestamp (descending)
          messageEntries.sort((a, b) => b[1].timestamp - a[1].timestamp);
          const [newLastMessageId, newLastMessage] = messageEntries[0];
          
          // Update last message
          await set(lastMessageRef, {
            message: newLastMessage.message,
            sender: newLastMessage.sender,
            timestamp: newLastMessage.timestamp,
            message_id: newLastMessageId
          });
        } else {
          // No messages left, clear last message
          await remove(lastMessageRef);
        }
      } else {
        // No messages left, clear last message
        await remove(lastMessageRef);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

/**
 * Listen for messages in a chat
 * @param {string} chatId - Chat ID
 * @param {function} callback - Function to call with messages data
 * @returns {Object} - Reference to unsubscribe
 */
export const listenForMessages = (chatId, callback) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  
  onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const messagesData = snapshot.val();
    const messagesArray = Object.entries(messagesData).map(([id, data]) => ({
      message_id: id,
      ...data
    }));
    
    // Sort messages by timestamp
    messagesArray.sort((a, b) => a.timestamp - b.timestamp);
    callback(messagesArray);
  });
  
  return messagesRef;
};

/**
 * Listen for updates to the last message in a chat
 * @param {string} chatId - Chat ID
 * @param {function} callback - Function to call with last message data
 * @returns {Object} - Reference to unsubscribe
 */
export const listenForLastMessage = (chatId, callback) => {
  const lastMessageRef = ref(database, `chats/${chatId}/last_message`);
  
  onValue(lastMessageRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    
    callback(snapshot.val());
  });
  
  return lastMessageRef;
};

/**
 * Update unread message count for a user
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 * @param {number} count - New count (or increment if omitted)
 * @returns {Promise<void>}
 */
export const updateUnreadCount = async (chatId, userId, count = null) => {
  const unreadRef = ref(database, `unread/${userId}/${chatId}`);
  
  if (count !== null) {
    // Set to specific count
    await set(unreadRef, { count });
  } else {
    // Increment existing count
    const snapshot = await get(unreadRef);
    const currentCount = snapshot.exists() ? snapshot.val().count || 0 : 0;
    await set(unreadRef, { count: currentCount + 1 });
  }
};

/**
 * Listen for unread message counts for a user
 * @param {string} userId - User ID
 * @param {string} chatId - Chat ID
 * @param {function} callback - Function to call with unread count data
 * @returns {Object} - Reference to unsubscribe
 */
export const listenForUnreadCount = (userId, chatId, callback) => {
  const unreadRef = ref(database, `unread/${userId}/${chatId}`);
  
  onValue(unreadRef, (snapshot) => {
    const count = snapshot.exists() ? snapshot.val().count || 0 : 0;
    callback(count);
  });
  
  return unreadRef;
};

/**
 * Clear unread messages for a chat
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const clearUnreadMessages = async (chatId, userId) => {
  const unreadRef = ref(database, `unread/${userId}/${chatId}`);
  await set(unreadRef, { count: 0 });
};

/**
 * Remove a listener
 * @param {Object} listenerRef - Reference returned by a listen function
 */
export const removeListener = (listenerRef) => {
  if (listenerRef) {
    off(listenerRef);
  }
};

/**
 * Listen for all unread message counts for a user
 * @param {string} userId - User ID
 * @param {function} callback - Function to call with unread counts data
 * @returns {Object} - Reference to unsubscribe
 */
export const listenForAllUnreadCounts = (userId, callback) => {
  const unreadRef = ref(database, `unread/${userId}`);
  
  onValue(unreadRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({});
      return;
    }
    
    callback(snapshot.val());
  });
  
  return unreadRef;
};

/**
 * Get all unread counts for a user (one-time)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Object with chat IDs as keys and counts as values
 */
export const getAllUnreadCounts = async (userId) => {
  const unreadRef = ref(database, `unread/${userId}`);
  const snapshot = await get(unreadRef);
  
  if (!snapshot.exists()) {
    return {};
  }
  
  return snapshot.val();
};