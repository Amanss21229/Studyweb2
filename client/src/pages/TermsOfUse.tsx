import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background" data-testid="terms-of-use-page">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Terms of Use</h1>
            <p className="text-muted-foreground">Last Updated: October 2025</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing and using AimAi (the "Platform"), you agree to be bound by these Terms of Use. 
                If you disagree with any part of these terms, you must not use our Platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                AimAi provides AI-powered educational tutoring services for NEET and JEE preparation, covering Physics, 
                Chemistry, Mathematics, and Biology based on NCERT curriculum.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Age Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Users must be at least 13 years of age to use this Platform</li>
                <li>Users under 18 years must have parental/guardian consent</li>
                <li>Parents/guardians are responsible for monitoring minor's use of the Platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Users agree to:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Platform solely for educational purposes</li>
                <li>Provide accurate information during registration</li>
                <li>Maintain confidentiality of account credentials</li>
                <li>Not share or distribute Platform content without authorization</li>
                <li>Not use the Platform for any unlawful or prohibited activities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Users must not:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload or share harmful, offensive, or inappropriate content</li>
                <li>Attempt to hack, reverse engineer, or compromise Platform security</li>
                <li>Use automated systems or bots to access the Platform</li>
                <li>Impersonate others or provide false information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Share or distribute child sexual abuse material (CSAM) - strictly prohibited under POCSO Act, 2012</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                All content, features, and functionality on the Platform are owned by Sansa Learn and are protected by 
                copyright, trademark, and other intellectual property laws of India.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Disclaimer of Warranties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                The Platform is provided "as is" without warranties of any kind. While we strive for accuracy, 
                we do not guarantee that the educational content is error-free or will meet specific learning outcomes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Sansa Learn shall not be liable for any indirect, incidental, or consequential damages arising from 
                use of the Platform. Our total liability is limited to the amount paid by the user, if any.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate access to the Platform for violation of these Terms or 
                for any other reason at our sole discretion, without prior notice.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction 
                of courts in India, in accordance with the Information Technology Act, 2000 and other applicable laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                We reserve the right to modify these Terms at any time. Continued use of the Platform after changes 
                constitutes acceptance of the modified Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                For questions about these Terms, please contact us at: <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a>
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Legal Compliance:</strong> These Terms comply with the Information Technology Act, 2000, 
                Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, 
                Consumer Protection Act, 2019, and other applicable Indian laws.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
