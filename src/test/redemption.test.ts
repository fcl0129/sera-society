import { describe, it, expect } from "vitest";
import { receiptStatusFromCode } from "@/components/ops/RedemptionReceipt";

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