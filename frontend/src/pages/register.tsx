import React from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRegister } from '@workspace/api-client-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Code2, Loader2, User, Building, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SocialLoginButtons } from '@/components/social-login-buttons';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(256, 'Password is too long'),
  role: z.enum(['student', 'company', 'university']),
});

export default function RegisterPage() {
  const { setAuth, auth } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  React.useEffect(() => {
    if (auth) setLocation('/dashboard');
  }, [auth, setLocation]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'student' },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const response = await registerMutation.mutateAsync({ data: values });
      setAuth({ token: response.token, user: response.user });
      toast({ title: 'Account created successfully!' });
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error?.response?.data?.error ?? 'Please try again.',
      });
    }
  };

  const role = form.watch('role');

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* ── Form panel ── */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-[420px]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-md brand-gradient text-white">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Koda AI</span>
          </Link>

          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Log in
            </Link>
          </p>

          <div className="mt-8 space-y-6">
            {/* Social sign-up */}
            <SocialLoginButtons mode="register" role={role} />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-muted/30 px-2 text-muted-foreground tracking-wider">
                  or register with email
                </span>
              </div>
            </div>

            {/* Email form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Role picker */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a…</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-3"
                        >
                          {[
                            { value: 'student', label: 'Student', Icon: User },
                            { value: 'company', label: 'Company', Icon: Building },
                            { value: 'university', label: 'University', Icon: GraduationCap },
                          ].map(({ value, label, Icon }) => (
                            <FormItem key={value}>
                              <FormControl>
                                <RadioGroupItem value={value} className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                <Icon className="mb-2 h-5 w-5" />
                                <span className="text-xs font-medium text-center leading-tight">{label}</span>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {role === 'company' ? 'Company Name' : role === 'university' ? 'University Name' : 'Full Name'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={role === 'company' ? 'Acme Corp' : role === 'university' ? 'MIT' : 'Jane Smith'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work or School Email</FormLabel>
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

                <Button
                  type="submit"
                  className="w-full h-11 text-base brand-gradient text-white border-0 shadow-md"
                  disabled={registerMutation.isPending || form.formState.isSubmitting}
                >
                  {registerMutation.isPending || form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By creating an account you agree to our{' '}
                  <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* ── Right artistic panel ── */}
      <div className="relative hidden w-0 flex-1 lg:block bg-foreground overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-10 mix-blend-multiply" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#35B7FF] blur-[150px] opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[#7A4DFF] blur-[100px] opacity-15" />
        <div className="flex h-full items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-3xl font-bold mb-6">Join the standard.</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Create an account in seconds. Find matches in minutes. Build your engineering career on a platform designed for precision and clarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
