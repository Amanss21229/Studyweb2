import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { ShareButtons } from "@/components/ShareButtons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Eye, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface NewsArticleProps {
  slug: string;
}

export default function NewsArticle({ slug }: NewsArticleProps) {
  const { data: article, isLoading, error } = useQuery({
    queryKey: [`/api/news/${slug}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <Card className="p-8">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, we couldn't find this news article.</p>
          <Link href="/news">
            <Button>Back to News</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}/news/${slug}`;
  const metaTitle = article.metaTitle || `${article.title} | AIMAI NEET JEE News`;
  const metaDescription = article.metaDescription || article.excerpt || article.description;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": metaDescription,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Organization",
      "name": "AIMAI"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AIMAI",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "image": article.imageUrl || `${window.location.origin}/logo.png`
  };

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        keywords={article.keywords || `NEET news, JEE news, ${article.examType} updates, NTA notifications`}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
        ogImage={article.imageUrl}
        ogType="article"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/news">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>

          <Card className="p-8">
            <div className="mb-6">
              <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                {article.examType.toUpperCase()}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-article-title">
              {article.title}
            </h1>

            {article.imageUrl && (
              <img 
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-auto rounded-lg mb-6"
                data-testid="img-article"
              />
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.publishedAt), 'MMMM dd, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.viewCount} views
              </span>
              {article.sourceUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => window.open(article.sourceUrl, '_blank')}
                  data-testid="link-source"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Official Source
                </Button>
              )}
            </div>

            <div 
              className="prose dark:prose-invert max-w-none mb-8"
              data-testid="text-article-content"
              dangerouslySetInnerHTML={{ 
                __html: article.content.replace(/\n/g, '<br>') 
              }}
            />

            <div className="pt-6 border-t">
              <ShareButtons 
                url={`/news/${slug}`}
                title={article.title}
                text={`Check out this ${article.examType.toUpperCase()} news on AIMAI`}
              />
            </div>
          </Card>

          <Card className="p-6 mt-6 bg-primary/5">
            <h3 className="text-lg font-semibold mb-2">Ask. Learn. Repeat. — Powered by AIMAI 🤖</h3>
            <p className="text-muted-foreground mb-4">
              Have questions about NEET or JEE? Get instant AI-powered answers!
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
