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
import { Languages, Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { redirectToLogin, redirectToLogout } from "@/lib/authUtils";
import logoImage from "@assets/IMG_20250913_000900_129_1759602426440.jpg";
import Home from "@/pages/Home";
import CompleteProfile from "@/pages/CompleteProfile";
import Solution from "@/pages/Solution";
import History from "@/pages/History";
import SavedSolutions from "@/pages/SavedSolutions";
import Progress from "@/pages/Progress";
import NeetUpdates from "@/pages/NeetUpdates";
import JeeUpdates from "@/pages/JeeUpdates";
import NeetCriteria from "@/pages/NeetCriteria";
import JeeCriteria from "@/pages/JeeCriteria";
import NotFound from "@/pages/not-found";

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, getLanguageDisplay } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();

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
                Your personal AI tutor for NEET & JEE
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

            {/* User Profile / Login */}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center space-x-2 hover:bg-primary/10"
                        data-testid="user-menu"
                      >
                        {user.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt={user.name || "User"} 
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full premium-gradient flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <span className="text-sm font-medium hidden md:inline">
                          {user.name || user.firstName || "Student"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={redirectToLogout}
                        className="text-destructive"
                        data-testid="logout-button"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    onClick={redirectToLogin}
                    className="premium-gradient text-white hover:opacity-90 font-semibold shadow-lg"
                    size="sm"
                    data-testid="login-button"
                  >
                    Login with Google
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated but profile not complete, show Complete Profile page
  if (isAuthenticated && user && !user.isProfileComplete) {
    return <CompleteProfile />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={History} />
      <Route path="/saved-solutions" component={SavedSolutions} />
      <Route path="/progress" component={Progress} />
      <Route path="/neet-updates" component={NeetUpdates} />
      <Route path="/jee-updates" component={JeeUpdates} />
      <Route path="/neet-criteria" component={NeetCriteria} />
      <Route path="/jee-criteria" component={JeeCriteria} />
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
