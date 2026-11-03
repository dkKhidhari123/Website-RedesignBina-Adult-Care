import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { LEGAL_UPDATED } from './Privacy';
import { site } from '../data/site';

export default function Terms() {
  return (
    <>
      <PageHero title="Terms & Conditions">
        <p>Last updated {LEGAL_UPDATED}</p>
      </PageHero>
      <section className="section">
        <div className="container">
          <article className="prose-legal mx-auto max-w-prose text-[1.0625rem]">
            <p>
              These terms apply to your use of <strong>binaadultcare.com</strong>, operated by Bina Adult Care. By using
              this website you agree to them.
            </p>

            <h2>Information on this website</h2>
            <p>
              The content on this website is general information about our services. It is not medical, legal or
              financial advice. Please speak with a qualified professional about your loved one’s individual needs.
            </p>
            <p>
              We work to keep information accurate and up to date, but services, availability and other details may
              change. Please contact us to confirm anything that is important to your decision.
            </p>

            <h2>Visit requests and inquiries</h2>
            <p>
              Submitting a visit request, contact form or job application does not create an appointment, a care
              agreement or an offer of employment. A visit is confirmed only when a member of our team contacts you to
              confirm it. Any care services are provided under a separate written agreement.
            </p>

            <h2>Emergencies</h2>
            <p>
              Do not use this website for emergencies. If someone needs urgent medical help, call <strong>911</strong>.
            </p>

            <h2>Acceptable use</h2>
            <p>
              Please do not misuse this website — for example by submitting false information, sending spam or
              attempting to interfere with its operation or security.
            </p>

            <h2>Intellectual property</h2>
            <p>
              The text, photographs, logo and design of this website belong to Bina Adult Care or are used with
              permission, and may not be copied without our written consent.
            </p>

            <h2>Links to other websites</h2>
            <p>This website may link to other websites, such as maps or social media. We are not responsible for their content.</p>

            <h2>Limitation of liability</h2>
            <p>
              To the extent permitted by law, Bina Adult Care is not liable for any loss arising from use of this
              website or reliance on its content.
            </p>

            <h2>Governing law</h2>
            <p>These terms are governed by the laws of the State of California.</p>

            <h2>Privacy</h2>
            <p>
              Our <Link to="/privacy-policy">Privacy Policy</Link> explains how we handle information you send us.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms? Call <a href={site.phone.href}>{site.phone.display}</a> or email{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
