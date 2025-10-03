import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MessageCircle, Send, Mail, Link, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConversationMessage } from "@/lib/api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ConversationMessage | null;
}

export function ShareModal({ isOpen, onClose, message }: ShareModalProps) {
  const { toast } = useToast();

  const copyLink = async () => {
    if (!message?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(message.shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareVia = (platform: string) => {
    if (!message?.shareUrl) return;
    
    const text = `Check out this NEET/JEE solution: ${message.shareUrl}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(message.shareUrl)}&text=${encodeURIComponent('NEET/JEE Solution')}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=NEET/JEE Solution&body=${encodeURIComponent(text)}`;
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="share-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Share Solution</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="shareLink" className="text-sm font-medium mb-2 block">
              Shareable Link
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="shareLink"
                value={message?.shareUrl || ''}
                readOnly
                className="flex-1"
                data-testid="share-link-input"
              />
              <Button 
                onClick={copyLink}
                variant="outline"
                data-testid="copy-link-button"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <Label className="text-sm font-medium mb-3 block">Share via</Label>
            <div className="grid grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-3 h-auto"
                onClick={() => shareVia('whatsapp')}
                data-testid="share-whatsapp"
              >
                <MessageCircle className="h-6 w-6 text-green-500 mb-1" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-3 h-auto"
                onClick={() => shareVia('telegram')}
                data-testid="share-telegram"
              >
                <Send className="h-6 w-6 text-blue-500 mb-1" />
                <span className="text-xs">Telegram</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-3 h-auto"
                onClick={() => shareVia('email')}
                data-testid="share-email"
              >
                <Mail className="h-6 w-6 text-red-500 mb-1" />
                <span className="text-xs">Email</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center p-3 h-auto"
                onClick={copyLink}
                data-testid="share-copy"
              >
                <Link className="h-6 w-6 text-primary mb-1" />
                <span className="text-xs">Copy</span>
              </Button>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-xs text-accent-foreground flex items-start">
              <Info className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
              This link will remain active for 30 days and can be accessed by anyone with the URL.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
