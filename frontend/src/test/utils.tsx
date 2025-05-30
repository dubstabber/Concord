import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { vi } from "vitest";

export function renderWithRouter(ui: React.ReactElement, { route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);

  return render(
    <>
      {ui}
      <Toaster position="top-center" />
    </>,
    { wrapper: BrowserRouter }
  );
}

vi.mock("zustand", async () => {
  const actual = await vi.importActual("zustand");
  return {
    ...actual,
  };
});
