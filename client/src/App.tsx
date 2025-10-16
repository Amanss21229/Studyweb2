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
import { Languages, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import logoImage from "@assets/IMG_20250913_000900_129_1759602426440.jpg";
import Home from "@/pages/Home";
import Solution from "@/pages/Solution";
import History from "@/pages/History";
import SavedSolutions from "@/pages/SavedSolutions";
import Progress from "@/pages/Progress";
import ApiKeys from "@/pages/ApiKeys";
import NeetUpdates from "@/pages/NeetUpdates";
import JeeUpdates from "@/pages/JeeUpdates";
import NeetCriteria from "@/pages/NeetCriteria";
import JeeCriteria from "@/pages/JeeCriteria";
import ContactUs from "@/pages/ContactUs";
import AboutUs from "@/pages/AboutUs";
import TermsOfUse from "@/pages/TermsOfUse";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import ChildSafety from "@/pages/ChildSafety";
import GrievanceRedressal from "@/pages/GrievanceRedressal";
import QuestionPage from "@/pages/QuestionPage";
import News from "@/pages/News";
import NewsArticle from "@/pages/NewsArticle";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import NotFound from "@/pages/not-found";

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, getLanguageDisplay } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 dark:bg-card/90">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden logo-shine premium-border premium-glow flex-shrink-0">
              <img 
                src={logoImage} 
                alt="AimAi Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold gold-glow-text tracking-tight">
                AimAi
              </h1>
              <p className="text-[10px] text-primary font-semibold tracking-wide">
                POWERED BY SANSA LEARN
              </p>
              <p className="text-[9px] text-muted-foreground hidden sm:block">
                Ask. Learn. Repeat. — Powered by AIMAI 🤖
              </p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 hover:bg-primary/10"
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
              className="btn-icon hover:bg-primary/10"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-primary" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
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
      <Route path="/history" component={History} />
      <Route path="/saved-solutions" component={SavedSolutions} />
      <Route path="/progress" component={Progress} />
      <Route path="/api-keys" component={ApiKeys} />
      <Route path="/neet-updates" component={NeetUpdates} />
      <Route path="/jee-updates" component={JeeUpdates} />
      <Route path="/neet-criteria" component={NeetCriteria} />
      <Route path="/jee-criteria" component={JeeCriteria} />
      <Route path="/contact-us" component={ContactUs} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/terms-of-use" component={TermsOfUse} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/child-safety" component={ChildSafety} />
      <Route path="/grievance-redressal" component={GrievanceRedressal} />
      <Route path="/solution/:shareUrl">
        {(params) => <Solution shareUrl={params.shareUrl} />}
      </Route>
      <Route path="/question/:slug">
        {(params) => <QuestionPage slug={params.slug} />}
      </Route>
      <Route path="/news" component={News} />
      <Route path="/news/:slug">
        {(params) => <NewsArticle slug={params.slug} />}
      </Route>
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug">
        {(params) => <BlogPost slug={params.slug} />}
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
