import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Blog() {
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['/api/blog'],
  });

  const renderBlogCard = (post: any) => (
    <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow" data-testid={`card-blog-${post.id}`}>
      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
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
      
      {post.category && (
        <span className="inline-block px-3 py-1 bg-primary/10 rounded-full text-xs font-medium mb-3">
          {post.category.toUpperCase()}
        </span>
      )}
      
      <Link href={`/blog/${post.slug}`}>
        <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`text-blog-title-${post.id}`}>
          {post.title}
        </h3>
      </Link>
      
      <p className="text-muted-foreground mb-4 line-clamp-3">
        {post.excerpt}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">By {post.authorName}</span>
        <Link href={`/blog/${post.slug}`}>
          <Button size="sm" data-testid={`button-read-${post.id}`}>Read More</Button>
        </Link>
      </div>
    </Card>
  );

  return (
    <>
      <SEOHead
        title="NEET & JEE Study Guides and Tips 2025 | AIMAI Blog"
        description="Expert tips, study guides, and strategies for NEET and JEE 2025 preparation. Learn how to crack NEET/JEE with AI-powered study methods."
        keywords="NEET preparation tips, JEE study guide, NEET 2025 strategy, JEE 2025 tips, how to crack NEET, JEE preparation, AIMAI blog"
        canonicalUrl={`${window.location.origin}/blog`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gold-glow-text" data-testid="text-page-title">
              AIMAI Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert guides, tips, and strategies to ace NEET & JEE 2025 with AI-powered learning
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-32" />
                </Card>
              ))}
            </div>
          ) : blogPosts && blogPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map(renderBlogCard)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">No blog posts available yet. Check back soon!</p>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
