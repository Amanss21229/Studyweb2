import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, FlaskConical, Calculator, Dna } from "lucide-react";
import { MessageList } from "./MessageList";
import { InputPanel } from "./InputPanel";
import { ShareModal } from "./ShareModal";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "./LanguageProvider";
import logoImage from "@assets/IMG_20250913_000900_129_1759602426440.jpg";
import { 
  createConversation, 
  submitTextQuestion, 
  submitImageQuestion, 
  ConversationMessage 
} from "@/lib/api";

interface ChatInterfaceProps {
  selectedSubject?: string | null;
}

export function ChatInterface({ selectedSubject }: ChatInterfaceProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [shareMessage, setShareMessage] = useState<ConversationMessage | null>(null);
  
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // Load conversation messages
  const { data: conversationMessages } = useQuery<ConversationMessage[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: () => createConversation(),
    onSuccess: (data) => {
      setConversationId(data.id);
    },
    onError: (error) => {
      toast({
        title: "Failed to start conversation",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Submit text question mutation
  const submitTextMutation = useMutation({
    mutationFn: ({ text, convId }: { text: string; convId: string }) => {
      return submitTextQuestion(convId, text, language);
    },
    onMutate: ({ text }) => {
      // Optimistic update - add user message
      const userMessage: ConversationMessage = {
        id: `temp-${Date.now()}`,
        type: 'question',
        text,
        inputType: 'text',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
    },
    onSuccess: (data, variables) => {
      setIsTyping(false);
      
      // Add AI response
      const aiMessage: ConversationMessage = {
        id: data.solution.id,
        type: 'solution',
        text: data.solution.solutionText,
        subject: data.solution.subject,
        chapter: data.solution.chapter,
        topic: data.solution.topic,
        shareUrl: data.solution.shareUrl,
        neetJeePyq: data.solution.neetJeePyq,
        createdAt: data.solution.createdAt,
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // Invalidate and refetch messages using conversation ID from mutation variables
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations', variables.convId, 'messages']
      });
    },
    onError: (error) => {
      setIsTyping(false);
      // Remove optimistic user message
      setMessages(prev => prev.slice(0, -1));
      toast({
        title: "Failed to submit question",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Submit image question mutation
  const submitImageMutation = useMutation({
    mutationFn: ({ file, convId }: { file: File; convId: string }) => {
      return submitImageQuestion(convId, file, language);
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data, variables) => {
      setIsTyping(false);
      
      // Add both user question and AI response
      const userMessage: ConversationMessage = {
        id: data.question.id,
        type: 'question',
        text: data.question.questionText,
        inputType: 'image',
        imageUrl: data.question.imageUrl,
        createdAt: data.question.createdAt,
      };
      
      const aiMessage: ConversationMessage = {
        id: data.solution.id,
        type: 'solution',
        text: data.solution.solutionText,
        subject: data.solution.subject,
        chapter: data.solution.chapter,
        topic: data.solution.topic,
        shareUrl: data.solution.shareUrl,
        neetJeePyq: data.solution.neetJeePyq,
        createdAt: data.solution.createdAt,
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      // Invalidate and refetch messages using conversation ID from mutation variables
      queryClient.invalidateQueries({
        queryKey: ['/api/conversations', variables.convId, 'messages']
      });
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Failed to process image",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleTextSubmit = async (text: string) => {
    if (!conversationId) {
      // Create conversation first, then submit with the new conversation ID
      try {
        const newConversation = await createConversationMutation.mutateAsync();
        // Now submit with the newly created conversation ID
        submitTextMutation.mutate({ text, convId: newConversation.id });
      } catch (error) {
        // Error already handled by createConversationMutation's onError
      }
    } else {
      // Always pass conversationId explicitly to avoid state timing issues
      submitTextMutation.mutate({ text, convId: conversationId });
    }
  };

  const handleImageSubmit = async (file: File) => {
    if (!conversationId) {
      // Create conversation first, then submit with the new conversation ID
      try {
        const newConversation = await createConversationMutation.mutateAsync();
        // Now submit with the newly created conversation ID
        submitImageMutation.mutate({ file, convId: newConversation.id });
      } catch (error) {
        // Error already handled by createConversationMutation's onError
      }
    } else {
      // Always pass conversationId explicitly to avoid state timing issues
      submitImageMutation.mutate({ file, convId: conversationId });
    }
  };

  const handleAudioSubmit = (text: string) => {
    // Audio transcription already done, treat as text
    handleTextSubmit(text);
  };

  const handleShare = (message: ConversationMessage) => {
    setShareMessage(message);
  };

  const exampleQuestions = [
    {
      text: "Explain Newton's Laws with examples",
      subject: "physics",
      icon: Lightbulb,
      color: "text-accent"
    },
    {
      text: "What is Electrochemistry?",
      subject: "chemistry",
      icon: FlaskConical,
      color: "text-secondary"
    },
    {
      text: "Solve: ∫ x²dx from 0 to 5",
      subject: "math",
      icon: Calculator,
      color: "text-primary"
    },
    {
      text: "Explain DNA replication process",
      subject: "biology",
      icon: Dna,
      color: "text-success"
    }
  ];

  const hasConversation = messages.length > 0;
  const isLoading = submitTextMutation.isPending || submitImageMutation.isPending || createConversationMutation.isPending;

  return (
    <>
      {/* Welcome Card */}
      {!hasConversation && (
        <Card className="card-elevated mb-6 premium-border premium-gradient-subtle" data-testid="welcome-card">
          <CardContent className="p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden logo-shine premium-border animate-pulse-glow">
                <img 
                  src={logoImage} 
                  alt="AimAi Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-4xl font-bold mb-2 gold-glow-text">
                Hello, Future Doctor/Engineer! 👋
              </h2>
              <p className="text-sm font-semibold text-primary mb-2 tracking-wide">
                POWERED BY SANSA LEARN
              </p>
              <p className="text-muted-foreground text-lg mb-8">
                Your personal AI tutor for NEET & JEE preparation. Ask me anything about Physics, Chemistry, Mathematics, or Biology from the NCERT syllabus!
              </p>
              
              {/* Example Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {exampleQuestions.map((question, index) => {
                  const Icon = question.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="p-4 h-auto text-left card-elevated hover-lift hover:border-primary hover:bg-primary/10 transition-all"
                      onClick={() => handleTextSubmit(question.text)}
                      disabled={isLoading}
                      data-testid={`example-question-${index}`}
                    >
                      <Icon className={`h-5 w-5 ${question.color} mb-2`} />
                      <p className="text-sm font-medium">{question.text}</p>
                    </Button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="font-medium">Pro Tip: Be specific with your questions. Include chapter names or topic details for better explanations!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      {hasConversation && (
        <MessageList 
          messages={messages} 
          isTyping={isTyping}
          onShare={handleShare}
        />
      )}

      {/* Input Panel */}
      <InputPanel
        onSubmitText={handleTextSubmit}
        onSubmitImage={handleImageSubmit}
        onSubmitAudio={handleAudioSubmit}
        isLoading={isLoading}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={!!shareMessage}
        onClose={() => setShareMessage(null)}
        message={shareMessage}
      />
    </>
  );
}
