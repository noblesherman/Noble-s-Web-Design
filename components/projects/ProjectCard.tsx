import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ProjectData } from '../../data/projects';
import { resolveHeroSources } from '../../lib/projectAssets';

type Props = {
  project: ProjectData;
};

export const ProjectCard: React.FC<Props> = ({ project }) => {
  const { primary: heroSrc, fallback: heroFallback } = resolveHeroSources(project);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (heroFallback && img.dataset.fallbackApplied !== 'true') {
      img.dataset.fallbackApplied = 'true';
      img.src = heroFallback;
    }
  };

  return (
    <Link to={`/projects/${project.id}`} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface mb-6 border border-white/10 group-hover:border-white/30 transition-colors"
      >
        <motion.img
          src={heroSrc}
          alt={project.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-mono text-accent bg-background/70 rounded-full border border-white/10">
              {project.category}
            </span>
            <h3 className="text-2xl font-bold text-white mt-3 group-hover:text-primary transition-colors">
              {project.client}
            </h3>
            <p className="text-muted text-sm line-clamp-2">{project.shortDescription}</p>
          </div>
          <span className="text-xs text-white/60">{project.year}</span>
        </div>
      </motion.div>
      <div className="flex gap-2 flex-wrap">
        {project.tags.map((tag) => (
          <span key={tag} className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
};

export default ProjectCard;
