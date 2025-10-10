import { useState } from "react";
import { usePageMeta } from "@/lib/usePageMeta";
import { ChatInterface } from "@/components/ChatInterface";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  usePageMeta(
    "AimAi — AI Tutor for NEET & JEE",
    "AimAi: Personalized AI-powered quizzes, NCERT-aligned solutions and study help for NEET & JEE aspirants. Practice smart, learn fast.",
    "https://aimai.onrender.com/",
    "https://aimai.onrender.com/og-image.png"
  );
  
  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl" data-testid="home-page">
      {/* Hamburger Menu */}
      <HamburgerMenu />

      {/* Chat Interface - Full Width */}
      <section className="w-full">
        <ChatInterface selectedSubject={selectedSubject} />
      </section>

      {/* Floating Action Button (Mobile) */}
      <Button 
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg lg:hidden hover:scale-110 transition-transform z-30 bg-gradient-to-br from-primary to-secondary"
        data-testid="floating-action-button"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>
    </main>
  );
}
