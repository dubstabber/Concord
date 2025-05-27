import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Send } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import type { Message } from "../types";



const HomePage = () => {
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
      sender: authUser.id,
      timestamp: new Date(),
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-8">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title mb-6">Messages</h1>
          
          <div className="space-y-4 mb-6 h-[400px] overflow-y-auto p-4 bg-base-200 rounded-lg">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`chat ${message.sender === "system" ? "chat-start" : "chat-end"}`}
              >
                <div className="chat-bubble">{message.text}</div>
                <div className="chat-footer opacity-50 text-xs">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
              disabled={!authUser}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!newMessage.trim() || !authUser}
            >
              <Send className="size-5" />
            </button>
          </form>
          
          {!authUser && (
            <div className="alert alert-warning mt-4">
              <span>Please log in to send messages</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
