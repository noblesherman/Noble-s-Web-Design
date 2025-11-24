# Project image roots

Each project now has a folder under `public/images/projects/{projectId}`. Drop your files there so the app can load them without changing code.

- Hero image: `hero.jpg` by default (override per project with `heroFilename` in `data/projects.ts`).
- Gallery images: add files like `gallery-1.jpg`, `gallery-2.jpg`, etc., and list them in `galleryFilenames` for that project.

Examples:
- Food4Philly → `public/images/projects/food4philly/hero.jpg`
- Noble Web Designs → `public/images/projects/noble-web-designs/gallery-1.jpg`
