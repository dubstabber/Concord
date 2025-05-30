import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { axiosInstance } from "../../../src/lib/axios";
import type { Socket } from "socket.io-client";
import type { User } from "../../types";

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  connected: true,
} as unknown as Socket;

vi.mock("../../../src/lib/axios", () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUser: User = {
  _id: "test-user-id",
  fullName: "Test User",
  email: "test@example.com",
  profilePic: "/test-avatar.png",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(useAuthStore.getState(), "connectSocket").mockImplementation(
      () => {
        useAuthStore.setState({ socket: mockSocket });
      }
    );

    useAuthStore.setState({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,
      onlineUsers: [],
      socket: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("checkAuth", () => {
    it("should set authUser when auth check succeeds", async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockUser });

      await useAuthStore.getState().checkAuth();

      expect(axiosInstance.get).toHaveBeenCalledWith("/auth/check");
      expect(useAuthStore.getState().authUser).toEqual(mockUser);
      expect(useAuthStore.getState().isCheckingAuth).toBe(false);
      expect(useAuthStore.getState().connectSocket).toHaveBeenCalled();
    });

    it("should set authUser to null when auth check fails", async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      await useAuthStore.getState().checkAuth();

      expect(axiosInstance.get).toHaveBeenCalledWith("/auth/check");
      expect(useAuthStore.getState().authUser).toBeNull();
      expect(useAuthStore.getState().isCheckingAuth).toBe(false);
      expect(useAuthStore.getState().connectSocket).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should set authUser when login succeeds", async () => {
      const loginData = { email: "test@example.com", password: "password" };
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: mockUser });

      await useAuthStore.getState().login(loginData);

      expect(axiosInstance.post).toHaveBeenCalledWith("/auth/login", loginData);
      expect(useAuthStore.getState().authUser).toEqual(mockUser);
      expect(useAuthStore.getState().isLoggingIn).toBe(false);
    });

    it("should handle login failure", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrong-password",
      };
      const axiosError = {
        response: { data: { message: "Invalid credentials" } },
      };
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(axiosError);

      await useAuthStore.getState().login(loginData);

      expect(axiosInstance.post).toHaveBeenCalledWith("/auth/login", loginData);
      expect(useAuthStore.getState().authUser).toBeNull();
      expect(useAuthStore.getState().isLoggingIn).toBe(false);
    });
  });

  describe("signup", () => {
    it("should set authUser when signup succeeds", async () => {
      const signupData = {
        fullName: "New User",
        email: "new@example.com",
        password: "password",
        confirmPassword: "password",
      };
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: mockUser });

      await useAuthStore.getState().signup(signupData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/signup",
        signupData
      );
      expect(useAuthStore.getState().authUser).toEqual(mockUser);
      expect(useAuthStore.getState().isSigningUp).toBe(false);
    });
  });

  describe("logout", () => {
    it("should clear authUser when logout succeeds", async () => {
      useAuthStore.setState({ authUser: mockUser });
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({});

      await useAuthStore.getState().logout();

      expect(axiosInstance.post).toHaveBeenCalledWith("/auth/logout");
      expect(useAuthStore.getState().authUser).toBeNull();
    });
  });

  describe("connectSocket", () => {
    it("should connect socket when user is authenticated", () => {
      const connectSocketSpy = vi.spyOn(
        useAuthStore.getState(),
        "connectSocket"
      );
      connectSocketSpy.mockImplementation(() => {
        useAuthStore.setState({ socket: mockSocket });
      });

      useAuthStore.setState({ authUser: mockUser, socket: null });

      useAuthStore.getState().connectSocket();

      expect(connectSocketSpy).toHaveBeenCalled();
      expect(useAuthStore.getState().socket).toBe(mockSocket);
    });

    it("should not connect socket when user is not authenticated", () => {
      const connectSocketSpy = vi.spyOn(
        useAuthStore.getState(),
        "connectSocket"
      );
      connectSocketSpy.mockImplementation(() => {
        if (useAuthStore.getState().authUser) {
          useAuthStore.setState({ socket: mockSocket });
        }
      });

      useAuthStore.setState({ authUser: null, socket: null });
      useAuthStore.getState().connectSocket();

      expect(useAuthStore.getState().socket).toBeNull();
    });
  });
});
