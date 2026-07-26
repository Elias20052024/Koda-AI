import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetStudentDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { FileText, CheckCircle, XCircle, Clock, Zap, Target, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { auth } = useAuth();
  const studentId = auth?.user?.id || 0;

  const { data: dashboard, isLoading } = useGetStudentDashboard(
    { studentId },
    { query: { enabled: !!studentId, queryKey: ['student-dashboard', studentId] } }
  );

  // Mock data
  const mockDashboard = {
    totalApplications: 12,
    pendingApplications: 5,
    acceptedApplications: 2,
    rejectedApplications: 5,
    profileCompleteness: 85,
    recommendedCount: 24,
    recentApplications: [
      { id: 1, internshipTitle: "Frontend Intern", companyName: "Vercel", status: "pending", createdAt: new Date().toISOString(), matchScore: 92 },
      { id: 2, internshipTitle: "React Developer", companyName: "Linear", status: "accepted", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), matchScore: 88 },
      { id: 3, internshipTitle: "UI Engineer", companyName: "Stripe", status: "rejected", createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), matchScore: 75 },
    ]
  };

  const data = dashboard || mockDashboard;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'rejected': return <XCircle className="w-3 h-3 mr-1" />;
      case 'pending': return <Clock className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {auth?.user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Here is what's happening with your internship search.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.pendingApplications} pending review</p>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.acceptedApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">Accepted applications</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">AI Recommended</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.recommendedCount}</div>
            <p className="text-xs text-primary/80 mt-1">High-match roles found</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profile</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold">{data.profileCompleteness}%</div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-3">
              <div className="brand-gradient h-2 rounded-full" style={{ width: `${data.profileCompleteness}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary">
              <Link href="/student/applications">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentApplications?.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between group cursor-pointer border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-bold text-sm">
                      {app.companyName?.substring(0, 2).toUpperCase() || 'CO'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">{app.internshipTitle}</p>
                      <p className="text-xs text-muted-foreground">{app.companyName} • {format(new Date(app.createdAt), 'MMM d')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={`capitalize px-2 py-0.5 text-xs font-medium border ${getStatusColor(app.status)}`}>
                      <span className="flex items-center">{getStatusIcon(app.status)}{app.status}</span>
                    </Badge>
                    {app.matchScore && (
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {app.matchScore}% Match
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {(!data.recentApplications || data.recentApplications.length === 0) && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  You haven't applied to any internships yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border shadow-sm bg-foreground text-white relative overflow-hidden">
          <div className="absolute inset-0 brand-gradient opacity-10"></div>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Discover Your Matches</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col items-center justify-center py-10 text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Briefcase className="h-8 w-8 text-[#33D6D1]" />
            </div>
            <h3 className="text-xl font-bold mb-2">We found {data.recommendedCount} roles for you</h3>
            <p className="text-gray-400 mb-8 max-w-xs text-sm">Our AI analyzed your skills and found internships where you have a 80%+ match rate.</p>
            <Button className="brand-gradient text-white border-0" asChild>
              <Link href="/internships">Browse Recommendations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
