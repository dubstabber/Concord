import { vi } from "vitest";

export const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  to: vi.fn().mockReturnThis(),
  connected: true,
};

const io = vi.fn(() => mockSocket);

export const resetSocketMocks = () => {
  mockSocket.on.mockReset();
  mockSocket.off.mockReset();
  mockSocket.connect.mockReset();
  mockSocket.disconnect.mockReset();
  mockSocket.emit.mockReset();
  mockSocket.to.mockReset();
};

export default io;
