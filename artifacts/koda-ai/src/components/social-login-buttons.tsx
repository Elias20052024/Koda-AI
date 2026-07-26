import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// ── Brand SVG icons (inline, no external library) ─────────────────────────────

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-[#0A66C2]" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────

type Provider = 'google' | 'github' | 'linkedin_oidc';

interface SocialLoginButtonsProps {
  mode?: 'login' | 'register';
}

const PROVIDERS: { id: Provider; label: string; Icon: React.FC }[] = [
  { id: 'google',        label: 'Google',   Icon: GoogleIcon },
  { id: 'github',        label: 'GitHub',   Icon: GitHubIcon },
  { id: 'linkedin_oidc', label: 'LinkedIn', Icon: LinkedInIcon },
];

export function SocialLoginButtons({ mode = 'login' }: SocialLoginButtonsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<Provider | null>(null);

  const handleLogin = async (provider: Provider) => {
    setLoading(provider);
    try {
      const redirectTo = `${window.location.origin}/oauth-callback`;
      const { error } = await getSupabaseClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
      // Browser is now redirecting to the OAuth provider — no need to reset loading
    } catch (err: any) {
      setLoading(null);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: err?.message ?? 'Could not connect to the authentication provider.',
      });
    }
  };

  const verb = mode === 'register' ? 'Sign up' : 'Continue';

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          className="w-full h-11 gap-3 font-medium border border-border hover:bg-muted/60 transition-colors"
          disabled={loading !== null}
          onClick={() => handleLogin(id)}
        >
          {loading === id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icon />
          )}
          {verb} with {label}
        </Button>
      ))}
    </div>
  );
}
