import React from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useLogin } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Code2, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SocialLoginButtons } from '@/components/social-login-buttons';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(256, 'Password is too long'),
});

export default function LoginPage() {
  const { setAuth, auth } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  React.useEffect(() => {
    if (auth) setLocation('/dashboard');
  }, [auth, setLocation]);

  // Show error from social OAuth redirect (e.g. ?error=...)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: decodeURIComponent(err),
      });
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const response = await loginMutation.mutateAsync({ data: values });
      setAuth({ token: response.token, user: response.user });
      toast({ title: 'Welcome back!' });
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error?.response?.data?.error ?? 'Please check your credentials.',
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* ── Form panel ── */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-md brand-gradient text-white">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Koda AI</span>
          </Link>

          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Not a member?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              Create an account
            </Link>
          </p>

          <div className="mt-8 space-y-6">
            {/* Social buttons */}
            <SocialLoginButtons mode="login" />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-muted/30 px-2 text-muted-foreground tracking-wider">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Email / password form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base brand-gradient text-white border-0 shadow-md"
                  disabled={loginMutation.isPending || form.formState.isSubmitting}
                >
                  {loginMutation.isPending || form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Demo: <span className="font-mono">student1@example.com</span> / <span className="font-mono">123456</span>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* ── Right artistic panel ── */}
      <div className="relative hidden w-0 flex-1 lg:block bg-foreground overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-10 mix-blend-multiply" />
        <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 rounded-full bg-[#33D6D1] blur-[120px] opacity-20" />
        <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 rounded-full bg-[#7A4DFF] blur-[120px] opacity-20" />
        <div className="flex h-full items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-3xl font-bold mb-6">Where intent meets opportunity.</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              We've replaced the noise of traditional job hunting with a high-signal matching engine. Your skills, verified and matched perfectly to the teams that need them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
