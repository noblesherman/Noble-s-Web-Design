import type { ProjectData } from '../data/projects';

const DEFAULT_HERO_FILE = 'hero.jpg';

export const resolveHeroSources = (project: ProjectData) => {
  const primary = project.assetsBase
    ? `${project.assetsBase}/${project.heroFilename || DEFAULT_HERO_FILE}`
    : project.heroImage;

  const fallback = project.heroImage;

  return { primary, fallback };
};

export const resolveGallerySources = (project: ProjectData) => {
  const hasLocalGallery = Boolean(project.assetsBase && project.galleryFilenames?.length);

  if (hasLocalGallery) {
    const primary = project.galleryFilenames!.map((file) => `${project.assetsBase}/${file}`);
    const fallback = project.gallery?.length ? project.gallery : primary;
    return { primary, fallback };
  }

  return { primary: project.gallery, fallback: project.gallery };
};
