export interface SpeechConfig {
  languageCode: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface TTSConfig {
  languageCode: string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesisUtterance | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    // Initialize Web Speech API
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize speech recognition
   */
  private initializeSpeechRecognition(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  /**
   * Start speech-to-text recognition
   */
  async startSpeechToText(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: Error) => void,
    config: SpeechConfig = {
      languageCode: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1
    }
  ): Promise<void> {
    if (!this.recognition) {
      onError(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    try {
      this.recognition.lang = config.languageCode;
      this.recognition.continuous = config.continuous || true;
      this.recognition.interimResults = config.interimResults || true;
      this.recognition.maxAlternatives = config.maxAlternatives || 1;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          onResult(interimTranscript, false);
        }
        
        if (finalTranscript) {
          onResult(finalTranscript, true);
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false;
        onError(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.start();
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Stop speech-to-text recognition
   */
  stopSpeechToText(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(
    text: string,
    config: TTSConfig = {
      languageCode: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    }
  ): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      throw new Error('Speech synthesis is not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice if specified
        if (config.voiceName) {
          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find(voice => voice.name === config.voiceName);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        // Set language
        utterance.lang = config.languageCode;
        
        // Set speech parameters
        utterance.rate = config.rate || 1.0;
        utterance.pitch = config.pitch || 1.0;
        utterance.volume = config.volume || 1.0;

        // Event handlers
        utterance.onstart = () => {
          this.isSpeaking = true;
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = (event) => {
          this.isSpeaking = false;
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
        this.synthesis = utterance;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop text-to-speech
   */
  stopTextToSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Get available voices for text-to-speech
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  }

  /**
   * Check if speech recognition is supported
   */
  isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && 
           (window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Check if speech synthesis is supported
   */
  isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && !!window.speechSynthesis;
  }

  /**
   * Check if microphone access is available
   */
  async isMicrophoneAvailable(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current listening state
   */
  getListeningState(): boolean {
    return this.isListening;
  }

  /**
   * Get current speaking state
   */
  getSpeakingState(): boolean {
    return this.isSpeaking;
  }

  /**
   * Pause speech synthesis
   */
  pauseSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Resume speech synthesis
   */
  resumeSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }
}

// Export singleton instance
export const speechService = new SpeechService();