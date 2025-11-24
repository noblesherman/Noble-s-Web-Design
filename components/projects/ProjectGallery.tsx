import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  images: string[];
  fallbackImages?: string[];
};

export const ProjectGallery: React.FC<Props> = ({ images, fallbackImages }) => {
  const resolvedImages = images?.length ? images : fallbackImages || [];

  if (!resolvedImages.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {resolvedImages.map((src, idx) => (
        <motion.div
          key={src}
          whileHover={{ y: -6 }}
          className="overflow-hidden rounded-xl border border-white/10 bg-surface"
        >
          <img
            src={src}
            alt={`Gallery ${idx + 1}`}
            className="w-full h-full object-cover"
            onError={(event) => {
              const img = event.currentTarget;
              const fallback = fallbackImages?.[idx];
              if (fallback && img.dataset.fallbackApplied !== 'true') {
                img.dataset.fallbackApplied = 'true';
                img.src = fallback;
              }
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProjectGallery;
