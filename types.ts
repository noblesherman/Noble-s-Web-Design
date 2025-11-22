
export interface Project {
  id: string;
  title: string;
  slug: string;
  client: string;
  type: string;
  year: string;
  description: string;
  tags: string[];
  image: string;
  featured?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  author?: string;
  tags?: string[];
  image?: string;
  content?: string;
}

export interface Lead {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
}
