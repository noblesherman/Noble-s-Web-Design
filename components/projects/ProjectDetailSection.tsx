import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  title: string;
  children: React.ReactNode;
};

export const ProjectDetailSection: React.FC<Props> = ({ title, children }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-surface border border-white/10 rounded-2xl p-8"
    >
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="text-muted space-y-3">{children}</div>
    </motion.section>
  );
};

export default ProjectDetailSection;
