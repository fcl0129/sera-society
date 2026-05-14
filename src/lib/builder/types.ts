export type EventTypeKey =
  | "dinner"
  | "birthday"
  | "party"
  | "corporate"
  | "wedding_adjacent"
  | "private_gathering"
  | "launch"
  | "other";

export const EVENT_TYPE_OPTIONS: { value: EventTypeKey; label: string }[] = [
  { value: "dinner", label: "Dinner" },
  { value: "birthday", label: "Birthday" },
  { value: "party", label: "Party" },
  { value: "corporate", label: "Corporate event" },
  { value: "wedding_adjacent", label: "Wedding-adjacent" },
  { value: "private_gathering", label: "Private gathering" },
  { value: "launch", label: "Launch" },
  { value: "other", label: "Other" },
];

export type InvitationStyleKey =
  | "midnight_dinner"
  | "oxblood_salon"
  | "garden_after_dark"
  | "champagne_minimal"
  | "velvet_club";

export type GuestStatus =
  | "not_invited"
  | "invited"
  | "opened"
  | "rsvp_pending"
  | "attending"
  | "declined";

export interface BuilderGuest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plusOne: boolean;
  notes?: string;
  status: GuestStatus;
}

export type WidgetKey =
  | "hero"
  | "rsvp"
  | "schedule"
  | "location"
  | "dress_code"
  | "menu"
  | "guest_notes"
  | "playlist"
  | "gift"
  | "accommodation"
  | "gallery"
  | "drink_tickets"
  | "checkin";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  detail?: string;
}

export interface BuilderConfig {
  basics: {
    title: string;
    type: EventTypeKey;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string;
    location: string;
    dressCode: string;
    hostName: string;
    description: string;
  };
  invitation: {
    style: InvitationStyleKey;
    headline: string;
    subheading: string;
    hostLine: string;
    rsvpCta: string;
    note: string;
  };
  guests: BuilderGuest[];
  rsvp: {
    deadline: string;
    allowPlusOnes: boolean;
    askDietary: boolean;
    askSong: boolean;
    askArrival: boolean;
    customQuestion: string;
    confirmationMessage: string;
  };
  widgets: {
    enabled: Record<WidgetKey, boolean>;
    order: WidgetKey[];
    schedule: ScheduleItem[];
    locationNotes: string;
    menu: string;
    guestNotes: string;
    playlistUrl: string;
    gift: string;
    accommodation: string;
    moodboardUrls: string[];
  };
}

export interface SavedEvent {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  config: BuilderConfig;
}