// file: src/context/RandomContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { auth } from "../utils/firebaseConfig";
import socketService from "../../../backend/utils/socket";
import { 
  initWebRTC, 
  createOffer, 
  handleOffer, 
  handleAnswer, 
  handleICECandidate, 
  cleanupWebRTC, 
  toggleMic 
} from "../../../backend/utils/socket";

// Create random context
const RandomContext = createContext();
console.log("RandomContext created");

export const RandomProvider = ({ children }) => {
  console.log("RandomProvider rendering");
  
  const [messages, setMessages] = useState([]);
  const [currentPartner, setCurrentPartner] = useState(null);
  const [chatStatus, setChatStatus] = useState("idle"); // idle, searching, connected, ended
  const [callStatus, setCallStatus] = useState("idle"); // idle, searching, connected, ended
  const [connected, setConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const callTimerRef = useRef(null);
  const audioRef = useRef(null);
  
  // Connect to Socket.IO when component mounts
  useEffect(() => {
    console.log("RandomProvider useEffect running");
    const user = auth.currentUser;
    console.log("Current user:", user);
    
    const userData = user ? {
      username: user.displayName || user.email?.split('@')[0] || "Anonymous",
      uid: user.uid
    } : {
      username: "TestUser",
      uid: "test-user-id"
    };
    
    console.log("Attempting to connect socket with userData:", userData);
    
    socketService.connect(userData)
      .then(() => {
        console.log("✅ Socket connected successfully");
        setConnected(true);
      })
      .catch(error => {
        console.error("❌ Failed to connect to socket:", error);
        alert("Socket connection failed: " + error.message);
      });
    
    // Create an audio element for remote audio
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.autoplay = true;
      document.body.appendChild(audioRef.current);
    }
    
    // Set up Socket.IO event listeners
    const connectionListener = (data) => {
      console.log("Connection event received:", data);
      setConnected(data.status === "connected");
    };
    
    const searchingListener = (data) => {
      console.log("Searching event received:", data);
      if (data.mode === "chat") {
        setChatStatus("searching");
      } else if (data.mode === "call") {
        setCallStatus("searching");
      }
    };
    
    const searchCancelledListener = () => {
      console.log("Search cancelled event received");
      setChatStatus("idle");
      setCallStatus("idle");
    };
    
    const chatConnectedListener = (data) => {
      console.log("Chat connected event received:", data);
      setChatStatus("connected");
      setCurrentPartner({
        id: data.partnerId,
        username: data.partnerName
      });
      setMessages([]);
    };
    
    const callConnectedListener = (data) => {
      console.log("Call connected event received:", data);
      setCallStatus("connected");
      setCurrentPartner({
        id: data.partnerId,
        username: data.partnerName
      });
      setCallDuration(0);
      
      // Start call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      // Initialize WebRTC for voice call
      initWebRTC()
        .then(({ remoteStream }) => {
          // Set the remote stream to the audio element
          if (audioRef.current && remoteStream) {
            audioRef.current.srcObject = remoteStream;
          }
          
          // Create and send offer
          createOffer();
        })
        .catch(err => {
          console.error("Failed to initialize WebRTC:", err);
        });
    };
    
    const chatMessageListener = (data) => {
      console.log("Chat message event received:", data);
      if (data.message) {
        setMessages(prev => [...prev, {
          ...data.message,
          isMine: false,
          id: Date.now().toString()
        }]);
      }
    };
    
    const messageSentListener = (data) => {
      console.log("Message sent event received:", data);
      if (data.message) {
        setMessages(prev => [...prev, {
          ...data.message,
          isMine: true,
          id: Date.now().toString()
        }]);
      }
    };
    
    const chatEndedListener = () => {
      console.log("Chat ended event received");
      setChatStatus("ended");
      setCurrentPartner(null);
    };
    
    const callEndedListener = () => {
      console.log("Call ended event received");
      setCallStatus("ended");
      setCurrentPartner(null);
      
      // Stop call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      
      // Clean up WebRTC resources
      cleanupWebRTC();
      
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
    
    // WebRTC signaling events
    const rtcOfferListener = (data) => {
      console.log("RTC offer received:", data);
      handleOffer(data.offer);
    };
    
    const rtcAnswerListener = (data) => {
      console.log("RTC answer received:", data);
      handleAnswer(data.answer);
    };
    
    const iceCandidateListener = (data) => {
      console.log("ICE candidate received:", data);
      handleICECandidate(data.candidate);
    };
    
    // Register event listeners
    console.log("Registering event listeners");
    const unsubscribeConnection = socketService.onEvent("connection", connectionListener);
    const unsubscribeSearching = socketService.onEvent("searching", searchingListener);
    const unsubscribeSearchCancelled = socketService.onEvent("searchCancelled", searchCancelledListener);
    const unsubscribeChatConnected = socketService.onEvent("chatConnected", chatConnectedListener);
    const unsubscribeCallConnected = socketService.onEvent("callConnected", callConnectedListener);
    const unsubscribeChatMessage = socketService.onEvent("chatMessage", chatMessageListener);
    const unsubscribeMessageSent = socketService.onEvent("messageSent", messageSentListener);
    const unsubscribeChatEnded = socketService.onEvent("chatEnded", chatEndedListener);
    const unsubscribeCallEnded = socketService.onEvent("callEnded", callEndedListener);
    const unsubscribeRtcOffer = socketService.onEvent("rtcOffer", rtcOfferListener);
    const unsubscribeRtcAnswer = socketService.onEvent("rtcAnswer", rtcAnswerListener);
    const unsubscribeIceCandidate = socketService.onEvent("iceCandidate", iceCandidateListener);
    
    // Clean up listeners when component unmounts
    return () => {
      console.log("RandomProvider cleanup running");
      
      unsubscribeConnection();
      unsubscribeSearching();
      unsubscribeSearchCancelled();
      unsubscribeChatConnected();
      unsubscribeCallConnected();
      unsubscribeChatMessage();
      unsubscribeMessageSent();
      unsubscribeChatEnded();
      unsubscribeCallEnded();
      unsubscribeRtcOffer();
      unsubscribeRtcAnswer();
      unsubscribeIceCandidate();
      
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      // Clean up audio element
      if (audioRef.current) {
        if (audioRef.current.parentNode) {
          audioRef.current.parentNode.removeChild(audioRef.current);
        }
        audioRef.current = null;
      }
      
      // Clean up WebRTC
      cleanupWebRTC();
      
      socketService.disconnect();
    };
  }, []);
  
  // Request microphone permission function
  const requestMicrophonePermission = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone permission granted");
        setMicPermissionGranted(true);
        
        // Stop the stream immediately - we just needed the permission
        stream.getTracks().forEach(track => track.stop());
        
        return true;
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setMicPermissionGranted(false);
        alert("Please allow microphone access to use the call feature.");
        return false;
      }
    } else {
      alert("Your browser doesn't support microphone access.");
      return false;
    }
  };
  
  // Start random chat
  const startRandomChat = () => {
    console.log("startRandomChat called, connected status:", connected);
    
    // Temporarily bypass connected check for testing
    // if (!connected) {
    //   console.error("Cannot start random chat: socket not connected");
    //   return;
    // }
    
    setChatStatus("searching");
    setMessages([]);
    
    try {
      console.log("Calling socketService.findRandomChatPartner");
      socketService.findRandomChatPartner()
        .then(partner => {
          console.log("✅ Chat partner found:", partner);
        })
        .catch(error => {
          console.error("❌ Error finding chat partner:", error);
          alert("Error finding chat partner: " + error.message);
        });
    } catch (error) {
      console.error("❌ Exception in findRandomChatPartner:", error);
      alert("Exception in findRandomChatPartner: " + error.message);
    }
  };
  
  // Start random call
  const startRandomCall = async () => {
    console.log("startRandomCall called, connected status:", connected);
    
    // First check microphone permission
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }
    
    // Temporarily bypass connected check for testing
    // if (!connected) {
    //   console.error("Cannot start random call: socket not connected");
    //   return;
    // }
    
    setCallStatus("searching");
    
    try {
      console.log("Calling socketService.findRandomCallPartner");
      socketService.findRandomCallPartner()
        .then(partner => {
          console.log("✅ Call partner found:", partner);
        })
        .catch(error => {
          console.error("❌ Error finding call partner:", error);
          alert("Error finding call partner: " + error.message);
        });
    } catch (error) {
      console.error("❌ Exception in findRandomCallPartner:", error);
      alert("Exception in findRandomCallPartner: " + error.message);
    }
  };
  
  // Send message
  const sendMessage = (content) => {
    console.log("sendMessage called with content:", content);
    
    if (!connected) {
      console.error("Cannot send message: socket not connected");
      return;
    }
    
    if (chatStatus !== "connected") {
      console.error("Cannot send message: chat not connected");
      return;
    }
    
    socketService.sendChatMessage(content);
  };
  
  // End chat
  const endChat = () => {
    console.log("endChat called, connected status:", connected);
    
    if (!connected) {
      console.error("Cannot end chat: socket not connected");
      return;
    }
    
    socketService.endChat();
    setChatStatus("ended");
  };
  
  // End call
  const endCall = () => {
    console.log("endCall called, connected status:", connected);
    
    if (!connected) {
      console.error("Cannot end call: socket not connected");
      return;
    }
    
    socketService.endCall();
    setCallStatus("ended");
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // Clean up WebRTC resources
    cleanupWebRTC();
    
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  };
  
  // Cancel search
  const cancelSearch = () => {
    console.log("cancelSearch called, connected status:", connected);
    
    if (!connected) {
      console.error("Cannot cancel search: socket not connected");
      return;
    }
    
    socketService.cancelSearch();
    setChatStatus("idle");
    setCallStatus("idle");
  };
  
  // Toggle mic mute for WebRTC
  const handleToggleMute = (muted) => {
    return toggleMic(muted);
  };
  
  // Toggle speaker for audio element
  const handleToggleSpeaker = (speakerOn) => {
    if (audioRef.current) {
      audioRef.current.muted = !speakerOn;
      return true;
    }
    return false;
  };
  
  // Reset to options
  const resetToOptions = () => {
    console.log("Resetting to options view");
    
    // Reset state
    setChatStatus("idle");
    setCallStatus("idle");
    setMessages([]);
    setCurrentPartner(null);
    
    // Clean up timers
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // Clean up WebRTC
    cleanupWebRTC();
    
    // Clean up audio
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  };
  
  const contextValue = {
    messages,
    currentPartner,
    chatStatus,
    callStatus,
    connected,
    callDuration,
    micPermissionGranted,
    startRandomChat,
    startRandomCall,
    sendMessage,
    endChat,
    endCall,
    cancelSearch,
    toggleMute: handleToggleMute,
    toggleSpeaker: handleToggleSpeaker,
    requestMicrophonePermission,
    resetToOptions
  };
  
  console.log("RandomProvider providing value:", contextValue);
  
  return (
    <RandomContext.Provider value={contextValue}>
      {children}
    </RandomContext.Provider>
  );
};

// Custom hook for using random context
export const useRandom = () => {
  const context = useContext(RandomContext);
  console.log("useRandom called, context:", context);
  
  if (!context) {
    console.error("useRandom must be used within a RandomProvider");
    alert("Context error: useRandom must be used within a RandomProvider");
    
    // Return dummy implementation for testing
    return {
      messages: [],
      currentPartner: null,
      chatStatus: "idle",
      callStatus: "idle",
      connected: false,
      callDuration: 0,
      startRandomChat: () => {
        console.log("startRandomChat - fallback");
        alert("startRandomChat - fallback implementation");
      },
      startRandomCall: () => {
        console.log("startRandomCall - fallback");
        alert("startRandomCall - fallback implementation");
      },
      sendMessage: () => console.log("sendMessage - fallback"),
      endChat: () => console.log("endChat - fallback"),
      endCall: () => console.log("endCall - fallback"),
      cancelSearch: () => console.log("cancelSearch - fallback"),
      toggleMute: () => console.log("toggleMute - fallback"),
      toggleSpeaker: () => console.log("toggleSpeaker - fallback"),
      resetToOptions: () => console.log("resetToOptions - fallback")
    };
  }
  
  return context;
};

// Explicit export of the context for debugging
export default RandomContext;