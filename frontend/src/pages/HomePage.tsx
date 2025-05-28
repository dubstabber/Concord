import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useAuthStore } from "../store/useAuthStore";
import type { Message } from "../types";
import { useChatStore } from "../store/useChatStore";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Sidebar from "../components/Sidebar";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to Concord! This is a simple chat application.",
      sender: "system",
      timestamp: new Date(),
    },
  ]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMessage.trim() || !authUser) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: authUser._id,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
