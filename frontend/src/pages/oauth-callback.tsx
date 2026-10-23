import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { getSupabaseClient } from '@/lib/supabase';
import { apiBaseUrl } from '@/lib/api-base-url';
import { Loader2, Code2, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

/**
 * Supabase redirects here after the user completes OAuth with a provider.
 * The auth tokens are in the URL fragment (#access_token=...).
 * We:
 *   1. Let Supabase parse the fragment and establish a session
 *   2. Pull the user's email/name/avatar from the session
 *   3. POST to our backend to find-or-create the user in our DB
 *   4. Store our app token in localStorage and redirect to dashboard
 */
export default function OAuthCallbackPage() {
  const { setAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      // Supabase auto-parses the hash fragment on page load
      const { data: { session }, error: sessionError } = await getSupabaseClient().auth.getSession();

      if (cancelled) return;

      if (sessionError || !session) {
        setError(sessionError?.message ?? 'No session found. Please try logging in again.');
        return;
      }

      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const roleFromUrl = searchParams.get('role');
      const storedRole = typeof window !== 'undefined'
        ? window.sessionStorage.getItem('pending-social-role') ?? window.localStorage.getItem('pending-social-role')
        : null;
      const pendingRole = roleFromUrl ?? storedRole ?? 'student';
      const normalizedRole = pendingRole === 'company' || pendingRole === 'university' ? pendingRole : 'student';

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('pending-social-role');
        window.localStorage.removeItem('pending-social-role');
      }

      try {
        // The backend verifies this access token with Supabase before accepting identity claims.
        const res = await fetch(`${apiBaseUrl}/auth/social`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.access_token, role: normalizedRole }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `Server error ${res.status}`);
        }

        const { token, user: appUser } = await res.json();
        if (cancelled) return;

        setAuth({ token, user: appUser });
        setLocation('/dashboard');
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to complete sign-in.');
      }
    }

    handleCallback();
    return () => { cancelled = true; };
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
            <p className="text-base font-medium text-foreground">Sign-in failed</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Link href="/login" className="inline-block mt-2 text-sm font-medium text-primary hover:text-primary/80">
              ← Back to login
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-base font-medium text-foreground">Signing you in…</p>
            <p className="text-sm text-muted-foreground">Setting up your account, just a moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
