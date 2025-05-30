import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "../../pages/SignUpPage";
import { useAuthStore } from "../../store/useAuthStore";
import { BrowserRouter } from "react-router-dom";
import toast from "react-hot-toast";

vi.mock("../../store/useAuthStore");
vi.mock("react-hot-toast");

describe("SignUpPage", () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(toast.error).mockImplementation(() => "mocked-toast-id");

    vi.mocked(useAuthStore).mockReturnValue({
      signup: mockSignup,
      isSigningUp: false,
    } as unknown as ReturnType<typeof useAuthStore>);
  });

  it("renders signup form correctly", () => {
    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Create Account" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Account/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("toggles password visibility when eye icon is clicked", async () => {
    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    const passwordField = screen.getByPlaceholderText(
      "********"
    ) as HTMLInputElement;
    expect(passwordField.type).toBe("password");

    const toggleButton = screen.getByRole("button", { name: "" });
    await userEvent.click(toggleButton);

    expect(passwordField.type).toBe("text");

    await userEvent.click(toggleButton);
    expect(passwordField.type).toBe("password");
  });

  it("validates full name on form submission", async () => {
    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    const emailField = screen.getByPlaceholderText("you@example.com");
    const passwordField = screen.getByPlaceholderText("********");
    const submitButton = screen.getByRole("button", {
      name: /Create Account/i,
    });

    await userEvent.type(emailField, "test@example.com");
    await userEvent.type(passwordField, "password123");
    await userEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith("Full name is required");
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("validates email format on form submission", async () => {
    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    const nameField = screen.getByPlaceholderText("John Doe");
    const emailField = screen.getByPlaceholderText("you@example.com");
    const passwordField = screen.getByPlaceholderText("********");
    const submitButton = screen.getByRole("button", {
      name: /Create Account/i,
    });

    await userEvent.type(nameField, "Test User");
    await userEvent.type(emailField, "invalid-email");
    await userEvent.type(passwordField, "password123");
    await userEvent.click(submitButton);

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("validates password length on form submission", async () => {
    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    const nameField = screen.getByPlaceholderText("John Doe");
    const emailField = screen.getByPlaceholderText("you@example.com");
    const passwordField = screen.getByPlaceholderText("********");
    const submitButton = screen.getByRole("button", {
      name: /Create Account/i,
    });

    await userEvent.type(nameField, "Test User");
    await userEvent.type(emailField, "test@example.com");
    await userEvent.type(passwordField, "12345");
    await userEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Password must be at least 6 characters long"
    );
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    const nameField = screen.getByPlaceholderText("John Doe");
    const emailField = screen.getByPlaceholderText("you@example.com");
    const passwordField = screen.getByPlaceholderText("********");
    const submitButton = screen.getByRole("button", {
      name: /Create Account/i,
    });

    await userEvent.type(nameField, "Test User");
    await userEvent.type(emailField, "test@example.com");
    await userEvent.type(passwordField, "password123");
    await userEvent.click(submitButton);

    expect(mockSignup).toHaveBeenCalledWith({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });
  });

  it("shows loading state during form submission", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      signup: mockSignup,
      isSigningUp: true,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );

    const loadingText = screen.getByText(/Loading/i);
    expect(loadingText).toBeInTheDocument();

    const submitButton = screen.getByText(/Loading/i).closest("button");
    expect(submitButton).toBeDisabled();
  });
});
