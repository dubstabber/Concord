import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { AxiosError } from "axios";
import type { Message, User } from "../types";
import type { ChatState } from "../types/chat";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/messages/users");
      set({ users: response.data });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "An error occurred");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "An error occurred");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData: string) => {
    const { selectedUser, messages } = get();
    try {
      const parsedData = JSON.parse(messageData);

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        parsedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Error sending message:", error);
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "An error occurred");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

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
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),
}));
