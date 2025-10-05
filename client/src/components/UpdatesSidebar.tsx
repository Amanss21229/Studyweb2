import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, FileText, History, Bookmark, TrendingUp, Mail, Info, ScrollText, Shield, ShieldCheck, Scale, Key } from "lucide-react";
import { Link } from "wouter";

export function UpdatesSidebar() {
  const updatesAndNotices = [
    { 
      id: 'neet-updates', 
      name: 'NEET Latest Updates', 
      icon: Bell, 
      color: 'text-blue-500 dark:text-blue-400',
      href: '/neet-updates'
    },
    { 
      id: 'jee-updates', 
      name: 'JEE Latest Updates', 
      icon: Bell, 
      color: 'text-green-500 dark:text-green-400',
      href: '/jee-updates'
    },
    { 
      id: 'neet-criteria', 
      name: 'NEET Exam Criteria And Pattern', 
      icon: FileText, 
      color: 'text-purple-500 dark:text-purple-400',
      href: '/neet-criteria'
    },
    { 
      id: 'jee-criteria', 
      name: 'JEE Exam Criteria And Pattern', 
      icon: FileText, 
      color: 'text-pink-500 dark:text-pink-400',
      href: '/jee-criteria'
    }
  ];

  const quickActions = [
    { name: 'View History', icon: History, color: 'text-primary', href: '/history' },
    { name: 'Saved Solutions', icon: Bookmark, color: 'text-accent', href: '/saved-solutions' },
    { name: 'Progress', icon: TrendingUp, color: 'text-primary', href: '/progress' },
    { name: 'API Keys', icon: Key, color: 'text-golden', href: '/api-keys' }
  ];

  const policies = [
    { name: 'Contact Us', icon: Mail, color: 'text-blue-500', href: '/contact-us' },
    { name: 'About Us', icon: Info, color: 'text-green-500', href: '/about-us' },
    { name: 'Terms of Use', icon: ScrollText, color: 'text-purple-500', href: '/terms-of-use' },
    { name: 'Privacy Policy', icon: Shield, color: 'text-orange-500', href: '/privacy-policy' },
    { name: 'Child Safety Policy', icon: ShieldCheck, color: 'text-pink-500', href: '/child-safety' },
    { name: 'Grievance Redressal', icon: Scale, color: 'text-red-500', href: '/grievance-redressal' }
  ];

  return (
    <Card className="card-elevated sticky top-24 premium-border" data-testid="updates-sidebar">
      <CardContent className="p-4">
        <h2 className="font-semibold text-lg mb-4 flex items-center">
          <div className="w-2 h-2 bg-primary rounded-full mr-2 premium-glow" />
          Updates and Notices
        </h2>
        
        <div className="space-y-2 mb-6">
          {updatesAndNotices.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start px-4 py-3 h-auto transition-all hover:bg-primary/10 hover:border-primary/20"
                data-testid={`update-${item.id}`}
                asChild
              >
                <Link href={item.href}>
                  <Icon className={`h-5 w-5 mr-3 ${item.color}`} />
                  <span className="font-medium text-left">{item.name}</span>
                </Link>
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

        <div className="border-t border-border pt-6 mt-6">
          <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Policies</h3>
          <div className="space-y-2">
            {policies.map((policy) => {
              const Icon = policy.icon;
              
              return (
                <Button
                  key={policy.name}
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 h-auto text-sm hover:bg-primary/10 transition-all"
                  data-testid={`policy-${policy.name.toLowerCase().replace(/\s+/g, '-')}`}
                  asChild
                >
                  <Link href={policy.href}>
                    <Icon className={`h-4 w-4 mr-3 ${policy.color}`} />
                    <span>{policy.name}</span>
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
