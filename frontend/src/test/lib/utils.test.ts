import { describe, expect, it, vi, beforeEach } from "vitest";
import { formatMessageTime } from "../../lib/utils";

describe("utils", () => {
  describe("formatMessageTime", () => {
    beforeEach(() => {
      const mockToLocaleTimeString = vi.fn().mockReturnValue("14:30");
      Date.prototype.toLocaleTimeString = mockToLocaleTimeString;
    });

    it("should format date string to time format", () => {
      const dateString = "2025-05-30T14:30:00.000Z";

      const result = formatMessageTime(dateString);

      expect(result).toBe("14:30");
      expect(Date.prototype.toLocaleTimeString).toHaveBeenCalledWith("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    });

    it("should handle invalid date strings", () => {
      expect(() => formatMessageTime("invalid-date")).not.toThrow();
    });
  });
});
