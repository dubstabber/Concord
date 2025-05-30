import { describe, expect, it, vi } from "vitest";
import { screen, render } from "@testing-library/react";
import HomePage from "../../pages/HomePage";
import { useChatStore } from "../../store/useChatStore";

vi.mock("../../store/useChatStore");

vi.mock("../../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar Component</div>,
}));

vi.mock("../../components/NoChatSelected", () => ({
  default: () => (
    <div data-testid="no-chat-selected">No Chat Selected Component</div>
  ),
}));

vi.mock("../../components/ChatContainer", () => ({
  default: () => (
    <div data-testid="chat-container">Chat Container Component</div>
  ),
}));

describe("HomePage", () => {
  it("should render Sidebar and NoChatSelected when no user is selected", () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedUser: null,
    } as unknown as ReturnType<typeof useChatStore>);

    render(<HomePage />);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("no-chat-selected")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-container")).not.toBeInTheDocument();
  });

  it("should render Sidebar and ChatContainer when a user is selected", () => {
    vi.mocked(useChatStore).mockReturnValue({
      selectedUser: {
        _id: "user1",
        fullName: "John Doe",
        email: "john@example.com",
      },
    } as unknown as ReturnType<typeof useChatStore>);

    render(<HomePage />);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.queryByTestId("no-chat-selected")).not.toBeInTheDocument();
    expect(screen.getByTestId("chat-container")).toBeInTheDocument();
  });
});
