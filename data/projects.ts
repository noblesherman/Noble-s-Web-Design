export type ProjectData = {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  heroImage: string;
  gallery: string[];
  assetsBase?: string;
  heroFilename?: string;
  galleryFilenames?: string[];
  tags: string[];
  technologies: string[];
  year: string;
  client: string;
  category: string;
  externalUrl?: string;
};

const projectAssetsBase = (id: string) => `/images/projects/${id}`;

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
    assetsBase: projectAssetsBase("food4philly"),
    heroFilename: "hero.jpg",
    galleryFilenames: ["gallery-1.jpg", "gallery-2.jpg"],
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
    assetsBase: projectAssetsBase("kensure-logistics"),
    heroFilename: "hero.jpg",
    galleryFilenames: ["gallery-1.jpg", "gallery-2.jpg"],
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
    assetsBase: projectAssetsBase("martinos"),
    heroFilename: "hero.jpg",
    galleryFilenames: ["gallery-1.jpg", "gallery-2.jpg"],
    tags: ["Mobile First", "E-comm", "Photography"],
    technologies: ["Next.js", "Stripe", "Headless CMS"],
    externalUrl: "https://martinosofelmont.net",
  },
  {
    id: "noble-web-designs",
    title: "Noble Web Designs Platform",
    client: "Noble Web Designs",
    category: "Platform",
    year: "2024",
    shortDescription:
      "A full-backend platform for web developers to manage clients, sign PDFs, and onboard projects without leaving the portal.",
    fullDescription:
      "I rebuilt the Noble Web Designs site into a working platform. Web developers can invite clients, guide onboarding, capture signatures on contracts, and keep documents synced to secure storage. The Express, Prisma, and Supabase backend powers the marketing site, admin dashboard, and client portal so everyone sees the same source of truth.",
    heroImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1600&auto=format&fit=crop",
    ],
    assetsBase: projectAssetsBase("noble-web-designs"),
    heroFilename: "hero.jpg",
    galleryFilenames: ["gallery-1.jpg", "gallery-2.jpg"],
    tags: ["Client Portal", "PDF eSign", "Onboarding"],
    technologies: ["React", "Express", "Prisma", "Supabase", "PDFKit"],
    externalUrl: "https://noblesweb.design",
  },
];
