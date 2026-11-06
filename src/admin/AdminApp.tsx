import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminSessionProvider, useAdmin } from './session';
import { ContentProvider, useContent } from './content';
import { AdminLayout } from './AdminLayout';
import { SignIn } from './pages/AuthPages';
import { Dashboard } from './pages/Dashboard';
import { Inbox } from './pages/Inbox';
import {
  FaqsEditor,
  GalleryEditor,
  HeroEditor,
  HomeEditor,
  LocationEditor,
  ServicesEditor,
  SettingsEditor,
  TeamEditor,
  TestimonialsEditor,
  VacanciesEditor,
  WhyEditor,
} from './pages/Editors';

function Centered({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-cream px-4 text-center">{children}</div>;
}

/** Content editors need the saved content loaded first. */
function WithContent({ children }: { children: ReactNode }) {
  const { loading, error } = useContent();
  if (loading) return <p className="flex items-center gap-2 text-slate"><Loader2 className="h-4 w-4 animate-spin" /> Loading content…</p>;
  if (error) return <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-900">{error}</p>;
  return <>{children}</>;
}

function Gate() {
  const { status, error, signOut } = useAdmin();

  if (status === 'loading')
    return (
      <Centered>
        <p className="flex items-center gap-2 text-slate"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>
      </Centered>
    );

  if (status === 'signed-out') return <SignIn />;

  if (status === 'not-configured')
    return (
      <Centered>
        <div className="card max-w-lg p-8 text-left">
          <h1 className="t-title">Admin dashboard not configured</h1>
          <p className="mt-3 text-slate">
            Set <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> in the Vercel project settings, then
            redeploy. See the README’s “Admin dashboard” section.
          </p>
        </div>
      </Centered>
    );

  if (status === 'error')
    return (
      <Centered>
        <div className="card max-w-md p-8">
          <h1 className="t-title">Something went wrong</h1>
          <p className="mt-3 text-slate">{error}</p>
          <button type="button" className="btn-primary mt-6" onClick={() => window.location.reload()}>Try again</button>
          <button type="button" className="btn-secondary mt-3" onClick={signOut}>Sign out</button>
        </div>
      </Centered>
    );

  return (
    <ContentProvider>
      <AdminLayout>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="messages" element={<Inbox table="contact_submissions" />} />
          <Route path="visits" element={<Inbox table="visit_requests" />} />
          <Route path="applications" element={<Inbox table="job_applications" />} />
          <Route path="content/home" element={<WithContent><HomeEditor /></WithContent>} />
          <Route path="content/hero" element={<WithContent><HeroEditor /></WithContent>} />
          <Route path="content/why" element={<WithContent><WhyEditor /></WithContent>} />
          <Route path="content/location" element={<WithContent><LocationEditor /></WithContent>} />
          <Route path="content/settings" element={<WithContent><SettingsEditor /></WithContent>} />
          <Route path="content/team" element={<WithContent><TeamEditor /></WithContent>} />
          <Route path="content/testimonials" element={<WithContent><TestimonialsEditor /></WithContent>} />
          <Route path="content/vacancies" element={<WithContent><VacanciesEditor /></WithContent>} />
          <Route path="content/gallery" element={<WithContent><GalleryEditor /></WithContent>} />
          <Route path="content/services" element={<WithContent><ServicesEditor /></WithContent>} />
          <Route path="content/faqs" element={<WithContent><FaqsEditor /></WithContent>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </ContentProvider>
  );
}

export default function AdminApp() {
  useEffect(() => {
    document.title = 'Admin | Bina Adult Care';
    const robots = document.head.querySelector('meta[name="robots"]');
    robots?.setAttribute('content', 'noindex, nofollow');
  }, []);

  return (
    <AdminSessionProvider>
      <Gate />
    </AdminSessionProvider>
  );
}
