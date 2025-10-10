import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Bookmark, Calendar, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { useState } from "react";

interface SavedSolution {
  id: string;
  solutionText: string;
  subject: string;
  chapter: string | null;
  topic: string | null;
  shareUrl: string;
  createdAt: string;
  question: {
    id: string;
    questionText: string;
  };
  conversation: {
    id: string;
    title: string | null;
  };
}

export default function SavedSolutions() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: savedSolutions, isLoading } = useQuery<SavedSolution[]>({
    queryKey: ['/api/saved-solutions'],
  });

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="saved-solutions-page">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Saved Solutions</h1>
            <p className="text-muted-foreground">Quick access to your bookmarked solutions</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-muted rounded w-full"></div>
              </Card>
            ))}
          </div>
        ) : !savedSolutions || savedSolutions.length === 0 ? (
          <Card className="p-12 text-center" data-testid="empty-saved">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Saved Solutions Yet</h3>
            <p className="text-muted-foreground mb-6">
              Bookmark solutions to quickly access them later.
            </p>
            <Button asChild data-testid="button-start-learning">
              <Link href="/">Start Learning</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedSolutions.map(item => (
              <Card 
                key={item.id} 
                className="p-6 hover:shadow-lg transition-all"
                data-testid={`solution-${item.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-primary fill-primary" />
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {item.subject}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(item.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2" data-testid={`question-${item.id}`}>
                  {item.question.questionText}
                </h3>

                {(item.chapter || item.topic) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.chapter && (
                      <span className="text-xs px-2 py-1 rounded-md bg-muted">
                        📚 {item.chapter}
                      </span>
                    )}
                    {item.topic && (
                      <span className="text-xs px-2 py-1 rounded-md bg-muted">
                        🎯 {item.topic}
                      </span>
                    )}
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm line-clamp-4" data-testid={`solution-text-${item.id}`}>
                    {item.solutionText}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(`${window.location.origin}/solution/${item.shareUrl}`, item.id)}
                    data-testid={`button-copy-${item.id}`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Share
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
