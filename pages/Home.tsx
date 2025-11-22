import React, { useRef, ReactElement } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Code, Globe, Layers, Smartphone, Zap, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SERVICES } from '../constants';
import { PROJECTS_DATA } from '../data/projects';

// 1. Hero Section
const Hero = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={targetRef} className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Parallax Layers */}
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px]" />
      </motion.div>

      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        {/* Left Content */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-accent text-xs font-mono mb-6">
              Accepting projects for late 2025
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight mb-6">
              Websites built like you actually <span className="text-transparent bg-clip-text bg-noble-gradient">use them.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted mb-8 max-w-md leading-relaxed">
              Clean layouts, calm motion, and pages that respect people’s time. I work with nonprofits and small teams who care how their site feels.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button to="/contact">Book Strategy Call</Button>
              <Button to="/work" variant="outline">See Projects</Button>
            </div>
          </motion.div>
        </div>

        {/* Right Visual - Simulated Project Stack */}
        <motion.div 
          style={{ y: y2 }}
          className="relative hidden md:block h-[600px]"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                x: 100, 
                scale: 0.9,
                rotateY: -5,
                rotateX: 5,
                transformPerspective: 1000
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1,
                rotateY: -5,
                rotateX: 5,
                transformPerspective: 1000
              }}
              transition={{ delay: 0.3 + (i * 0.1), duration: 0.8 }}
              className="absolute w-full aspect-[4/3] rounded-xl border border-white/10 bg-surface shadow-2xl overflow-hidden"
              style={{
                left: `${i * 20}px`,
                top: `${i * 40}px`,
                zIndex: 3 - i,
              }}
            >
              {/* Simulated Browser Interface */}
              <div className="w-full h-8 bg-background/90 backdrop-blur border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              
              {/* Content simulation */}
              <div className="p-8 h-full bg-surface/50 backdrop-blur-sm">
                {i === 0 && (
                   <div className="space-y-4">
                     <div className="h-32 rounded-lg bg-gradient-to-br from-primary/20 to-transparent w-full" />
                     <div className="h-4 rounded w-2/3 bg-white/10" />
                     <div className="h-4 rounded w-1/2 bg-white/10" />
                   </div>
                )}
                {i === 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-40 rounded-lg bg-white/5" />
                      <div className="h-40 rounded-lg bg-white/5" />
                    </div>
                )}
                 {i === 2 && (
                    <div className="flex flex-col items-center justify-center h-full pb-12">
                      <div className="w-16 h-16 rounded-full bg-accent/20 mb-4" />
                      <div className="h-4 rounded w-32 bg-white/10 mb-2" />
                      <div className="h-3 rounded w-24 bg-white/5" />
                    </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// 2. Intro / Stats Section
const AboutStats = () => {
  return (
    <section className="py-24 bg-surface border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
              A one-person studio, <br/><span className="text-transparent bg-clip-text bg-noble-gradient">on purpose.</span>
            </h2>
            <div className="space-y-6 text-lg text-muted leading-relaxed">
              <p>
                I am Noble Sherman, a designer and developer who cares more about how your site feels than how many slides are in a pitch deck.
              </p>
              <p>
                I design and build in the same brain, so nothing gets lost between mockup and dev. You talk to the person who is actually building your site. No account managers, no mystery handoffs.
              </p>
            </div>
            <Button to="/about" variant="outline">More About Noble</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 group-hover:text-primary transition-colors">24</div>
                <p className="text-sm font-mono text-muted uppercase tracking-wider">Sites Shipped</p>
                <p className="text-xs text-muted mt-2">Real launches, not mockups.</p>
             </div>
             <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 group-hover:text-accent transition-colors">3s</div>
                <p className="text-sm font-mono text-muted uppercase tracking-wider">Avg TTI</p>
                <p className="text-xs text-muted mt-2">Time to interactive.</p>
             </div>
             <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 group-hover:text-secondary transition-colors">18</div>
                <p className="text-sm font-mono text-muted uppercase tracking-wider">Avg Days</p>
                <p className="text-xs text-muted mt-2">From kickoff to go-live.</p>
             </div>
             <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors group">
                <div className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 group-hover:text-green-400 transition-colors">92%</div>
                <p className="text-sm font-mono text-muted uppercase tracking-wider">Lighthouse</p>
                <p className="text-xs text-muted mt-2">Typical performance score.</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 3. Services Grid
const Services = () => {
  return (
    <section className="py-32 max-w-7xl mx-auto px-4 md:px-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16">
         <div>
           <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">What I Do</h2>
           <p className="text-muted max-w-md">Digital systems tailored for clarity and speed.</p>
         </div>
         <Button to="/services" variant="outline" className="mt-6 md:mt-0">Full Services</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative p-8 md:p-12 rounded-2xl bg-surface border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-white">
               <Layers size={120} strokeWidth={0.5} />
            </div>
            
            <h3 className="text-2xl font-heading font-bold text-white mb-4 relative z-10">{service.title}</h3>
            <p className="text-muted mb-8 relative z-10 min-h-[3rem]">{service.description}</p>
            
            <ul className="space-y-2 relative z-10">
              {service.features.map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-accent" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// 4. Project Strip
const ProjectStrip = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const featuredProjects = PROJECTS_DATA.slice(0, 4);

  return (
    <section ref={sectionRef} className="py-32 border-t border-white/5 overflow-hidden">
      <div className="px-4 md:px-8 mb-12 flex justify-between items-end max-w-7xl mx-auto">
        <div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">Selected Work</h2>
          <p className="text-muted">Less noise, more signal.</p>
        </div>
        <div className="hidden md:flex gap-2">
          <span className="text-sm font-mono text-muted">SCROLL</span>
          <ArrowRight className="text-muted" />
        </div>
      </div>
      
      <div className="relative overflow-x-auto scrollbar-hide">
        <motion.div 
          className="flex pb-12 pl-4 pr-12 md:pl-[calc(50vw-600px)] gap-8 snap-x min-w-max"
        >
          {featuredProjects.map((project) => (
            <motion.div 
              key={project.id}
              className="flex-none w-[85vw] md:w-[600px] snap-center group relative cursor-pointer"
            >
              <Link to={`/projects/${project.id}`}>
                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-surface mb-6 relative">
                 <img 
                   src={project.heroImage} 
                   alt={project.title}
                   className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                 />
                   <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                   <div className="absolute bottom-6 left-6">
                     <span className="text-xs font-mono text-accent mb-2 block">{project.type}</span>
                     <h3 className="text-2xl font-bold text-white">{project.client}</h3>
                   </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
      
      <div className="text-center pt-8">
         <Button to="/work">Explore All Projects</Button>
      </div>
    </section>
  );
};

// 5. Process Section
const Process = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = [
    { 
      title: "Strategy", 
      desc: "We talk through goals, audience, and site map on a quick call. No fluff, just a clear plan.", 
      icon: <TrendingUp />,
      details: ["Goals Definition", "Audience Persona", "Technical Scope"]
    },
    { 
      title: "Design", 
      desc: "I sketch flows, set the motion rules, and lock in key screens. You see exactly how it feels.", 
      icon: <Layers />,
      details: ["Wireframing", "Visual System", "Motion Prototypes"]
    },
    { 
      title: "Build", 
      desc: "I ship the Next.js build with performance and accessibility baked in. Fast by default.", 
      icon: <Code />,
      details: ["Next.js Development", "CMS Setup", "Performance Tuning"]
    },
    { 
      title: "Launch", 
      desc: "You get QA, redirects, analytics, and clear docs for updates. I don't disappear after live.", 
      icon: <Zap />,
      details: ["Deployment", "SEO Check", "Handover Documentation"]
    }
  ];

  return (
    <section className="py-32 max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div>
            <h2 className="text-4xl font-heading font-bold text-white mb-4">Fast, calm, and structured.</h2>
            <p className="text-muted text-lg">No mystery sprints. You always know what is being worked on.</p>
          </div>
          <div className="space-y-8">
             {steps.map((step, i) => (
               <div 
                 key={i} 
                 className={`cursor-pointer transition-all duration-300 p-6 rounded-xl border ${
                   activeStep === i 
                   ? 'bg-white/5 border-primary/30' 
                   : 'border-transparent hover:bg-white/5'
                 }`}
                 onClick={() => setActiveStep(i)}
                 onMouseEnter={() => setActiveStep(i)}
               >
                 <div className="flex items-center gap-4 mb-2">
                   <span className="font-mono text-accent text-sm">0{i + 1}</span>
                   <h3 className="text-xl font-bold text-white">{step.title}</h3>
                 </div>
                 <p className="text-muted pl-8">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
        
        <div className="relative hidden md:flex items-center justify-center bg-surface rounded-2xl border border-white/5 p-12 h-[600px] sticky top-24">
           <AnimatePresence mode="wait">
             <motion.div 
               key={activeStep}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="text-center w-full"
             >
                <div className="inline-flex p-8 rounded-full bg-background border border-white/10 mb-8 text-primary shadow-2xl">
                  {React.cloneElement(steps[activeStep].icon as ReactElement<any>, { size: 64 })}
                </div>
                <h4 className="text-4xl font-bold text-white mb-6">{steps[activeStep].title} Phase</h4>
                <div className="flex flex-col items-center gap-3">
                  {steps[activeStep].details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-muted">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export const Home: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      <Hero />
      <AboutStats />
      <Services />
      <ProjectStrip />
      <Process />
    </div>
  );
};
