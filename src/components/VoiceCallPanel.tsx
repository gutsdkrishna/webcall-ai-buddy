
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume, VolumeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Waveform from './Waveform';
import { cn } from '@/lib/utils';

interface VoiceCallPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export enum CallStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  SPEAKING = 'speaking',
  LISTENING = 'listening',
  ENDED = 'ended',
}

const VoiceCallPanel: React.FC<VoiceCallPanelProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<CallStatus>(CallStatus.CONNECTING);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{text: string, type: 'user' | 'ai'}[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate connection process
  useEffect(() => {
    if (isOpen && status === CallStatus.CONNECTING) {
      const timer = setTimeout(() => {
        setStatus(CallStatus.CONNECTED);
        addMessage("Hello! I'm your AI customer service assistant. How can I help you today?", 'ai');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status]);

  const addMessage = (text: string, type: 'user' | 'ai') => {
    setMessages(prev => [...prev, {text, type}]);
  };

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleAudioToggle = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleEndCall = () => {
    setStatus(CallStatus.ENDED);
    setTimeout(() => {
      onClose();
      // Reset state for next call
      setStatus(CallStatus.CONNECTING);
      setMessages([]);
      setIsMuted(false);
    }, 1000);
  };

  // Simulate user speaking and AI responding
  const simulateConversation = () => {
    if (status === CallStatus.CONNECTED || status === CallStatus.LISTENING) {
      setStatus(CallStatus.SPEAKING);
      addMessage("I need help with my recent order. It hasn't arrived yet.", 'user');
      
      setTimeout(() => {
        setStatus(CallStatus.LISTENING);
        setTimeout(() => {
          setStatus(CallStatus.SPEAKING);
          addMessage("I understand that's frustrating. Let me check the status of your order. Could you please provide your order number?", 'ai');
          setStatus(CallStatus.LISTENING);
        }, 2000);
      }, 2000);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(
      "voice-panel transition-all duration-300 z-50",
      isMinimized ? "minimized" : "expanded",
      status === CallStatus.ENDED && "animate-fadeOut"
    )}>
      {isMinimized ? (
        <div 
          className="w-full h-full bg-green-500 flex items-center justify-center text-white cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <Mic size={24} />
        </div>
      ) : (
        <>
          <div className="voice-panel-header bg-gray-800 text-white">
            <div className="flex items-center">
              <div className={cn(
                "w-3 h-3 rounded-full mr-2",
                status === CallStatus.CONNECTING ? "bg-yellow-400 animate-connecting" :
                status === CallStatus.SPEAKING ? "bg-green-500" :
                "bg-blue-300"
              )} />
              <span className="font-medium">
                {status === CallStatus.CONNECTING ? "Connecting..." :
                 status === CallStatus.SPEAKING ? "AI Speaking" :
                 status === CallStatus.LISTENING ? "Listening..." :
                 status === CallStatus.ENDED ? "Call Ended" :
                 "Connected"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-white hover:text-gray-300 transition-colors p-1"
              >
                <span className="sr-only">Minimize</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>
          
          <div className="p-4 flex-grow overflow-hidden flex flex-col h-[calc(100%-64px-72px)] bg-gray-900">
            <div className="flex-grow overflow-y-auto mb-4 space-y-3 text-white">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[80%] rounded-lg p-3",
                  msg.type === 'user' ? "bg-green-700 ml-auto" : "bg-gray-700"
                )}>
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <Waveform 
              isActive={status === CallStatus.SPEAKING}
              className="my-2"
            />
          </div>
          
          <div className="bg-gray-800 p-4 flex justify-center items-center space-x-4 border-t border-gray-700">
            <Button
              variant="outline"
              size="icon"
              className={cn("rounded-full w-12 h-12", isMuted && "bg-red-900 text-red-100 border-red-700")}
              onClick={handleMuteToggle}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
            </Button>
            
            <Button
              variant="destructive"
              size="icon" 
              className="rounded-full w-16 h-16"
              onClick={handleEndCall}
              aria-label="End call"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={cn("rounded-full w-12 h-12", !isAudioEnabled && "bg-red-900 text-red-100 border-red-700")}
              onClick={handleAudioToggle}
              aria-label={isAudioEnabled ? "Disable audio" : "Enable audio"}
            >
              {isAudioEnabled ? <Volume className="text-white" /> : <VolumeOff className="text-white" />}
            </Button>
            
            {/* This button is for demo purposes only - to trigger the simulated conversation */}
            <Button
              variant="outline"
              className="hidden md:block text-white bg-gray-700 border-gray-600 hover:bg-gray-600"
              onClick={simulateConversation}
            >
              Say something (demo)
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceCallPanel;
