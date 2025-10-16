import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ExternalLink, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function News() {
  const { data: allNews, isLoading } = useQuery({
    queryKey: ['/api/news'],
  });

  const { data: neetNews } = useQuery({
    queryKey: ['/api/news?examType=neet'],
  });

  const { data: jeeNews } = useQuery({
    queryKey: ['/api/news?examType=jee'],
  });

  const renderNewsCard = (article: any) => (
    <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow" data-testid={`card-news-${article.id}`}>
      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {article.viewCount} views
        </span>
        <span className="px-2 py-1 bg-primary/10 rounded-full text-xs font-medium">
          {article.examType.toUpperCase()}
        </span>
      </div>
      <Link href={`/news/${article.slug}`}>
        <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`text-news-title-${article.id}`}>
          {article.title}
        </h3>
      </Link>
      <p className="text-muted-foreground mb-4 line-clamp-3">
        {article.excerpt || article.description}
      </p>
      <div className="flex gap-2">
        <Link href={`/news/${article.slug}`}>
          <Button variant="default" size="sm" data-testid={`button-read-${article.id}`}>
            Read Full Article
          </Button>
        </Link>
        {article.sourceUrl && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(article.sourceUrl, '_blank')}
            data-testid={`button-source-${article.id}`}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Source
          </Button>
        )}
      </div>
    </Card>
  );

  const renderNewsList = (newsList: any[] | undefined) => {
    if (!newsList || newsList.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No news articles available yet.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {newsList.map(renderNewsCard)}
      </div>
    );
  };

  return (
    <>
      <SEOHead
        title="NEET & JEE Latest News and Updates 2025 | AIMAI"
        description="Stay updated with the latest NEET 2025 and JEE 2025 news, exam dates, registration updates, syllabus changes, and important announcements from NTA."
        keywords="NEET 2025 news, JEE 2025 updates, NTA notifications, NEET exam date, JEE registration, NEET syllabus 2025, JEE 2025 latest news"
        canonicalUrl={`${window.location.origin}/news`}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gold-glow-text" data-testid="text-page-title">
              NEET & JEE News 2025
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get the latest updates, exam notifications, and important news for NEET and JEE aspirants
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="all" data-testid="tab-all">All News</TabsTrigger>
              <TabsTrigger value="neet" data-testid="tab-neet">NEET</TabsTrigger>
              <TabsTrigger value="jee" data-testid="tab-jee">JEE</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
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
              ) : (
                renderNewsList(allNews)
              )}
            </TabsContent>

            <TabsContent value="neet">
              {renderNewsList(neetNews)}
            </TabsContent>

            <TabsContent value="jee">
              {renderNewsList(jeeNews)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
