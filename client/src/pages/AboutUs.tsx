import { Link } from "wouter";
import { ArrowLeft, GraduationCap, Target, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background" data-testid="about-us-page">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">About Us</h1>
            <p className="text-muted-foreground">Learn more about AimAi and our mission</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Who We Are
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                AimAi is an AI-powered educational platform developed by Sansa Learn, dedicated to helping NEET and JEE aspirants 
                achieve their academic goals. We provide personalized AI tutoring in Physics, Chemistry, Mathematics, and Biology, 
                following the NCERT syllabus.
              </p>
              <p className="text-muted-foreground">
                Our platform offers 24/7 access to educational support, helping students clear their doubts, practice concepts, 
                and strengthen their understanding of complex topics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To democratize quality education by providing affordable, accessible, and personalized AI-powered tutoring 
                to every NEET and JEE aspirant in India. We believe that every student deserves access to excellent educational 
                resources, regardless of their location or economic background.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold mb-1">Quality Education</h3>
                <p className="text-muted-foreground">Providing accurate, curriculum-aligned content that helps students excel</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Student Safety</h3>
                <p className="text-muted-foreground">Maintaining a safe, secure learning environment for all students, especially minors</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Privacy & Security</h3>
                <p className="text-muted-foreground">Protecting student data with industry-standard security measures</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Compliance</h3>
                <p className="text-muted-foreground">Adhering to all Indian laws and regulations, including IT Act 2000 and child safety norms</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Service Provider Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Platform Name:</strong> AimAi</p>
              <p><strong>Powered By:</strong> Sansa Learn Educational Services</p>
              <p><strong>Contact Email:</strong> <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a></p>
              <p><strong>Service Type:</strong> Online AI-powered Educational Tutoring Platform</p>
              <p><strong>Primary Users:</strong> NEET & JEE Aspirants (Students aged 15-20 years primarily)</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                AimAi is committed to maintaining the highest standards of educational quality and legal compliance. 
                We operate in accordance with the Information Technology Act, 2000, Information Technology (Intermediary Guidelines 
                and Digital Media Ethics Code) Rules, 2021, and all applicable Indian laws and regulations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
