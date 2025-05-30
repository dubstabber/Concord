import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageInput from "../../components/MessageInput";
import { useChatStore } from "../../store/useChatStore";
import toast from "react-hot-toast";

vi.mock("../../store/useChatStore");
vi.mock("react-hot-toast");

class MockFileReader {
  onload: (() => void) | null = null;
  onloadend: (() => void) | null = null;
  result: string = "data:image/jpeg;base64,mockImageData";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAsDataURL(_file: Blob): void {
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend();
      }
    }, 0);
  }
}

vi.stubGlobal("FileReader", MockFileReader);

describe("MessageInput", () => {
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useChatStore).mockReturnValue({
      sendMessage: mockSendMessage,
      selectedUser: {
        _id: "user123",
        fullName: "Test User",
        email: "test@example.com",
      },
    } as unknown as ReturnType<typeof useChatStore>);
  });

  it("renders message input form correctly", () => {
    render(<MessageInput />);

    expect(
      screen.getByPlaceholderText("Type a message...")
    ).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(sendButton).toBeInTheDocument();
  });

  it("updates text value when typing", async () => {
    render(<MessageInput />);

    const inputField = screen.getByPlaceholderText("Type a message...");
    await userEvent.type(inputField, "Hello there");

    expect(inputField).toHaveValue("Hello there");
  });

  it("disables send button when no text or image", () => {
    render(<MessageInput />);

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(sendButton).toBeDisabled();
  });

  it("enables send button when text is entered", async () => {
    render(<MessageInput />);

    const inputField = screen.getByPlaceholderText("Type a message...");
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );

    await userEvent.type(inputField, "Hello");

    expect(sendButton).not.toBeDisabled();
  });

  it("sends text message on form submission", async () => {
    render(<MessageInput />);

    const inputField = screen.getByPlaceholderText("Type a message...");
    await userEvent.type(inputField, "Hello world");

    const form = inputField.closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    const expectedData = JSON.stringify({
      text: "Hello world",
      image: null,
    });
    expect(mockSendMessage).toHaveBeenCalledWith(expectedData);
  });

  it.skip("handles image upload and preview", async () => {
    render(<MessageInput />);

    const fileInput = document.querySelector(
      'input[type="file"][accept="image/*"]'
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(["dummy content"], "test.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const previewImg = screen.getByAltText("Preview");
    expect(previewImg).toBeInTheDocument();
    expect(previewImg).toHaveAttribute(
      "src",
      "data:image/jpeg;base64,mockImageData"
    );

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(sendButton).not.toBeDisabled();
  });

  it.skip("removes image preview when close button is clicked", async () => {
    render(<MessageInput />);

    const fileInput = document.querySelector(
      'input[type="file"][accept="image/*"]'
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(["dummy content"], "test.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const previewImg = screen.getByAltText("Preview");
    expect(previewImg).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const removeButton = buttons.find(
      (btn) => btn.getAttribute("type") === "button"
    );
    fireEvent.click(removeButton!);

    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });

  it("validates file type for image upload", async () => {
    render(<MessageInput />);

    const fileInput = document.querySelector(
      'input[type="file"][accept="image/*"]'
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(["dummy content"], "test.txt", {
      type: "text/plain",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(toast.error).toHaveBeenCalledWith("Please select an image file");

    expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
  });
});
