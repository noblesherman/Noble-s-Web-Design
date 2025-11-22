export type ProjectData = {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  heroImage: string;
  gallery: string[];
  tags: string[];
  technologies: string[];
  year: string;
  client: string;
  category: string;
  externalUrl?: string;
};

export const PROJECTS_DATA: ProjectData[] = [
  {
    id: "food4philly",
    title: "Food4Philly",
    client: "Food4Philly",
    category: "Nonprofit",
    year: "2024",
    shortDescription: "A refocused nonprofit site that makes donating and finding food simple.",
    fullDescription:
      "We rebuilt the Food4Philly experience from the ground up with a focus on clarity, accessibility, and real-world workflows. The new site trims the noise, prioritizes critical actions, and keeps donors informed without overwhelm.",
    heroImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522199785564-6e0cf66e4300?q=80&w=1600&auto=format&fit=crop",
    ],
    tags: ["Accessibility", "Donor UX", "Nonprofit"],
    technologies: ["Next.js", "Tailwind", "Framer Motion", "CMS"],
    externalUrl: "https://food4philly.org",
  },
  {
    id: "kensure-logistics",
    title: "Kensure Logistics",
    client: "Kensure Logistics",
    category: "Logistics",
    year: "2024",
    shortDescription: "A B2B marketing site that cuts straight to what ops people care about.",
    fullDescription:
      "We tightened the narrative, clarified service tiers, and added subtle motion that signals polish without slowing down procurement teams. The result: faster sales conversations and clearer value props.",
    heroImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1527437934671-61474b530017?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500043202000-5fe6f3d0890e?q=80&w=1600&auto=format&fit=crop",
    ],
    tags: ["SEO", "Motion", "B2B"],
    technologies: ["React", "Tailwind", "Framer Motion", "HubSpot"],
    externalUrl: "https://freightkensure.com",
  },
  {
    id: "martinos",
    title: "Martinos Pizzeria",
    client: "Martinos Pizzeria",
    category: "E-commerce",
    year: "2023",
    shortDescription: "A neighborhood restaurant with a cleaner menu and smoother mobile flow.",
    fullDescription:
      "Streamlined ordering, updated photography, and quick taps for repeat customers. The site now feels as friendly as the staff behind the counter.",
    heroImage: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?q=80&w=1600&auto=format&fit=crop",
    ],
    tags: ["Mobile First", "E-comm", "Photography"],
    technologies: ["Next.js", "Stripe", "Headless CMS"],
    externalUrl: "https://martinosofelmont.net",
  },
  {
    id: "noble-studio-v1",
    title: "Noble Studio v1",
    client: "Noble",
    category: "Design System",
    year: "2023",
    shortDescription: "Previous iteration of the studio portfolio focusing on dark mode aesthetics.",
    fullDescription:
      "An exploration into calm motion, deep surfaces, and typography balance. Served as the foundation for the current studio site.",
    heroImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop",
    ],
    tags: ["Design System", "Brand"],
    technologies: ["React", "Storybook", "Framer Motion"],
    externalUrl: "https://noblesweb.design",
  },
];
