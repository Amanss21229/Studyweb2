import { Link } from "wouter";
import { ArrowLeft, Scale, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GrievanceRedressal() {
  return (
    <div className="min-h-screen bg-background" data-testid="grievance-redressal-page">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Grievance Redressal Mechanism</h1>
            <p className="text-muted-foreground">Resolution process for complaints and concerns</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Our Commitment to Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                AimAi is committed to addressing user concerns promptly and fairly. This Grievance Redressal Mechanism 
                is established in compliance with the Information Technology (Intermediary Guidelines and Digital Media 
                Ethics Code) Rules, 2021, and other applicable Indian laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grievance Officer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Contact Details:</strong></p>
              <div className="space-y-2 ml-4">
                <p><strong>Platform:</strong> AimAi (Powered by Sansa Learn)</p>
                <p><strong>Email:</strong> <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a></p>
                <p><strong>Subject Line:</strong> "Grievance - [Brief Description]"</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Types of Grievances We Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>We handle complaints related to:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Content Issues:</strong> Inappropriate, inaccurate, or harmful content</li>
                <li><strong>Privacy Concerns:</strong> Data security, unauthorized access, or privacy violations</li>
                <li><strong>Platform Issues:</strong> Technical problems, service disruptions, or functionality errors</li>
                <li><strong>Account Issues:</strong> Login problems, unauthorized access, or account suspension</li>
                <li><strong>Child Safety:</strong> Any concerns related to minor user safety (highest priority)</li>
                <li><strong>Legal Violations:</strong> Copyright infringement, defamation, or other legal concerns</li>
                <li><strong>Service Quality:</strong> Educational content quality or customer service issues</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                2. How to File a Grievance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Step 1: Prepare Your Complaint</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Write a clear, detailed description of your concern</li>
                <li>Include relevant information: date, time, specific content/feature involved</li>
                <li>Attach supporting evidence: screenshots, URLs, or documentation</li>
                <li>Provide your contact information for follow-up</li>
              </ul>

              <p className="pt-3"><strong>Step 2: Submit Your Grievance</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email to: <a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a></li>
                <li>Subject: "Grievance - [Brief Description]"</li>
                <li>Include all relevant details and evidence</li>
              </ul>

              <p className="pt-3"><strong>Step 3: Acknowledgment</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will receive acknowledgment within 24 hours</li>
                <li>A unique complaint reference number will be provided</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                3. Resolution Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Acknowledgment: Within 24 hours</p>
                  <p className="text-sm">We confirm receipt and assign a reference number</p>
                </div>
                
                <div>
                  <p className="font-semibold">Investigation: 3-7 business days</p>
                  <p className="text-sm">We review your complaint and gather necessary information</p>
                </div>
                
                <div>
                  <p className="font-semibold">Resolution: Within 15 days</p>
                  <p className="text-sm">As per IT Rules 2021, we aim to resolve grievances within 15 days of receipt</p>
                </div>
                
                <div>
                  <p className="font-semibold">Urgent Child Safety Issues: Immediate action</p>
                  <p className="text-sm">Child safety concerns are prioritized and addressed within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Grievance Resolution Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Our structured approach:</strong></p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li><strong>Receipt & Acknowledgment:</strong> Complaint logged and acknowledged with reference number</li>
                <li><strong>Initial Review:</strong> Grievance Officer assesses the complaint and determines severity</li>
                <li><strong>Investigation:</strong> Relevant teams investigate the issue thoroughly</li>
                <li><strong>Action:</strong> Appropriate corrective measures are implemented</li>
                <li><strong>Communication:</strong> You are informed of the resolution and actions taken</li>
                <li><strong>Follow-up:</strong> We ensure the issue is fully resolved to your satisfaction</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Escalation Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>If you are not satisfied with the resolution:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Request escalation by replying to the resolution email with "ESCALATE"</li>
                <li>Your complaint will be reviewed by senior management</li>
                <li>Additional investigation may be conducted</li>
                <li>Final decision will be communicated within 7 days of escalation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. External Redressal Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>If you remain unsatisfied, you may approach:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Consumer Forums:</strong> Under Consumer Protection Act, 2019</li>
                <li><strong>Cyber Crime Cell:</strong> For cybercrimes and IT Act violations (www.cybercrime.gov.in)</li>
                <li><strong>Ministry of Electronics and IT:</strong> For intermediary guideline violations</li>
                <li><strong>National Commission for Protection of Child Rights:</strong> For child safety issues (1098)</li>
                <li><strong>Appropriate Court of Law:</strong> As per Indian jurisdiction</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Priority Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>These complaints receive immediate priority:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Child safety and POCSO-related concerns (within 24 hours)</li>
                <li>Privacy breaches and data security issues (within 48 hours)</li>
                <li>Content depicting violence, hate speech, or illegal activities (within 24 hours)</li>
                <li>Account security compromises (within 24 hours)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Transparency and Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All grievances are logged and tracked with unique reference numbers</li>
                <li>Records are maintained as per legal requirements</li>
                <li>Monthly reports on grievances received and resolved are prepared</li>
                <li>User privacy is maintained throughout the process</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <div className="space-y-2">
                <p><strong>Grievance Officer Email:</strong></p>
                <p className="ml-4"><a href="mailto:eduaman07@gmail.com" className="text-primary hover:underline">eduaman07@gmail.com</a></p>
                
                <p className="pt-2"><strong>For Urgent Child Safety Issues:</strong></p>
                <p className="ml-4">Mark email as "URGENT - CHILD SAFETY" and include "1098" in subject line</p>
                
                <p className="pt-2"><strong>Office Hours:</strong></p>
                <p className="ml-4">Monday to Saturday, 9:00 AM - 6:00 PM IST</p>
                <p className="ml-4">Emergency child safety issues: 24/7 monitoring</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Legal Compliance:</strong> This Grievance Redressal Mechanism complies with the Information Technology 
                (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, Rule 3(2), Consumer Protection Act, 2019, 
                and other applicable Indian laws. We are committed to fair, transparent, and timely resolution of all user grievances.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
