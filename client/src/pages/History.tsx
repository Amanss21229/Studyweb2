import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface Question {
  id: string;
  questionText: string;
  subject?: string;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  questionCount: number;
}

export default function History() {
  const { data: history, isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['/api/history'],
  });

  const groupByDate = (items: HistoryItem[] = []) => {
    const grouped: Record<string, HistoryItem[]> = {};
    
    items.forEach(item => {
      const date = format(parseISO(item.createdAt), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    
    return Object.entries(grouped).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const groupedHistory = groupByDate(history);

  return (
    <div className="min-h-screen bg-background" data-testid="history-page">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Conversation History</h1>
            <p className="text-muted-foreground">View all your past conversations organized by date</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        ) : groupedHistory.length === 0 ? (
          <Card className="p-12 text-center" data-testid="empty-history">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start asking questions to build your conversation history.
            </p>
            <Button asChild data-testid="button-start-learning">
              <Link href="/">Start Learning</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedHistory.map(([date, conversations]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold" data-testid={`date-${date}`}>
                    {format(parseISO(date), 'MMMM d, yyyy')}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'})
                  </span>
                </div>
                
                <div className="space-y-3">
                  {conversations.map(conv => (
                    <Card 
                      key={conv.id} 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      data-testid={`conversation-${conv.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2" data-testid={`title-${conv.id}`}>
                            {conv.title || 'Untitled Conversation'}
                          </h3>
                          {conv.questions.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {conv.questions[0].questionText}
                              </p>
                              {conv.questions[0].subject && (
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                  {conv.questions[0].subject}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span>{conv.questionCount}</span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Last updated: {format(parseISO(conv.updatedAt), 'h:mm a')}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
