export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;
  private transcriptResult: string = '';
  private isStopping: boolean = false;
  private isRecognitionActive: boolean = false;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  async startRecording(language: string = 'en-US'): Promise<void> {
    this.cleanup();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.transcriptResult = '';
      this.isStopping = false;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();

      if (this.recognition) {
        this.recognition.lang = this.getLanguageCode(language);
        
        this.recognition.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            }
          }
          
          if (finalTranscript) {
            this.transcriptResult += finalTranscript;
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          if (this.isStopping && (event.error === 'aborted' || event.error === 'no-speech')) {
            return;
          }
        };

        this.recognition.onend = () => {
          this.isRecognitionActive = false;
          console.log('Speech recognition ended');
        };

        this.recognition.onstart = () => {
          this.isRecognitionActive = true;
        };

        this.recognition.start();
      }
    } catch (error) {
      this.cleanup();
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.isStopping = true;

      if (this.recognition && this.isRecognitionActive) {
        try {
          this.recognition.stop();
        } catch (error) {
          console.warn('Error stopping recognition:', error);
        }
      }

      if (!this.mediaRecorder) {
        this.cleanup();
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        setTimeout(() => {
          const transcript = this.transcriptResult.trim();
          
          this.cleanup();
          
          if (!transcript) {
            reject(new Error('No speech detected. Please try again and speak clearly.'));
          } else {
            resolve(transcript);
          }
        }, 500);
      };

      try {
        this.mediaRecorder.stop();
      } catch (error) {
        this.cleanup();
        reject(new Error('Failed to stop recording'));
      }
    });
  }

  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'english': 'en-US',
      'hindi': 'hi-IN',
      'hinglish': 'en-IN',
      'bengali': 'bn-IN'
    };
    return languageMap[language] || 'en-US';
  }

  isSupported(): boolean {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  }

  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  cleanup(): void {
    try {
      if (this.recognition && this.isRecognitionActive) {
        this.recognition.stop();
      }
    } catch (error) {
      console.warn('Cleanup: Error stopping recognition:', error);
    }
    
    try {
      if (this.mediaRecorder) {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
        if (this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        this.mediaRecorder = null;
      }
    } catch (error) {
      console.warn('Cleanup: Error stopping media recorder:', error);
    }
    
    this.transcriptResult = '';
    this.isRecognitionActive = false;
    this.isStopping = false;
    this.audioChunks = [];
  }
}
