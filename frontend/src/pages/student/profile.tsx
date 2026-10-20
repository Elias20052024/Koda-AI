import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  useGetTalentProfile,
  useReplaceTalentEvidence,
  useUpdateTalentSkills,
} from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Plus, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  university: z.string().min(2, "University name is required"),
  gpa: z.coerce.number().min(0).max(5).optional(),
  bio: z.string().max(500).optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string()),
  coursework: z.array(z.string()).optional(),
});

export default function StudentProfile() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [skillInput, setSkillInput] = React.useState('');
  const [courseworkInput, setCourseworkInput] = React.useState('');

  const {
    data: student,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTalentProfile({
    query: { enabled: !!auth?.user?.id, queryKey: ['talent-profile', auth?.user?.id] }
  });

  const updateMutation = useUpdateTalentSkills();
  const evidenceMutation = useReplaceTalentEvidence();
  const coursework = React.useMemo(
    () => student?.education.flatMap((entry) => entry.coursework) ?? [],
    [student?.education],
  );

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      university: '',
      gpa: undefined,
      bio: '',
      resumeUrl: '',
      skills: [],
      coursework: [],
    },
  });

  React.useEffect(() => {
    if (student) {
      form.reset({
        university: student.university ?? '',
        gpa: student.gpa ?? undefined,
        bio: student.bio ?? '',
        resumeUrl: student.resumeUrl ?? '',
        skills: student.skills,
        coursework,
      });
    }
  }, [student, coursework, form]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !skillInput.trim()) return;
    e.preventDefault();
    
    const currentSkills = form.getValues('skills');
    if (!currentSkills.includes(skillInput.trim())) {
      form.setValue('skills', [...currentSkills, skillInput.trim()], { shouldDirty: true });
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills');
    form.setValue('skills', currentSkills.filter(s => s !== skillToRemove), { shouldDirty: true });
  };

  const handleAddCoursework = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !courseworkInput.trim()) return;
    e.preventDefault();

    const currentCoursework = form.getValues('coursework') || [];
    if (!currentCoursework.includes(courseworkInput.trim())) {
      form.setValue('coursework', [...currentCoursework, courseworkInput.trim()], { shouldDirty: true });
    }
    setCourseworkInput('');
  };

  const removeCoursework = (itemToRemove: string) => {
    const currentCoursework = form.getValues('coursework') || [];
    form.setValue('coursework', currentCoursework.filter((item) => item !== itemToRemove), { shouldDirty: true });
  };

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      await updateMutation.mutateAsync({
        data: {
          university: values.university,
          gpa: values.gpa ?? null,
          bio: values.bio || null,
          resumeUrl: values.resumeUrl || null,
          skills: values.skills,
        },
      });
      if (student) {
        await evidenceMutation.mutateAsync({
          data: {
            projects: student.projects.map((project) => ({
              name: project.name,
              description: project.description,
              skills: project.skills,
              url: project.url ?? undefined,
              startedAt: project.startedAt,
              completedAt: project.completedAt,
            })),
            experience: student.experience.map((entry) => ({
              organization: entry.organization,
              title: entry.title,
              description: entry.description,
              skills: entry.skills,
              startedAt: entry.startedAt,
              endedAt: entry.endedAt,
            })),
            education: student.education.length
              ? student.education.map((entry, index) => ({
                  institution: index === 0 ? values.university : entry.institution,
                  degree: entry.degree ?? undefined,
                  fieldOfStudy: entry.fieldOfStudy ?? undefined,
                  coursework: index === 0 ? values.coursework ?? [] : entry.coursework,
                  startDate: entry.startDate,
                  endDate: entry.endDate,
                }))
              : [{
                  institution: values.university,
                  coursework: values.coursework ?? [],
                }],
          },
        });
      }
      await refetch();
      toast({ title: "Profile updated successfully" });
    } catch (saveError) {
      toast({
        variant: "destructive",
        title: "Could not update profile",
        description: saveError instanceof Error ? saveError.message : "Please try again.",
      });
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  if (isError || !student) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">Could not load your profile</h1>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Your profile is unavailable."}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }

  const name = auth?.user?.name ?? "Student";
  const email = auth?.user?.email ?? "";
  const avatarUrl = auth?.user?.avatarUrl ?? "";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your public presence and resume data.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 ring-4 ring-background shadow-md">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl brand-gradient text-white">
                  {name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              
              {student.verified && (
                <Badge variant="outline" className="mt-4 bg-green-50 text-green-700 border-green-200 gap-1 font-medium">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  University Verified
                </Badge>
              )}
              
              <Button variant="outline" size="sm" className="mt-6 w-full">
                <Upload className="h-4 w-4 mr-2" /> Change Photo
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>This information is used by our AI to match you with internships.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="university"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gpa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GPA (Optional)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} value={field.value || ''} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio / Summary</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe your background and what you're looking for..." 
                            className="resize-none h-24" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={() => (
                      <FormItem>
                        <FormLabel>Technical Skills</FormLabel>
                        <CardDescription className="mb-2 text-xs">Add your strongest skills. Press enter to add.</CardDescription>
                        <div className="flex items-center gap-2 mb-3">
                          <Input 
                            value={skillInput} 
                            onChange={e => setSkillInput(e.target.value)} 
                            onKeyDown={handleAddSkill}
                            placeholder="e.g. React, Python, AWS..."
                          />
                          <Button type="button" variant="secondary" onClick={handleAddSkill}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 p-4 bg-muted/30 rounded-lg min-h-[60px]">
                          {form.watch('skills').map(skill => (
                            <Badge key={skill} className="pl-3 pr-1 py-1 brand-gradient text-white border-0 font-medium">
                              {skill}
                              <button 
                                type="button" 
                                onClick={() => removeSkill(skill)}
                                className="ml-2 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {form.watch('skills').length === 0 && (
                            <span className="text-sm text-muted-foreground self-center">No skills added yet.</span>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coursework"
                    render={() => (
                      <FormItem>
                        <FormLabel>Relevant Coursework</FormLabel>
                        <CardDescription className="mb-2 text-xs">List the classes that best demonstrate your technical and academic strengths.</CardDescription>
                        <div className="flex items-center gap-2 mb-3">
                          <Input
                            value={courseworkInput}
                            onChange={e => setCourseworkInput(e.target.value)}
                            onKeyDown={handleAddCoursework}
                            placeholder="e.g. Data Structures, Machine Learning..."
                          />
                          <Button type="button" variant="secondary" onClick={handleAddCoursework}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 p-4 bg-muted/30 rounded-lg min-h-[60px]">
                          {(form.watch('coursework') || []).map(course => (
                            <Badge key={course} className="pl-3 pr-1 py-1 bg-background text-foreground border border-border font-medium">
                              {course}
                              <button
                                type="button"
                                onClick={() => removeCoursework(course)}
                                className="ml-2 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          {(form.watch('coursework') || []).length === 0 && (
                            <span className="text-sm text-muted-foreground self-center">No coursework added yet.</span>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resumeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio or Resume Link</FormLabel>
                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      className="brand-gradient text-white border-0 px-8"
                      disabled={updateMutation.isPending || evidenceMutation.isPending || !form.formState.isDirty}
                    >
                      {updateMutation.isPending || evidenceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
