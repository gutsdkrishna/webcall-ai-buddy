// Define the WebSpeechAPI types to fix the TypeScript errors
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

// Create a global type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onerror: ((event: SpeechRecognitionError) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: ((event: Event) => void) | null;
    onstart: ((event: Event) => void) | null;
  }
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  
  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  startListening(onTranscript: (text: string, isFinal: boolean) => void) {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        console.error("Failed to initialize speech recognition");
        return;
      }
    }
    
    this.isListening = true;
    
    this.recognition.onstart = () => {
      console.log('Voice recognition started');
    };
    
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Create a custom array from the SpeechRecognitionResultList
      const results = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        results.push(event.results[i]);
      }
      
      const transcript = results
        .map(result => result[0].transcript)
        .join('');
      
      const isFinal = event.results[event.resultIndex].isFinal;
      onTranscript(transcript, isFinal);
    };
    
    this.recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error', event.error, event.message);
    };
    
    this.recognition.onend = () => {
      console.log('Speech recognition service disconnected');
      if (this.isListening) {
        this.recognition?.start();
      }
    };
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }
  
  stopListening() {
    if (this.recognition) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
}

export default new VoiceService();

// --- WebSocket Audio Streaming for AI Voice Agent ---
export class VoiceWebSocketService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private playbackQueue: Array<Blob> = [];
  private isPlaying = false;

  connect(
    onAudio: (audioUrl: string) => void,
    onClose?: () => void,
    onError?: (e: Event) => void
  ) {
    this.ws = new WebSocket('ws://localhost:8000/ws/audio');
    this.ws.binaryType = 'arraybuffer';
    this.ws.onmessage = (event) => {
      // Received audio from backend (as bytes)
      const audioBlob = new Blob([event.data], { type: 'audio/wav' });
      this.playbackQueue.push(audioBlob);
      this.playAudioQueue();
      if (onAudio) onAudio(URL.createObjectURL(audioBlob));
    };
    this.ws.onclose = () => { if (onClose) onClose(); };
    this.ws.onerror = (e) => { if (onError) onError(e); };
  }

  async startStreaming() {
    if (!navigator.mediaDevices.getUserMedia) {
      alert('getUserMedia not supported in this browser.');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new window.AudioContext();
    this.sourceNode = this.audioContext.createMediaStreamSource(stream);
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        e.data.arrayBuffer().then((buf) => this.ws?.send(buf));
      }
    };
    this.mediaRecorder.start(500); // send every 500ms
  }

  stopStreaming() {
    this.mediaRecorder?.stop();
    this.audioContext?.close();
    this.ws?.close();
  }

  private playAudioQueue() {
    if (this.isPlaying || this.playbackQueue.length === 0) return;
    this.isPlaying = true;
    const blob = this.playbackQueue.shift()!;
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onended = () => {
      this.isPlaying = false;
      this.playAudioQueue();
    };
    audio.play();
  }
}

export const voiceWebSocketService = new VoiceWebSocketService();
