import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UpdatesSidebar } from "./UpdatesSidebar";

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-24 left-4 z-50 w-10 h-10 hover:bg-primary/10 rounded-lg"
          data-testid="hamburger-menu-button"
        >
          <Menu className="h-6 w-6 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto p-0">
        <div className="p-4">
          <UpdatesSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
