import { vi } from 'vitest';

export const axiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  defaults: { 
    baseURL: 'http://localhost:5001/api', 
    withCredentials: true 
  }
};
