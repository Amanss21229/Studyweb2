import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { UpdatesSidebar } from "@/components/UpdatesSidebar";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl" data-testid="home-page">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <UpdatesSidebar />
        </aside>

        {/* Chat Interface */}
        <section className="lg:col-span-9">
          <ChatInterface selectedSubject={selectedSubject} />
        </section>
      </div>

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
