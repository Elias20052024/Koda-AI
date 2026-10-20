import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGetUniversityDashboard, useListVerificationRequests, useUpdateVerificationStatus } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UniversityDashboard() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const universityId = auth?.user?.id || 0;

  const {
    data: dashboard,
    isLoading: dashLoading,
    isError: dashboardError,
    error: dashboardErrorDetails,
    refetch: refetchDashboard,
  } = useGetUniversityDashboard(
    { universityId },
    { query: { enabled: !!universityId, queryKey: ['university-dashboard', universityId] } }
  );

  const {
    data: requests,
    refetch: refetchRequests,
    isLoading: requestsLoading,
    isError: requestsError,
    error: requestsErrorDetails,
  } = useListVerificationRequests(
    { universityId },
    { query: { enabled: !!universityId, queryKey: ['verification-requests', universityId] } }
  );

  const updateMutation = useUpdateVerificationStatus();

  if (dashLoading || requestsLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  if (dashboardError || requestsError || !dashboard || !requests) {
    const errorDetails = dashboardErrorDetails ?? requestsErrorDetails;
    return (
      <div className="space-y-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">Could not load university dashboard data</h1>
        <p className="text-muted-foreground">
          {errorDetails instanceof Error ? errorDetails.message : "Dashboard data is unavailable."}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            void refetchDashboard();
            void refetchRequests();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const data = dashboard;
  const pendingRequests = requests.filter((request) => request.status === 'pending');

  const handleVerify = async (verificationRequestId: number, status: 'approved' | 'rejected') => {
    try {
      await updateMutation.mutateAsync({
        id: verificationRequestId,
        data: { status }
      });
      toast({ title: `Student ${status} successfully.` });
    } catch (mutationError) {
      toast({
        variant: "destructive",
        title: `Could not ${status === 'approved' ? 'approve' : 'reject'} verification request`,
        description: mutationError instanceof Error ? mutationError.message : "Please try again.",
      });
      return;
    }
    void refetchRequests();
    void refetchDashboard();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">University portal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Verify students with confidence</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Monitor enrollment verification, track placement impact, and keep your student records aligned with employer outcomes.</p>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
            <div className="rounded-3xl bg-slate-50 p-4 text-center border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Students</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{data.totalStudents}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-center border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Verified</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{data.verifiedStudents}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Total Students</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.totalStudents}</p>
            </div>
            <Users className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Students enrolled across your verified programs.</CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Verified</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.verifiedStudents}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-cyan-600" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Successful verifications completed this period.</CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Pending</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.pendingVerifications}</p>
            </div>
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Requests waiting for your review.</CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-lg">
          <CardHeader className="flex items-start justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-500">Placements</CardTitle>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{data.placedStudents}</p>
            </div>
            <GraduationCap className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Students placed into internships and roles.</CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-[#33D6D1]/10 via-transparent to-[#7A4DFF]/10 px-6 py-6">
          <CardHeader className="flex flex-col gap-3 pb-0">
            <CardTitle className="text-lg font-semibold text-slate-900">Pending Verifications</CardTitle>
            <p className="text-sm text-slate-500">Approve or reject incoming student verification requests quickly.</p>
          </CardHeader>
        </div>
        <CardContent className="space-y-4 px-6 pt-6 pb-6">
          {pendingRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
              <CheckCircle className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
              All caught up! No pending verification requests.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{req.studentName}</p>
                    <p className="text-sm text-slate-500">{req.studentEmail}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                      onClick={() => handleVerify(req.id, 'rejected')}
                      disabled={updateMutation.isPending}
                    >
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white border-0"
                      onClick={() => handleVerify(req.id, 'approved')}
                      disabled={updateMutation.isPending}
                    >
                      Verify Student
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
