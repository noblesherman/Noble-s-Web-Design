import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

export const Contact: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    projectType: '',
    priority: '',
    scope: '',
    timeline: '',
    budget: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) setIsSuccess(true);
        setIsSubmitting(false);
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-8"
        >
          <CheckCircle2 size={48} className="text-green-500" />
        </motion.div>
        <h2 className="text-4xl font-heading font-bold text-white mb-4">Message Received</h2>
        <p className="text-xl text-muted mb-8">Thanks for reaching out, {formData.name}. I'll review your details and get back to you within 48 hours.</p>
        <Button to="/">Back Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="mb-12">
        <h1 className="text-5xl font-heading font-bold text-white mb-4">Start a Project</h1>
        <div className="flex gap-2 items-center">
          {[1, 2, 3].map(num => (
            <div key={num} className={`h-1 flex-1 rounded-full transition-colors ${step >= num ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="min-h-[400px]">
        <AnimatePresence mode="wait" custom={step}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm text-muted mb-2">Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg p-4 text-white focus:border-primary outline-none"
                    placeholder="Noble Sherman"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-2">Business Name</label>
                  <input 
                    type="text" 
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg p-4 text-white focus:border-primary outline-none"
                    placeholder="Your company or organization"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg p-4 text-white focus:border-primary outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-8">
                 <Button onClick={handleNext} disabled={!formData.name || !formData.email}>
                   Next Step <ChevronRight className="ml-2" size={16} />
                 </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl text-white mb-4">What best describes your project?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'I need a brand new website',
                    'My current site needs a makeover',
                    'Fix/update existing site',
                    'Ongoing site management & updates',
                    'I have no idea but I need help!'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('projectType', opt)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.projectType === opt 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/10 bg-surface text-muted hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-white mb-4">What matters most to you right now?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Get more customers',
                    'Look more professional',
                    'Improve speed + SEO',
                    'Easier to manage',
                    'All of the above!'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('priority', opt)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.priority === opt 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/10 bg-surface text-muted hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-8">
                 <Button variant="secondary" onClick={handleBack}>
                   <ChevronLeft className="mr-2" size={16} /> Back
                 </Button>
                 <Button onClick={handleNext} disabled={!formData.projectType || !formData.priority}>
                   Next Step <ChevronRight className="ml-2" size={16} />
                 </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl text-white mb-4">If you already have a plan in mind, select the scope.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    '1-3 pages',
                    '4-8 pages',
                    'Online store / e-commerce',
                    'Booking or scheduling system',
                    'Custom features',
                    'Not sure yet'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('scope', opt)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.scope === opt 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/10 bg-surface text-muted hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-white mb-4">When would you like your website ready?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'ASAP (next 2-4 weeks)',
                    '1-2 months',
                    '3+ months',
                    'Browsing options'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('timeline', opt)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.timeline === opt 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/10 bg-surface text-muted hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-white mb-4">What is your comfort budget?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    '$800 - $1500',
                    '$1500 - $3000',
                    '$3000 - $6000',
                    'More for advanced needs',
                    'Not sure yet!'
                  ].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange('budget', opt)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.budget === opt 
                        ? 'border-primary bg-primary/10 text-white' 
                        : 'border-white/10 bg-surface text-muted hover:border-white/30'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl text-white mb-4">Anything you want me to know?</h3>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full h-32 bg-surface border border-white/10 rounded-lg p-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  placeholder="Links to your current site, dream examples, must-haves, etc."
                />
              </div>

              <div className="flex justify-between pt-8">
                 <Button variant="secondary" onClick={handleBack}>
                   <ChevronLeft className="mr-2" size={16} /> Back
                 </Button>
                 <Button type="submit" disabled={!formData.scope || !formData.timeline || !formData.budget || isSubmitting}>
                   {isSubmitting ? 'Sending...' : 'Send Request'}
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
