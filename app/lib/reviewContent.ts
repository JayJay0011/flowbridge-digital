export type ReviewItem = {
  id: string;
  name: string;
  company: string;
  rating: number;
  summary: string;
  body: string;
  videoUrl?: string | null;
  response?: string | null;
};

export const fallbackReviews: ReviewItem[] = [
  {
    id: "fallback-1",
    name: "Ashley Bayes",
    company: "NavBuddyTM",
    rating: 5,
    summary: "Clearer systems and less operational stress",
    body:
      "Flowbridge helped us think through the structure behind the work, not just the tools. The process felt clear, practical, and focused on outcomes.",
    videoUrl: "https://www.youtube.com/embed/qcpyw1omFMQ",
  },
  {
    id: "fallback-2",
    name: "Nicky Terrebonne",
    company: "Ecommerce Store Owner",
    rating: 5,
    summary: "A stronger backend for growth",
    body:
      "The work brought more clarity to our operations and gave us a better way to organize follow-up, delivery, and internal visibility.",
    videoUrl: "https://www.youtube.com/embed/K6AG2KZ3auI",
  },
  {
    id: "fallback-3",
    name: "Dr. Ayona",
    company: "Ayona Medspa & Beauty Bar",
    rating: 5,
    summary: "More structure, better visibility",
    body:
      "Flowbridge helped turn scattered processes into a more organized system. Communication was clear and the direction made sense.",
    videoUrl: "https://www.youtube.com/embed/ExBODRPBiuw",
  },
  {
    id: "fallback-4",
    name: "Operations Lead",
    company: "Service Business",
    rating: 5,
    summary: "Follow-up finally became manageable",
    body:
      "The biggest change was visibility. We could see where leads, handoffs, and updates were breaking down and had a clear system to fix it.",
  },
  {
    id: "fallback-5",
    name: "Founder",
    company: "Growing Team",
    rating: 5,
    summary: "A practical systems partner",
    body:
      "The recommendations were direct and useful. We left with a cleaner operating flow and a better sense of what needed to happen next.",
  },
];

export function getStars(rating: number) {
  return "★".repeat(Math.max(0, Math.min(5, rating)));
}
