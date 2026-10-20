import React from 'react';
import { useParams, Link } from 'wouter';
import { useGetInternship, useGetMatchScore, useCreateApplication } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Clock, DollarSign, Building, ArrowLeft, Send, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function InternshipDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || '0', 10);
  const { auth } = useAuth();
  const { toast } = useToast();
  
  // Real hooks
  const { data: internship, isLoading, error: internshipError } = useGetInternship(id, { 
    query: { enabled: !!id, queryKey: ['internships', id] } 
  });
  
  const data = internship;

  // Match score hook (only enabled if student is logged in)
  const isStudent = auth?.user?.role === 'student';
  const { data: matchResult } = useGetMatchScore(id, {
    studentId: auth?.user?.id || 0,
  }, {
    query: { enabled: isStudent, queryKey: ['match', id, auth?.user?.id] },
  });

  const match = matchResult;

  const createApplication = useCreateApplication();

  const handleApply = async () => {
    if (!auth || auth.user.role !== 'student') {
      toast({
        title: auth ? "Student account required" : "Please login to apply",
        description: "Only authenticated students can apply for internships.",
      });
      return;
    }
    try {
      await createApplication.mutateAsync({
        data: {
          internshipId: id,
          studentId: auth.user.id,
          coverLetter: ""
        }
      });
      toast({ title: "Application submitted successfully!" });
    } catch {
      toast({
        variant: "destructive",
        title: "Could not submit application",
        description: "Please try again. If you already applied, check your application history.",
      });
    }
  };

  if (isLoading && !data) {
    return <div className="p-20 text-center text-muted-foreground">Loading...</div>;
  }
  if (!data) {
    return (
      <div className="p-20 text-center">
        <p className="text-muted-foreground">{internshipError instanceof Error ? internshipError.message : "Internship not found."}</p>
        <Link href="/internships" className="mt-4 inline-block text-primary hover:underline">Back to internships</Link>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 min-h-[calc(100vh-64px)] pb-20">
      {/* Header Banner */}
      <div className="h-48 bg-foreground w-full relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 -mt-16 relative z-10 max-w-5xl">
        <div className="mb-6">
          <Link href="/internships" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to search
          </Link>
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="h-24 w-24 shrink-0 rounded-xl border-4 border-card bg-white shadow-sm flex items-center justify-center font-bold text-3xl text-foreground">
              {data.companyName?.substring(0, 2).toUpperCase() || 'CO'}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{data.title}</h1>
              <p className="text-xl text-muted-foreground flex items-center gap-2 mb-6">
                <Building className="h-5 w-5" /> {data.companyName}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6 bg-muted/50 p-4 rounded-xl">
                {data.location && (
                  <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{data.location}</div>
                )}
                {data.type && (
                  <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{data.type}</div>
                )}
                {data.duration && (
                  <div className="flex items-center"><Clock className="h-4 w-4 mr-2" />{data.duration}</div>
                )}
                {data.salary && (
                  <div className="flex items-center"><DollarSign className="h-4 w-4 mr-1" />{data.salary}</div>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col gap-4">
              <Button
                size="lg"
                className="w-full brand-gradient border-0 text-white font-medium"
                onClick={handleApply}
                disabled={!isStudent || createApplication.isPending || data.status !== 'open'}
              >
                <Send className="mr-2 h-4 w-4" />
                {data.status !== 'open' ? 'Applications closed' : isStudent ? 'Apply Now' : 'Student account required'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {data.applicantsCount || 0} applicants so far
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-8 prose prose-gray max-w-none">
                <h3 className="text-xl font-bold mb-4 mt-0 text-foreground">About the role</h3>
                <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {data.description}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {isStudent && match && (
              <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <CardContent className="p-6 relative z-10">
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <span className="flex h-2 w-2 rounded-full brand-gradient mr-2"></span>
                    Match Analysis
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                        <path strokeDasharray={`${match.matchScore ?? 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
                      </svg>
                      <span className="absolute text-lg font-bold">{match.matchScore === null ? '—' : `${match.matchScore}%`}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{match.matchExplanation}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">Matched Skills</span>
                      <div className="flex flex-wrap gap-2">
                        {match.matchedSkills.map(skill => (
                          <Badge key={skill} variant="outline" className="border-primary/30 text-primary bg-primary/5">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {match.missingSkills.length > 0 && (
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">Missing Skills</span>
                        <div className="flex flex-wrap gap-2">
                          {match.missingSkills.map(skill => (
                            <Badge key={skill} variant="outline" className="border-destructive/30 text-destructive bg-destructive/5">
                              <XCircle className="mr-1 h-3 w-3" /> {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(data.skills || []).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="bg-muted hover:bg-muted font-normal text-sm px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
