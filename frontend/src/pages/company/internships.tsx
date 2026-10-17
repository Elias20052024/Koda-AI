import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetCompanyInternships } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, MapPin, Calendar, Clock, Edit, MoreVertical, Briefcase } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function CompanyInternships() {
  const { auth } = useAuth();
  const companyId = auth?.user?.id || 0;

  const { data: internships, isLoading } = useGetCompanyInternships(companyId, {
    query: { enabled: !!companyId, queryKey: ['company-internships', companyId] }
  });

  const mockInternships = [
    {
      id: 1, title: "Frontend Engineering Intern", location: "Remote", type: "Summer 2024", 
      status: "open", applicantsCount: 42, createdAt: new Date().toISOString(), skills: ["React", "TypeScript"]
    },
    {
      id: 2, title: "Backend Developer Intern", location: "New York, NY", type: "Fall 2024", 
      status: "open", applicantsCount: 15, createdAt: new Date().toISOString(), skills: ["Go", "PostgreSQL"]
    },
    {
      id: 3, title: "Data Science Intern", location: "Remote", type: "Spring 2024", 
      status: "closed", applicantsCount: 89, createdAt: new Date(Date.now() - 30*86400000).toISOString(), skills: ["Python", "PyTorch"]
    }
  ];

  const data = internships || mockInternships;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internship Postings</h1>
          <p className="text-muted-foreground mt-1">Manage your job listings and view applicants.</p>
        </div>
        <Button className="brand-gradient text-white border-0 shadow-sm" asChild>
          <Link href="/company/internships/new"><Plus className="h-4 w-4 mr-2"/> Create New Posting</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {data.map((job: any) => (
          <Card key={job.id} className={`overflow-hidden ${job.status === 'closed' ? 'opacity-75 bg-muted/30' : ''}`}>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Left content */}
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'} 
                           className={job.status === 'open' ? 'bg-[#33D6D1] hover:bg-[#33D6D1] text-black font-semibold' : ''}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
                    {job.location && <div className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" />{job.location}</div>}
                    {job.type && <div className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" />{job.type}</div>}
                  </div>

                  <div className="flex gap-2">
                    {job.skills?.map((skill: string) => (
                      <span key={skill} className="text-xs font-medium bg-muted px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right stats & actions */}
                <div className="sm:w-64 border-t sm:border-t-0 sm:border-l bg-muted/10 p-6 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{job.applicantsCount || 0}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Applicants</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <Button variant="default" className="flex-1" asChild>
                      <Link href={`/company/internships/${job.id}/applicants`}>Review</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit className="h-4 w-4 mr-2"/> Edit Posting</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Clock className="h-4 w-4 mr-2"/> Close Posting</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {data.length === 0 && (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No postings yet</h3>
            <p className="text-muted-foreground mb-6">Create your first internship posting to start finding talent.</p>
            <Button className="brand-gradient text-white border-0" asChild>
              <Link href="/company/internships/new">Create Posting</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
