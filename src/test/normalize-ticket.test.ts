import { describe, it, expect } from "vitest";
import { normalizeScannedTicketValue } from "@/lib/redemption";

describe("normalizeScannedTicketValue", () => {
  it("returns empty string for nullish/empty", () => {
    expect(normalizeScannedTicketValue(null)).toBe("");
    expect(normalizeScannedTicketValue(undefined)).toBe("");
    expect(normalizeScannedTicketValue("   ")).toBe("");
  });

  it("trims whitespace from raw tokens", () => {
    expect(normalizeScannedTicketValue("  abc-123  ")).toBe("abc-123");
  });

  it("returns raw token when not a URL", () => {
    expect(normalizeScannedTicketValue("ticket_abc_123")).toBe("ticket_abc_123");
  });

  it("extracts token from /pass/:token URL", () => {
    expect(normalizeScannedTicketValue("https://sera.app/pass/abc-123")).toBe("abc-123");
    expect(normalizeScannedTicketValue("https://sera.app/pass/abc-123/")).toBe("abc-123");
  });

  it("decodes URL-encoded token in path", () => {
    expect(normalizeScannedTicketValue("https://sera.app/pass/abc%20123")).toBe("abc 123");
  });

  it("extracts ?token= query param", () => {
    expect(normalizeScannedTicketValue("https://sera.app/x?token=tkn-9")).toBe("tkn-9");
  });

  it("extracts ?ticket= query param", () => {
    expect(normalizeScannedTicketValue("https://sera.app/x?ticket=tkt-9")).toBe("tkt-9");
  });

  it("falls back to last segment for unknown URLs", () => {
    expect(normalizeScannedTicketValue("https://sera.app/some/other/xyz")).toBe("xyz");
  });
});
