import React from 'react';
import { motion } from 'framer-motion';
import { PROJECTS_DATA } from '../data/projects';
import ProjectCard from '../components/projects/ProjectCard';

export const Projects: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-heading font-bold text-white mb-4"
          >
            Projects
          </motion.h1>
          <p className="text-muted max-w-2xl">Motion-forward case studies built for clarity, speed, and calm experiences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {PROJECTS_DATA.map((project) => (
            <ProjectCard project={project} key={project.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
