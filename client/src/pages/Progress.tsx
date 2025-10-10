import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, BookOpen, Target, Activity, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";

interface ProgressData {
  totalQuestions: number;
  subjectBreakdown: Record<string, { 
    count: number; 
    topics: string[]; 
    chapters: string[] 
  }>;
  weakAreas: Array<{ subject: string; chapter: string; count: number }>;
  strongAreas: Array<{ subject: string; chapter: string; count: number }>;
  recentActivity: Array<{ date: string; count: number }>;
}

const subjectIcons: Record<string, string> = {
  physics: '⚛️',
  chemistry: '🧪',
  math: '📐',
  biology: '🧬',
};

const subjectColors: Record<string, string> = {
  physics: 'bg-blue-500',
  chemistry: 'bg-green-500',
  math: 'bg-purple-500',
  biology: 'bg-pink-500',
};

export default function Progress() {
  const { data: progress, isLoading } = useQuery<ProgressData>({
    queryKey: ['/api/progress'],
  });

  const totalSubjects = Object.keys(progress?.subjectBreakdown || {}).length;
  const maxQuestions = Math.max(...Object.values(progress?.subjectBreakdown || {}).map(s => s.count), 1);

  return (
    <div className="min-h-screen bg-background" data-testid="progress-page">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Progress Report</h1>
            <p className="text-muted-foreground">Detailed analysis of your learning journey</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </Card>
            ))}
          </div>
        ) : !progress || progress.totalQuestions === 0 ? (
          <Card className="p-12 text-center" data-testid="empty-progress">
            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Progress Data Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start solving questions to track your progress and identify areas for improvement.
            </p>
            <Button asChild data-testid="button-start-learning">
              <Link href="/">Start Learning</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6" data-testid="stat-total-questions">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-2xl font-bold">{progress.totalQuestions}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6" data-testid="stat-subjects">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subjects Covered</p>
                    <p className="text-2xl font-bold">{totalSubjects}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6" data-testid="stat-topics">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <CheckCircle className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Topics Explored</p>
                    <p className="text-2xl font-bold">
                      {Object.values(progress.subjectBreakdown).reduce((sum, s) => sum + s.topics.length, 0)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6" data-testid="stat-chapters">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-success/10">
                    <Activity className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chapters Studied</p>
                    <p className="text-2xl font-bold">
                      {Object.values(progress.subjectBreakdown).reduce((sum, s) => sum + s.chapters.length, 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Subject Breakdown */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Subject-wise Distribution</h2>
              <div className="space-y-4">
                {Object.entries(progress.subjectBreakdown).map(([subject, data]) => {
                  const percentage = (data.count / progress.totalQuestions) * 100;
                  return (
                    <div key={subject} data-testid={`subject-${subject}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{subjectIcons[subject] || '📚'}</span>
                          <span className="font-medium capitalize">{subject}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{data.count}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <ProgressBar value={percentage} className="h-3" />
                      <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                        <span>{data.chapters.length} chapters</span>
                        <span>•</span>
                        <span>{data.topics.length} topics</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Weak Areas */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold">Areas to Improve</h2>
                </div>
                {progress.weakAreas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keep practicing to identify areas for improvement!</p>
                ) : (
                  <div className="space-y-3">
                    {progress.weakAreas.map((area, idx) => (
                      <div 
                        key={`${area.subject}-${area.chapter}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20"
                        data-testid={`weak-area-${idx}`}
                      >
                        <div>
                          <p className="font-medium capitalize">{area.subject}</p>
                          <p className="text-sm text-muted-foreground">{area.chapter}</p>
                        </div>
                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {area.count} {area.count === 1 ? 'question' : 'questions'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Strong Areas */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Strong Areas</h2>
                </div>
                {progress.strongAreas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keep solving questions to identify your strengths!</p>
                ) : (
                  <div className="space-y-3">
                    {progress.strongAreas.map((area, idx) => (
                      <div 
                        key={`${area.subject}-${area.chapter}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20"
                        data-testid={`strong-area-${idx}`}
                      >
                        <div>
                          <p className="font-medium capitalize">{area.subject}</p>
                          <p className="text-sm text-muted-foreground">{area.chapter}</p>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {area.count} {area.count === 1 ? 'question' : 'questions'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity (Last 30 Days)</h2>
              <div className="flex items-end gap-1 h-32">
                {progress.recentActivity.slice(0, 30).reverse().map((day, idx) => {
                  const height = (day.count / Math.max(...progress.recentActivity.map(d => d.count))) * 100;
                  return (
                    <div 
                      key={day.date}
                      className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t relative group"
                      style={{ height: `${height}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
                      data-testid={`activity-${idx}`}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg z-10">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {day.count} {day.count === 1 ? 'question' : 'questions'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Hover over bars to see details
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
