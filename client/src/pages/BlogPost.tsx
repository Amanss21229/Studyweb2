import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { ShareButtons } from "@/components/ShareButtons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Eye, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface BlogPostProps {
  slug: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/blog/${slug}`],
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-6">Sorry, we couldn't find this blog post.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}/blog/${slug}`;
  const metaTitle = post.metaTitle || `${post.title} | AIMAI Blog`;
  const metaDescription = post.metaDescription || post.excerpt;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": metaDescription,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "AIMAI",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "image": post.imageUrl || `${window.location.origin}/logo.png`,
    "articleSection": post.category || "Education"
  };

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        keywords={post.keywords || `NEET preparation, JEE tips, study guide, ${post.category || 'education'}`}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
        ogImage={post.imageUrl}
        ogType="article"
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <Card className="p-8">
            {post.category && (
              <div className="mb-6">
                <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium">
                  {post.category.toUpperCase()}
                </span>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-post-title">
              {post.title}
            </h1>

            {post.imageUrl && (
              <img 
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-auto rounded-lg mb-6"
                data-testid="img-post"
              />
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.authorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
              </span>
              {post.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} views
              </span>
            </div>

            {post.excerpt && (
              <div className="text-lg text-muted-foreground italic mb-6 pb-6 border-b">
                {post.excerpt}
              </div>
            )}

            <div 
              className="prose dark:prose-invert max-w-none mb-8"
              data-testid="text-post-content"
              dangerouslySetInnerHTML={{ 
                __html: post.content.replace(/\n/g, '<br>') 
              }}
            />

            <div className="pt-6 border-t">
              <ShareButtons 
                url={`/blog/${slug}`}
                title={post.title}
                text={`Check out this helpful guide on AIMAI`}
              />
            </div>
          </Card>

          <Card className="p-6 mt-6 bg-primary/5">
            <h3 className="text-lg font-semibold mb-2">Ask. Learn. Repeat. — Powered by AIMAI 🤖</h3>
            <p className="text-muted-foreground mb-4">
              Have NEET or JEE doubts? Get instant AI-powered answers to ace your exams!
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
