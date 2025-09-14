declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// A minimal type for SpeechRecognition so TS stops complaining
type ISpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

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
  private recognition: ISpeechRecognition | null = null;
  private synthesis: SpeechSynthesisUtterance | null = null;
  private isListening = false;
  private isSpeaking = false;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition() as ISpeechRecognition;
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";
      }
    }
  }

  async startSpeechToText(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: Error) => void,
    config: SpeechConfig = {
      languageCode: "en-US",
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
    }
  ): Promise<void> {
    if (!this.recognition) {
      onError(new Error("Speech recognition is not supported in this browser"));
      return;
    }

    try {
      this.recognition.lang = config.languageCode;
      this.recognition.continuous = config.continuous ?? true;
      this.recognition.interimResults = config.interimResults ?? true;
      this.recognition.maxAlternatives = config.maxAlternatives ?? 1;

      this.recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) onResult(interimTranscript, false);
        if (finalTranscript) onResult(finalTranscript, true);
      };

      this.recognition.onerror = (event: any) => {
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

  stopSpeechToText(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  async textToSpeech(
    text: string,
    config: TTSConfig = {
      languageCode: "en-US",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
    }
  ): Promise<void> {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      throw new Error("Speech synthesis is not supported in this browser");
    }

    return new Promise((resolve, reject) => {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (config.voiceName) {
          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find(
            (voice) => voice.name === config.voiceName
          );
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        utterance.lang = config.languageCode;
        utterance.rate = config.rate ?? 1.0;
        utterance.pitch = config.pitch ?? 1.0;
        utterance.volume = config.volume ?? 1.0;

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

        window.speechSynthesis.speak(utterance);
        this.synthesis = utterance;
      } catch (error) {
        reject(error);
      }
    });
  }

  stopTextToSpeech(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }

  isSpeechRecognitionSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  isSpeechSynthesisSupported(): boolean {
    return typeof window !== "undefined" && !!window.speechSynthesis;
  }

  async isMicrophoneAvailable(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  getListeningState(): boolean {
    return this.isListening;
  }

  getSpeakingState(): boolean {
    return this.isSpeaking;
  }

  pauseSpeech(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  resumeSpeech(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }
}

export const speechService = new SpeechService();
