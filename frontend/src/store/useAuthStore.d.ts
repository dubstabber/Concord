import { StoreApi, UseBoundStore } from "zustand";

interface AuthUser {
  id?: string;
  username?: string;
  email?: string;
}

interface AuthStore {
  authUser: AuthUser | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
}

export const useAuthStore: UseBoundStore<StoreApi<AuthStore>>;
