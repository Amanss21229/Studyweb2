import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, Languages, Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import Home from "@/pages/Home";
import Solution from "@/pages/Solution";
import NotFound from "@/pages/not-found";

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, getLanguageDisplay } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">NEET JEE AI Tutor</h1>
              <p className="text-xs text-muted-foreground">Your Personal Doubt Solver</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2"
                  data-testid="language-selector"
                >
                  <Languages className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {getLanguageDisplay(language)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => setLanguage('english')}
                  className="flex items-center justify-between"
                  data-testid="language-english"
                >
                  <span>English</span>
                  {language === 'english' && <span className="text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('hindi')}
                  data-testid="language-hindi"
                >
                  हिंदी (Hindi)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('hinglish')}
                  data-testid="language-hinglish"
                >
                  Hinglish
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('bengali')}
                  data-testid="language-bengali"
                >
                  বাংলা (Bengali)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="btn-icon"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-primary" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </Button>

            {/* User Profile (Optional) */}
            <Button 
              variant="ghost" 
              className="hidden sm:flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium hidden md:inline">Student</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/solution/:shareUrl">
        {(params) => <Solution shareUrl={params.shareUrl} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Header />
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
