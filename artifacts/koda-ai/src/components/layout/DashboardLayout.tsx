import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  UserCircle, 
  Briefcase, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Users,
  CheckSquare,
  Building,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { auth, logout } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!auth) {
      setLocation('/login');
    }
  }, [auth, setLocation]);

  if (!auth) return null;

  const role = auth.user.role;
  
  const studentLinks = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/profile', label: 'Profile', icon: UserCircle },
    { href: '/student/applications', label: 'Applications', icon: FileText },
  ];

  const companyLinks = [
    { href: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/company/profile', label: 'Company Profile', icon: Building },
    { href: '/company/internships', label: 'Internships', icon: Briefcase },
  ];

  const universityLinks = [
    { href: '/university/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/university/students', label: 'Students', icon: Users },
    { href: '/university/verification', label: 'Verifications', icon: CheckSquare },
  ];

  const commonLinks = [
    { href: '/internships', label: 'Browse Jobs', icon: Briefcase },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  let links = [];
  if (role === 'student') links = studentLinks;
  else if (role === 'company') links = companyLinks;
  else if (role === 'university') links = universityLinks;

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <div className="flex min-h-[100dvh] bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card px-4 py-6">
        <Link href="/" className="flex items-center space-x-2 px-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-md brand-gradient text-white">
            <span className="font-bold">K</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Koda AI</span>
        </Link>

        <div className="flex-1 space-y-1">
          <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-4">Menu</div>
          {links.map(link => {
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-8">General</div>
          {commonLinks.map(link => {
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center px-3 py-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mr-3">
              {auth.user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{auth.user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{role}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex h-14 items-center justify-between border-b bg-card px-4">
          <Link href="/" className="font-bold text-lg">Koda AI</Link>
          <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
            <LayoutDashboard className="h-5 w-5" />
          </Button>
        </header>
        
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
