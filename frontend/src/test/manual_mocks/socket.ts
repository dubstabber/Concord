import { vi } from "vitest";

export const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  connected: true,
};

export const io = vi.fn(() => mockSocket);
