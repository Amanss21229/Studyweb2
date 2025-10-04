import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Bookmark, Share2, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConversationMessage } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import botAvatar from "@assets/IMG_20250826_123716_907_1759607150583.jpg";

interface MessageListProps {
  messages: ConversationMessage[];
  isTyping?: boolean;
  onShare?: (message: ConversationMessage) => void;
}

export function MessageList({ messages, isTyping, onShare }: MessageListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const bookmarkMutation = useMutation({
    mutationFn: async (solutionId: string) => {
      const response = await apiRequest('POST', `/api/solutions/${solutionId}/bookmark`);
      return await response.json();
    },
    onSuccess: (data, solutionId) => {
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        if (data.isBookmarked) {
          newSet.add(solutionId);
        } else {
          newSet.delete(solutionId);
        }
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-solutions'] });
      toast({
        title: data.isBookmarked ? "Saved!" : "Removed",
        description: data.isBookmarked ? "Solution saved to bookmarks" : "Solution removed from bookmarks",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save. Please login to save solutions.",
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const saveMessage = (message: ConversationMessage) => {
    if (message.type === 'solution' && message.id) {
      bookmarkMutation.mutate(message.id);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4 mb-6" data-testid="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'} chat-message`}
          data-testid={`message-${message.id}`}
        >
          {message.type === 'question' ? (
            // User Question
            <div className="max-w-[80%]">
              <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                <p className="text-sm leading-relaxed">{message.text}</p>
                {message.imageUrl && (
                  <img 
                    src={message.imageUrl} 
                    alt="Question" 
                    className="mt-2 max-w-full rounded"
                  />
                )}
              </div>
              <div className="flex items-center justify-end mt-1 space-x-2 text-xs text-muted-foreground">
                <span>{formatTime(message.createdAt)}</span>
                <CheckCheck className="h-3 w-3 text-primary" />
              </div>
            </div>
          ) : (
            // AI Solution
            <div className="max-w-[85%]">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1 border-2 border-primary/20">
                  <img 
                    src={botAvatar} 
                    alt="AimAi Bot" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    {message.subject && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {message.subject}
                        </Badge>
                        {message.chapter && (
                          <Badge variant="outline" className="bg-secondary/10 text-secondary text-xs">
                            Ch. {message.chapter}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </div>
                    
                    {message.neetJeePyq && (message.neetJeePyq.neet?.length || message.neetJeePyq.jee?.length) && (
                      <div className="bg-success/10 border border-success/20 rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium text-success mb-1">
                          <CheckCheck className="h-3 w-3 inline mr-1" />
                          NEET/JEE PYQ Reference:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {message.neetJeePyq.neet?.length && `NEET: ${message.neetJeePyq.neet.join(', ')}`}
                          {message.neetJeePyq.neet?.length && message.neetJeePyq.jee?.length && ' | '}
                          {message.neetJeePyq.jee?.length && `JEE: ${message.neetJeePyq.jee.join(', ')}`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 px-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.createdAt)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-primary btn-icon p-1"
                        onClick={() => copyToClipboard(message.text)}
                        data-testid={`copy-message-${message.id}`}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-xs btn-icon p-1 ${bookmarkedIds.has(message.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                        onClick={() => saveMessage(message)}
                        data-testid={`save-message-${message.id}`}
                        disabled={bookmarkMutation.isPending}
                      >
                        <Bookmark className={`h-3 w-3 mr-1 ${bookmarkedIds.has(message.id) ? 'fill-accent' : ''}`} />
                        {bookmarkedIds.has(message.id) ? 'Saved' : 'Save'}
                      </Button>
                      {message.shareUrl && onShare && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-secondary btn-icon p-1"
                          onClick={() => onShare(message)}
                          data-testid={`share-message-${message.id}`}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex justify-start chat-message" data-testid="typing-indicator">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1 border-2 border-primary/20">
              <img 
                src={botAvatar} 
                alt="AimAi Bot" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-1 typing-indicator">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
