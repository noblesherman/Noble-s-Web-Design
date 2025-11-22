
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../constants';
import { Calendar, Clock, User } from 'lucide-react';

export const Blog: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-8">Writing</h1>
          <p className="text-xl text-muted leading-relaxed">
            Thoughts on web performance, design systems, and the business of running a one-person studio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col h-full"
            >
              <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-xl bg-surface border border-white/5 aspect-video mb-6 relative group-hover:border-white/20 transition-colors">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-surface to-background flex items-center justify-center">
                    <span className="text-4xl text-white/10 font-heading">NWD</span>
                  </div>
                )}
              </Link>

              <div className="flex-1">
                <div className="flex gap-4 text-xs font-mono text-accent mb-3">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  <span className="flex items-center gap-1 text-muted"><Clock size={12} /> {post.readTime}</span>
                </div>
                
                <Link to={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </Link>
                
                <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                {post.tags?.map(tag => (
                   <span key={tag} className="text-[10px] uppercase tracking-wider text-white/40 border border-white/10 px-2 py-1 rounded">
                     {tag}
                   </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
