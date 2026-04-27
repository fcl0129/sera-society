# Ticket + Check-in Drift Repair Verification

Manual verification checklist after applying migration `20260427113000_repair_ticket_and_checkin_schema_drift.sql`.

1. Organizer can issue a ticket to an accepted `event_guests` row with no linked profile (`guest_id` null).
2. Ticket insert succeeds with only `event_id`, `event_guest_id`, `status='active'` (and optional `guest_id`) and no `ticket_code`.
3. New `drink_tickets` row has a non-null `token` value.
4. `/pass/:token` for that guest RSVP token renders an active ticket QR.
5. Bartender redemption succeeds once.
6. Second redemption attempt returns `already_redeemed`.
7. Check-in inserts `checkins.guest_id = event_guests.id`.
8. Undo check-in deletes that `checkins` row.
9. Confirm no RLS recursion regressions in organizer dashboard/check-in/pass flows.
