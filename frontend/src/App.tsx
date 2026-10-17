import React, { useEffect } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { useTheme } from '@/hooks/use-theme';

// Layouts
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Pages - Public
import LandingPage from '@/pages/landing';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import InternshipsPage from '@/pages/internships';
import InternshipDetailPage from '@/pages/internship-detail';
import AboutPage from '@/pages/about';
import ContactPage from '@/pages/contact';
import AIPage from '@/pages/ai';
import PrivacyPage from '@/pages/privacy';
import TermsPage from '@/pages/terms';
import NotFound from '@/pages/not-found';
import OAuthCallbackPage from '@/pages/oauth-callback';

// Pages - Dashboard
import DashboardRouter from '@/pages/dashboard-router';

// Student Pages
import StudentDashboard from '@/pages/student/dashboard';
import StudentProfile from '@/pages/student/profile';
import StudentApplications from '@/pages/student/applications';
import StudentTalent from '@/pages/student/talent';
8888
// Company Pages
import CompanyDashboard from '@/pages/company/dashboard';
import CompanyProfile from '@/pages/company/profile';
import CompanyInternships from '@/pages/company/internships';
import CompanyInternshipNew from '@/pages/company/internship-new';
import CompanyInternshipApplicants from '@/pages/company/internship-applicants';

// University Pages
import UniversityDashboard from '@/pages/university/dashboard';
import UniversityStudents from '@/pages/university/students';
import UniversityVerification from '@/pages/university/verification';

// Shared Authenticated Pages
import NotificationsPage from '@/pages/notifications';
import SettingsPage from '@/pages/settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicLayout><LandingPage /></PublicLayout>
      </Route>
      <Route path="/login">
        <PublicLayout><LoginPage /></PublicLayout>
      </Route>
      <Route path="/register">
        <PublicLayout><RegisterPage /></PublicLayout>
      </Route>
      <Route path="/internships">
        <PublicLayout><InternshipsPage /></PublicLayout>
      </Route>
      <Route path="/internships/:id">
        <PublicLayout><InternshipDetailPage /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><AboutPage /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><ContactPage /></PublicLayout>
      </Route>
      <Route path="/ai">
        <PublicLayout><AIPage /></PublicLayout>
      </Route>
      <Route path="/privacy">
        <PublicLayout><PrivacyPage /></PublicLayout>
      </Route>
      <Route path="/oauth-callback"><OAuthCallbackPage /></Route>
      <Route path="/terms">
        <PublicLayout><TermsPage /></PublicLayout>
      </Route>
      
      {/* Dashboard Routes wrapped in DashboardLayout */}
      <Route path="/dashboard"><DashboardLayout><DashboardRouter /></DashboardLayout></Route>
      
      <Route path="/student/dashboard"><DashboardLayout><StudentDashboard /></DashboardLayout></Route>
      <Route path="/student/profile"><DashboardLayout><StudentProfile /></DashboardLayout></Route>
      <Route path="/student/applications"><DashboardLayout><StudentApplications /></DashboardLayout></Route>
      <Route path="/student/talent"><DashboardLayout><StudentTalent /></DashboardLayout></Route>

      <Route path="/company/dashboard"><DashboardLayout><CompanyDashboard /></DashboardLayout></Route>
      <Route path="/company/profile"><DashboardLayout><CompanyProfile /></DashboardLayout></Route>
      <Route path="/company/internships"><DashboardLayout><CompanyInternships /></DashboardLayout></Route>
      <Route path="/company/internships/new"><DashboardLayout><CompanyInternshipNew /></DashboardLayout></Route>
      <Route path="/company/internships/:id/applicants"><DashboardLayout><CompanyInternshipApplicants /></DashboardLayout></Route>

      <Route path="/university/dashboard"><DashboardLayout><UniversityDashboard /></DashboardLayout></Route>
      <Route path="/university/students"><DashboardLayout><UniversityStudents /></DashboardLayout></Route>
      <Route path="/university/verification"><DashboardLayout><UniversityVerification /></DashboardLayout></Route>

      <Route path="/notifications"><DashboardLayout><NotificationsPage /></DashboardLayout></Route>
      <Route path="/settings"><DashboardLayout><SettingsPage /></DashboardLayout></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useTheme();

  useEffect(() => {
    setBaseUrl(import.meta.env.BASE_URL?.replace(/\/$/, '') || null);
    setAuthTokenGetter(() => {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage.getItem('koda_auth');
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as { token?: string };
        return parsed.token ?? null;
      } catch {
        return null;
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
