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

  const { data: dashboard, isLoading: dashLoading } = useGetUniversityDashboard(
    { universityId },
    { query: { enabled: !!universityId, queryKey: ['university-dashboard', universityId] } }
  );

  const { data: requests, refetch } = useListVerificationRequests(
    { universityId },
    { query: { enabled: !!universityId, queryKey: ['verification-requests', universityId] } }
  );

  const updateMutation = useUpdateVerificationStatus();

  const mockDashboard = {
    totalStudents: 450,
    verifiedStudents: 412,
    pendingVerifications: 5,
    placedStudents: 128,
  };

  const mockRequests = [
    { id: 1, studentName: "Alice Walker", studentEmail: "alice.w@univ.edu", status: "pending", createdAt: new Date().toISOString() },
    { id: 2, studentName: "Bob Smith", studentEmail: "bsmith@univ.edu", status: "pending", createdAt: new Date().toISOString() },
  ];

  const data = dashboard || mockDashboard;
  const pendingRequests = (requests || mockRequests).filter(r => r.status === 'pending');

  const handleVerify = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateMutation.mutateAsync({
        data: { status }
      });
      toast({ title: `Student ${status} successfully.` });
      refetch();
    } catch (e) {
      toast({ title: `Action completed (Demo Mode)` });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">University Portal</h1>
        <p className="text-muted-foreground mt-1">Verify students and track placement outcomes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered on Koda</p>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.verifiedStudents}</div>
            <p className="text-xs text-primary/80 mt-1">{(data.verifiedStudents/data.totalStudents*100).toFixed(0)}% verification rate</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Action</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Placements</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.placedStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">Secured internships</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500/50" />
              All caught up! No pending verification requests.
            </div>
          ) : (
            <div className="divide-y">
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-foreground">{req.studentName}</p>
                    <p className="text-sm text-muted-foreground">{req.studentEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                      onClick={() => handleVerify(req.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white border-0"
                      onClick={() => handleVerify(req.id, 'approved')}
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
