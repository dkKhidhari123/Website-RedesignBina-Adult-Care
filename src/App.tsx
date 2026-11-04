import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import BookVisit from './pages/BookVisit';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import BusinessCard from './pages/BusinessCard';
import NotFound from './pages/NotFound';

// The admin dashboard is loaded only when someone visits /admin, so it adds nothing to public pages.
const AdminApp = lazy(() => import('./admin/AdminApp'));

/** Routes are rendered by a BrowserRouter (main.tsx) or a StaticRouter (entry-server.tsx). */
export function App() {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={<div className="min-h-screen bg-cream" />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="team" element={<Team />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="careers" element={<Careers />} />
        <Route path="contact" element={<Contact />} />
        <Route path="book-a-visit" element={<BookVisit />} />
        <Route path="privacy-policy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="card" element={<BusinessCard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
