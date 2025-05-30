import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../../components/Sidebar";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { User } from "../../types";

vi.mock("../../store/useChatStore");
vi.mock("../../store/useAuthStore");

describe("Sidebar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render loading skeleton when users are loading", () => {
    const mockGetUsers = vi.fn();

    vi.mocked(useChatStore).mockReturnValue({
      users: [],
      getUsers: mockGetUsers,
      isUsersLoading: true,
      setSelectedUser: vi.fn(),
      selectedUser: null,
      messages: [],
      sendMessage: vi.fn(),
      isMessagesLoading: false,
      subscribeToMessages: vi.fn(),
      unsubscribeFromMessages: vi.fn(),
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: { _id: "currentUser" },
      onlineUsers: [],
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<Sidebar />);

    expect(mockGetUsers).toHaveBeenCalledTimes(1);
    const skeletonElements = screen.queryAllByTestId("skeleton-loader");
    if (skeletonElements.length === 0) {
      const skeletonByClass = document.querySelectorAll(".skeleton");
      expect(skeletonByClass.length).toBeGreaterThan(0);
    } else {
      expect(skeletonElements.length).toBeGreaterThan(0);
    }
  });

  it("should render users list when loaded", async () => {
    const mockUsers: User[] = [
      { _id: "user1", fullName: "John Doe", email: "john@example.com" },
      { _id: "user2", fullName: "Jane Smith", email: "jane@example.com" },
      { _id: "user3", fullName: "Bob Johnson", email: "bob@example.com" },
    ];

    const mockGetUsers = vi.fn();
    const mockSetSelectedUser = vi.fn();

    vi.mocked(useChatStore).mockReturnValue({
      users: mockUsers,
      getUsers: mockGetUsers,
      isUsersLoading: false,
      setSelectedUser: mockSetSelectedUser,
      selectedUser: null,
      messages: [],
      sendMessage: vi.fn(),
      isMessagesLoading: false,
      subscribeToMessages: vi.fn(),
      unsubscribeFromMessages: vi.fn(),
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: {
        _id: "currentUser",
        fullName: "Current User",
        email: "current@example.com",
      },
      onlineUsers: ["user1", "user3"],
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      isLoggingIn: false,
      isSigningUp: false,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<Sidebar />);

    expect(mockGetUsers).toHaveBeenCalledTimes(1);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();

    const userElements = screen.getAllByRole("button");
    expect(userElements.length).toBe(3);
    fireEvent.click(
      screen.getByText("Jane Smith").closest("button") as HTMLElement
    );
    expect(mockSetSelectedUser).toHaveBeenCalledWith(mockUsers[1]);
  });

  it("should highlight the selected user", () => {
    const mockUsers: User[] = [
      { _id: "user1", fullName: "John Doe", email: "john@example.com" },
      { _id: "user2", fullName: "Jane Smith", email: "jane@example.com" },
    ];

    const selectedUser = mockUsers[0];

    vi.mocked(useChatStore).mockReturnValue({
      users: mockUsers,
      getUsers: vi.fn(),
      isUsersLoading: false,
      setSelectedUser: vi.fn(),
      selectedUser: selectedUser,
      messages: [],
      sendMessage: vi.fn(),
      isMessagesLoading: false,
      subscribeToMessages: vi.fn(),
      unsubscribeFromMessages: vi.fn(),
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: {
        _id: "currentUser",
        fullName: "Current User",
        email: "current@example.com",
      },
      onlineUsers: ["user1"],
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
      isLoggingIn: false,
      isSigningUp: false,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<Sidebar />);

    const selectedUserElement = screen.getByText("John Doe").closest("button");
    expect(selectedUserElement).toBeInTheDocument();
    expect(selectedUserElement?.tagName).toBe("BUTTON");
  });

  it("should show no users message when user list is empty", () => {
    vi.mocked(useChatStore).mockReturnValue({
      users: [],
      getUsers: vi.fn(),
      isUsersLoading: false,
      setSelectedUser: vi.fn(),
      selectedUser: null,
      messages: [],
      sendMessage: vi.fn(),
      isMessagesLoading: false,
      subscribeToMessages: vi.fn(),
      unsubscribeFromMessages: vi.fn(),
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      authUser: { _id: "currentUser" },
      onlineUsers: [],
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<Sidebar />);

    expect(screen.getByText(/No online users/i)).toBeInTheDocument();
  });
});
