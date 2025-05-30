import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatContainer from "../../components/ChatContainer";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { Message, User } from "../../types";

Element.prototype.scrollIntoView = vi.fn();

vi.mock("../../store/useChatStore");
vi.mock("../../store/useAuthStore");
vi.mock("../../lib/utils", () => ({
  formatMessageTime: vi.fn(() => "2:30 PM"),
}));
vi.mock("../../components/ChatHeader", () => ({
  default: () => <div data-testid="chat-header">Chat Header</div>,
}));
vi.mock("../../components/MessageInput", () => ({
  default: () => <div data-testid="message-input">Message Input</div>,
}));
vi.mock("../../components/skeletons/MessageSkeleton", () => ({
  default: () => <div data-testid="message-skeleton">Message Skeleton</div>,
}));

describe("ChatContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading skeleton when messages are loading", () => {
    // Arrange
    const mockGetMessages = vi.fn();
    const mockSubscribe = vi.fn();
    const mockUnsubscribe = vi.fn();

    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      getMessages: mockGetMessages,
      isMessagesLoading: true,
      selectedUser: {
        _id: "user1",
        fullName: "User 1",
        email: "user1@example.com",
      },
      subscribeToMessages: mockSubscribe,
      unsubscribeFromMessages: mockUnsubscribe,
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: {
        _id: "currentUser",
        fullName: "Current User",
        email: "current@example.com",
      },
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<ChatContainer />);

    expect(screen.getByTestId("chat-header")).toBeInTheDocument();
    expect(screen.getByTestId("message-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("message-input")).toBeInTheDocument();
    expect(mockGetMessages).toHaveBeenCalledWith("user1");
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it("should render messages when loaded", () => {
    const mockSelectedUser: User = {
      _id: "user1",
      fullName: "User 1",
      email: "user1@example.com",
      profilePic: "/avatar1.png",
    };

    const mockAuthUser: User = {
      _id: "currentUser",
      fullName: "Current User",
      email: "current@example.com",
      profilePic: "/avatar2.png",
    };

    const mockMessages: Message[] = [
      {
        _id: "msg1",
        text: "Hello there",
        senderId: "currentUser",
        createdAt: "2025-05-30T14:30:00Z",
      },
      {
        _id: "msg2",
        text: "Hi back!",
        senderId: "user1",
        createdAt: "2025-05-30T14:31:00Z",
      },
      {
        _id: "msg3",
        text: "How are you?",
        senderId: "currentUser",
        createdAt: "2025-05-30T14:32:00Z",
      },
      {
        _id: "msg4",
        image: "/image.png",
        senderId: "user1",
        createdAt: "2025-05-30T14:33:00Z",
      },
    ];

    const mockGetMessages = vi.fn();
    const mockSubscribe = vi.fn();
    const mockUnsubscribe = vi.fn();

    vi.mocked(useChatStore).mockReturnValue({
      messages: mockMessages,
      getMessages: mockGetMessages,
      isMessagesLoading: false,
      selectedUser: mockSelectedUser,
      subscribeToMessages: mockSubscribe,
      unsubscribeFromMessages: mockUnsubscribe,
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: mockAuthUser,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<ChatContainer />);

    expect(screen.getByTestId("chat-header")).toBeInTheDocument();
    expect(screen.getByTestId("message-input")).toBeInTheDocument();
    expect(screen.queryByTestId("message-skeleton")).not.toBeInTheDocument();

    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("Hi back!")).toBeInTheDocument();
    expect(screen.getByText("How are you?")).toBeInTheDocument();
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
    expect(images.some((img) => img.getAttribute("src") === "/image.png")).toBe(
      true
    );

    expect(mockGetMessages).toHaveBeenCalledWith("user1");
    expect(mockSubscribe).toHaveBeenCalledTimes(1);
  });

  it("should clean up by unsubscribing when unmounted", () => {
    const mockGetMessages = vi.fn();
    const mockSubscribe = vi.fn();
    const mockUnsubscribe = vi.fn();

    vi.mocked(useChatStore).mockReturnValue({
      messages: [],
      getMessages: mockGetMessages,
      isMessagesLoading: false,
      selectedUser: {
        _id: "user1",
        fullName: "User 1",
        email: "user1@example.com",
      },
      subscribeToMessages: mockSubscribe,
      unsubscribeFromMessages: mockUnsubscribe,
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: {
        _id: "currentUser",
        fullName: "Current User",
        email: "current@example.com",
      },
    } as unknown as ReturnType<typeof useAuthStore>);

    const { unmount } = render(<ChatContainer />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
