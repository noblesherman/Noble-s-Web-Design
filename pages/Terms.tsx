import React from "react";
import { Link } from "react-router-dom";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-surface/70 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
    <h2 className="text-2xl font-heading font-bold text-white">{title}</h2>
    <div className="text-muted space-y-3 leading-relaxed">{children}</div>
  </section>
);

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="bg-surface/80 border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Legal</p>
              <h1 className="text-4xl font-heading font-bold mt-2">Terms of Service for Noble Web Designs</h1>
              <p className="text-muted mt-2">Effective Date: Friday, November 27th, 2025</p>
            </div>
            <Link to="/" className="text-primary hover:text-white text-sm">← Back to home</Link>
          </div>
          <p className="text-muted mt-6 leading-relaxed">
            These Terms govern access to noblesweb.design, our client portal, and all services provided by Noble Web Designs (“we”, “us”, “our”). By using our site or services, you agree to these Terms.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-muted uppercase tracking-[0.12em] mb-2">Scope</p>
            <p className="text-white">Website, client portal, services, communications.</p>
          </div>
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-muted uppercase tracking-[0.12em] mb-2">Contact</p>
            <p className="text-white">support@noblesweb.design</p>
          </div>
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-muted uppercase tracking-[0.12em] mb-2">Governing Law</p>
            <p className="text-white">Commonwealth of Pennsylvania & applicable U.S. law.</p>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="1. Services Provided">
            <p>Website design, development, hosting setup, consulting, technical support, and related digital services. Services may change or be discontinued at any time.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be 18+ and able to enter a contract. You warrant all information is accurate and that you have authority for any organization you represent.</p>
          </Section>

          <Section title="3. Client Accounts and Portal Access">
            <div>
              <h3 className="font-semibold text-white">3.1 Account Creation</h3>
              <ul className="list-disc list-inside">
                <li>Valid email</li>
                <li>Temporary PIN issued by us</li>
                <li>Password you create</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">3.2 Account Responsibility</h3>
              <ul className="list-disc list-inside">
                <li>Keep credentials confidential</li>
                <li>Responsible for all activity under your account</li>
                <li>Notify us of suspected unauthorized access</li>
              </ul>
              <p>We are not liable for damages from compromised credentials.</p>
            </div>
          </Section>

          <Section title="4. Project Process and Communication">
            <p>Provide timely responses, accurate and complete information, and prompt approvals/revisions. Delays may extend timelines.</p>
          </Section>

          <Section title="5. Payments, Invoices, and Refunds">
            <div>
              <h3 className="font-semibold text-white">5.1 Payments</h3>
              <p>Quotes and terms are provided before work begins; payment may be full or milestone-based.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">5.2 Late Payments</h3>
              <ul className="list-disc list-inside">
                <li>Delayed work or suspension</li>
                <li>Late fees</li>
                <li>Project termination</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">5.3 Refunds</h3>
              <p>Payments are non-refundable except where no work has begun.</p>
            </div>
          </Section>

          <Section title="6. Ownership and Intellectual Property">
            <div>
              <h3 className="font-semibold text-white">6.1 Client Ownership</h3>
              <p>Upon final payment, you own the final website design and deliverables explicitly stated in the contract.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">6.2 Our Ownership</h3>
              <p>We retain source files, internal templates, frameworks, systems, and tools not expressly transferred.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">6.3 Licensing</h3>
              <p>You receive a license to use the final website for your business. No resale or claiming ownership of proprietary systems without written permission.</p>
            </div>
          </Section>

          <Section title="7. Content Provided by You">
            <p>All content you provide must be lawful and not infringe rights. You indemnify us against claims arising from your content.</p>
          </Section>

          <Section title="8. Revisions and Project Scope">
            <p>Revisions are limited to the package scope. Additional or out-of-scope requests may be billed separately.</p>
          </Section>

          <Section title="9. Hosting, Domains, and Third-Party Services">
            <p>Third-party services follow their own terms. We are not responsible for outages or issues caused by external providers.</p>
          </Section>

          <Section title="10. Website Launch and Post-Launch Changes">
            <p>Post-launch changes are billed separately unless covered by an ongoing service package.</p>
          </Section>

          <Section title="11. Disclaimer of Warranties">
            <p>Services are “as-is” and “as-available.” No guarantee of error-free sites, uninterrupted third-party services, or specific results.</p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>
              Not liable for lost revenue, data, security breaches due to user error, downtime from third-parties, or indirect/ consequential damages. Liability is capped at the amount paid for the specific project.
            </p>
          </Section>

          <Section title="13. Termination">
            <p>We may suspend or terminate services for violations or abuse. You may terminate anytime; completed work and payments remain non-refundable.</p>
          </Section>

          <Section title="14. Changes to These Terms">
            <p>Terms may be updated anytime; changes are effective when posted. Continued use signifies acceptance.</p>
          </Section>

          <Section title="15. Governing Law">
            <p>Commonwealth of Pennsylvania and applicable U.S. federal law.</p>
          </Section>

          <Section title="16. Contact Information">
            <p>Noble Web Designs</p>
            <p>
              Website: <a href="https://noblesweb.design" className="text-primary hover:text-white">https://noblesweb.design</a>
            </p>
            <p>
              Email: <a href="mailto:support@noblesweb.design" className="text-primary hover:text-white">support@noblesweb.design</a>
            </p>
            <p>Owner: Noble Sherman</p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
