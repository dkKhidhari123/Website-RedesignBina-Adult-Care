import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminCall, ApiError } from './api';

type Status = 'loading' | 'signed-out' | 'ready' | 'not-configured' | 'error';

interface AdminState {
  status: Status;
  username: string;
  error?: string;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AdminState | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string>();

  // On load, ask the server whether the session cookie is still valid.
  useEffect(() => {
    adminCall<{ username: string }>('me')
      .then((me) => {
        setUsername(me.username);
        setStatus('ready');
      })
      .catch((e: ApiError) => {
        if (e.status === 401) setStatus('signed-out');
        else if (e.status === 503) setStatus('not-configured');
        else {
          setError(e.message);
          setStatus('error');
        }
      });
  }, []);

  const signIn = useCallback(async (u: string, p: string) => {
    const r = await adminCall<{ username: string }>('login', { username: u, password: p });
    setUsername(r.username);
    setStatus('ready');
  }, []);

  const signOut = useCallback(async () => {
    await adminCall('logout').catch(() => {});
    setUsername('');
    setStatus('signed-out');
  }, []);

  return <Ctx.Provider value={{ status, username, error, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAdmin must be used inside AdminSessionProvider');
  return v;
}
