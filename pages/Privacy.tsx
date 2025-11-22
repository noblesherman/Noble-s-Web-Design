import React from "react";
import { Link } from "react-router-dom";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-surface/70 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
    <h2 className="text-2xl font-heading font-bold text-white">{title}</h2>
    <div className="text-muted space-y-3">{children}</div>
  </section>
);

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="bg-surface/80 border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Privacy</p>
              <h1 className="text-4xl font-heading font-bold mt-2">Privacy Policy for Noble Web Designs</h1>
              <p className="text-muted mt-2">Effective Date: Friday, November 27th, 2025</p>
            </div>
            <Link to="/" className="text-primary hover:text-white text-sm">← Back to home</Link>
          </div>
          <p className="text-muted mt-6 leading-relaxed">
            This Privacy Policy describes how Noble Web Designs (“we”, “us”, “our”) collects, uses, discloses, and protects personal information when individuals access noblesweb.design (the “Website”), use our services, or interact with our client portals, forms, or communication systems.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-muted uppercase tracking-[0.12em] mb-2">Contact</p>
            <p className="text-white font-semibold">support@noblesweb.design</p>
            <p className="text-muted text-sm">Owner: Noble Sherman</p>
          </div>
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-muted uppercase tracking-[0.12em] mb-2">Scope</p>
            <p className="text-white">Website, client portal, forms, communications.</p>
          </div>
          <div className="bg-surface/70 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-muted uppercase tracking-[0.12em] mb-2">Location</p>
            <p className="text-white">United States (data may be transferred to the U.S.)</p>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="1. Information We Collect">
            <div>
              <h3 className="font-semibold text-white">1.1 Information You Provide Directly</h3>
              <ul className="list-disc list-inside leading-relaxed">
                <li>Name, email, phone, business details</li>
                <li>Project information, billing address</li>
                <li>Onboarding form inputs and uploaded materials</li>
                <li>Login credentials and temporary PINs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">1.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside leading-relaxed">
                <li>IP, device, OS, browser</li>
                <li>Referrers, pages visited, session duration</li>
                <li>Cookies, tracking identifiers, error logs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">1.3 Information From Third-Party Services</h3>
              <p className="leading-relaxed">Identity data from third-party login (e.g., GitHub for admin access).</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">1.4 Client Project Information</h3>
              <ul className="list-disc list-inside leading-relaxed">
                <li>Website content/assets, branding, domain details</li>
                <li>Hosting credentials you share, publishing content</li>
                <li>Project communication records</li>
              </ul>
            </div>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc list-inside leading-relaxed">
              <li>Provide and manage design/development services</li>
              <li>Authenticate logins and secure portals</li>
              <li>Communicate (invoices, updates, maintenance notices)</li>
              <li>Monitor performance, improve UX, fix bugs</li>
              <li>Protect against fraud and comply with law</li>
            </ul>
          </Section>

          <Section title="3. Cookies and Tracking">
            <p className="leading-relaxed">
              Cookies support sessions, authentication, analytics, and UX. Disabling cookies may limit functionality.
            </p>
          </Section>

          <Section title="4. How We Share Your Information">
            <p className="leading-relaxed">We do not sell personal data. We share only:</p>
            <div>
              <h3 className="font-semibold text-white">4.1 Service Providers</h3>
              <ul className="list-disc list-inside leading-relaxed">
                <li>Hosting, cloud storage, email delivery, analytics</li>
                <li>Payment processing, domain/DNS services</li>
              </ul>
            </div>
            <p className="leading-relaxed">Only necessary data is shared.</p>
            <div>
              <h3 className="font-semibold text-white">4.2 Legal Requirements</h3>
              <p className="leading-relaxed">Disclosures required by law, subpoena, or government request.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white">4.3 Business Changes</h3>
              <p className="leading-relaxed">Data may transfer in mergers or asset transfers per applicable law.</p>
            </div>
          </Section>

          <Section title="5. Data Security">
            <ul className="list-disc list-inside leading-relaxed">
              <li>HTTPS encryption</li>
              <li>Secure password hashing</li>
              <li>Limited access controls</li>
              <li>Regular security updates</li>
              <li>Encrypted storage for project files</li>
            </ul>
            <p className="text-muted leading-relaxed">
              No system is fully immune to risk. Keep your credentials secure.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p className="leading-relaxed">We retain data for active projects, records, legal compliance, security, and operations. You may request deletion unless restricted by law.</p>
          </Section>

          <Section title="7. Your Rights">
            <p className="leading-relaxed">You may request access, updates, deletion, copies, or limits on processing where applicable.</p>
            <p className="leading-relaxed"><strong>Email:</strong> support@noblesweb.design</p>
          </Section>

          <Section title="8. Children’s Privacy">
            <p className="leading-relaxed">Services are not directed to children under 13. Contact us to remove unintended data.</p>
          </Section>

          <Section title="9. Third-Party Links">
            <p className="leading-relaxed">External sites or tools have their own practices; we are not responsible for their content or policies.</p>
          </Section>

          <Section title="10. International Users">
            <p className="leading-relaxed">By using the site, you consent to transfer and storage of data in the U.S.</p>
          </Section>

          <Section title="11. Changes to This Privacy Policy">
            <p className="leading-relaxed">Updates take effect upon posting on noblesweb.design. Continued use signifies acceptance.</p>
          </Section>

          <Section title="12. Contact Information">
            <p className="leading-relaxed">Noble Web Designs</p>
            <p className="leading-relaxed">
              Website: <a href="https://noblesweb.design" className="text-primary hover:text-white">https://noblesweb.design</a>
            </p>
            <p className="leading-relaxed">
              Email: <a href="mailto:support@noblesweb.design" className="text-primary hover:text-white">support@noblesweb.design</a>
            </p>
            <p className="leading-relaxed">Owner: Noble Sherman</p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
