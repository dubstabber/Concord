import { describe, it, expect, vi, beforeEach } from "vitest";
import { useChatStore } from "../../../src/store/useChatStore";
import { axiosInstance } from "../../../src/lib/axios";
import { useAuthStore } from "../../../src/store/useAuthStore";
import type { AuthState, Message, User } from "../../types";
import type { Socket } from "socket.io-client";

vi.mock("../../../src/lib/axios");
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../src/store/useAuthStore", () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      socket: {
        on: vi.fn(),
        off: vi.fn(),
      },
      authUser: {
        _id: "test-user-id",
        fullName: "Test User",
        email: "test@example.com",
        profilePic: "/avatar.png",
      },
    })),
  },
}));

const mockUsers: User[] = [
  {
    _id: "user-1",
    fullName: "Test User 1",
    email: "user1@example.com",
    profilePic: "/avatar1.png",
  },
  {
    _id: "user-2",
    fullName: "Test User 2",
    email: "user2@example.com",
    profilePic: "/avatar2.png",
  },
];

const mockMessages: Message[] = [
  {
    _id: "msg-1",
    sender: "user-1",
    text: "Hello there!",
    createdAt: new Date("2025-05-30T10:00:00.000Z").toISOString(),
  },
  {
    _id: "msg-2",
    sender: "test-user-id",
    text: "Hi! How are you?",
    createdAt: new Date("2025-05-30T10:01:00.000Z").toISOString(),
  },
];

describe("useChatStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useChatStore.setState({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
    });
  });

  describe("getUsers", () => {
    it("should fetch users and update state", async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockUsers });

      await useChatStore.getState().getUsers();

      expect(axiosInstance.get).toHaveBeenCalledWith("/messages/users");
      expect(useChatStore.getState().users).toEqual(mockUsers);
      expect(useChatStore.getState().isUsersLoading).toBe(false);
    });

    it("should handle errors when fetching users fails", async () => {
      const axiosError = {
        response: { data: { message: "Failed to fetch users" } },
      };
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(axiosError);

      await useChatStore.getState().getUsers();

      expect(axiosInstance.get).toHaveBeenCalledWith("/messages/users");
      expect(useChatStore.getState().users).toEqual([]);
      expect(useChatStore.getState().isUsersLoading).toBe(false);
    });
  });

  describe("getMessages", () => {
    it("should fetch messages for a specific user", async () => {
      const userId = "user-1";
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockMessages,
      });

      await useChatStore.getState().getMessages(userId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/messages/${userId}`);
      expect(useChatStore.getState().messages).toEqual(mockMessages);
      expect(useChatStore.getState().isMessagesLoading).toBe(false);
    });
  });

  describe("sendMessage", () => {
    it("should send a message to the selected user", async () => {
      const selectedUser = mockUsers[0];
      const messageData = JSON.stringify({ text: "New message" });
      const newMessage = {
        _id: "new-msg",
        text: "New message",
        sender: "test-user-id",
        createdAt: new Date().toISOString(),
      };

      useChatStore.setState({
        selectedUser,
        messages: [...mockMessages],
      });

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: newMessage });

      await useChatStore.getState().sendMessage(messageData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        `/messages/send/${selectedUser._id}`,
        { text: "New message" },
        { headers: { "Content-Type": "application/json" } }
      );

      expect(useChatStore.getState().messages).toHaveLength(
        mockMessages.length + 1
      );
      expect(useChatStore.getState().messages[mockMessages.length]).toEqual(
        newMessage
      );
    });
  });

  describe("setSelectedUser", () => {
    it("should update the selected user", () => {
      const user = mockUsers[0];

      useChatStore.getState().setSelectedUser(user);

      expect(useChatStore.getState().selectedUser).toEqual(user);
    });

    it("should set selectedUser to null when null is passed", () => {
      useChatStore.setState({ selectedUser: mockUsers[0] });

      useChatStore.getState().setSelectedUser(null);

      expect(useChatStore.getState().selectedUser).toBeNull();
    });
  });

  describe("Socket Message Subscriptions", () => {
    const mockOn = vi.fn();
    const mockOff = vi.fn();
    const mockSocket = { on: mockOn, off: mockOff };

    beforeEach(() => {
      mockOn.mockReset();
      mockOff.mockReset();
      vi.mocked(useAuthStore.getState).mockReturnValue({
        socket: mockSocket as unknown as Socket,
        authUser: { _id: "test-user-id" },
      } as unknown as AuthState);
    });

    it("should subscribe to new messages when a user is selected", () => {
      useChatStore.setState({ selectedUser: mockUsers[0] });

      useChatStore.getState().subscribeToMessages();

      expect(mockOn).toHaveBeenCalledWith("newMessage", expect.any(Function));
    });

    it("should not subscribe if no user is selected", () => {
      useChatStore.setState({ selectedUser: null });

      useChatStore.getState().subscribeToMessages();

      expect(mockOn).not.toHaveBeenCalled();
    });

    it("should unsubscribe from message events", () => {
      useChatStore.getState().unsubscribeFromMessages();

      expect(mockOff).toHaveBeenCalledWith("newMessage");
    });

    it("should update messages when a new message is received", () => {
      const initialMessages = [...mockMessages];
      useChatStore.setState({
        selectedUser: mockUsers[0],
        messages: initialMessages,
      });

      mockOn.mockImplementation((event, callback) => {
        if (event === "newMessage") {
          const newMessage = {
            _id: "new-msg-id",
            sender: "user-1",
            senderId: "user-1",
            receiverId: "test-user-id",
            text: "New socket message",
            createdAt: new Date().toISOString(),
          };
          callback(newMessage);
        }
      });

      useChatStore.getState().subscribeToMessages();

      expect(mockOn).toHaveBeenCalledWith("newMessage", expect.any(Function));
      expect(useChatStore.getState().messages).toHaveLength(
        initialMessages.length + 1
      );
      expect(
        useChatStore.getState().messages[initialMessages.length].text
      ).toBe("New socket message");
    });
  });
});
