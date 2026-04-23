import type { Tables } from "@/integrations/supabase/types";

/** Centralised re-exports of common database row shapes. */
export type AccessRequestRow = Tables<"access_requests">;
export type EventRow = Tables<"events">;
export type EventGuestRow = Tables<"event_guests">;
export type DrinkTicketRow = Tables<"drink_tickets">;
export type CheckinRow = Tables<"checkins">;
export type ProfileRow = Tables<"profiles">;
export type UserTierAccessRow = Tables<"user_tier_access">;

/** RSVP status enum, kept in sync with the DB constraint. */
export type RsvpStatus = "pending" | "accepted" | "declined";

/** Drink ticket status enum, kept in sync with the DB constraint. */
export type TicketStatus = "active" | "redeemed" | "void";

/** Tiers a user may be granted. */
export type TierLevel = "essential" | "social" | "host" | "occasions";

/** Access request review decision (no master/legacy roles). */
export type AccessRequestDecision = "approved" | "rejected";

/** Strongly-typed view of an access request as used in the admin UI. */
export type AccessRequestView = AccessRequestRow & {
  status: "pending" | "approved" | "rejected";
};