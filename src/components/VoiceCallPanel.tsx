
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Volume, VolumeOff, MessageCircle } from 'lucide-react';
import Waveform from './Waveform';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';

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
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const callerName = "AI Assistant";
  const phoneNumber = "12 34 5678";
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  // Sample questions for the interface
  const questions = [
    "What are your business hours?",
    "How do I reset my password?",
    "Where can I find pricing information?",
    "How do I contact customer support?"
  ];

  // Simulate connection process
  useEffect(() => {
    if (isOpen && status === CallStatus.CONNECTING) {
      const timer = setTimeout(() => {
        setStatus(CallStatus.CONNECTED);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status]);

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
      setIsMuted(false);
      setSelectedQuestion(null);
    }, 1000);
  };

  const handleQuestionSelect = (question: string) => {
    setSelectedQuestion(question);
    // Here you would typically send the question to your AI service
    // For now, we'll just simulate a response by changing status
    setStatus(CallStatus.SPEAKING);
    setTimeout(() => {
      setStatus(CallStatus.LISTENING);
    }, 3000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={cn(
      "voice-call-panel transition-all duration-300 z-50 rounded-3xl overflow-hidden",
      isMinimized ? "minimized" : "expanded",
      status === CallStatus.ENDED ? "animate-fadeOut" : "animate-slideIn",
      isOpen && !isMinimized && "animate-scaleIn"
    )}>
      {isMinimized ? (
        <div 
          className="w-full h-full bg-green-500 flex items-center justify-center text-white cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <Mic size={24} />
        </div>
      ) : (
        <div className="h-full bg-[#1A1F2C] flex flex-col">
          {/* Phone number and status */}
          <div className="text-center pt-10 pb-4 px-4 animate-fadeIn">
            <div className="text-white text-xl mb-1">{phoneNumber}</div>
            <div className="text-[#1EAEDB]">
              {status === CallStatus.CONNECTING ? "Calling..." : 
               status === CallStatus.CONNECTED ? "Connected" : 
               status === CallStatus.SPEAKING ? "Speaking..." : 
               status === CallStatus.LISTENING ? "Listening..." : 
               "In call"}
            </div>
          </div>
          
          {/* Contact avatar */}
          <div className="flex justify-center mb-6 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <Avatar className="h-24 w-24 bg-gray-700">
              <AvatarFallback className="text-4xl text-gray-400">AI</AvatarFallback>
            </Avatar>
          </div>
          
          {/* Contact name */}
          <div className="text-white text-center text-2xl mb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            {callerName}
          </div>
          
          {/* Question interface */}
          <div className="flex-1 px-6 mb-6 overflow-y-auto animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            {selectedQuestion ? (
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <p className="text-white"><span className="font-semibold">You asked:</span> {selectedQuestion}</p>
                {status === CallStatus.SPEAKING && (
                  <div className="flex items-center justify-center mt-4">
                    <Waveform height={30} />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-white text-center mb-4">What would you like to know?</h3>
                {questions.map((question, index) => (
                  <button 
                    key={index} 
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white text-left p-4 rounded-lg flex items-center transition-colors animate-fadeIn"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <MessageCircle size={18} className="mr-3 text-[#1EAEDB]" />
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Call control buttons - only mute and speaker */}
          <div className="grid grid-cols-3 gap-4 mb-10 px-8 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
            <div className="flex flex-col items-center gap-2">
              <button 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border border-gray-600",
                  isMuted ? "bg-gray-700" : "bg-transparent"
                )}
                onClick={handleMuteToggle}
              >
                {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
              </button>
              <span className="text-white text-xs">Mute</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors"
                onClick={handleEndCall}
              >
                <PhoneOff size={24} className="text-white" />
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border border-gray-600",
                  !isAudioEnabled ? "bg-gray-700" : "bg-transparent"
                )}
                onClick={handleAudioToggle}
              >
                {isAudioEnabled ? <Volume size={20} className="text-white" /> : <VolumeOff size={20} className="text-white" />}
              </button>
              <span className="text-white text-xs">Speaker</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCallPanel;
