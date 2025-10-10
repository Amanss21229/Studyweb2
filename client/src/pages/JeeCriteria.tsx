import { useQuery } from "@tanstack/react-query";
import { usePageMeta } from "@/lib/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, FileText, GraduationCap } from "lucide-react";
import { ExamCriteria } from "@shared/schema";
import { format } from "date-fns";

export default function JeeCriteria() {
  const { data: criteria, isLoading } = useQuery<ExamCriteria>({
    queryKey: ['/api/exam-criteria', 'jee'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  usePageMeta(
    "JEE Eligibility & Criteria",
    "Detailed JEE eligibility criteria, important guidelines and preparation pointers — from AimAi.",
    "https://aimai.onrender.com/jee-criteria",
    "https://aimai.onrender.com/og-image.png"
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl" data-testid="jee-criteria-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">JEE Exam Criteria & Pattern</h1>
        <p className="text-muted-foreground">
          Complete information about JEE exam pattern, eligibility criteria, and syllabus
        </p>
      </div>

      {!criteria ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No criteria information available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Exam Pattern</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-muted-foreground">{criteria.pattern}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle>Eligibility Criteria</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-muted-foreground">{criteria.criteria}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Syllabus</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {criteria.syllabus.subjects.map((subject, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-lg mb-3">{subject.name}</h3>
                    <ul className="space-y-2">
                      {subject.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-muted-foreground">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Last updated: {format(new Date(criteria.lastUpdated), "PPP")}
          </div>
        </div>
      )}
    </div>
  );
}
