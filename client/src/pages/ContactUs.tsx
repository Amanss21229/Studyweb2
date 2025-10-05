import { Link } from "wouter";
import { ArrowLeft, Mail, MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background" data-testid="contact-us-page">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p className="text-muted-foreground">Get in touch with our team</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AimAi - Sansa Learn Educational Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">
                    eduaman07@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Response Time</h3>
                  <p className="text-muted-foreground">We aim to respond within 24-48 hours on business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Queries Regarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h3 className="font-semibold">General Support</h3>
                <p className="text-muted-foreground">For general questions about our AI tutoring services, study materials, or platform features</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Technical Issues</h3>
                <p className="text-muted-foreground">Report bugs, technical problems, or platform accessibility issues</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Content Concerns</h3>
                <p className="text-muted-foreground">Report inappropriate content or educational content accuracy issues</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Grievance Redressal</h3>
                <p className="text-muted-foreground">For complaints or grievances, please refer to our Grievance Redressal Mechanism</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> AimAi is committed to providing quality educational support for NEET & JEE aspirants. 
                We comply with all applicable Indian laws including the Information Technology Act, 2000 and related rules.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
