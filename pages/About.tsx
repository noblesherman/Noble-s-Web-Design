import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { TestSentryButton } from "../components/TestSentryButton";


export default function Home() {
  return (
    <div>
      {/* your original content */}
      <TestSentryButton />
    </div>
  );
}

export const About: React.FC = () => {
  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Content */}
          <div className="lg:col-span-7">
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8">
              Noble Sherman
            </h1>
            <h2 className="text-2xl text-accent font-mono mb-12">
              Designer. Developer. Human.
            </h2>
            
            <div className="prose prose-lg prose-invert text-muted space-y-8 leading-relaxed">
              <p className="text-xl text-white font-medium">
                I run a one-person studio near Philadelphia, working with local orgs and online clients who value craft.
              </p>
              <p>
                I’ve spent years in the industry seeing projects get bloated, delayed, and diluted by too many cooks in the kitchen. Agencies often overcharge and under-deliver, passing your project from a senior sales person to a junior developer.
              </p>
              <p>
                <span className="text-white">My approach is different.</span> You work directly with me. I handle the discovery, the design, the code, and the launch. This keeps communication clear and the vision pure.
              </p>
              <p>
                I’m comfortable in both Figma and VS Code, which means I don’t design things that are impossible to build, and I don’t build things that break the design system.
              </p>
              
              <h3 className="text-white text-2xl font-bold pt-8">What I value</h3>
              <ul className="space-y-4 list-none pl-0">
                <li className="flex gap-4">
                  <span className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <span><strong>Clear Communication:</strong> No jargon. I explain tech in plain English.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <span><strong>Sustainable Pace:</strong> I don't do crunch time. Good work takes focused time.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <span><strong>Realistic Scope:</strong> I’ll tell you if a feature isn't worth the budget.</span>
                </li>
              </ul>
            </div>

            <div className="mt-12">
              <Button to="/contact">Let's Work Together</Button>
            </div>
          </div>

          {/* Sidebar / Image Area */}
          <div className="lg:col-span-5">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-[3/4] bg-surface rounded-2xl overflow-hidden relative border border-white/5 mb-8"
             >
               <img
                 src="/images/noble-headshot.jpg"
                 alt="Noble Sherman headshot"
                 className="absolute inset-0 w-full h-full object-cover"
                 loading="lazy"
               />
               <div className="absolute inset-0 bg-gradient-to-br from-background/30 via-transparent to-transparent" />
             </motion.div>

             <div className="bg-white/5 rounded-xl p-8 border border-white/5">
               <h4 className="text-white font-bold mb-4">Connect</h4>
               <ul className="space-y-3 text-muted">
                 <li>
                   <a href="mailto:noble@noblesweb.design" className="hover:text-primary transition-colors">
                     noble@noblesweb.design
                   </a>
                 </li>
                 <li>Based in Philadelphia, PA</li>
                 <li>Remote friendly</li>
               </ul>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};


