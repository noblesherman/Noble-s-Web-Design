import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { PROJECTS_DATA } from '../data/projects';
import ProjectHero from '../components/projects/ProjectHero';
import ProjectDetailSection from '../components/projects/ProjectDetailSection';
import ProjectGallery from '../components/projects/ProjectGallery';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { resolveGallerySources } from '../lib/projectAssets';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const project = PROJECTS_DATA.find((p) => p.id === id);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const gallerySources = project ? resolveGallerySources(project) : null;

  if (!project) return <div className="pt-32 text-center text-white">Project not found</div>;

  return (
    <div className="bg-background min-h-screen">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left" style={{ scaleX }} />

      <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <Link to="/projects" className="inline-flex items-center text-muted hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Link>

        <div className="relative">
          <ProjectHero project={project} />
          {project.externalUrl && (
            <div className="absolute right-4 bottom-6 md:right-8 md:bottom-10 flex gap-3">
              <Button variant="outline" asChild>
                <a href={project.externalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  Visit Site <ExternalLink size={16} />
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <ProjectDetailSection title="Overview">
            <p>{project.fullDescription}</p>
          </ProjectDetailSection>
          <ProjectDetailSection title="Tech Stack">
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="px-2 py-1 rounded bg-white/10 text-white text-xs border border-white/10">
                  {tech}
                </span>
              ))}
            </div>
          </ProjectDetailSection>
          <ProjectDetailSection title="Tags">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded bg-primary/10 text-white text-xs border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </ProjectDetailSection>
        </div>

        <ProjectGallery
          images={gallerySources?.primary || []}
          fallbackImages={gallerySources?.fallback}
        />

        <div className="mt-16 flex items-center justify-between bg-surface border border-white/10 rounded-2xl p-6 flex-col md:flex-row gap-4">
          <div className="space-y-1">
            <p className="text-muted text-sm">Ready for your own transformation?</p>
            <h3 className="text-2xl text-white font-bold">Let’s ship your project.</h3>
          </div>
          <div className="flex gap-3">
            {project.externalUrl && (
              <Button variant="outline" asChild>
                <a href={project.externalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  Visit Site <ExternalLink size={16} />
                </a>
              </Button>
            )}
            <Button to="/contact">Start a Project</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
