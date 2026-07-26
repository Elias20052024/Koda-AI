import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Code2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

/**
 * Landing page for OAuth redirects.
 * The backend redirects here with ?payload=<JSON> after a successful OAuth flow.
 * On error the backend redirects to /login?error=<message> instead.
 */
export default function OAuthCallbackPage() {
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Handle error case — backend redirected /login?error=... but user ended up here
    const err = params.get('error');
    if (err) {
      setError(decodeURIComponent(err));
      return;
    }

    const raw = params.get('payload');
    if (!raw) {
      setError('No authentication data received.');
      return;
    }

    try {
      const { token, user } = JSON.parse(decodeURIComponent(raw));
      if (!token || !user) throw new Error('Malformed payload');
      setAuth({ token, user });
      setLocation('/dashboard');
    } catch {
      setError('Failed to process login. Please try again.');
    }
  }, [setAuth, setLocation]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="text-center space-y-4 max-w-sm px-4">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md brand-gradient text-white">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Koda AI</span>
        </Link>

        {error ? (
          <div className="space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-base font-medium text-foreground">Login failed</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Link
              href="/login"
              className="inline-block mt-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-base font-medium text-foreground">Signing you in…</p>
            <p className="text-sm text-muted-foreground">Just a moment while we set up your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}
