import { Link } from 'react-router-dom';
import { bookVisitHref, fullAddress, nav, site } from '../data/site';

function Heading({ children }: { children: string }) {
  return <h2 className="mb-3.5 font-sans text-[0.875rem] font-semibold text-white">{children}</h2>;
}

export function Footer() {
  const link = 'text-mist transition-colors hover:text-champagne';
  return (
    <footer className="bg-navy px-0 pb-7 pt-[4.5rem] text-[0.875rem] text-mist">
      <div className="container">
        <div className="grid gap-10 border-b border-champagne/25 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <strong className="mb-2.5 block text-[1.0625rem] text-white">Bina Adult Care</strong>
            <p>Compassionate Care for Senior Adults. Residential Care and Home Care in El Sobrante, California.</p>
          </div>
          <nav aria-label="Quick links">
            <Heading>Quick Links</Heading>
            <ul className="flex flex-col gap-2.5">
              {[...nav, { to: '/about', label: 'About Us' }].map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className={link}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Our services">
            <Heading>Our Services</Heading>
            <ul className="flex flex-col gap-2.5">
              <li><Link to="/services#residential" className={link}>Residential Care</Link></li>
              <li><Link to="/services#home-care" className={link}>Home Care Services</Link></li>
              <li><Link to={bookVisitHref} className={link}>Book a Visit</Link></li>
            </ul>
          </nav>
          <div>
            <Heading>Contact Us</Heading>
            <ul className="flex flex-col gap-2.5">
              <li>{fullAddress}, USA</li>
              <li><a href={site.phone.href} className={link}>{site.phone.display}</a></li>
              <li><a href={`mailto:${site.email}`} className={`break-all ${link}`}>{site.email}</a></li>
              {site.social.instagram && (
                <li><a href={site.social.instagram.url} target="_blank" rel="noopener noreferrer" className={link}>Instagram {site.social.instagram.handle}</a></li>
              )}
              {site.social.facebook && (
                <li><a href={site.social.facebook.url} target="_blank" rel="noopener noreferrer" className={link}>Facebook</a></li>
              )}
              {site.social.linkedin && (
                <li><a href={site.social.linkedin.url} target="_blank" rel="noopener noreferrer" className={link}>LinkedIn</a></li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 text-[0.8125rem] text-mist sm:flex-row sm:justify-between">
          <p>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Bina Adult Care. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li><Link to="/privacy-policy" className="hover:text-champagne">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-champagne">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
