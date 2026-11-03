import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAdmin } from '../session';

export function SignIn() {
  const { signIn } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(username.trim(), password);
    } catch (err) {
      setError((err as Error).message);
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-soft ring-1 ring-line">
            <img src="/logo.webp" alt="" width={36} height={37} className="h-9 w-9 object-contain" />
          </span>
          <span className="leading-tight">
            <strong className="block text-lg text-navy">Bina Adult Care</strong>
            <span className="text-sm text-slate">Admin dashboard</span>
          </span>
        </div>
        <div className="card p-7 sm:p-9">
          <h1 className="t-title mb-6 flex items-center gap-2.5 text-[1.5rem]">
            <Lock className="h-5 w-5 text-brand-400" aria-hidden /> Sign in
          </h1>
          {error && (
            <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
          )}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="admin-id" className="field-label">Admin ID</label>
              <input id="admin-id" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} onChange={(e) => setUsername(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="admin-password" className="field-label">Password</label>
              <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Sign in
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate">
            Forgot the password? The website owner can change it in the Vercel project settings.
          </p>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-link">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
