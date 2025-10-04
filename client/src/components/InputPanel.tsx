import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Keyboard, 
  Image, 
  Mic, 
  Send, 
  Upload, 
  X, 
  Lightbulb,
  SquareRadical,
  PenTool,
  MicIcon,
  Square,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from "@/lib/audio";
import { useLanguage } from "./LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { redirectToLogin } from "@/lib/authUtils";

type InputMode = 'text' | 'image' | 'audio';

interface InputPanelProps {
  onSubmitText: (text: string) => void;
  onSubmitImage: (file: File, extractedText?: string) => void;
  onSubmitAudio: (text: string) => void;
  isLoading?: boolean;
}

export function InputPanel({ onSubmitText, onSubmitImage, onSubmitAudio, isLoading }: InputPanelProps) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('Click to start recording');
  const [showWaveform, setShowWaveform] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const handlePremiumFeatureClick = (feature: 'image' | 'audio') => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: `${feature === 'image' ? 'Image upload' : 'Voice input'} requires login. Please login to continue.`,
        variant: "destructive",
      });
      setTimeout(() => redirectToLogin(), 1500);
      return false;
    }
    return true;
  };

  const handleTextSubmit = () => {
    if (!textInput.trim() || isLoading) return;
    
    onSubmitText(textInput.trim());
    setTextInput('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSubmit = () => {
    if (!selectedImage || isLoading) return;
    
    onSubmitImage(selectedImage);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initializeAudioRecorder = () => {
    if (!audioRecorderRef.current) {
      audioRecorderRef.current = new AudioRecorder();
    }
  };

  const toggleRecording = async () => {
    initializeAudioRecorder();
    const recorder = audioRecorderRef.current!;

    if (!recorder.isSupported()) {
      toast({
        title: "Recording not supported",
        description: "Your browser doesn't support audio recording",
        variant: "destructive",
      });
      return;
    }

    if (!isRecording) {
      try {
        await recorder.startRecording();
        setIsRecording(true);
        setRecordingStatus('Recording... Click to stop');
        setShowWaveform(true);
      } catch (error) {
        toast({
          title: "Recording failed",
          description: "Failed to start recording. Please check microphone permissions.",
          variant: "destructive",
        });
      }
    } else {
      try {
        setRecordingStatus('Processing audio...');
        setShowWaveform(false);
        
        if (recorder.isSpeechRecognitionSupported()) {
          const transcription = await recorder.transcribeAudio(language);
          onSubmitAudio(transcription);
        } else {
          toast({
            title: "Speech recognition not supported",
            description: "Your browser doesn't support speech recognition",
            variant: "destructive",
          });
        }
        
        setIsRecording(false);
        setRecordingStatus('Click to start recording');
      } catch (error) {
        toast({
          title: "Processing failed",
          description: "Failed to process audio. Please try again.",
          variant: "destructive",
        });
        setIsRecording(false);
        setRecordingStatus('Click to start recording');
      }
    }
  };

  const inputModes = [
    { id: 'text', name: 'Text', icon: Keyboard },
    { id: 'image', name: 'Image', icon: Image },
    { id: 'audio', name: 'Voice', icon: Mic }
  ] as const;

  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-4 pb-6 border-t border-border">
      <Card className="card-elevated">
        <CardContent className="p-4">
          {/* Input Mode Tabs */}
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto" data-testid="input-mode-tabs">
            {inputModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = inputMode === mode.id;
              const isPremium = mode.id === 'image' || mode.id === 'audio';
              const isLocked = isPremium && !isAuthenticated;
              
              return (
                <Button
                  key={mode.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`flex items-center space-x-2 px-4 py-2 whitespace-nowrap ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'} ${isLocked ? 'opacity-70' : ''}`}
                  onClick={() => {
                    if (isPremium && !handlePremiumFeatureClick(mode.id)) {
                      return;
                    }
                    setInputMode(mode.id);
                  }}
                  data-testid={`input-mode-${mode.id}`}
                >
                  {isLocked ? (
                    <Lock className="h-3 w-3 mr-1" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{mode.name}</span>
                  {isLocked && <span className="text-xs ml-1">(Login)</span>}
                </Button>
              );
            })}
          </div>

          {/* Text Input Panel */}
          {inputMode === 'text' && (
            <div data-testid="text-input-panel">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={3}
                    placeholder="Type your NEET/JEE doubt here... (e.g., 'Explain the concept of oxidation and reduction')"
                    className="w-full px-4 py-3 bg-muted border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                    maxLength={1000}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTextSubmit();
                      }
                    }}
                    data-testid="question-input"
                  />
                  <div className="flex items-center justify-between mt-2 px-1">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary btn-icon p-1"
                        title="Add equation"
                      >
                        <SquareRadical className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary btn-icon p-1"
                        title="Add diagram"
                      >
                        <PenTool className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {textInput.length}/1000
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || isLoading}
                  className="px-6 py-3 hover-lift"
                  data-testid="send-button"
                >
                  <span>Send</span>
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Image Input Panel */}
          {inputMode === 'image' && (
            <div data-testid="image-input-panel">
              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="image-upload-input"
                  />
                  <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div data-testid="image-preview">
                  <div className="relative bg-muted rounded-lg p-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 rounded-full p-2"
                      onClick={removeImage}
                      data-testid="remove-image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleImageSubmit}
                    disabled={isLoading}
                    className="w-full mt-3 hover-lift"
                    data-testid="process-image"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Extract & Solve Question
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Audio Input Panel */}
          {inputMode === 'audio' && (
            <div className="text-center py-8" data-testid="audio-input-panel">
              <Button
                onClick={toggleRecording}
                disabled={isLoading}
                className={`w-20 h-20 rounded-full mx-auto mb-4 hover:scale-105 transition-transform ${
                  isRecording 
                    ? 'bg-gradient-to-br from-destructive to-destructive' 
                    : 'bg-gradient-to-br from-destructive to-accent'
                }`}
                data-testid="record-button"
              >
                {isRecording ? (
                  <Square className="h-6 w-6 text-white" />
                ) : (
                  <MicIcon className="h-6 w-6 text-white" />
                )}
              </Button>
              <p className="text-sm font-medium mb-1" data-testid="record-status">
                {recordingStatus}
              </p>
              <p className="text-xs text-muted-foreground">Speak your question clearly</p>
              
              {showWaveform && (
                <div className="mt-6" data-testid="audio-waveform">
                  <div className="flex items-center justify-center space-x-1 h-12">
                    {[20, 35, 50, 35, 45, 30, 40].map((height, index) => (
                      <div
                        key={index}
                        className="w-1 bg-primary rounded-full animate-pulse"
                        style={{ 
                          height: `${height}px`, 
                          animationDelay: `${index * 0.1}s` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Tips */}
          <div className="mt-4 flex items-start space-x-2 bg-muted/50 rounded-lg p-3">
            <Lightbulb className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <strong>Pro Tip:</strong> Be specific with your questions. Include chapter names or topic details for better explanations!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
