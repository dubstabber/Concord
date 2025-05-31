# Concord - Real-Time Chat Application

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://concord-81qy.onrender.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue.svg)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-black.svg)](https://socket.io/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas/database)

</div>

## 🚀 [Live Demo](https://concord-81qy.onrender.com/)

Experience Concord in action! Click the link above to visit the deployed application.

## 📋 Overview

Concord is a modern, feature-rich real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and enhanced with TypeScript and Socket.IO for real-time functionality. It provides a seamless communication experience with instant messaging, online status indicators, and media sharing capabilities.

## ✨ Key Features

- **Real-time messaging** - Instant message delivery between users
- **Live online status** - See who's online without refreshing
- **User authentication** - Secure signup, login, and session management
- **Image sharing** - Send and receive images in conversations
- **Responsive design** - Works seamlessly on desktop and mobile devices
- **Message history** - View your conversation history with each user
- **Profile customization** - Update profile picture and user information

## 🛠️ Technologies Used

### Frontend

- **React** - UI library for building component-based interfaces
- **TypeScript** - Type-safe JavaScript for enhanced code quality
- **Zustand** - Lightweight state management solution
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication library
- **Axios** - Promise-based HTTP client
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications system
- **Vitest** - Testing framework

### Backend

- **Node.js** - JavaScript runtime environment
- **Express** - Web application framework
- **Socket.IO** - Real-time event-based communication
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library for MongoDB
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Cloud storage for images

## 🏗️ Architecture

### Real-Time Communication

Concord uses Socket.IO for real-time features like instant messaging and online status updates. The socket server maintains a mapping between user IDs and socket connections, enabling targeted message delivery and presence broadcasting.

### State Management

The application uses Zustand for state management, with separate stores for authentication and chat functionality. This provides a clean separation of concerns while maintaining a reactive UI.

### API Layer

The backend provides RESTful APIs for user authentication, message retrieval, and message sending. These endpoints are secured with JWT middleware to ensure authenticated access.

## 🔧 Installation and Setup

### Prerequisites

- Node.js (v14+)
- MongoDB account or local MongoDB installation
- Cloudinary account (for image uploads)

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/dubstabber/Concord.git
cd concord
```

2. **Set up environment variables**

Create `.env` files in both frontend and backend directories with the necessary configuration.

For backend:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

3. **Install dependencies and start the application**

```bash
# Install backend dependencies
cd backend
npm install
npm run dev

# In a new terminal, install frontend dependencies
cd ../frontend
npm install
npm run dev
```

4. **Open the application**

Navigate to `http://localhost:5173` in your browser.

## 🧪 Testing

The project includes comprehensive tests for both frontend and backend:

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## 🔍 Code Highlights

### TypeScript Type Definitions

```typescript
// Message Interface
export interface Message {
  _id: string;
  text?: string;
  sender?: string;
  senderId?: string;
  receiverId?: string;
  timestamp?: Date;
  createdAt?: string;
  image?: string;
}

// User Interface
export interface User {
  _id: string;
  fullName: string;
  email?: string;
  profilePic?: string;
}

// Authentication State
export interface AuthState {
  authUser: User | null;
  socket: Socket | null;
  onlineUsers: string[];
  // Additional state fields and methods...
}
```

### Real-Time Message Subscription with Zustand

```typescript
subscribeToMessages: () => {
  get().unsubscribeFromMessages();

  const socket = useAuthStore.getState().socket;
  if (!socket) {
    console.error("Socket not available for message subscription");
    return;
  }

  console.log(`Subscribing to messages for user: ${selectedUser._id}`);

  socket.on("newMessage", (newMessage: Message) => {
    console.log("New message received:", newMessage);

    if (
      newMessage.senderId === selectedUser._id ||
      newMessage.receiverId === selectedUser._id
    ) {
      console.log("Adding message to chat");
      const { messages } = get();
      set({ messages: [...messages, newMessage] });
    }
  });
};
```

### Socket Connection Management

```typescript
connectSocket: () => {
  if (get().socket) return;

  const socket = io(BASE_URL, {
    query: { userId: get().authUser?._id },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    timeout: 20000,
  });

  socket.connect();
  set({ socket });

  socket.on("connect", () => {
    console.log("Socket connected successfully");
  });

  socket.on("getOnlineUsers", (userIds: string[]) => {
    set({ onlineUsers: userIds });
  });
};
```
