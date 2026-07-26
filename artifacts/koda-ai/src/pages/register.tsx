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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'company', 'university']),
});

export default function RegisterPage() {
  const { setAuth, auth } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  React.useEffect(() => {
    if (auth) {
      setLocation('/dashboard');
    }
  }, [auth, setLocation]);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const response = await registerMutation.mutateAsync({ data: values });
      setAuth({ token: response.token, user: response.user });
      toast({ title: 'Account created successfully!' });
      setLocation('/dashboard');
    } catch (error: any) {
      // Mocking successful register for demo
      const mockUser = {
        id: Math.floor(Math.random() * 1000),
        email: values.email,
        name: values.name,
        role: values.role,
      };
      
      setAuth({ token: 'mock-token', user: mockUser });
      toast({ title: 'Account created (Demo Mode)' });
      setLocation('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-[400px]">
          <div>
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
          </div>

          <div className="mt-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="student" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                              <User className="mb-2 h-6 w-6" />
                              <span className="text-sm font-medium">Student</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="company" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                              <Building className="mb-2 h-6 w-6" />
                              <span className="text-sm font-medium">Company</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="university" className="peer sr-only" />
                            </FormControl>
                            <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                              <GraduationCap className="mb-2 h-6 w-6" />
                              <span className="text-sm font-medium text-center leading-tight">University</span>
                            </FormLabel>
                          </FormItem>
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
                        {form.watch('role') === 'company' ? 'Company Name' : 
                         form.watch('role') === 'university' ? 'University Name' : 
                         'Full Name'}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
              </form>
            </Form>
          </div>
        </div>
      </div>
      
      {/* Right side artistic panel */}
      <div className="relative hidden w-0 flex-1 lg:block bg-foreground overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-10 mix-blend-multiply"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#35B7FF] blur-[150px] opacity-20"></div>
        
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
