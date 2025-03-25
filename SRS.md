# Software Requirements Specification (SRS) for KonecC

## 1. Introduction

### 1.1 Purpose
KonecC is a web-based application designed to **connect random strangers via text or audio calls**. Users can also add friends using unique usernames and chat with them. The purpose of this document is to outline the functional and technical aspects of the application.

### 1.2 Scope
KonecC is a **cross-platform** web application, ensuring seamless communication. Key technologies include:

- **Frontend:** React.js (for web)
- **Backend:** Flask (Python)
- **Database & Authentication:** Firebase Firestore & Firebase Authentication
- **Real-Time Communication:** WebRTC (for calls)
- **Hosting:** Firebase Hosting

## 2. Overall Description

### 2.1 Product Features
- **Random Chat:** Users can connect with strangers for text-based chat.
- **Friend System:** Users can add friends via username and chat with them.
- **Audio Calls:** Users can initiate and receive audio calls.
- **User Profiles:** Users can set up their profile with a username, bio, gender, and friend list.
- **Notifications:** Friend requests, new messages, and call alerts.
- **Chat & Call History:** Chats are stored for **3 days** before deletion.

### 2.2 User Classes
- **Guests:** Can sign up or log in.
- **Registered Users:** Can access all app features.
- **Admin:** (Future update) Can manage users and monitor app activity.

### 2.3 Operating Environment
- **Frontend:** React.js
- **Backend:** Flask (Python)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Authentication
- **Real-Time Communication:** WebRTC
- **Hosting:** Firebase Hosting

## 3. Functional Requirements

### 3.1 Authentication
- **Sign Up/Login:** Users register using email/password. Username must be unique.
- **Password Reset:** Users can reset their password via email.

### 3.2 Random Chat
- **Find a Chat:** Connects users randomly.
- **Leave Chat:** Redirects to the random chat screen.
- **Chat History:** Stores messages for **3 days**.

### 3.3 Friend System
- **Search Users:** Find users via unique username.
- **Send/Accept Friend Request.**
- **Remove Friend:** Users can remove friends from their list.

### 3.4 Audio Calls
- **Initiate/Accept/Reject Calls.**
- **Call UI:** Shows the other user’s name, call duration, and three buttons (End, Mute, Speaker).
- **Call History:** Shows past calls.

### 3.5 Notifications
- **Friend Requests, Messages, Calls Alerts** in a dedicated Notification tab.

## 4. Non-Functional Requirements
- **Performance:** Loads within **3 seconds**.
- **Scalability:** Supports up to **10,000 concurrent users**.
- **Security:** Firebase Authentication ensures **secure logins**.
- **Usability:** **Simple and easy-to-use UI**.

## 5. System Architecture

### 5.1 Frontend (React.js)
- **State Management:** Context API (for simplicity).
- **UI Components:** Built with Tailwind CSS.

### 5.2 Backend (Flask - Python)
- **User API:** Manages authentication and profiles.
- **Chat API:** Handles random & friend-based chats.
- **Call API:** Uses WebRTC for real-time audio.

### 5.3 Database (Firebase Firestore)
- **User Profiles** → Stores username, bio, gender, and friends.
- **Chat Data** → Messages stored **temporarily (3 days)**.
- **Call Logs** → Stores username and call timing.

## 6. Technologies

### 6.1 Frontend
- React.js
- Tailwind CSS
- Axios (for API calls)

### 6.2 Backend
- Flask (Python)
- Firebase Firestore (Database)
- Firebase Authentication (User Auth)
- WebRTC (Audio Calls)

### 6.3 Tools
- **Postman** (for API testing)
- **VS Code** (for coding)

## 7. Timeline

| Week | Task |
|------|------|
| 1-2  | Set up project, authentication system |
| 3-4  | Implement random chat & friend system |
| 5-6  | Add audio call functionality |
| 7-8  | User profiles & notifications |
| 9-10 | Testing, bug fixes, and deployment |

## 8. Risks
- **Real-Time Communication:** WebRTC latency issues.
- **Scalability:** Firebase limitations.
- **Security:** User data encryption.

## 9. Glossary
- **Firebase:** Backend-as-a-Service.
- **WebRTC:** Real-time communication tech.
- **Expo:** React Native framework.

---

## Implementation Approach
To achieve this within **one month**, we are using **Firebase for authentication & database**, which eliminates the need for complex backend infrastructure. **WebRTC ensures real-time audio calls**. The **frontend is React.js**, making it simple and efficient. Firebase **automatically handles scalability**.

---

## Conclusion
KonecC is a **lightweight and scalable** chat application. The use of Firebase and WebRTC makes it **easy to develop** within one month. Features will be **expanded in future updates**.
