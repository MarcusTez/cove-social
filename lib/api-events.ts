export type RsvpStatus = "pending" | "confirmed" | "declined" | "cancelled" | null;

export interface ApiEvent {
  id: string;
  title: string;
  eventDatetime: string;
  address: string;
  isOpen: boolean;
  description: string;
  imageData: string | null;
  category: string;
  rsvpCount: number;
  hasRsvped: boolean;
  rsvpStatus: RsvpStatus;
  confirmedDetails: string | null;
  createdAt: string;
}

export interface ApiEventsResponse {
  events: ApiEvent[];
}

export interface ApiEventResponse {
  event: ApiEvent;
}

export interface ApiEventSection {
  label: string;
  events: ApiEvent[];
}

export function formatEventDateTime(isoString: string): string {
  const date = new Date(isoString);
  const dayPart = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dayPart}, ${timePart}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function groupEventsByDate(events: ApiEvent[]): ApiEventSection[] {
  const now = new Date();
  const today = startOfDay(now);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayOfWeek = today.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);

  const endOfNextWeek = new Date(endOfWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  const buckets: ApiEventSection[] = [
    { label: "Today", events: [] },
    { label: "Tomorrow", events: [] },
    { label: "This Week", events: [] },
    { label: "Next Week", events: [] },
    { label: "Coming Up", events: [] },
  ];

  for (const event of events) {
    const eventDay = startOfDay(new Date(event.eventDatetime));

    if (eventDay < today) continue;

    if (eventDay.getTime() === today.getTime()) {
      buckets[0].events.push(event);
    } else if (eventDay.getTime() === tomorrow.getTime()) {
      buckets[1].events.push(event);
    } else if (eventDay <= endOfWeek) {
      buckets[2].events.push(event);
    } else if (eventDay <= endOfNextWeek) {
      buckets[3].events.push(event);
    } else {
      buckets[4].events.push(event);
    }
  }

  return buckets.filter((b) => b.events.length > 0);
}
