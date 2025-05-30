import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "../../pages/HomePage";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { User, Message } from "../../types";

vi.mock("../../components/Sidebar", () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="sidebar">
      <div>
        <button data-testid="user-item-1">User 1</button>
        <button data-testid="user-item-2">User 2</button>
      </div>
      {children}
    </div>
  ),
}));

vi.mock("../../components/NoChatSelected", () => ({
  default: () => (
    <div data-testid="no-chat-selected">Select a conversation</div>
  ),
}));

let mockChatMessages: Message[] = [];

const mockUsers: User[] = [
  { _id: "user1", fullName: "User One", email: "user1@example.com" },
  { _id: "user2", fullName: "User Two", email: "user2@example.com" },
];

const mockMessages: Message[] = [
  {
    _id: "msg1",
    text: "Hello",
    senderId: "user1",
    createdAt: "2025-05-30T12:00:00Z",
  },
];

const mockGetUsers = vi.fn();
const mockGetMessages = vi.fn();

const mockSendMessage = vi.fn().mockImplementation((messageData) => {
  const messageObj = JSON.parse(messageData);
  const newMessage: Message = {
    _id: `msg-${Date.now()}`,
    text: messageObj.text,
    senderId: "auth-user",
    createdAt: new Date().toISOString(),
  };

  mockChatMessages = [...mockChatMessages, newMessage];

  vi.mocked(useChatStore).mockReturnValue({
    users: mockUsers,
    messages: mockChatMessages,
    selectedUser: mockUsers[0],
    getUsers: mockGetUsers,
    getMessages: mockGetMessages,
    sendMessage: mockSendMessage,
    setSelectedUser: mockSetSelectedUser,
    isUsersLoading: false,
    isMessagesLoading: false,
    subscribeToMessages: vi.fn(),
    unsubscribeFromMessages: vi.fn(),
  } as unknown as ReturnType<typeof useChatStore>);

  return Promise.resolve();
});

const mockSetSelectedUser = vi.fn().mockImplementation((user) => {
  vi.mocked(useChatStore).mockReturnValue({
    users: mockUsers,
    messages: user ? mockMessages : [],
    selectedUser: user,
    getUsers: mockGetUsers,
    getMessages: mockGetMessages,
    sendMessage: mockSendMessage,
    setSelectedUser: mockSetSelectedUser,
    isUsersLoading: false,
    isMessagesLoading: false,
    subscribeToMessages: vi.fn(),
    unsubscribeFromMessages: vi.fn(),
  } as unknown as ReturnType<typeof useChatStore>);

  if (user) mockGetMessages(user._id);
});

vi.mock("../../components/ChatContainer", () => {
  return {
    default: () => {
      return (
        <div data-testid="chat-container">
          <div data-testid="messages-list">
            {mockChatMessages.map((msg: Message) => (
              <div key={msg._id} data-testid={`message-${msg._id}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form
            data-testid="message-form"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector("input");
              if (input && input.value) {
                // Use the mock function directly
                mockSendMessage(JSON.stringify({ text: input.value }));
                input.value = "";
              }
            }}
          >
            <input data-testid="message-input" type="text" />
            <button type="submit">Send</button>
          </form>
        </div>
      );
    },
  };
});

vi.mock("../../store/useChatStore");
vi.mock("../../store/useAuthStore");

describe("Chat Flow Integration Test", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockChatMessages = [];

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: {
        _id: "auth-user",
        fullName: "Auth User",
        email: "auth@example.com",
      },
      onlineUsers: ["user2"],
    } as unknown as ReturnType<typeof useAuthStore>);
  });

  const updateChatStoreMock = (options: {
    selectedUser?: User | null;
    messages?: Message[];
  }) => {
    vi.mocked(useChatStore).mockReturnValue({
      users: mockUsers,
      messages: options.messages || [],
      selectedUser: options.selectedUser || null,
      getUsers: mockGetUsers,
      getMessages: mockGetMessages,
      sendMessage: mockSendMessage,
      setSelectedUser: mockSetSelectedUser,
      isUsersLoading: false,
      isMessagesLoading: false,
      subscribeToMessages: vi.fn(),
      unsubscribeFromMessages: vi.fn(),
    } as unknown as ReturnType<typeof useChatStore>);
  };

  it("should show message list when user is selected", async () => {
    updateChatStoreMock({ selectedUser: null, messages: [] });

    render(<HomePage />);

    expect(screen.getByTestId("no-chat-selected")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-container")).not.toBeInTheDocument();

    mockChatMessages = [...mockMessages];
    updateChatStoreMock({
      selectedUser: mockUsers[0],
      messages: mockMessages,
    });

    cleanup();
    render(<HomePage />);

    expect(screen.queryByTestId("no-chat-selected")).not.toBeInTheDocument();
    expect(screen.getByTestId("chat-container")).toBeInTheDocument();

    const messagesList = screen.getByTestId("messages-list");
    expect(messagesList).toHaveTextContent("Hello");
  });

  it("should add new message when user sends a message", async () => {
    mockChatMessages = [...mockMessages];
    updateChatStoreMock({
      selectedUser: mockUsers[0],
      messages: mockChatMessages,
    });

    render(<HomePage />);

    expect(screen.getByTestId("chat-container")).toBeInTheDocument();
    expect(screen.getByTestId("messages-list")).toHaveTextContent("Hello");

    const messageInput = screen.getByTestId("message-input");

    await userEvent.type(messageInput, "New test message");
    await userEvent.click(screen.getByRole("button", { name: /Send/i }));

    expect(mockSendMessage).toHaveBeenCalledWith(
      JSON.stringify({ text: "New test message" })
    );

    const newMessage: Message = {
      _id: "msg-new",
      text: "New test message",
      senderId: "auth-user",
      createdAt: new Date().toISOString(),
    };
    mockChatMessages = [...mockChatMessages, newMessage];

    updateChatStoreMock({
      selectedUser: mockUsers[0],
      messages: mockChatMessages,
    });

    cleanup();
    render(<HomePage />);

    expect(screen.getByTestId("messages-list")).toHaveTextContent(
      "New test message"
    );
  });
});
