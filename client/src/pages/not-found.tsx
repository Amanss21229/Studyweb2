import { Card, CardContent } from "@/components/ui/card";
import { usePageMeta } from "@/lib/usePageMeta";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/IMG_20250913_000900_129_1759602426440.jpg";

export default function NotFound() {
  usePageMeta(
    "Page Not Found — AimAi",
    "The page you were looking for could not be found. Go back to AimAi home for NEET & JEE practice.",
    "https://aimai.onrender.com/",
    "https://aimai.onrender.com/og-image.png"
  );
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 card-elevated premium-border">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden logo-shine premium-border">
            <img 
              src={logoImage} 
              alt="AimAi Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold gold-glow-text">404</h1>
          </div>

          <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
          
          <p className="text-sm text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Button 
            asChild
            className="premium-gradient text-white hover:opacity-90 font-semibold shadow-lg"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
