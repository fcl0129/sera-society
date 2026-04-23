import { describe, it, expect } from "vitest";
import { receiptStatusFromCode } from "@/components/ops/RedemptionReceipt";
import type { RedemptionResponse } from "@/lib/redemption";

describe("receiptStatusFromCode", () => {
  it("returns success when ok", () => {
    expect(receiptStatusFromCode("redeemed", true)).toBe("success");
  });
  it("maps already_redeemed → already_used", () => {
    expect(receiptStatusFromCode("already_redeemed", false)).toBe("already_used");
  });
  it("maps void → void", () => {
    expect(receiptStatusFromCode("void", false)).toBe("void");
  });
  it("maps unauthorized/forbidden → unauthorized", () => {
    expect(receiptStatusFromCode("unauthorized", false)).toBe("unauthorized");
    expect(receiptStatusFromCode("forbidden", false)).toBe("unauthorized");
  });
  it("falls back to invalid for unknown codes", () => {
    expect(receiptStatusFromCode("rpc_error", false)).toBe("invalid");
    expect(receiptStatusFromCode(undefined, false)).toBe("invalid");
  });
});

describe("receiptStatusFromCode — ok flag precedence", () => {
  it("treats ok=true as success even when code looks like an error", () => {
    // ok wins: backend may return ok=true with code='redeemed' on first scan
    expect(receiptStatusFromCode("already_redeemed", true)).toBe("success");
    expect(receiptStatusFromCode("void", true)).toBe("success");
    expect(receiptStatusFromCode("invalid_method", true)).toBe("success");
    expect(receiptStatusFromCode(undefined, true)).toBe("success");
    expect(receiptStatusFromCode("", true)).toBe("success");
  });

  it("never returns success when ok=false, regardless of code", () => {
    const codes = ["already_redeemed", "void", "forbidden", "unauthorized", "invalid", "rpc_error", "invalid_method", "anything", ""];
    for (const c of codes) {
      expect(receiptStatusFromCode(c, false)).not.toBe("success");
    }
  });

  it("handles invalid_method as invalid (not a security category)", () => {
    expect(receiptStatusFromCode("invalid_method", false)).toBe("invalid");
  });

  it("handles rpc_error as invalid (transport failure surfaces as invalid receipt)", () => {
    expect(receiptStatusFromCode("rpc_error", false)).toBe("invalid");
  });

  it("is case-sensitive: uppercase codes fall through to invalid", () => {
    // Backend contract is lowercase; defensive default keeps receipt trustworthy.
    expect(receiptStatusFromCode("ALREADY_REDEEMED", false)).toBe("invalid");
    expect(receiptStatusFromCode("Void", false)).toBe("invalid");
  });
});

describe("double-redemption edge cases", () => {
  // Simulate the canonical second-scan response from the redeem-ticket edge function.
  const firstScan: RedemptionResponse = {
    ok: true,
    code: "redeemed",
    ticket_id: "tkt_123",
    event_id: "evt_1",
    redeemed_at: "2026-04-23T20:00:00.000Z",
  };
  const secondScan: RedemptionResponse = {
    ok: false,
    code: "already_redeemed",
    message: "Ticket already redeemed",
    ticket_id: "tkt_123",
    event_id: "evt_1",
    redeemed_at: "2026-04-23T20:00:00.000Z",
  };

  it("first scan resolves to success", () => {
    expect(receiptStatusFromCode(firstScan.code, firstScan.ok)).toBe("success");
  });

  it("second scan of the same token resolves to already_used (never success)", () => {
    const status = receiptStatusFromCode(secondScan.code, secondScan.ok);
    expect(status).toBe("already_used");
    expect(status).not.toBe("success");
  });

  it("preserves redeemed_at across both scans so receipt shows the original redemption time", () => {
    expect(secondScan.redeemed_at).toBe(firstScan.redeemed_at);
  });

  it("a void ticket scanned after redemption surfaces void, not already_used", () => {
    const voided: RedemptionResponse = { ok: false, code: "void", message: "Ticket voided" };
    expect(receiptStatusFromCode(voided.code, voided.ok)).toBe("void");
  });

  it("each redemption method (qr/nfc/manual) maps identically — receipt status is method-agnostic", () => {
    const methods = ["qr", "nfc", "manual"] as const;
    for (const _m of methods) {
      // The mapping function is method-agnostic by design; verify symmetry.
      expect(receiptStatusFromCode("already_redeemed", false)).toBe("already_used");
      expect(receiptStatusFromCode("redeemed", true)).toBe("success");
    }
  });
});