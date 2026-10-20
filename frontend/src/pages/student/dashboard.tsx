import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetStudentDashboard } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { FileText, CheckCircle, XCircle, Clock, Zap, Target, Briefcase, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { auth } = useAuth();
  const studentId = auth?.user?.id || 0;

  const { data: dashboard, isLoading, isError, error, refetch } = useGetStudentDashboard(
    { studentId },
    { query: { enabled: !!studentId, queryKey: ['student-dashboard', studentId] } }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="space-y-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">Could not load the student dashboard</h1>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Dashboard data is unavailable."}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }
  const data = dashboard;

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
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Student dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
              Welcome back, {auth?.user?.name.split(' ')[0]}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              See your internship search progress, key matches, and next actions in one professional workspace.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:w-auto">
            <div className="rounded-3xl border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{data.totalApplications}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Offers</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{data.acceptedApplications}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Profile</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{data.profileCompleteness}%</p>
            </div>
          </div>
        </div>
      </section>

      <div>
        <Link href="/student/talent">
          <Button className="brand-gradient text-white">
            Explore assessments & internship matches <Target className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          <Card className="border border-border bg-card shadow-lg">
            <CardHeader className="flex items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground">Applications</CardTitle>
                <p className="mt-2 text-3xl font-semibold text-foreground">{data.totalApplications}</p>
              </div>
              <FileText className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-500">{data.pendingApplications} currently pending</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-slate-950 text-white shadow-lg">
            <CardHeader className="flex items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-300">Open Internships</CardTitle>
                <p className="mt-2 text-3xl font-semibold text-white">{data.recommendedCount}</p>
              </div>
              <Zap className="h-5 w-5 text-cyan-300" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-300">Open internship listings you have not applied to.</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-lg">
            <CardHeader className="flex items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground">Accepted</CardTitle>
                <p className="mt-2 text-3xl font-semibold text-foreground">{data.acceptedApplications}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-500">Your strongest opportunities are waiting.</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card shadow-lg">
            <CardHeader className="flex items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-sm font-semibold text-muted-foreground">Rejected</CardTitle>
                <p className="mt-2 text-3xl font-semibold text-foreground">{data.rejectedApplications}</p>
              </div>
              <XCircle className="h-5 w-5 text-rose-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-500">Track conversions and refine your applications.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-lg">
          <div className="bg-gradient-to-r from-[#33D6D1]/10 via-transparent to-[#7A4DFF]/10 px-6 py-6">
            <CardHeader className="flex flex-col gap-3 pb-0">
              <CardTitle className="text-lg font-semibold text-foreground">Recent Applications</CardTitle>
              <p className="text-sm text-muted-foreground">Review your latest submissions in one place.</p>
            </CardHeader>
          </div>
          <CardContent className="space-y-4 px-6 pt-6 pb-6">
            {data.recentApplications?.map((app) => (
              <div key={app.id} className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 transition-all hover:scale-[1.01] hover:border-muted">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{app.internshipTitle}</p>
                    <p className="text-sm text-muted-foreground">{app.companyName} · {format(new Date(app.createdAt), 'MMM d')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {app.matchScore == null ? "—" : `${app.matchScore}% Match`}
                    </p>
                    <p className="text-xs text-muted-foreground">Match score</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`capitalize px-2 py-1 text-xs font-semibold border ${getStatusColor(app.status)}`}>
                    <span className="flex items-center">{getStatusIcon(app.status)}{app.status}</span>
                  </Badge>
                </div>
              </div>
            ))}
            {(!data.recentApplications || data.recentApplications.length === 0) && (
              <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No recent applications yet. Browse internships to start applying.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
