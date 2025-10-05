import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background" data-testid="privacy-policy-page">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: October 2025</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                At AimAi, we are committed to protecting your privacy and personal information. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our Platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Personal Information:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and profile information (via Google authentication)</li>
                <li>Educational information (class, stream, gender for personalized learning)</li>
                <li>User-generated content (questions asked, solutions saved)</li>
              </ul>
              
              <p className="pt-3"><strong>Automatically Collected Information:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Usage data and interaction patterns</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>We use collected information to:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide personalized educational content and AI tutoring services</li>
                <li>Maintain and improve Platform functionality</li>
                <li>Track learning progress and generate analytics</li>
                <li>Communicate important updates and notifications</li>
                <li>Ensure Platform security and prevent fraud</li>
                <li>Comply with legal obligations and enforce our Terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>We do NOT sell your personal information. We may share data with:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Third-party services that help us operate the Platform (e.g., hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government authorities</li>
                <li><strong>Safety & Security:</strong> To protect rights, property, or safety of our users or others</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong>Special Protection for Minors:</strong> Since our primary users are students aged 15-20, 
                we take extra precautions to protect children's privacy in compliance with applicable laws including 
                the Protection of Children from Sexual Offences (POCSO) Act, 2012.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We do not knowingly collect unnecessary personal information from children under 18</li>
                <li>Parental consent is required for users under 18 years</li>
                <li>We implement age-appropriate safety measures and content filtering</li>
                <li>We do not share children's data with third parties for marketing purposes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Secure authentication via Google OAuth</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and data minimization practices</li>
              </ul>
              <p className="pt-2">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect 
                your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                We retain your personal information only as long as necessary for the purposes outlined in this Privacy Policy, 
                or as required by law. You may request deletion of your account and data by contacting us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>You have the right to:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw consent for data processing</li>
                <li>Object to certain data processing activities</li>
                <li>Lodge a complaint with relevant authorities</li>
              </ul>
              <p className="pt-2">
                To exercise these rights, contact us at: <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                We use cookies and similar technologies to enhance user experience, analyze Platform usage, and remember 
                your preferences. You can control cookie settings through your browser, though this may affect Platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Our Platform uses third-party services (e.g., Google for authentication, OpenAI for AI responses). 
                These services have their own privacy policies, and we encourage you to review them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                We may update this Privacy Policy periodically. We will notify users of significant changes via email 
                or prominent notice on the Platform. Continued use after changes constitutes acceptance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                For privacy-related questions or concerns, contact us at:
              </p>
              <p><strong>Email:</strong> <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a></p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Legal Compliance:</strong> This Privacy Policy complies with the Information Technology Act, 2000, 
                Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, 
                Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and other applicable Indian data protection laws.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
