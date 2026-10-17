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

  const studentGeneralLinks = [
    { href: '/internships', label: 'Browse Internships', icon: Briefcase },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const companyGeneralLinks = [
    { href: '/company/candidates', label: 'Candidates', icon: Users },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const universityGeneralLinks = [
    { href: '/university/reports', label: 'Reports', icon: FileText },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarConfig: Record<string, {
    title: string;
    description: string;
    accentClass: string;
    links: typeof studentLinks;
    generalLinks: typeof studentGeneralLinks;
    sectionLabel: string;
  }> = {
    student: {
      title: 'Student Hub',
      description: 'Track applications, explore internships, and plan your next move.',
      accentClass: 'from-cyan-500 via-slate-100 to-slate-900',
      links: studentLinks,
      generalLinks: studentGeneralLinks,
      sectionLabel: 'Student workspace',
    },
    company: {
      title: 'Hiring Studio',
      description: 'Manage roles, review candidates, and scale your talent pipeline.',
      accentClass: 'from-violet-500 via-slate-100 to-slate-900',
      links: companyLinks,
      generalLinks: companyGeneralLinks,
      sectionLabel: 'Recruitment center',
    },
    university: {
      title: 'Academic Portal',
      description: 'Verify students, manage programs, and connect with employers.',
      accentClass: 'from-emerald-500 via-slate-100 to-slate-900',
      links: universityLinks,
      generalLinks: universityGeneralLinks,
      sectionLabel: 'University dashboard',
    },
  };

  const config = sidebarConfig[role] || sidebarConfig.student;
  const dashboardPath = role === 'company' ? '/company/dashboard' : role === 'university' ? '/university/dashboard' : '/student/dashboard';

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-80 flex-col border-r border-border bg-sidebar px-6 py-7 shadow-sm">
        <Link href={dashboardPath} className="mb-10 rounded-[1.75rem] border border-border bg-slate-950 bg-gradient-to-br p-5 text-white shadow-xl shadow-slate-200/20 transition hover:shadow-slate-300/30">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-3xl text-xl font-semibold text-white shadow-lg", {
              'bg-gradient-to-br from-cyan-500 to-slate-900': role === 'student',
              'bg-gradient-to-br from-violet-500 to-slate-900': role === 'company',
              'bg-gradient-to-br from-emerald-500 to-slate-900': role === 'university',
            })}>
              K
            </div>
            <div>
              <p className="text-base font-semibold">{config.title}</p>
              <p className="mt-1 text-xs leading-4 text-slate-300">{config.description}</p>
            </div>
          </div>
        </Link>

        <div className="flex-1 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{config.sectionLabel}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Quick links tailored for your {role} experience.</p>
          </div>

          <div className="space-y-2">
            {config.links.map(link => {
              const isActive = location === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className={cn("h-4 w-4", isActive ? "text-slate-900" : "text-slate-400")} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">General</div>
          {config.generalLinks.map(link => {
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center space-x-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className={cn("h-4 w-4", isActive ? "text-foreground" : "text-muted-foreground")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto rounded-3xl border border-border bg-card p-4 shadow-inner">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white", {
              'bg-cyan-500': role === 'student',
              'bg-violet-500': role === 'company',
              'bg-emerald-500': role === 'university',
            })}>
              {auth.user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{auth.user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-2 w-full justify-start text-slate-600 hover:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex h-16 items-center justify-between border-b border-border bg-background px-4">
          <Link href="/" className="font-bold text-lg text-foreground">Koda AI</Link>
          <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </Button>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1700px] px-4 py-6 md:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
