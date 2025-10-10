import { useQuery } from "@tanstack/react-query";
import { usePageMeta } from "@/lib/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import { ExamUpdate } from "@shared/schema";
import { format } from "date-fns";

export default function JeeUpdates() {
  const { data: updates = [], isLoading } = useQuery<ExamUpdate[]>({
    queryKey: ['/api/exam-updates', 'jee'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  usePageMeta(
    "JEE Updates — Exam News & Tips",
    "All important JEE notifications, exam changes and preparation tips. Stay updated with AimAi.",
    "https://aimai.onrender.com/jee-updates",
    "https://aimai.onrender.com/og-image.png"
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl" data-testid="jee-updates-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">JEE Latest Updates</h1>
        <p className="text-muted-foreground">
          Stay updated with authentic JEE exam notifications from NTA
        </p>
      </div>

      <div className="space-y-4">
        {updates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No updates available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          updates.map((update) => (
            <Card key={update.id} className="hover:shadow-lg transition-shadow" data-testid={`update-${update.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl">{update.title}</CardTitle>
                  {update.isVerified && (
                    <Badge variant="default" className="bg-green-500">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 whitespace-pre-line">
                  {update.description}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(update.publishedAt), "PPP")}
                  </div>
                  {update.sourceUrl && (
                    <a
                      href={update.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline"
                      data-testid={`source-link-${update.id}`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Source
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
