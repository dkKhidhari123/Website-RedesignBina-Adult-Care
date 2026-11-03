import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { fullAddress, site } from '../data/site';

export const LEGAL_UPDATED = 'October 30, 2026';

export default function Privacy() {
  return (
    <>
      <PageHero title="Privacy Policy">
        <p>Last updated {LEGAL_UPDATED}</p>
      </PageHero>
      <section className="section">
        <div className="container">
          <article className="prose-legal mx-auto max-w-prose text-[1.0625rem]">
            <p>
              Bina Adult Care (“we”, “us”) respects your privacy. This policy explains what information we collect
              through <strong>binaadultcare.com</strong>, how we use it and the choices you have.
            </p>

            <h2>Information you give us</h2>
            <p>When you use a form on this website we collect the information you enter:</p>
            <ul>
              <li><strong>Contact form:</strong> name, email, optional phone number, topic and message.</li>
              <li><strong>Visit requests:</strong> name, email, phone number, type of care, preferred date and time, and any message.</li>
              <li><strong>Job applications:</strong> name, email, phone number, position, experience, message and an optional resume file.</li>
            </ul>
            <p>
              Please do not include detailed medical or health information in website forms. We are happy to discuss
              care needs by phone or in person.
            </p>

            <h2>Information collected automatically</h2>
            <p>
              When you submit a form we record the page it was sent from and your browser’s user-agent string, to help
              us prevent spam and fix problems. This website does not use advertising or analytics cookies.
            </p>

            <h2>How we use your information</h2>
            <ul>
              <li>To respond to your questions and arrange visits or consultations.</li>
              <li>To review job applications and contact applicants.</li>
              <li>To keep this website secure and prevent misuse.</li>
            </ul>
            <p>We do not sell your personal information, and we do not use it for advertising.</p>

            <h2>How we store and protect it</h2>
            <p>
              Form submissions are sent over an encrypted connection and stored in a private database. Resumes are
              stored in private file storage. Access is limited to authorized Bina Adult Care staff. We may also receive
              an email notification containing the details you submitted.
            </p>

            <h2>Service providers</h2>
            <p>We use a small number of trusted providers to run this website:</p>
            <ul>
              <li>Vercel — website hosting.</li>
              <li>Supabase — secure database and file storage for form submissions.</li>
              <li>Google — embedded map on our Contact page and website fonts.</li>
              <li>An email delivery provider, if enabled, to notify our team of new submissions.</li>
            </ul>
            <p>These providers process information only to provide their services to us.</p>

            <h2>How long we keep it</h2>
            <p>
              We keep inquiries and applications only as long as needed for the purpose they were sent, and then delete
              them, unless we are required to keep them longer by law.
            </p>

            <h2>Your choices</h2>
            <p>
              You can ask us to access, correct or delete the personal information you have submitted. California
              residents may have additional rights under California privacy law. To make a request, contact us using
              the details below.
            </p>

            <h2>Children</h2>
            <p>This website is not directed at children under 13, and we do not knowingly collect their information.</p>

            <h2>Changes to this policy</h2>
            <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>

            <h2>Contact us</h2>
            <p>
              Bina Adult Care, {fullAddress}
              <br />
              Phone: <a href={site.phone.href}>{site.phone.display}</a>
              <br />
              Email: <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <p>
              See also our <Link to="/terms">Terms &amp; Conditions</Link>.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
