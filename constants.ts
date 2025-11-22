
import { Project, Service, Testimonial, BlogPost } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Food4Philly',
    slug: 'food4philly',
    client: 'Food4Philly',
    type: 'Nonprofit',
    year: '2024',
    description: 'A refocused nonprofit site that makes donating and finding food simple.',
    tags: ['Next.js', 'Accessibility', 'Localization'],
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop',
    featured: true,
  },
  {
    id: '2',
    title: 'Kensure Logistics',
    slug: 'kensure-logistics',
    client: 'Kensure Logistics',
    type: 'Logistics',
    year: '2024',
    description: 'A B2B marketing site that cuts straight to what ops people care about.',
    tags: ['React', 'Motion', 'SEO'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop',
    featured: true,
  },
  {
    id: '3',
    title: 'Martino’s of Elmont',
    slug: 'martinos',
    client: 'Martino’s',
    type: 'E-commerce',
    year: '2023',
    description: 'A neighborhood restaurant with a cleaner menu and smoother mobile flow.',
    tags: ['Mobile First', 'CMS', 'Photography'],
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1600&auto=format&fit=crop',
    featured: true,
  },
  {
    id: '4',
    title: 'Noble Studio v1',
    slug: 'noble-studio-v1',
    client: 'Noble',
    type: 'Design System',
    year: '2023',
    description: 'Previous iteration of the studio portfolio focusing on dark mode aesthetics.',
    tags: ['Design System', 'React'],
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
    featured: false,
  }
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Design & Strategy',
    description: 'I design and build in the same brain, so nothing gets lost. Mockups that actually work in the browser.',
    features: ['Figma Prototyping', 'Motion Design', 'User Experience', 'Brand Identity'],
    icon: 'Palette'
  },
  {
    id: 's2',
    title: 'Web Development',
    description: 'Sites that load fast and respect your users\' time. Clean code that doesn\'t need a babysitter.',
    features: ['Next.js & React', 'Performance First', 'SEO Optimization', 'CMS Integration'],
    icon: 'Code'
  },
  {
    id: 's3',
    title: 'Nonprofit & Local',
    description: 'Specialized approach for organizations that need clear communication and accessible interfaces.',
    features: ['Accessibility (WCAG)', 'Donation Flows', 'Localization', 'Event Systems'],
    icon: 'HeartHandshake'
  },
  {
    id: 's4',
    title: 'Launch & Care',
    description: 'Here for long-term relationships, not one-off mystery handoffs.',
    features: ['Security Updates', 'Analytics Reports', 'Feature Iteration', 'Monthly Support'],
    icon: 'Zap'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'Director',
    company: 'Food4Philly',
    quote: "Traffic went up and the site loads like it cares. Noble translated our mission into a digital experience that actually works for our donors."
  },
  {
    id: 't2',
    name: 'Mike Ross',
    role: 'Ops Lead',
    company: 'Kensure Logistics',
    quote: "We launched in weeks and nothing broke. The design is sharp, professional, and exactly what our enterprise clients expect to see."
  },
  {
    id: 't3',
    name: 'Tony Martino',
    role: 'Owner',
    company: 'Martino’s',
    quote: "Clean design, smart motion, no fluff. Customers can finally read the menu on their phones without pinching and zooming."
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Why Speed Matters for Nonprofits',
    slug: 'speed-matters',
    excerpt: 'Donors leave when pages load slow. Here is how we fix it using Next.js and proper image optimization.',
    date: 'Oct 12, 2023',
    readTime: '5 min read',
    author: 'Noble Sherman',
    tags: ['Performance', 'Next.js'],
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000&auto=format&fit=crop',
    content: `
      <p>In the world of nonprofit fundraising, every second counts. Literally. Studies show that a 1-second delay in page load time can result in a 7% reduction in conversions. For a nonprofit, that means fewer donations, fewer volunteers, and less impact.</p>
      
      <h3>The Heavy Page Problem</h3>
      <p>Many organizational sites are built on heavy, outdated CMS platforms that load megabytes of unoptimized images and scripts before the user can even click "Donate". This is especially problematic for mobile users, who often make up over 50% of traffic.</p>
      
      <h3>The Solution: Static Generation</h3>
      <p>By using Next.js, we pre-render pages at build time. This means when a donor visits Food4Philly, the server isn't scrambling to build the page database query by database query. It just hands over a finished HTML file.</p>
      
      <h3>Results</h3>
      <p>After migrating to a modern stack, we saw:</p>
      <ul>
        <li>Time to Interactive dropped from 4.5s to 0.8s</li>
        <li>Mobile donation conversion increased by 15%</li>
        <li>Google Search ranking improved for local keywords</li>
      </ul>
    `
  },
  {
    id: 'b2',
    title: 'Calm Motion: Animation that respects the user',
    slug: 'calm-motion',
    excerpt: 'Designing interactions that feel natural and helpful, rather than flashy and distracting.',
    date: 'Nov 03, 2023',
    readTime: '4 min read',
    author: 'Noble Sherman',
    tags: ['Design', 'Motion'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
    content: `
      <p>Motion on the web gets a bad rap, and often deservedly so. We've all visited sites where things fly in from every direction, scroll-jacking takes over your mouse, and you feel like you're fighting the interface just to read a paragraph.</p>
      
      <h3>Utility First</h3>
      <p>At Noble Web Designs, I follow a "Utility First" rule for motion. If an animation doesn't help the user understand context, hierarchy, or state, it gets cut.</p>
      
      <h3>Examples of Good Motion</h3>
      <ul>
        <li><strong>Staggered lists:</strong> Helps the eye follow content as it loads.</li>
        <li><strong>State transitions:</strong> Morphing a button into a loading spinner confirms an action was registered.</li>
        <li><strong>Skeleton screens:</strong> Reduces perceived wait time compared to a blank white screen.</li>
      </ul>
      
      <p>The goal isn't to impress other designers. It's to make the user feel like the site is fast, responsive, and solid.</p>
    `
  },
  {
    id: 'b3',
    title: 'Building the Kensure Logistics Portal',
    slug: 'kensure-build',
    excerpt: 'How we structured a React application for high-volume B2B logistics tracking.',
    date: 'Dec 15, 2023',
    readTime: '8 min read',
    author: 'Noble Sherman',
    tags: ['Case Study', 'React'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
    content: `
      <p>Kensure Logistics needed more than a marketing site. They needed a customer portal where clients could track shipments in real-time, view invoices, and manage warehouse inventory.</p>
      
      <h3>Architecture</h3>
      <p>We chose a hybrid approach:</p>
      <ul>
        <li><strong>Marketing Site:</strong> Next.js for SEO and speed.</li>
        <li><strong>Portal:</strong> A protected route section using client-side fetching with SWR for real-time data updates.</li>
      </ul>
      
      <h3>Challenge: Data Visualization</h3>
      <p>Displaying thousands of shipping routes on a map without crashing the browser required careful optimization. We implemented clustering and lazy loading for map markers, ensuring the UI remained buttery smooth even with heavy datasets.</p>
    `
  }
];
