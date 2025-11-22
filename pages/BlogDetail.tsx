
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { BLOG_POSTS } from '../constants';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (!post) {
    return (
      <div className="min-h-screen pt-32 text-center px-4">
        <h1 className="text-2xl text-white mb-4">Article not found</h1>
        <Button to="/blog">Back to Writing</Button>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-background min-h-screen relative">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary z-[100] origin-left"
        style={{ scaleX }}
      />

      <div className="pt-32 pb-24 px-4 md:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12">
          <Link to="/blog" className="inline-flex items-center text-muted hover:text-white mb-8 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Back to Writing
          </Link>
          
          <div className="flex gap-4 text-sm font-mono text-accent mb-6">
            <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-2 text-muted"><Clock size={14} /> {post.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-y border-white/10 py-6">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                 NS
               </div>
               <div>
                 <p className="text-white font-medium text-sm">{post.author}</p>
                 <p className="text-muted text-xs">Founder, Noble Web Designs</p>
               </div>
             </div>
             
             <div className="flex gap-2">
               <button onClick={copyLink} className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Copy Link">
                 <LinkIcon size={18} />
               </button>
               <button className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Share on Twitter">
                 <Twitter size={18} />
               </button>
               <button className="p-2 text-muted hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Share on LinkedIn">
                 <Linkedin size={18} />
               </button>
             </div>
          </div>
        </div>

        {/* Hero Image */}
        {post.image && (
          <div className="max-w-5xl mx-auto mb-16 rounded-xl overflow-hidden aspect-[21/9] border border-white/5">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto prose prose-lg prose-invert prose-headings:font-heading prose-headings:font-bold prose-p:text-muted prose-a:text-primary hover:prose-a:text-secondary prose-img:rounded-xl">
          {/* Dangerously setting HTML since this is mocked content from constants. In real app use MDX or sanitize. */}
          <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
        </div>

        {/* Footer / Next Steps */}
        <div className="max-w-3xl mx-auto mt-24 pt-12 border-t border-white/10">
           <h3 className="text-2xl text-white font-bold mb-6">Enjoyed this article?</h3>
           <p className="text-muted mb-8">
             I write about design, development, and running a studio. If you're looking for someone to bring this level of care to your project, let's talk.
           </p>
           <div className="flex gap-4">
             <Button to="/contact">Start a Project</Button>
             <Button to="/blog" variant="outline">Read More</Button>
           </div>
        </div>
      </div>
    </div>
  );
};
