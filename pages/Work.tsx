
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PROJECTS_DATA } from '../data/projects';
import ProjectCard from '../components/projects/ProjectCard';

export const Work: React.FC = () => {
  const [filter, setFilter] = useState('All');
  
  // Specific order requested: E-commerce, Nonprofit, Logistics
  const filters = ['All', 'E-commerce', 'Nonprofit', 'Logistics'];

  const filteredProjects = filter === 'All' 
    ? PROJECTS_DATA 
    : PROJECTS_DATA.filter(p => p.category === filter);

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8">Work</h1>
          <div className="flex flex-wrap gap-4">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-full text-sm font-mono transition-all duration-300 border ${
                  filter === f 
                    ? 'bg-white text-background border-white font-bold' 
                    : 'bg-transparent text-muted border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
        >
          {filteredProjects.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
           <div className="py-24 text-center">
             <p className="text-muted">No projects found in this category yet.</p>
           </div>
        )}
      </div>
    </div>
  );
};
