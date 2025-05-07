
// This is a mock implementation of a voice service
// In a real implementation, you would integrate with a speech recognition and synthesis API

export enum VoiceServiceStatus {
  IDLE = 'idle',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  SPEAKING = 'speaking',
  ERROR = 'error',
}

export interface VoiceServiceOptions {
  onStatusChange?: (status: VoiceServiceStatus) => void;
  onTranscription?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
}

export class VoiceService {
  private status: VoiceServiceStatus = VoiceServiceStatus.IDLE;
  private options: VoiceServiceOptions;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private conversationHistory: string[] = [];
  
  constructor(options: VoiceServiceOptions = {}) {
    this.options = options;
    
    // Initialize Web Speech API if available
    if (typeof window !== 'undefined') {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
      
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }
  
  private setupRecognition() {
    if (!this.recognition) return;
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.recognition.onstart = () => {
      this.setStatus(VoiceServiceStatus.LISTENING);
    };
    
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        if (this.options.onTranscription) {
          this.options.onTranscription(transcript);
        }
        this.processUserInput(transcript);
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      this.setStatus(VoiceServiceStatus.ERROR);
      if (this.options.onError) {
        this.options.onError(new Error(`Speech recognition error: ${event.error}`));
      }
    };
    
    this.recognition.onend = () => {
      if (this.status === VoiceServiceStatus.LISTENING) {
        this.setStatus(VoiceServiceStatus.IDLE);
      }
    };
  }
  
  private setStatus(status: VoiceServiceStatus) {
    this.status = status;
    if (this.options.onStatusChange) {
      this.options.onStatusChange(status);
    }
  }
  
  public startListening() {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      if (this.options.onError) {
        this.options.onError(new Error('Speech recognition not supported'));
      }
      return;
    }
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition', error);
    }
  }
  
  public stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition', error);
    }
  }
  
  private async processUserInput(text: string) {
    this.setStatus(VoiceServiceStatus.PROCESSING);
    
    // Add to conversation history
    this.conversationHistory.push(`User: ${text}`);
    
    try {
      // In a real implementation, you would send this text to an API
      // For now, we'll simulate a response
      const response = await this.simulateAIResponse(text);
      
      // Add AI response to history
      this.conversationHistory.push(`AI: ${response}`);
      
      if (this.options.onResponse) {
        this.options.onResponse(response);
      }
      
      this.speak(response);
    } catch (error) {
      console.error('Error processing input', error);
      this.setStatus(VoiceServiceStatus.ERROR);
      if (this.options.onError && error instanceof Error) {
        this.options.onError(error);
      }
    }
  }
  
  private async simulateAIResponse(text: string): Promise<string> {
    // This is where you'd connect to an actual AI API
    // For now, we'll use some simple responses
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return "Hello! How can I assist you today?";
    } else if (lowerText.includes('help')) {
      return "I'm here to help. What do you need assistance with?";
    } else if (lowerText.includes('order') || lowerText.includes('purchase')) {
      return "I can help with your order. Could you provide your order number so I can check the status?";
    } else if (lowerText.includes('bye') || lowerText.includes('goodbye')) {
      return "Thank you for chatting with me. Is there anything else you need help with before you go?";
    } else {
      return "I understand. Could you provide more details so I can better assist you?";
    }
  }
  
  public speak(text: string) {
    if (!this.synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }
    
    this.setStatus(VoiceServiceStatus.SPEAKING);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    // Find a good voice if available
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(
      voice => voice.name.includes('Google') || voice.name.includes('Female')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      this.setStatus(VoiceServiceStatus.IDLE);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error', event);
      this.setStatus(VoiceServiceStatus.ERROR);
    };
    
    this.synthesis.speak(utterance);
  }
  
  public cancel() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    
    if (this.recognition) {
      this.stopListening();
    }
    
    this.setStatus(VoiceServiceStatus.IDLE);
  }
  
  public getConversationHistory(): string[] {
    return [...this.conversationHistory];
  }
}

// Type definitions needed for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default VoiceService;
