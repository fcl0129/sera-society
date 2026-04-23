import { describe, it, expect } from "vitest";
import { landingPathForRole, isStaffRole } from "@/lib/auth";

describe("landingPathForRole", () => {
  it("routes admin/host_admin to /admin", () => {
    expect(landingPathForRole("admin")).toBe("/admin");
    expect(landingPathForRole("host_admin")).toBe("/admin");
  });
  it("routes organizer to /organizer", () => {
    expect(landingPathForRole("organizer")).toBe("/organizer");
  });
  it("routes bartender to /ops/bartender", () => {
    expect(landingPathForRole("bartender")).toBe("/ops/bartender");
  });
  it("routes guest and null to /ops/guest", () => {
    expect(landingPathForRole("guest")).toBe("/ops/guest");
    expect(landingPathForRole(null)).toBe("/ops/guest");
  });
});

describe("isStaffRole", () => {
  it("treats admin/host_admin/organizer as staff", () => {
    expect(isStaffRole("admin")).toBe(true);
    expect(isStaffRole("host_admin")).toBe(true);
    expect(isStaffRole("organizer")).toBe(true);
  });
  it("treats bartender/guest/null as non-staff", () => {
    expect(isStaffRole("bartender")).toBe(false);
    expect(isStaffRole("guest")).toBe(false);
    expect(isStaffRole(null)).toBe(false);
  });
});