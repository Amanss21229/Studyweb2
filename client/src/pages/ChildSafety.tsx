import { Link } from "wouter";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ChildSafety() {
  return (
    <div className="min-h-screen bg-background" data-testid="child-safety-page">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Child Safety Policy</h1>
            <p className="text-muted-foreground">Protecting our young learners</p>
          </div>
        </div>

        <Alert className="mb-6 border-primary">
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            AimAi is committed to providing a safe, secure, and appropriate learning environment for all students, 
            especially minors. We comply with all Indian laws including the POCSO Act, 2012.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Our Commitment to Child Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                AimAi serves primarily students aged 15-20 preparing for NEET and JEE exams. We recognize our responsibility 
                to protect children and have implemented comprehensive safety measures in accordance with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Protection of Children from Sexual Offences (POCSO) Act, 2012</li>
                <li>Information Technology Act, 2000</li>
                <li>Information Technology (Intermediary Guidelines) Rules, 2021</li>
                <li>The Juvenile Justice (Care and Protection of Children) Act, 2015</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Age Verification and Parental Consent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Users under 18 years must have parental or guardian consent to use the Platform</li>
                <li>We collect minimal personal information from minors</li>
                <li>Parents/guardians can request access to or deletion of their child's data</li>
                <li>Age-appropriate content filtering is implemented</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Content Moderation and Safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>We maintain strict content policies:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-generated responses are filtered for age-appropriate educational content only</li>
                <li>No sharing of personal contact information (phone numbers, addresses) is permitted</li>
                <li>User-generated content is monitored for inappropriate material</li>
                <li>Automated and manual content moderation systems are in place</li>
                <li>Educational content is aligned with NCERT curriculum standards</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Zero Tolerance for Child Abuse Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p className="font-semibold text-destructive">
                We have ZERO TOLERANCE for child sexual abuse material (CSAM) and exploitation.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any content depicting, promoting, or facilitating child abuse is strictly prohibited</li>
                <li>Users found sharing such content will be immediately banned and reported to authorities</li>
                <li>We cooperate fully with law enforcement agencies in investigations</li>
                <li>Violations are reported to the National Crime Records Bureau (NCRB) and Cyber Crime Cell</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Privacy Protection for Minors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We collect only necessary information required for educational services</li>
                <li>Children's data is never sold or used for marketing purposes</li>
                <li>Enhanced security measures protect minor user accounts</li>
                <li>Data retention is limited and can be deleted upon parental request</li>
                <li>No third-party advertising or tracking for users under 18</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Safe Communication Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Platform safety features:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>No direct messaging between users (students cannot contact each other)</li>
                <li>All interactions are with AI tutor only</li>
                <li>No public forums or user-to-user communication</li>
                <li>Supervised learning environment focused solely on education</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Reporting Mechanisms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>If you encounter concerning content or behavior:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Report immediately to: <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a></li>
                <li>Include details: type of concern, user involved (if applicable), screenshot evidence</li>
                <li>We will respond within 24 hours and take immediate action</li>
                <li>Serious violations are reported to appropriate authorities within 24 hours</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Parental Controls and Guidance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>For Parents and Guardians:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Monitor your child's usage and progress on the Platform</li>
                <li>Review saved solutions and conversation history</li>
                <li>Set appropriate study time limits</li>
                <li>Contact us for any concerns about your child's safety or privacy</li>
                <li>Request data access, correction, or deletion at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Staff Training and Accountability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All team members undergo child safety and POCSO Act training</li>
                <li>Clear protocols for handling child safety incidents</li>
                <li>Regular audits of safety measures and content moderation</li>
                <li>Designated Child Safety Officer monitors compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>For immediate child safety concerns:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Platform Safety:</strong> <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a></li>
                <li><strong>National Commission for Protection of Child Rights (NCPCR):</strong> 1098 (Childline India)</li>
                <li><strong>Cyber Crime Reporting:</strong> www.cybercrime.gov.in</li>
                <li><strong>National Crime Records Bureau:</strong> As per POCSO Act reporting requirements</li>
              </ul>
            </CardContent>
          </Card>

          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <strong>Important:</strong> If you suspect or know of any child abuse, exploitation, or illegal activity, 
              report it immediately to local police and Childline (1098). Your safety and that of all children is our top priority.
            </AlertDescription>
          </Alert>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Legal Compliance:</strong> This Child Safety Policy is designed to comply with the Protection of Children 
                from Sexual Offences (POCSO) Act, 2012, Information Technology Act, 2000, and all applicable Indian laws 
                protecting children's rights and safety. We are committed to the highest standards of child protection.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
