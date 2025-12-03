import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { Home } from './pages/Home';
import { Work } from './pages/Work';
import { WorkDetail } from './pages/WorkDetail';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Admin2FASetup from './pages/Admin2FASetup';
import { Services } from './pages/Services';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { BlogDetail } from './pages/BlogDetail';
import { Client } from './pages/Client';
import ClientLogin from './pages/client/login';
import ClientRegister from './pages/client/register';
import { ClientContract } from './pages/ClientContract';
import Team from './pages/Team';
import Support from './pages/Support';
import SupportTicket from './pages/SupportTicket';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import PortalBilling from './pages/PortalBilling';
import PortalBillingComplete from './pages/PortalBillingComplete';

// Vercel analytics imports
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />

      {/* Analytics + Insights must go high in the app */}
      <SpeedInsights />
      <Analytics />

      <div className="flex flex-col min-h-screen font-sans bg-background text-text">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:slug" element={<WorkDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/client" element={<Client />} />
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/client/register" element={<ClientRegister />} />
            <Route path="/client/contracts/:contractId" element={<ClientContract />} />
            <Route path="/team" element={<Team />} />
            <Route path="/support" element={<Support />} />
            <Route path="/support/:ticketId" element={<SupportTicket />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/portal/billing" element={<PortalBilling />} />
            <Route path="/portal/billing/complete" element={<PortalBillingComplete />} />
            <Route path="/client/billing" element={<PortalBilling />} />
            <Route path="/client/billing/complete" element={<PortalBillingComplete />} />

            {/* REAL ADMIN ROUTE FOR GITHUB OAUTH */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/2fa/setup" element={<Admin2FASetup />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
