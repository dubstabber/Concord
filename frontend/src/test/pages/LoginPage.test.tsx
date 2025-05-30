import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../../pages/LoginPage";
import { useAuthStore } from "../../store/useAuthStore";
import { BrowserRouter } from "react-router-dom";
import toast from "react-hot-toast";

vi.mock("../../store/useAuthStore");
vi.mock("react-hot-toast");

describe("LoginPage", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(toast.error).mockImplementation(() => "mocked-toast-id");

    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoggingIn: false,
    } as unknown as ReturnType<typeof useAuthStore>);
  });

  it("renders login form correctly", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Create account/i })
    ).toBeInTheDocument();
  });

  it("toggles password visibility when eye icon is clicked", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const passwordField = screen.getByPlaceholderText(
      "••••••••"
    ) as HTMLInputElement;
    expect(passwordField.type).toBe("password");

    const toggleButton = screen.getByRole("button", { name: "" });
    await userEvent.click(toggleButton);

    expect(passwordField.type).toBe("text");

    await userEvent.click(toggleButton);
    expect(passwordField.type).toBe("password");
  });

  it("validates email format on form submission", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailField = screen.getByPlaceholderText("you@example.com");
    const passwordField = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    await userEvent.type(emailField, "invalid-email");
    await userEvent.type(passwordField, "password123");
    await userEvent.click(submitButton);

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("validates required fields on form submission", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole("button", { name: /Sign in/i });
    await userEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith("Email is required");
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("submits form with valid data", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailField = screen.getByPlaceholderText("you@example.com");
    const passwordField = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: /Sign in/i });

    await userEvent.type(emailField, "user@example.com");
    await userEvent.type(passwordField, "password123");
    await userEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("shows loading state during form submission", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoggingIn: true,
    } as unknown as ReturnType<typeof useAuthStore>);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const loadingText = screen.getByText(/Loading/i);
    expect(loadingText).toBeInTheDocument();
    const submitButton = screen.getByText(/Loading/i).closest("button");
    expect(submitButton).toBeDisabled();
  });
});
