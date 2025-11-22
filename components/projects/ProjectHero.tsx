import React from 'react';
import { motion, useTransform, useScroll } from 'framer-motion';
import type { ProjectData } from '../../data/projects';

type Props = {
  project: ProjectData;
};

export const ProjectHero: React.FC<Props> = ({ project }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 60]);

  return (
    <section className="relative min-h-[60vh] flex items-end overflow-hidden rounded-3xl border border-white/10 mb-16">
      <motion.img
        src={project.heroImage}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ y }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="relative z-10 p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-4 max-w-3xl"
        >
          <span className="inline-block px-3 py-1 text-xs font-mono text-accent bg-white/10 rounded-full border border-white/10">
            {project.category} • {project.year}
          </span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white">{project.title}</h1>
          <p className="text-lg text-muted max-w-2xl">{project.shortDescription}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectHero;
