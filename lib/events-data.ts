export type BookingStatus = "BOOKING OPEN" | "SOLD OUT" | "MEMBERS ONLY";

export interface Event {
  id: string;
  category: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  address: string;
  status: BookingStatus;
  imageUrl: string;
  price: string;
  description: string[];
  cancellationPolicy: string;
}

export interface EventSection {
  label: string;
  events: Event[];
}

export const STATUS_COLORS: Record<BookingStatus, string> = {
  "BOOKING OPEN": "#22c55e",
  "SOLD OUT": "#ef4444",
  "MEMBERS ONLY": "#a855f7",
};

export const MOCK_EVENTS: EventSection[] = [
  {
    label: "Today",
    events: [
      {
        id: "1",
        category: "Entertainment",
        title: "House Quiz",
        date: "Sat 21 Mar",
        time: "19:00",
        endTime: "21:00",
        venue: "White City House",
        address: "225 Wood Lane\nLondon\nW12 7FQ\nUnited Kingdom",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
        price: "Free to book",
        description: [
          "Join us at White City House for our signature House Quiz — an evening of friendly competition, sharp wit, and good company. Teams of up to six, with prizes for the winners.",
          "This event operates on a first-come, first-served basis. Please arrive by 18:45 to secure your seats. The quiz begins promptly at 19:00.",
        ],
        cancellationPolicy: "You can cancel this booking at any point before the scheduled start time.",
      },
      {
        id: "2",
        category: "Food & Drink",
        title: "Kurdish Newroz dinner by Nandine and Taste Cadets",
        date: "Sat 21 Mar",
        time: "19:00",
        endTime: "22:00",
        venue: "Shoreditch House",
        address: "Ebor Street\nLondon\nE1 6AW\nUnited Kingdom",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
        price: "£65 per person",
        description: [
          "To celebrate Newroz — the Kurdish and Persian new year — Nandine and Taste Cadets have come together to create a special dinner rooted in tradition and reimagined for the occasion.",
          "The evening will feature a set menu of sharing plates inspired by the flavours of Kurdistan, accompanied by natural wines and non-alcoholic alternatives.",
        ],
        cancellationPolicy: "Cancellations made more than 48 hours before the event will receive a full refund. No refunds within 48 hours of the event.",
      },
      {
        id: "3",
        category: "Music",
        title: "An evening with Jenevieve",
        date: "Sat 21 Mar",
        time: "20:30",
        endTime: "21:30",
        venue: "180 House",
        address: "180 Strand\nLondon\nWC2R 1EA\nUnited Kingdom",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
        price: "Free to book",
        description: [
          "Join us at 180 House for an evening with Jenevieve, an artist who effortlessly blends old-school charm with contemporary flair. With a sound that's not quite neo-soul, not quite R&B, but always and undeniably Jenevieve, her breezy yet introspective new album solidifies her as one of the most exciting voices of her generation.",
          "This event operates on a first-come, first-served basis, with limited tables. Due to the nature of the room, please keep sound to a minimum during the performance.",
        ],
        cancellationPolicy: "You can cancel this booking at any point before the scheduled start time.",
      },
      {
        id: "4",
        category: "Party",
        title: "Late Nights at Mews: DJ Fat Tony",
        date: "Sat 21 Mar",
        time: "22:00",
        endTime: "03:00",
        venue: "Soho Mews House Club",
        address: "76 Dean Street\nLondon\nW1D 3SQ\nUnited Kingdom",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        price: "Free to book",
        description: [
          "DJ Fat Tony takes over the Mews House Club for a late-night session spanning house, disco, and everything in between. One of London's most beloved DJs, Fat Tony has been a fixture of the city's nightlife for over three decades.",
          "Entry for members only. Guests must be signed in by a member. Smart casual dress code applies.",
        ],
        cancellationPolicy: "You can cancel this booking at any point before the scheduled start time.",
      },
    ],
  },
  {
    label: "Tomorrow",
    events: [
      {
        id: "5",
        category: "Wellness",
        title: "Sunday Morning Yoga Flow",
        date: "Sun 22 Mar",
        time: "09:00",
        endTime: "10:00",
        venue: "Chiswick House",
        address: "Chiswick House & Gardens\nLondon\nW4 2RP\nUnited Kingdom",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80",
        price: "Free to book",
        description: [
          "Start your Sunday with an hour of gentle flow yoga, led by our resident instructor. All levels welcome — bring your own mat or borrow one from the house.",
          "After the session, guests are welcome to stay for coffee and pastries in the courtyard.",
        ],
        cancellationPolicy: "You can cancel this booking at any point before the scheduled start time.",
      },
      {
        id: "6",
        category: "Food & Drink",
        title: "Sunday Roast with the Members",
        date: "Sun 22 Mar",
        time: "13:00",
        endTime: "15:00",
        venue: "Notting Hill House",
        address: "99 Kensington Park Road\nLondon\nW11 2PN\nUnited Kingdom",
        status: "MEMBERS ONLY",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76594f0e243?w=800&q=80",
        price: "£45 per person",
        description: [
          "A proper Sunday roast in the Notting Hill House dining room. A rotating selection of roasts each week, with all the trimmings. Vegetarian and vegan options available.",
          "This is a members-only event. Please book in advance as seating is limited.",
        ],
        cancellationPolicy: "Cancellations made more than 24 hours before the event will receive a full refund.",
      },
    ],
  },
  {
    label: "This Week",
    events: [
      {
        id: "7",
        category: "Culture",
        title: "Private View: New Works by Hurvin Anderson",
        date: "Wed 25 Mar",
        time: "18:30",
        endTime: "21:00",
        venue: "Electric House",
        address: "191 Portobello Road\nLondon\nW11 2ED\nUnited Kingdom",
        status: "SOLD OUT",
        imageUrl: "https://images.unsplash.com/photo-1531913223931-b0d3198229ee?w=800&q=80",
        price: "Free to book",
        description: [
          "A private view of new paintings by Hurvin Anderson, exploring themes of memory, landscape, and the in-between spaces of Black British experience. Light refreshments will be served.",
          "This event is now sold out. Join the waitlist to be notified of cancellations.",
        ],
        cancellationPolicy: "You can cancel this booking at any point before the scheduled start time.",
      },
      {
        id: "8",
        category: "Talk",
        title: "An Evening with Bernardine Evaristo",
        date: "Thu 26 Mar",
        time: "19:00",
        endTime: "20:30",
        venue: "Soho House",
        address: "40 Greek Street\nLondon\nW1D 4EB\nUnited Kingdom",
        status: "BOOKING OPEN",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
        price: "Free to book",
        description: [
          "Bernardine Evaristo, Booker Prize-winning author of Girl, Woman, Other, joins us for an evening of conversation about her new novel, the power of storytelling, and what it means to write from the margins.",
          "Books will be available to purchase on the night. A signing session will follow the talk.",
        ],
        cancellationPolicy: "You can cancel this booking at any point before the scheduled start time.",
      },
    ],
  },
];

export function findEventById(id: string): Event | undefined {
  for (const section of MOCK_EVENTS) {
    const event = section.events.find((e) => e.id === id);
    if (event) return event;
  }
  return undefined;
}
