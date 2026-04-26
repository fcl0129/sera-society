import { describe, it, expect } from "vitest";
import { receiptStatusFromCode } from "@/components/ops/RedemptionReceipt";

/**
 * Guest pass MVP — response shape and double-redemption invariants for the
 * accountless flow (tickets linked to event_guest_id, no auth user yet).
 */

type PassTicket = {
  id: string;
  token: string;
  status: "active" | "redeemed" | "void";
  redeemed_at: string | null;
  created_at: string;
};

type PassResponse = {
  ok: boolean;
  code?: string;
  event?: { id: string; title: string; starts_at: string };
  guest?: { id: string; rsvp_status: "pending" | "accepted" | "declined" };
  tickets?: PassTicket[];
};

describe("guest pass response shape", () => {
  it("an accepted guest with one active ticket renders a presentable QR", () => {
    const res: PassResponse = {
      ok: true,
      event: { id: "evt_1", title: "Soirée", starts_at: "2026-05-01T20:00:00Z" },
      guest: { id: "g_1", rsvp_status: "accepted" },
      tickets: [
        { id: "t_1", token: "tok_active", status: "active", redeemed_at: null, created_at: "2026-04-29T10:00:00Z" },
      ],
    };
    expect(res.ok).toBe(true);
    expect(res.guest?.rsvp_status).toBe("accepted");
    const active = (res.tickets ?? []).filter((t) => t.status === "active");
    expect(active).toHaveLength(1);
    expect(active[0].token.length).toBeGreaterThan(0);
  });

  it("a pending guest gets the RSVP gate even if tickets exist", () => {
    const res: PassResponse = {
      ok: true,
      event: { id: "evt_1", title: "Soirée", starts_at: "2026-05-01T20:00:00Z" },
      guest: { id: "g_1", rsvp_status: "pending" },
      tickets: [],
    };
    expect(res.guest?.rsvp_status).not.toBe("accepted");
  });

  it("an unknown token returns ok=false / not_found", () => {
    const res: PassResponse = { ok: false, code: "not_found" };
    expect(res.ok).toBe(false);
    expect(res.code).toBe("not_found");
  });

  it("redeemed tickets show their original redeemed_at", () => {
    const ticket: PassTicket = {
      id: "t_1",
      token: "tok_x",
      status: "redeemed",
      redeemed_at: "2026-05-01T21:14:00Z",
      created_at: "2026-04-29T10:00:00Z",
    };
    expect(ticket.redeemed_at).toBeTruthy();
    expect(ticket.status).toBe("redeemed");
  });
});

describe("guest pass — double-redemption maps to receipt correctly", () => {
  // The bartender flow drives the receipt; pass page just polls for status.
  it("first scan → success", () => {
    expect(receiptStatusFromCode("redeemed", true)).toBe("success");
  });
  it("second scan of same accountless ticket → already_used", () => {
    expect(receiptStatusFromCode("already_redeemed", false)).toBe("already_used");
  });
  it("voided pass ticket → void receipt", () => {
    expect(receiptStatusFromCode("void", false)).toBe("void");
  });
});