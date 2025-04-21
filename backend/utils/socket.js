// file: src/utils/socket.js
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.clientId = null;
    this.listeners = new Map();
    this.connected = false;
    console.log("SocketService initialized");
  }
  
  // Connect to Socket.IO server
  connect(userData = null) {
    console.log("Socket connect called with userData:", userData);
    
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        console.log("Socket already connected, reusing connection");
        resolve();
        return;
      }
      
      // Use explicit port for development
      const socketUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5001' 
        : window.location.origin;
      
      console.log("Connecting to socket URL:", socketUrl);
      
      try {
        this.socket = io(socketUrl, {
          path: "/socket.io",
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ["websocket"]
        });
        
        // Connection opened
        this.socket.on("connect", () => {
          console.log("Socket connected successfully with ID:", this.socket.id);
          this.connected = true;
          this.clientId = this.socket.id;
          
          this._notifyListeners("connection", { status: "connected" });
          
          // Send user data if available
          if (userData) {
            console.log("Emitting set_user_data with:", userData);
            this.socket.emit("set_user_data", userData);
          }
          
          resolve();
        });
        
        // Handle connection error
        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          this._notifyListeners("error", { error });
          reject(error);
        });
        
        // Handle disconnection
        this.socket.on("disconnect", () => {
          console.log("Socket disconnected");
          this.connected = false;
          this._notifyListeners("connection", { status: "disconnected" });
        });
        
        // Listen for events from server
        this.socket.on("searching", (data) => {
          console.log("Received searching event:", data);
          this._notifyListeners("searching", data);
        });
        
        this.socket.on("search_cancelled", () => {
          console.log("Received search_cancelled event");
          this._notifyListeners("searchCancelled", {});
        });
        
        this.socket.on("chat_connected", (data) => {
          console.log("Received chat_connected event:", data);
          this._notifyListeners("chatConnected", data);
        });
        
        this.socket.on("call_connected", (data) => {
          console.log("Received call_connected event:", data);
          this._notifyListeners("callConnected", data);
        });
        
        this.socket.on("chat_message", (data) => {
          console.log("Received chat_message event:", data);
          this._notifyListeners("chatMessage", { message: data });
        });
        
        this.socket.on("message_sent", (data) => {
          console.log("Received message_sent event:", data);
          this._notifyListeners("messageSent", { message: data });
        });
        
        this.socket.on("chat_ended", (data) => {
          console.log("Received chat_ended event:", data);
          this._notifyListeners("chatEnded", data);
        });
        
        this.socket.on("call_ended", (data) => {
          console.log("Received call_ended event:", data);
          this._notifyListeners("callEnded", data);
        });
        
        // WebRTC signaling
        this.socket.on("rtc_offer", (data) => {
          console.log("Received rtc_offer event:", data);
          this._notifyListeners("rtcOffer", data);
        });
        
        this.socket.on("rtc_answer", (data) => {
          console.log("Received rtc_answer event:", data);
          this._notifyListeners("rtcAnswer", data);
        });
        
        this.socket.on("ice_candidate", (data) => {
          console.log("Received ice_candidate event:", data);
          this._notifyListeners("iceCandidate", data);
        });
        
      } catch (error) {
        console.error("Failed to create socket connection:", error);
        reject(error);
      }
    });
  }
  
  // Disconnect from Socket.IO
  disconnect() {
    console.log("Socket disconnect called");
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this._notifyListeners("connection", { status: "disconnected" });
      console.log("Socket disconnected successfully");
    } else {
      console.log("Socket already disconnected");
    }
  }
  
  // Listen for socket events
  onEvent(event, callback) {
    console.log(`Registering listener for event: ${event}`);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push(callback);
    console.log(`Listener count for ${event}: ${this.listeners.get(event).length}`);
    
    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing listener for event: ${event}`);
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index !== -1) {
          eventListeners.splice(index, 1);
          console.log(`Listener removed, new count: ${eventListeners.length}`);
        }
      }
    };
  }
  
  // Notify listeners of an event
  _notifyListeners(event, data) {
    console.log(`Notifying listeners for event: ${event}`, data);
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      console.log(`Found ${listeners.length} listeners for ${event}`);
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    } else {
      console.log(`No listeners found for event: ${event}`);
    }
  }
  
  // Find a random chat partner
  findRandomChatPartner() {
    console.log("findRandomChatPartner called, connected:", this.connected);
    
    if (!this.socket) {
      console.error("Socket is null when trying to find chat partner");
      alert("Socket is null");
      return Promise.reject(new Error("Socket is null"));
    }
    
    if (!this.connected) {
      console.error("Socket not connected when trying to find chat partner");
      alert("Socket not connected");
      return Promise.reject(new Error("Socket not connected"));
    }
    
    console.log("Emitting find_random_chat event");
    this.socket.emit("find_random_chat");
    
    return new Promise((resolve) => {
      const handleChatConnection = (data) => {
        console.log("Chat connection callback triggered with data:", data);
        if (data.partnerId && data.partnerName) {
          // Remove event listener to avoid memory leak
          const unsubscribe = this.onEvent("chatConnected", handleChatConnection);
          if (unsubscribe) unsubscribe();
          
          resolve({
            partnerId: data.partnerId,
            partnerName: data.partnerName
          });
        }
      };
      
      // Listen for chat connection event
      console.log("Adding listener for chatConnected event");
      this.onEvent("chatConnected", handleChatConnection);
    });
  }
  
  // Find a random call partner
  findRandomCallPartner() {
    console.log("findRandomCallPartner called, connected:", this.connected);
    
    if (!this.socket) {
      console.error("Socket is null when trying to find call partner");
      alert("Socket is null");
      return Promise.reject(new Error("Socket is null"));
    }
    
    if (!this.connected) {
      console.error("Socket not connected when trying to find call partner");
      alert("Socket not connected");
      return Promise.reject(new Error("Socket not connected"));
    }
    
    console.log("Emitting find_random_call event");
    this.socket.emit("find_random_call");
    
    return new Promise((resolve) => {
      const handleCallConnection = (data) => {
        console.log("Call connection callback triggered with data:", data);
        if (data.partnerId && data.partnerName) {
          // Remove event listener to avoid memory leak
          const unsubscribe = this.onEvent("callConnected", handleCallConnection);
          if (unsubscribe) unsubscribe();
          
          resolve({
            partnerId: data.partnerId,
            partnerName: data.partnerName
          });
        }
      };
      
      // Listen for call connection event
      console.log("Adding listener for callConnected event");
      this.onEvent("callConnected", handleCallConnection);
    });
  }
  
  // Cancel ongoing search for partner
  cancelSearch() {
    console.log("cancelSearch called, connected:", this.connected);
    if (this.socket && this.connected) {
      console.log("Emitting cancel_search event");
      this.socket.emit("cancel_search");
    } else {
      console.error("Cannot cancel search: socket not connected");
    }
  }
  
  // Send a message in the chat
  sendChatMessage(content) {
    console.log("sendChatMessage called with content:", content);
    
    if (!this.socket || !this.connected) {
      console.error("Socket not connected when trying to send message");
      return Promise.reject(new Error("Socket not connected"));
    }
    
    console.log("Emitting chat_message event");
    this.socket.emit("chat_message", { content });
    
    return new Promise((resolve) => {
      const handleMessageSent = (data) => {
        console.log("Message sent callback triggered with data:", data);
        if (data.message) {
          // Remove event listener
          const unsubscribe = this.onEvent("messageSent", handleMessageSent);
          if (unsubscribe) unsubscribe();
          
          resolve(data.message);
        }
      };
      
      // Listen for message sent confirmation
      console.log("Adding listener for messageSent event");
      this.onEvent("messageSent", handleMessageSent);
    });
  }
  
  // End current chat
  endChat() {
    console.log("endChat called, connected:", this.connected);
    if (this.socket && this.connected) {
      console.log("Emitting end_chat event");
      this.socket.emit("end_chat");
    } else {
      console.error("Cannot end chat: socket not connected");
    }
  }
  
  // End current call
  endCall() {
    console.log("endCall called, connected:", this.connected);
    if (this.socket && this.connected) {
      console.log("Emitting end_call event");
      this.socket.emit("end_call");
    } else {
      console.error("Cannot end call: socket not connected");
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
console.log("SocketService singleton created");
export default socketService;

// Global WebRTC variables
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let audioElement = null;

// WebRTC configuration
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Initialize WebRTC call
export const initWebRTC = async () => {
  try {
    console.log("Initializing WebRTC");
    
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log("Microphone access granted");
    
    // Create peer connection
    peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    // Create remote stream
    remoteStream = new MediaStream();
    
    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log("Remote track received", event);
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      
      // Initialize audio element if not already done
      if (!audioElement) {
        audioElement = new Audio();
        audioElement.autoplay = true;
        document.body.appendChild(audioElement);
      }
      
      // Set remote stream as source for audio element
      audioElement.srcObject = remoteStream;
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate", event.candidate);
        socketService.socket.emit("ice_candidate", { candidate: event.candidate });
      }
    };
    
    console.log("WebRTC initialized successfully");
    return { localStream, remoteStream };
  } catch (error) {
    console.error("Failed to initialize WebRTC:", error);
    throw error;
  }
};

// Create offer
export const createOffer = async () => {
  if (!peerConnection) {
    console.error("PeerConnection not initialized");
    return;
  }
  
  try {
    console.log("Creating WebRTC offer");
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    console.log("Sending offer to remote peer");
    socketService.socket.emit("rtc_offer", { offer });
  } catch (error) {
    console.error("Error creating offer:", error);
  }
};

// Handle received offer
export const handleOffer = async (offer) => {
  if (!peerConnection) {
    await initWebRTC();
  }
  
  try {
    console.log("Received offer, setting remote description");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    console.log("Creating answer");
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    console.log("Sending answer to remote peer");
    socketService.socket.emit("rtc_answer", { answer });
  } catch (error) {
    console.error("Error handling offer:", error);
  }
};

// Handle received answer
export const handleAnswer = async (answer) => {
  if (!peerConnection) {
    console.error("PeerConnection not initialized");
    return;
  }
  
  try {
    console.log("Received answer, setting remote description");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error("Error handling answer:", error);
  }
};

// Handle received ICE candidate
export const handleICECandidate = async (candidate) => {
  if (!peerConnection) {
    console.error("PeerConnection not initialized");
    return;
  }
  
  try {
    console.log("Adding ICE candidate", candidate);
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
};

// Cleanup WebRTC
export const cleanupWebRTC = () => {
  console.log("Cleaning up WebRTC");
  
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  
  if (audioElement) {
    if (audioElement.parentNode) {
      document.body.removeChild(audioElement);
    }
    audioElement = null;
  }
  
  remoteStream = null;
};

// Toggle microphone mute
export const toggleMic = (muted) => {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !muted;
    });
    return true;
  }
  return false;
};

// For global access
window.webrtc = {
  initWebRTC,
  createOffer,
  handleOffer,
  handleAnswer,
  handleICECandidate,
  cleanupWebRTC,
  toggleMic
};

// Pre-request microphone permissions
setTimeout(() => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("Pre-requesting microphone permissions...");
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log("Microphone permission granted early");
        // Store stream for later use
        window.tempStream = stream;
        
        // Stop the tracks after getting permission
        setTimeout(() => {
          if (window.tempStream) {
            window.tempStream.getTracks().forEach(track => track.stop());
            window.tempStream = null;
          }
        }, 1000);
      })
      .catch(err => {
        console.error("Microphone permission denied early:", err);
      });
  }
}, 2000);