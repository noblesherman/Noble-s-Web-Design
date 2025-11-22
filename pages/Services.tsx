import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Code, Cpu, PenTool, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Services: React.FC = () => {
  const deliverables = {
    design: [
      "User Interface (UI) Design",
      "Interactive Prototyping (Figma)",
      "Motion Choreography",
      "Design Systems & Tokens",
      "Accessibility Audits"
    ],
    dev: [
      "Next.js & React Development",
      "Headless CMS Integration",
      "API Routes & Server Actions",
      "Performance Optimization",
      "SEO Structure"
    ]
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Hero */}
        <div className="max-w-3xl mb-24">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8">
            One brain,<br/>
            <span className="text-transparent bg-clip-text bg-noble-gradient">complete systems.</span>
          </h1>
          <p className="text-xl text-muted leading-relaxed mb-8">
            I bridge the gap between "it looks pretty" and "it actually works." 
            By handling both design and code, I eliminate the friction and data loss that happens in traditional agency handoffs.
          </p>
          <Button to="/contact">Start a Project</Button>
        </div>

        {/* Two Column Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {/* Design Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl bg-surface border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
                <PenTool size={120} strokeWidth={0.5} />
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
               <span className="w-3 h-3 rounded-full bg-secondary" />
               Design
             </h2>
             <p className="text-muted mb-8 text-lg">
               Visuals that serve a purpose. I don't just make things look nice; I build systems that scale. Every pixel is placed with development in mind.
             </p>
             
             <ul className="space-y-4">
               {deliverables.design.map((item, i) => (
                 <li key={i} className="flex items-start gap-3 text-gray-300">
                   <CheckCircle size={20} className="text-secondary mt-1 shrink-0" />
                   <span>{item}</span>
                 </li>
               ))}
             </ul>
          </motion.div>

          {/* Dev Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl bg-surface border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-colors"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 text-white">
                <Code size={120} strokeWidth={0.5} />
             </div>
             
             <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
               <span className="w-3 h-3 rounded-full bg-primary" />
               Build
             </h2>
             <p className="text-muted mb-8 text-lg">
               Code that respects the user. Fast load times, semantic HTML, and fluid animations that run at 60fps. I build on the Next.js stack for reliability.
             </p>
             
             <ul className="space-y-4">
               {deliverables.dev.map((item, i) => (
                 <li key={i} className="flex items-start gap-3 text-gray-300">
                   <CheckCircle size={20} className="text-primary mt-1 shrink-0" />
                   <span>{item}</span>
                 </li>
               ))}
             </ul>
          </motion.div>
        </div>

        {/* The "Why" Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
           <div className="bg-white/5 p-8 rounded-xl border border-white/5">
             <Zap className="text-accent mb-4" size={32} />
             <h3 className="text-xl font-bold text-white mb-2">No Handoff Loss</h3>
             <p className="text-muted text-sm">
               Design intent often breaks when handed to a separate dev team. Here, the designer writes the code.
             </p>
           </div>
           <div className="bg-white/5 p-8 rounded-xl border border-white/5">
             <Cpu className="text-accent mb-4" size={32} />
             <h3 className="text-xl font-bold text-white mb-2">Performance First</h3>
             <p className="text-muted text-sm">
               I optimize for Core Web Vitals from day one, not as an afterthought.
             </p>
           </div>
           <div className="bg-white/5 p-8 rounded-xl border border-white/5">
             <CheckCircle className="text-accent mb-4" size={32} />
             <h3 className="text-xl font-bold text-white mb-2">Accessibility</h3>
             <p className="text-muted text-sm">
               Sites are built to be usable by everyone, including keyboard navigation and screen readers.
             </p>
           </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-surface to-background border border-white/10 rounded-2xl p-12 text-center relative overflow-hidden">
           <div className="relative z-10">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to build better?</h2>
             <p className="text-muted max-w-xl mx-auto mb-8">
               Whether you need a new marketing site, a design system, or a complete rebrand, I'm ready to help.
             </p>
             <Button to="/contact">Book a Strategy Call</Button>
           </div>
           
           {/* Decorative background */}
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full" />
             <div className="absolute bottom-[-50%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full" />
           </div>
        </div>

      </div>
    </div>
  );
};