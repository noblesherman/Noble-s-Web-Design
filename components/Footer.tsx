import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Facebook } from 'lucide-react';
import { Button } from './ui/Button';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-white/5 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 border-b border-white/5 pb-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Ready when <span className="text-transparent bg-clip-text bg-noble-gradient">you are.</span>
            </h2>
            <p className="text-xl text-muted mb-8 max-w-lg">
              One short call to see if we are a good fit. If we are, you get a clear scope, pricing, and a timeline.
            </p>
            <Button to="/contact" variant="primary" className="text-lg px-8 py-4">
              Book Strategy Call
            </Button>
          </div>
          
          <div className="flex flex-col gap-4 items-start md:items-end">
             <a href="mailto:noble@noblesweb.design" className="text-xl md:text-2xl font-mono text-white hover:text-primary transition-colors">
               noble@noblesweb.design
             </a>
             <div className="text-muted">
               © {new Date().getFullYear()} Noble’s Web Designs
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Sitemap</h3>
            <ul className="space-y-2">
              <li><Link to="/work" className="text-muted hover:text-white transition-colors">Work</Link></li>
              <li><Link to="/services" className="text-muted hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/about" className="text-muted hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-muted hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Client</h3>
            <ul className="space-y-2">
              <li><Link to="/client" className="text-muted hover:text-white transition-colors">Client Portal</Link></li>
              <li><Link to="/admin" className="text-muted hover:text-white transition-colors">Admin Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Socials</h3>
            <div className="flex gap-4">
              <a href="https://github.com/noblesherman" className="text-muted hover:text-white transition-colors" target="_blank" rel="noreferrer">
                <Github size={20} />
              </a>
              <a href="https://www.instagram.com/nobleswebdesign/" className="text-muted hover:text-white transition-colors" target="_blank" rel="noreferrer">
                <Instagram size={20} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61565067176039" className="text-muted hover:text-white transition-colors" target="_blank" rel="noreferrer">
                <Facebook size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-heading font-semibold text-white mb-4">Noble Web Designs</h3>
            <p className="text-sm text-muted">
              A one-person studio focused on motion-forward sites.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-muted">
          <p>Websites built like you actually use them.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
