import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Atom, FlaskConical, Calculator, Dna, History, Bookmark, TrendingUp } from "lucide-react";
import { Link } from "wouter";

interface SubjectSidebarProps {
  selectedSubject: string | null;
  onSubjectSelect: (subject: string | null) => void;
  subjectCounts?: Record<string, number>;
}

export function SubjectSidebar({ selectedSubject, onSubjectSelect, subjectCounts = {} }: SubjectSidebarProps) {
  const subjects = [
    { id: 'physics', name: 'Physics', icon: Atom, color: 'text-blue-500 dark:text-blue-400' },
    { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: 'text-green-500 dark:text-green-400' },
    { id: 'math', name: 'Mathematics', icon: Calculator, color: 'text-purple-500 dark:text-purple-400' },
    { id: 'biology', name: 'Biology', icon: Dna, color: 'text-pink-500 dark:text-pink-400' }
  ];

  const quickActions = [
    { name: 'View History', icon: History, color: 'text-primary', href: '/history' },
    { name: 'Saved Solutions', icon: Bookmark, color: 'text-accent', href: '/saved-solutions' },
    { name: 'Progress', icon: TrendingUp, color: 'text-primary', href: '/progress' }
  ];

  return (
    <Card className="card-elevated sticky top-24 premium-border" data-testid="subject-sidebar">
      <CardContent className="p-4">
        <h2 className="font-semibold text-lg mb-4 flex items-center">
          <div className="w-2 h-2 bg-primary rounded-full mr-2 premium-glow" />
          Subjects
        </h2>
        
        <div className="space-y-2 mb-6">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            const isSelected = selectedSubject === subject.id;
            const count = subjectCounts[subject.id] || 0;
            
            return (
              <Button
                key={subject.id}
                variant={isSelected ? "default" : "ghost"}
                className={`w-full justify-between px-4 py-3 h-auto transition-all ${
                  isSelected 
                    ? 'premium-gradient text-white hover:opacity-90 shadow-md' 
                    : 'hover:bg-primary/10 hover:border-primary/20'
                }`}
                onClick={() => onSubjectSelect(isSelected ? null : subject.id)}
                data-testid={`subject-${subject.id}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : subject.color}`} />
                  <span className="font-medium">{subject.name}</span>
                </div>
                <Badge 
                  variant={isSelected ? "secondary" : "outline"}
                  className={`text-xs ${isSelected ? 'bg-white/20 text-white border-white/30' : ''}`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Button
                  key={action.name}
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 h-auto text-sm hover:bg-primary/10 transition-all"
                  data-testid={`action-${action.name.toLowerCase().replace(' ', '-')}`}
                  asChild
                >
                  <Link href={action.href}>
                    <Icon className={`h-4 w-4 mr-3 ${action.color}`} />
                    <span>{action.name}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
