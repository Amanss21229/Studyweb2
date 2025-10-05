export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;
  private transcriptResult: string = '';
  private interimResult: string = '';
  private isStopping: boolean = false;
  private isRecognitionActive: boolean = false;
  private hasReceivedResults: boolean = false;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      console.log('Speech Recognition initialized successfully');
    } else {
      console.error('Speech Recognition not supported in this browser');
    }
  }

  async startRecording(language: string = 'en-US'): Promise<void> {
    this.cleanup();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.transcriptResult = '';
      this.interimResult = '';
      this.hasReceivedResults = false;
      this.isStopping = false;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();

      if (this.recognition) {
        const langCode = this.getLanguageCode(language);
        this.recognition.lang = langCode;
        
        console.log('🎙️ Setting up speech recognition with language:', langCode);
        
        this.recognition.onresult = (event: any) => {
          console.log('📝 Speech recognition result event received');
          this.hasReceivedResults = true;
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const isFinal = event.results[i].isFinal;
            console.log(`Result ${i}: "${transcript}" (final: ${isFinal})`);
            
            if (isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Store final results
          if (finalTranscript) {
            this.transcriptResult += finalTranscript;
            console.log('✅ Got final transcript:', finalTranscript);
          }
          
          // Store interim results as fallback
          if (interimTranscript) {
            this.interimResult = interimTranscript;
            console.log('⏳ Interim transcript:', interimTranscript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.error('❌ Speech recognition error:', event.error, event);
          
          if (this.isStopping && (event.error === 'aborted' || event.error === 'no-speech')) {
            console.log('Ignoring error during stop:', event.error);
            return;
          }
        };

        this.recognition.onend = () => {
          this.isRecognitionActive = false;
          console.log('🛑 Speech recognition ended');
        };

        this.recognition.onstart = () => {
          this.isRecognitionActive = true;
          console.log('✅ Speech recognition STARTED successfully with lang:', this.recognition.lang);
        };

        this.recognition.onaudiostart = () => {
          console.log('🔊 Audio capture started');
        };

        this.recognition.onaudioend = () => {
          console.log('🔇 Audio capture ended');
        };

        this.recognition.onspeechstart = () => {
          console.log('🗣️ Speech detected!');
        };

        this.recognition.onspeechend = () => {
          console.log('🤐 Speech ended');
        };

        try {
          this.recognition.start();
          console.log('🚀 Calling recognition.start()...');
        } catch (error) {
          console.error('💥 Failed to start speech recognition:', error);
          throw error;
        }
      } else {
        console.error('❌ No recognition object available!');
        throw new Error('Speech recognition not available');
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

      if (!this.mediaRecorder) {
        this.cleanup();
        reject(new Error('No active recording'));
        return;
      }

      // Set up a completion handler
      const completeRecording = () => {
        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        // Give more time for final speech recognition results
        setTimeout(() => {
          let transcript = this.transcriptResult.trim();
          
          // If no final transcript but we have interim results, use them
          if (!transcript && this.interimResult) {
            transcript = this.interimResult.trim();
            console.log('Using interim transcript:', transcript);
          }
          
          console.log('Final transcript:', transcript);
          console.log('Has received results:', this.hasReceivedResults);
          this.cleanup();
          
          if (!transcript) {
            if (this.hasReceivedResults) {
              reject(new Error('Could not capture speech properly. Please try again with a longer recording.'));
            } else {
              reject(new Error('No speech detected. Please speak clearly into the microphone and try again.'));
            }
          } else {
            resolve(transcript);
          }
        }, 1000); // Increased from 500ms to 1000ms
      };

      // Stop recognition first and wait for final results
      if (this.recognition && this.isRecognitionActive) {
        this.recognition.onend = () => {
          this.isRecognitionActive = false;
          console.log('Speech recognition ended, transcript:', this.transcriptResult);
          // Wait a bit for final results to be processed
          setTimeout(() => {
            completeRecording();
          }, 300);
        };
        
        try {
          this.recognition.stop();
        } catch (error) {
          console.warn('Error stopping recognition:', error);
          completeRecording();
        }
      } else {
        completeRecording();
      }

      // Stop media recorder
      this.mediaRecorder.onstop = () => {
        console.log('Media recorder stopped');
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch (error) {
        console.warn('Error stopping media recorder:', error);
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
    this.interimResult = '';
    this.hasReceivedResults = false;
    this.isRecognitionActive = false;
    this.isStopping = false;
    this.audioChunks = [];
  }
}
