import React from 'react';
import { useGetCompanyDashboard } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { Users, Briefcase, Clock, Plus, ChevronRight } from 'lucide-react';
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

  const data = dashboard || mockDashboard;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your active postings and review top candidates.</p>
        </div>
        <Button className="brand-gradient text-white border-0 shadow-sm" asChild>
          <Link href="/company/internships/new"><Plus className="h-4 w-4 mr-2"/> Post Internship</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Roles</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.activeInternships}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {data.totalInternships} total</p>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.totalApplicants}</div>
            <p className="text-xs text-primary/80 mt-1">Across all postings</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.pendingApplicants}</div>
            <p className="text-xs text-muted-foreground mt-1">Need your attention</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.acceptedApplicants || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Accepted offers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent High-Match Applicants</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Candidates with strong skill overlap for your open roles.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/company/internships">View All <ChevronRight className="h-4 w-4 ml-1"/></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {data.recentApplications?.map((app: any) => (
              <div key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 group">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarFallback className="bg-muted text-foreground font-medium">
                      {app.studentName?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{app.studentName}</h4>
                    <p className="text-sm text-muted-foreground">Applied for <span className="font-medium text-foreground">{app.internshipTitle}</span></p>
                    <div className="flex gap-2 mt-2">
                      {app.studentSkills?.slice(0,3).map((skill: string) => (
                        <span key={skill} className="text-[10px] uppercase tracking-wider font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-12 h-12">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                        <path strokeDasharray={`${app.matchScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
                      </svg>
                      <span className="absolute text-xs font-bold">{app.matchScore}%</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 uppercase">Match</span>
                  </div>
                  <Button size="sm" variant="secondary">Review Profile</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
