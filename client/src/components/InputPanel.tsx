import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  Eraser,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from "@/lib/audio";
import { useLanguage } from "./LanguageProvider";

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
  const [recordingStatus, setRecordingStatus] = useState('Click microphone to start recording');
  const [showWaveform, setShowWaveform] = useState(false);
  const [isEquationPopoverOpen, setIsEquationPopoverOpen] = useState(false);
  const [isDiagramDialogOpen, setIsDiagramDialogOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const mathSymbols = [
    { symbol: '√', label: 'Square root', value: '√' },
    { symbol: '∛', label: 'Cube root', value: '∛' },
    { symbol: '∫', label: 'Integral', value: '∫' },
    { symbol: '∑', label: 'Summation', value: '∑' },
    { symbol: 'π', label: 'Pi', value: 'π' },
    { symbol: '∞', label: 'Infinity', value: '∞' },
    { symbol: '≈', label: 'Approximately', value: '≈' },
    { symbol: '≠', label: 'Not equal', value: '≠' },
    { symbol: '≤', label: 'Less than or equal', value: '≤' },
    { symbol: '≥', label: 'Greater than or equal', value: '≥' },
    { symbol: '°', label: 'Degree', value: '°' },
    { symbol: 'α', label: 'Alpha', value: 'α' },
    { symbol: 'β', label: 'Beta', value: 'β' },
    { symbol: 'γ', label: 'Gamma', value: 'γ' },
    { symbol: 'θ', label: 'Theta', value: 'θ' },
    { symbol: 'λ', label: 'Lambda', value: 'λ' },
    { symbol: 'Δ', label: 'Delta', value: 'Δ' },
    { symbol: '×', label: 'Multiply', value: '×' },
    { symbol: '÷', label: 'Divide', value: '÷' },
    { symbol: '±', label: 'Plus-minus', value: '±' },
    { symbol: '²', label: 'Squared', value: '²' },
    { symbol: '³', label: 'Cubed', value: '³' },
    { symbol: '⁴', label: 'Power 4', value: '⁴' },
    { symbol: '½', label: 'One half', value: '½' },
    { symbol: '⅓', label: 'One third', value: '⅓' },
    { symbol: '¼', label: 'One quarter', value: '¼' },
    { symbol: '∂', label: 'Partial derivative', value: '∂' },
    { symbol: '∇', label: 'Nabla', value: '∇' },
    { symbol: '∈', label: 'Element of', value: '∈' },
    { symbol: '∉', label: 'Not element of', value: '∉' },
    { symbol: '⊂', label: 'Subset', value: '⊂' },
    { symbol: '⊆', label: 'Subset or equal', value: '⊆' },
    { symbol: '∪', label: 'Union', value: '∪' },
    { symbol: '∩', label: 'Intersection', value: '∩' },
    { symbol: '→', label: 'Arrow right', value: '→' },
    { symbol: '←', label: 'Arrow left', value: '←' },
  ];


  const insertMathSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = textInput.substring(0, start) + symbol + textInput.substring(end);
    
    setTextInput(newText);
    setIsEquationPopoverOpen(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 0);

    toast({
      title: "Symbol inserted",
      description: `Added ${symbol} to your text`,
    });
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    if (isDiagramDialogOpen && canvasRef.current) {
      initializeCanvas();
    }
  }, [isDiagramDialogOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
  }, [selectedColor, brushSize]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initializeCanvas();
  };

  const saveDiagram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], 'diagram.png', { type: 'image/png' });
      
      toast({
        title: "Diagram saved",
        description: "Your diagram has been added as an image",
      });

      setIsDiagramDialogOpen(false);
      setInputMode('image');
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
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

    if (!recorder.isSpeechRecognitionSupported()) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (!isRecording) {
      try {
        await recorder.startRecording(language);
        setIsRecording(true);
        setRecordingStatus('🎤 Listening... Speak clearly, then click to stop');
        setShowWaveform(true);
        
        toast({
          title: "Recording started",
          description: "Speak clearly into your microphone",
        });
      } catch (error) {
        toast({
          title: "Recording failed",
          description: "Failed to start recording. Please check microphone permissions.",
          variant: "destructive",
        });
      }
    } else {
      try {
        setRecordingStatus('⏳ Processing your voice...');
        setShowWaveform(false);
        
        const transcription = await recorder.stopRecording();
        
        if (transcription && transcription.trim()) {
          toast({
            title: "Voice recognized",
            description: `Detected: "${transcription.substring(0, 50)}${transcription.length > 50 ? '...' : ''}"`,
          });
          onSubmitAudio(transcription);
        } else {
          toast({
            title: "No speech detected",
            description: "Please try again. Speak clearly and record for at least 2-3 seconds.",
            variant: "destructive",
          });
        }
        
        setIsRecording(false);
        setRecordingStatus('Click microphone to start recording');
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to process audio. Please try again.";
        toast({
          title: "Processing failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsRecording(false);
        setRecordingStatus('Click microphone to start recording');
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
              
              return (
                <Button
                  key={mode.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`flex items-center space-x-2 px-4 py-2 whitespace-nowrap ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setInputMode(mode.id)}
                  data-testid={`input-mode-${mode.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{mode.name}</span>
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
                    ref={textareaRef}
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
                      <Popover open={isEquationPopoverOpen} onOpenChange={setIsEquationPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary btn-icon p-1"
                            title="Add equation"
                            data-testid="equation-button"
                          >
                            <SquareRadical className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" data-testid="equation-popover">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Math Symbols</h4>
                            <p className="text-xs text-muted-foreground">Click a symbol to insert it</p>
                            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                              {mathSymbols.map((item) => (
                                <Button
                                  key={item.value}
                                  variant="outline"
                                  className="h-10 text-lg hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => insertMathSymbol(item.symbol)}
                                  title={item.label}
                                  data-testid={`math-symbol-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {item.symbol}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary btn-icon p-1"
                        title="Add diagram"
                        onClick={() => setIsDiagramDialogOpen(true)}
                        data-testid="diagram-button"
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

      {/* Diagram Drawing Dialog */}
      <Dialog open={isDiagramDialogOpen} onOpenChange={setIsDiagramDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="diagram-dialog">
          <DialogHeader>
            <DialogTitle>Draw Your Diagram</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="cursor-crosshair w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                data-testid="drawing-canvas"
              />
            </div>
            
            {/* Color Picker and Brush Size */}
            <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Color:</span>
                <div className="flex gap-2">
                  {[
                    { color: '#000000', label: 'Black' },
                    { color: '#EF4444', label: 'Red' },
                    { color: '#3B82F6', label: 'Blue' },
                    { color: '#10B981', label: 'Green' },
                    { color: '#F59E0B', label: 'Orange' },
                    { color: '#8B5CF6', label: 'Purple' },
                    { color: '#EC4899', label: 'Pink' },
                    { color: '#6B7280', label: 'Gray' },
                  ].map(({ color, label }) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-primary scale-110' 
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={label}
                      data-testid={`color-${label.toLowerCase()}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Size:</span>
                <div className="flex gap-2">
                  {[
                    { size: 1, label: 'Thin' },
                    { size: 2, label: 'Normal' },
                    { size: 4, label: 'Thick' },
                    { size: 6, label: 'Bold' },
                  ].map(({ size, label }) => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        brushSize === size
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border hover:bg-muted'
                      }`}
                      title={label}
                      data-testid={`brush-${label.toLowerCase()}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={clearCanvas}
                data-testid="clear-canvas-button"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Clear Canvas
              </Button>
              <div className="text-xs text-muted-foreground">
                Click and drag to draw
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDiagramDialogOpen(false)}
              data-testid="cancel-diagram-button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveDiagram}
              data-testid="save-diagram-button"
            >
              <Download className="h-4 w-4 mr-2" />
              Save Diagram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
