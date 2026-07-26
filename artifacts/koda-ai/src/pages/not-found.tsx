import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="brand-gradient-text text-8xl font-black mb-4">404</div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Page not found</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8">
        <Button asChild className="brand-gradient text-white border-0 px-8">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
