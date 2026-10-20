import React from 'react';
import { Link } from 'wouter';
import { AlertCircle, ArrowRight, Clock3, Loader2, RotateCcw, Send, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

type Choice = { id: string; label: string };
type Question = {
  id: number;
  position: number;
  type: string;
  prompt: string;
  options: Choice[] | null;
  answer: string | string[] | null;
  earnedPoints: number | string | null;
  explanation: string | null;
};
type Attempt = {
  id: number;
  status: 'in_progress' | 'pending_review' | 'submitted' | 'expired';
  startedAt: string;
  expiresAt: string;
  overallScore: number | null;
  resultExplanation: string | null;
  questions: Question[];
};
type Assessment = {
  id: number;
  title: string;
  skill: string;
  difficulty: string;
  durationMinutes: number;
  questionCount: number;
};
type AssessmentHistory = {
  id: number;
  title: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  overallScore: number | null;
  skillScores: { skill: string; score: number }[];
};
type Recommendation = {
  id: number;
  title: string;
  companyName: string;
  description: string;
  location: string | null;
  matchScore: number | null;
  evidenceCoverage: number;
  matchExplanation: string;
  eligible: boolean;
  eligibilityReasons: string[];
};

const apiBase = `${(import.meta.env.BASE_URL ?? '').replace(/\/$/, '')}/api`;

class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function requestApi<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const savedAuth = window.localStorage.getItem('koda_auth');
  const token = savedAuth ? (JSON.parse(savedAuth) as { token?: string }).token : undefined;
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiRequestError(
      typeof result?.error === 'string' ? result.error : `Request failed (${response.status})`,
      response.status,
    );
  }
  return result as T;
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function StudentTalent() {
  const { auth } = useAuth();
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [assessmentHistory, setAssessmentHistory] = React.useState<AssessmentHistory[]>([]);
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [profileSkills, setProfileSkills] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState('');
  const [skillsSaved, setSkillsSaved] = React.useState(false);
  const [attempt, setAttempt] = React.useState<Attempt | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [working, setWorking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(Date.now());
  const attemptStorageKey = `koda_talent_attempt_${auth?.user.id ?? 0}`;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assessmentList, history, recommendationList, profile] = await Promise.all([
        requestApi<Assessment[]>('/talent/assessments'),
        requestApi<AssessmentHistory[]>('/talent/assessment-history'),
        requestApi<Recommendation[]>('/talent/recommendations'),
        requestApi<{ skills: string[] }>('/talent/profile'),
      ]);
      setAssessments(assessmentList);
      setAssessmentHistory(history);
      setRecommendations(recommendationList);
      setProfileSkills(profile.skills);
      const attemptId = window.localStorage.getItem(attemptStorageKey);
      if (attemptId) {
        try {
          const savedAttempt = await requestApi<Attempt>(`/talent/attempts/${encodeURIComponent(attemptId)}`);
          if (savedAttempt.status === 'in_progress') setAttempt(savedAttempt);
          else {
            setAttempt(savedAttempt);
            window.localStorage.removeItem(attemptStorageKey);
          }
        } catch (resumeError) {
          if (resumeError instanceof ApiRequestError && resumeError.status === 404) {
            window.localStorage.removeItem(attemptStorageKey);
          } else {
            throw resumeError;
          }
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load talent matching data.');
    } finally {
      setLoading(false);
    }
  }, [attemptStorageKey]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startAssessment = async (assessmentId: number) => {
    setWorking(true);
    setError(null);
    try {
      const started = await requestApi<Attempt>(`/talent/assessments/${assessmentId}/attempts`, 'POST');
      setAttempt(started);
      window.localStorage.setItem(attemptStorageKey, String(started.id));
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Could not start the assessment.');
    } finally {
      setWorking(false);
    }
  };

  const refreshMatchSnapshots = async () => {
    setWorking(true);
    setError(null);
    try {
      const updated = await requestApi<Recommendation[]>('/talent/recommendations/refresh', 'POST');
      setRecommendations(updated);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Could not refresh match results.');
    } finally {
      setWorking(false);
    }
  };

  const saveAnswer = async (question: Question, answer: string | string[]) => {
    if (!attempt || attempt.status !== 'in_progress') return;
    setWorking(true);
    setError(null);
    try {
      await requestApi(
        `/talent/attempts/${attempt.id}/answers/${question.id}`,
        'PUT',
        { answer },
      );
      setAttempt((current) => current ? {
        ...current,
        questions: current.questions.map((item) =>
          item.id === question.id ? { ...item, answer } : item,
        ),
      } : current);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your answer.');
    } finally {
      setWorking(false);
    }
  };

  const submitAssessment = async () => {
    if (!attempt) return;
    setWorking(true);
    setError(null);
    try {
      const submitted = await requestApi<Attempt>(`/talent/attempts/${attempt.id}/submit`, 'POST');
      setAttempt(submitted);
      window.localStorage.removeItem(attemptStorageKey);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your assessment.');
    } finally {
      setWorking(false);
    }
  };

  const saveSkills = async () => {
    setWorking(true);
    setError(null);
    setSkillsSaved(false);
    try {
      const result = await requestApi<{ skills: string[] }>('/talent/profile', 'PUT', { skills: profileSkills });
      setProfileSkills(result.skills);
      setSkillsSaved(true);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save skills.');
    } finally {
      setWorking(false);
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || profileSkills.some((item) => item.toLocaleLowerCase() === skill.toLocaleLowerCase())) return;
    setProfileSkills((current) => [...current, skill]);
    setSkillInput('');
    setSkillsSaved(false);
  };

  const timeRemaining = attempt?.status === 'in_progress'
    ? new Date(attempt.expiresAt).getTime() - now
    : null;

  React.useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress' || timeRemaining === null || timeRemaining > 0) return;
    setAttempt((current) => current ? { ...current, status: 'expired' } : current);
    window.localStorage.removeItem(attemptStorageKey);
    setError('Assessment time expired. The attempt was not submitted.');
  }, [attempt, attemptStorageKey, timeRemaining]);

  if (!auth || auth.user.role !== 'student') {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Student access required</CardTitle>
          <CardDescription>Sign in with a student account to use assessments and recommendations.</CardDescription>
        </CardHeader>
        <CardContent><Link href="/login"><Button>Sign in</Button></Link></CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Talent matching</p>
          <h1 className="mt-2 text-3xl font-bold">Assessments & internship matches</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Recommendations use deterministic scores and show the evidence coverage behind each result.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/profile"><Button variant="outline">Update profile</Button></Link>
          <Button variant="outline" onClick={() => void load()} disabled={loading || working}>
            <RotateCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" onClick={() => void refreshMatchSnapshots()} disabled={loading || working}>
            Save match snapshot
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {attempt?.status === 'in_progress' ? (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Timed assessment</CardTitle>
                    <CardDescription>Answers are validated and scored on the server.</CardDescription>
                  </div>
                  <Badge variant={timeRemaining !== null && timeRemaining < 60_000 ? 'destructive' : 'secondary'}>
                    <Clock3 className="mr-1 h-3.5 w-3.5" /> {formatTime(timeRemaining ?? 0)} remaining
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {attempt.questions.map((question) => (
                  <section key={question.id} className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Question {question.position}</p>
                    <h3 className="mt-2 font-medium">{question.prompt}</h3>
                    {question.type === 'short_answer' ? (
                      <textarea
                        value={typeof question.answer === 'string' ? question.answer : ''}
                        maxLength={5000}
                        rows={5}
                        placeholder="Write your response"
                        disabled={working || timeRemaining === null || timeRemaining <= 0}
                        onChange={(event) => setAttempt((current) => current ? {
                          ...current,
                          questions: current.questions.map((item) =>
                            item.id === question.id ? { ...item, answer: event.target.value } : item,
                          ),
                        } : current)}
                        onBlur={(event) => void saveAnswer(question, event.currentTarget.value.trim())}
                        className="mt-4 w-full rounded-md border bg-background p-3 text-sm"
                      />
                    ) : (
                    <div className="mt-4 space-y-2">
                      {(question.options ?? []).map((option) => {
                        const selected = Array.isArray(question.answer)
                          ? question.answer.includes(option.id)
                          : question.answer === option.id;
                        const multiSelect = question.type === 'multi_select';
                        return (
                          <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-md border p-3 hover:bg-muted/40">
                            <input
                              type={multiSelect ? 'checkbox' : 'radio'}
                              name={`question-${question.id}`}
                              checked={selected}
                              disabled={working || timeRemaining === null || timeRemaining <= 0}
                              onChange={() => {
                                const answer = multiSelect
                                  ? (Array.isArray(question.answer) ? question.answer : [])
                                    .filter((id) => id !== option.id)
                                    .concat(selected ? [] : [option.id])
                                  : option.id;
                                void saveAnswer(question, answer);
                              }}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    )}
                  </section>
                ))}
                <Button
                  onClick={() => void submitAssessment()}
                  disabled={working || timeRemaining === null || timeRemaining <= 0 || attempt.questions.some((question) =>
                    question.answer === null ||
                    (question.type === 'short_answer' && (typeof question.answer !== 'string' || !question.answer.trim()))
                  )}
                >
                  {working ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submit assessment
                </Button>
              </CardContent>
            </Card>
          ) : attempt && (attempt.status === 'submitted' || attempt.status === 'pending_review') ? (
            <Card>
              <CardHeader>
                <CardTitle>{attempt.status === 'pending_review' ? 'Assessment awaiting review' : 'Assessment result'}</CardTitle>
                <CardDescription>{attempt.resultExplanation}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-3xl font-bold">
                  {attempt.overallScore === null ? 'Pending human review' : `${attempt.overallScore}%`}
                </p>
                {attempt.questions.map((question) => (
                  <div key={question.id} className="rounded-lg border p-4">
                    <p className="font-medium">{question.prompt}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Points: {question.earnedPoints ?? '—'}</p>
                    {question.explanation && <p className="mt-2 text-sm">{question.explanation}</p>}
                  </div>
                ))}
                <Button variant="outline" onClick={() => setAttempt(null)}>Back to assessments</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Technical assessments</CardTitle>
                <CardDescription>Only reviewed and published question sets can be started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {assessments.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No reviewed assessments are available yet. Your profile and internship recommendations remain usable while assessment content is prepared.
                  </p>
                ) : assessments.map((assessment) => (
                  <div key={assessment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">{assessment.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {assessment.skill} · {assessment.difficulty} · {assessment.questionCount} questions · {assessment.durationMinutes} minutes
                      </p>
                    </div>
                    <Button onClick={() => void startAssessment(assessment.id)} disabled={working}>
                      Start <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Skills used for matching</CardTitle>
              <CardDescription>Only skills saved to your account are used in recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profileSkills.length === 0 && (
                  <p className="text-sm text-muted-foreground">Add skills from your projects or coursework to improve evidence coverage.</p>
                )}
                {profileSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      disabled={working}
                      onClick={() => {
                        setProfileSkills((current) => current.filter((item) => item !== skill));
                        setSkillsSaved(false);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  maxLength={100}
                  placeholder="Add a skill"
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => void saveSkills()} disabled={working}>
                  {working ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save skills
                </Button>
                {skillsSaved && <span className="text-sm text-muted-foreground">Skills saved.</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment history</CardTitle>
              <CardDescription>Your submitted attempts and deterministic skill scores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assessmentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Completed assessments will appear here.</p>
              ) : assessmentHistory.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.status === 'submitted'
                        ? `${item.overallScore}% overall`
                        : item.status.replace('_', ' ')}
                    </p>
                    {item.skillScores.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.skillScores.map(({ skill, score }) => `${skill} ${score}%`).join(' · ')}
                      </p>
                    )}
                  </div>
                  {item.status === 'submitted' && <Badge variant="secondary">Complete</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Recommended internships</h2>
              <p className="text-sm text-muted-foreground">Missing evidence is excluded from the score and reflected in coverage.</p>
            </div>
            {recommendations.length === 0 ? (
              <Card><CardContent className="p-6 text-sm text-muted-foreground">No open internships are available to match right now.</CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.map((recommendation) => (
                  <Card key={recommendation.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                          <CardDescription>{recommendation.companyName}{recommendation.location ? ` · ${recommendation.location}` : ''}</CardDescription>
                        </div>
                        <Badge variant={recommendation.matchScore === null ? 'outline' : 'secondary'}>
                          {recommendation.matchScore === null ? 'Not enough evidence' : `${Math.round(recommendation.matchScore)}% match`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{recommendation.matchExplanation}</p>
                      <p className="text-xs text-muted-foreground">Evidence coverage: {Math.round(recommendation.evidenceCoverage)}%</p>
                      <Badge variant={recommendation.eligible ? 'secondary' : 'outline'}>
                        {recommendation.eligible ? 'Eligible' : 'Eligibility criteria not met'}
                      </Badge>
                      {recommendation.eligibilityReasons.length > 0 && (
                        <ul className="list-disc pl-5 text-xs text-muted-foreground">
                          {recommendation.eligibilityReasons.map((reason) => <li key={reason}>{reason}</li>)}
                        </ul>
                      )}
                      <Link href={`/internships/${recommendation.id}`} className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                        View internship <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
