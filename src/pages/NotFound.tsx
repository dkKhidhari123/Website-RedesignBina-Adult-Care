import { Link } from 'react-router-dom';
import { site } from '../data/site';

export default function NotFound() {
  return (
    <section className="bg-cream">
      <div className="container py-24 text-center sm:py-32">
        <p className="eyebrow-plain">Error 404</p>
        <h1 className="t-page mt-4">We couldn’t find that page</h1>
        <p className="t-lead mx-auto mt-6 max-w-xl">
          It may have moved. Head back to the homepage, or call us at{' '}
          <a href={site.phone.href} className="font-semibold text-brand-700 underline underline-offset-4">
            {site.phone.display}
          </a>
          .
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">Go to Homepage</Link>
          <Link to="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
