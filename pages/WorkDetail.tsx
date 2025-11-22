import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { PROJECTS } from '../constants';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const WorkDetail: React.FC = () => {
  const { slug } = useParams();
  const project = PROJECTS.find(p => p.slug === slug);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!project) return <div className="pt-32 text-center text-white">Project not found</div>;

  return (
    <div className="bg-background min-h-screen">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />

      <div className="pt-32 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <Link to="/work" className="inline-flex items-center text-muted hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Work
        </Link>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-heading font-bold text-white mb-8"
        >
          {project.client}
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24 border-t border-white/10 pt-8">
          <div className="col-span-3">
             <p className="text-2xl text-white leading-relaxed">{project.description}</p>
          </div>
          <div className="col-span-1 space-y-6">
             <div>
               <h3 className="text-sm font-mono text-muted mb-1">Type</h3>
               <p className="text-white">{project.type}</p>
             </div>
             <div>
               <h3 className="text-sm font-mono text-muted mb-1">Year</h3>
               <p className="text-white">{project.year}</p>
             </div>
             <div>
               <h3 className="text-sm font-mono text-muted mb-1">Stack</h3>
               <div className="flex flex-wrap gap-2">
                 {project.tags.map(tag => (
                   <span key={tag} className="text-xs border border-white/10 px-2 py-1 rounded text-white/80">{tag}</span>
                 ))}
               </div>
             </div>
          </div>
        </div>

        <div className="aspect-video w-full rounded-xl overflow-hidden mb-24">
          <img src={project.image} alt="Hero" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-3xl mx-auto space-y-24">
           <section>
             <h2 className="text-3xl font-bold text-white mb-6">The Challenge</h2>
             <p className="text-lg text-muted leading-relaxed">
               The client needed a complete overhaul of their digital presence. The previous system was monolithic, slow, and failed to capture the brand's innovative spirit. We needed to migrate to a headless architecture while maintaining SEO ranking.
             </p>
           </section>

           <section>
             <h2 className="text-3xl font-bold text-white mb-6">The Approach</h2>
             <p className="text-lg text-muted leading-relaxed mb-8">
               We adopted a component-driven strategy using React and Tailwind. By breaking the interface down into atomic units, we ensured consistency across the platform. Framer Motion was used to add depth and character to interactions.
             </p>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface h-64 rounded-lg border border-white/5"></div>
                <div className="bg-surface h-64 rounded-lg border border-white/5"></div>
             </div>
           </section>

           <section>
             <h2 className="text-3xl font-bold text-white mb-6">The Outcome</h2>
             <div className="grid grid-cols-3 gap-8 text-center">
               <div className="p-6 bg-white/5 rounded-lg">
                 <div className="text-4xl font-bold text-accent mb-2">40%</div>
                 <div className="text-sm text-muted">Increase in conversion</div>
               </div>
               <div className="p-6 bg-white/5 rounded-lg">
                 <div className="text-4xl font-bold text-accent mb-2">0.2s</div>
                 <div className="text-sm text-muted">Load time</div>
               </div>
               <div className="p-6 bg-white/5 rounded-lg">
                 <div className="text-4xl font-bold text-accent mb-2">100</div>
                 <div className="text-sm text-muted">Accessibility Score</div>
               </div>
             </div>
           </section>
        </div>

        <div className="mt-32 pt-12 border-t border-white/10 text-center">
           <h3 className="text-2xl text-white mb-6">Ready for your own transformation?</h3>
           <Button to="/contact">Start a Project</Button>
        </div>
      </div>
    </div>
  );
};