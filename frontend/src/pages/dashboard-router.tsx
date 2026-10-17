import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardRouter() {
  const { auth } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!auth) {
      setLocation('/login');
      return;
    }

    if (auth.user.role === 'student') {
      setLocation('/student/dashboard');
    } else if (auth.user.role === 'company') {
      setLocation('/company/dashboard');
    } else if (auth.user.role === 'university') {
      setLocation('/university/dashboard');
    } else {
      setLocation('/');
    }
  }, [auth, setLocation]);

  return <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
}
