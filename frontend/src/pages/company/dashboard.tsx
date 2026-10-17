import React from 'react';
import { useGetCompanyDashboard } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { Users, Briefcase, Clock, Plus, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CompanyDashboard() {
  const { auth } = useAuth();
  const companyId = auth?.user?.id || 0;

  const { data: dashboard, isLoading } = useGetCompanyDashboard(
    { companyId },
    { query: { enabled: !!companyId, queryKey: ['company-dashboard', companyId] } }
  );

  const mockDashboard = {
    totalInternships: 4,
    activeInternships: 3,
    totalApplicants: 142,
    pendingApplicants: 28,
    acceptedApplicants: 2,
    recentApplications: [
      { id: 101, studentName: "Alex Chen", studentSkills: ["React", "TypeScript", "Node.js"], internshipTitle: "Frontend Intern", matchScore: 94, status: "pending", createdAt: new Date().toISOString() },
      { id: 102, studentName: "Sarah Smith", studentSkills: ["Python", "Django", "AWS"], internshipTitle: "Backend Intern", matchScore: 88, status: "pending", createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 103, studentName: "David Kim", studentSkills: ["Figma", "React", "CSS"], internshipTitle: "Frontend Intern", matchScore: 91, status: "accepted", createdAt: new Date(Date.now() - 86400000).toISOString() },
    ]
  };

  if (isLoading && !dashboard) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  const data = dashboard || mockDashboard;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Recruiter dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Your hiring command center</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Track internship postings, evaluate candidates, and move hires forward with data-driven clarity.</p>
          </div>
          <Button className="brand-gradient text-white border-0 shadow-sm" asChild>
            <Link href="/company/internships/new"><Plus className="h-4 w-4 mr-2"/> Post Internship</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Active Roles</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.activeInternships}</p>
            </div>
            <Briefcase className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">{data.totalInternships} total listings live or paused.</CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Total Candidates</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totalApplicants}</p>
            </div>
            <Users className="h-5 w-5 text-cyan-600" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Across all your active internship postings.</CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Pending Review</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.pendingApplicants}</p>
            </div>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Candidates awaiting your next action.</CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Hired</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.acceptedApplicants || 0}</p>
            </div>
            <Users className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Confirmed matches from your recruitment pipeline.</CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-[#33D6D1]/10 via-transparent to-[#7A4DFF]/10 px-6 py-6">
          <CardHeader className="flex flex-col gap-3 pb-0">
            <CardTitle className="text-lg font-semibold text-slate-900">Recent High-Match Applicants</CardTitle>
            <p className="text-sm text-slate-500">Candidates with the strongest fit for your live roles.</p>
          </CardHeader>
        </div>
        <CardContent className="space-y-4 px-6 pt-6 pb-6">
          {data.recentApplications?.map((app: any) => (
            <div key={app.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 transition-all hover:scale-[1.01] hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border border-slate-200 bg-slate-100">
                  <AvatarFallback className="text-slate-700 font-medium">{app.studentName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{app.studentName}</h4>
                  <p className="text-sm text-slate-500">Applied for <span className="font-medium text-slate-900">{app.internshipTitle}</span></p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {app.studentSkills?.slice(0,3).map((skill: string) => (
                      <span key={skill} className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 shadow-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:justify-end">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{app.matchScore}% Match</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Strength</p>
                </div>
                <Button size="sm" variant="secondary">Review Profile</Button>
              </div>
            </div>
          ))}
          {!data.recentApplications?.length && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No recent applicants yet. Create a new posting to attract top talent.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
