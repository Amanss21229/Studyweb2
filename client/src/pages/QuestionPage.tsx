import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { ShareButtons } from "@/components/ShareButtons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionPageProps {
  slug: string;
}

export default function QuestionPage({ slug }: QuestionPageProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/seo-questions/${slug}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Card className="p-8 mb-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Question Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find the question you're looking for.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { question, solution, relatedQuestions, metaTitle, metaDescription, keywords } = data;
  const canonicalUrl = `${window.location.origin}/question/${slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": question?.questionText,
      "text": question?.questionText,
      "answerCount": 1,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": solution?.solutionText,
        "upvoteCount": 1
      },
      "about": {
        "@type": "Thing",
        "name": question?.subject
      }
    }
  };

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        keywords={keywords || 'NEET, JEE, question, answer, solution'}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
        ogType="article"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="p-8 mb-6 border-2 border-primary/20">
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-question">
                  {question?.questionText}
                </h1>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {question?.subject && (
                    <span className="px-3 py-1 bg-primary/10 rounded-full">
                      {question.subject}
                    </span>
                  )}
                  {question?.chapter && (
                    <span className="px-3 py-1 bg-muted rounded-full">
                      {question.chapter}
                    </span>
                  )}
                  {question?.topic && (
                    <span className="px-3 py-1 bg-muted rounded-full">
                      {question.topic}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold">AI Answer</h2>
              </div>
              <div 
                className="prose dark:prose-invert max-w-none text-foreground"
                data-testid="text-solution"
                dangerouslySetInnerHTML={{ 
                  __html: solution?.solutionText.replace(/\n/g, '<br>') 
                }}
              />
            </div>

            {solution?.neetJeePyq && (solution.neetJeePyq.neet || solution.neetJeePyq.jee) && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
                  Previous Year Questions (PYQ)
                </h3>
                {solution.neetJeePyq.neet && solution.neetJeePyq.neet.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium">NEET:</span> {solution.neetJeePyq.neet.join(', ')}
                  </div>
                )}
                {solution.neetJeePyq.jee && solution.neetJeePyq.jee.length > 0 && (
                  <div>
                    <span className="font-medium">JEE:</span> {solution.neetJeePyq.jee.join(', ')}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <ShareButtons 
                url={`/question/${slug}`}
                title={question?.questionText || 'NEET/JEE Question Solution'}
                text={`Check out this ${question?.subject || 'NEET/JEE'} question answer on AIMAI`}
              />
            </div>
          </Card>

          {relatedQuestions && relatedQuestions.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Related NEET/JEE Questions</h2>
              <div className="grid gap-4">
                {relatedQuestions.map((rq: any) => (
                  <Link key={rq.id} href={`/question/${rq.slug}`}>
                    <Card className="p-4 hover:border-primary/50 transition-colors cursor-pointer" data-testid={`card-related-${rq.id}`}>
                      <h3 className="font-medium text-primary hover:underline">
                        {rq.metaTitle || 'Related Question'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rq.metaDescription}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Card className="p-6 bg-primary/5">
            <h3 className="text-lg font-semibold mb-2">Ask. Learn. Repeat. — Powered by AIMAI 🤖</h3>
            <p className="text-muted-foreground mb-4">
              Get instant AI-powered answers to all your NEET & JEE doubts. Save, share, and ace your exams!
            </p>
            <Link href="/">
              <Button data-testid="button-ask-question">Ask Your Question</Button>
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
