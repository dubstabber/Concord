import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatHeader from "../../components/ChatHeader";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

vi.mock("../../store/useChatStore");
vi.mock("../../store/useAuthStore");

describe("ChatHeader", () => {
  it("should display the selected user name", () => {
    const mockSelectedUser = {
      _id: "user1",
      fullName: "John Doe",
      email: "john@example.com",
      profilePic: "/avatar.png",
    };

    vi.mocked(useChatStore).mockReturnValue({
      selectedUser: mockSelectedUser,
      setSelectedUser: vi.fn(),
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      onlineUsers: ["user1"],
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<ChatHeader />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByAltText("John Doe")).toHaveAttribute(
      "src",
      "/avatar.png"
    );
    expect(screen.getByText(/online/i)).toBeInTheDocument();
  });

  it("should display offline status when user is not online", () => {
    const mockSelectedUser = {
      _id: "user2",
      fullName: "Jane Smith",
      email: "jane@example.com",
    };

    vi.mocked(useChatStore).mockReturnValue({
      selectedUser: mockSelectedUser,
      setSelectedUser: vi.fn(),
    } as unknown as ReturnType<typeof useChatStore>);

    vi.mocked(useAuthStore).mockReturnValue({
      onlineUsers: ["user1"],
    } as unknown as ReturnType<typeof useAuthStore>);

    render(<ChatHeader />);

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByAltText("Jane Smith")).toHaveAttribute(
      "src",
      "/avatar.png"
    );
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });
});
