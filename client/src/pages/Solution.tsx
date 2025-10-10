import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareModal } from "@/components/ShareModal";
import { 
  ArrowLeft, 
  Share2, 
  Copy, 
  CheckCheck, 
  Bot, 
  ExternalLink 
} from "lucide-react";
import { getSolution } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import usePageMeta from "@/lib/usePageMeta";

interface SolutionPageProps {
  shareUrl: string;
}

export default function Solution({ shareUrl }: SolutionPageProps) {
  const [, setLocation] = useLocation();
  const [showShareModal, setShowShareModal] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/solutions', shareUrl],
    queryFn: () => getSolution(shareUrl),
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Solution copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading solution...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold mb-2">Solution Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This solution link may have expired or doesn't exist.
            </p>
            <Button onClick={() => setLocation('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { solution, question } = data;

    // ✅ Dynamic SEO meta tags
  usePageMeta(
    `${question.questionText?.slice(0, 60)} | NEET & JEE Solution by AimAi`,
    `Get detailed AI-generated explanation for "${question.questionText}" covering ${solution.subject || 'subject'} and ${solution.topic || 'topic'} for NEET, JEE & NCERT exams.`
  );
  
  return (
    <div className="min-h-screen bg-background" data-testid="solution-page">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="flex items-center space-x-2"
              data-testid="back-button"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tutor</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(solution.solutionText)}
                data-testid="copy-solution"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button 
                onClick={() => setShowShareModal(true)}
                data-testid="share-solution"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Question */}
        <Card className="mb-6 card-elevated" data-testid="question-card">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">Q</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">Question</Badge>
                  {question.inputType && (
                    <Badge variant="secondary">{question.inputType}</Badge>
                  )}
                </div>
                <p className="text-lg leading-relaxed">{question.questionText}</p>
                {question.imageUrl && (
                  <img 
                    src={question.imageUrl} 
                    alt="Question" 
                    className="mt-4 max-w-full rounded-lg border"
                  />
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Asked on {formatTime(question.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solution */}
        <Card className="card-elevated" data-testid="solution-card">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className="bg-primary/10 text-primary">
                    {solution.subject}
                  </Badge>
                  {solution.chapter && (
                    <Badge variant="outline" className="bg-secondary/10 text-secondary">
                      Ch. {solution.chapter}
                    </Badge>
                  )}
                  {solution.topic && (
                    <Badge variant="outline">{solution.topic}</Badge>
                  )}
                </div>
                
                <div className="prose max-w-none">
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {solution.solutionText}
                  </div>
                </div>
                
                {solution.neetJeePyq && (solution.neetJeePyq.neet?.length || solution.neetJeePyq.jee?.length) && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 mt-6">
                    <p className="font-medium text-success mb-2 flex items-center">
                      <CheckCheck className="h-4 w-4 mr-2" />
                      NEET/JEE PYQ Reference:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {solution.neetJeePyq.neet?.length && `NEET: ${solution.neetJeePyq.neet.join(', ')}`}
                      {solution.neetJeePyq.neet?.length && solution.neetJeePyq.jee?.length && ' | '}
                      {solution.neetJeePyq.jee?.length && `JEE: ${solution.neetJeePyq.jee.join(', ')}`}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Solved on {formatTime(solution.createdAt)} • Language: {solution.language}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(solution.solutionText)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Have more NEET/JEE doubts? Get instant solutions!
          </p>
          <Button 
            size="lg" 
            onClick={() => setLocation('/')}
            className="hover-lift"
          >
            Start New Conversation
          </Button>
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        message={{
          id: solution.id,
          type: 'solution',
          text: solution.solutionText,
          subject: solution.subject,
          chapter: solution.chapter,
          topic: solution.topic,
          shareUrl: solution.shareUrl,
          neetJeePyq: solution.neetJeePyq,
          createdAt: solution.createdAt,
        }}
      />
    </div>
  );
}
