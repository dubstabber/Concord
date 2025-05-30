/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />
/// <reference types="@testing-library/react" />

declare module "vitest" {
  interface MockedObject<T> {
    [key: string]: vitest.Mock;
  }
}

declare global {
  namespace Vi {
    interface Assertion {
      toHaveClass(expected: string): void;
    }
  }
}

export {};
