
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume, VolumeOff, KeyRound, AlarmClock, Video, Users, User, Record, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Waveform from './Waveform';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  const [showKeypad, setShowKeypad] = useState(false);
  const callerName = "AI Assistant";
  const phoneNumber = "12 34 5678";

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
      setShowKeypad(false);
    }, 1000);
  };

  const toggleKeypad = () => {
    setShowKeypad(!showKeypad);
  };

  if (!isOpen) {
    return null;
  }

  const renderPhoneKeypad = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    return (
      <div className="absolute inset-0 z-10 bg-[#1A1F2C] flex flex-col">
        <div className="flex justify-between items-center p-4">
          <span className="text-white">Keypad</span>
          <button
            onClick={toggleKeypad}
            className="text-white hover:bg-gray-700 rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-6">
            {keys.map(key => (
              <button 
                key={key} 
                className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white text-xl font-medium hover:bg-gray-700"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "voice-call-panel transition-all duration-300 z-50 rounded-3xl overflow-hidden",
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
        <div className="h-full bg-[#1A1F2C] flex flex-col">
          {/* Phone number and status */}
          <div className="text-center pt-10 pb-4 px-4">
            <div className="text-white text-xl mb-1">{phoneNumber}</div>
            <div className="text-[#1EAEDB]">
              {status === CallStatus.CONNECTING ? "Calling..." : 
               status === CallStatus.CONNECTED ? "Connected" : 
               status === CallStatus.SPEAKING ? "Speaking..." : 
               "In call"}
            </div>
          </div>
          
          {/* Contact avatar */}
          <div className="flex justify-center mb-6">
            <Avatar className="h-24 w-24 bg-gray-700">
              <AvatarFallback className="text-4xl text-gray-400">AI</AvatarFallback>
            </Avatar>
          </div>
          
          {/* Contact name */}
          <div className="text-white text-center text-2xl mb-10">
            {callerName}
          </div>
          
          {/* Call control buttons */}
          <div className="grid grid-cols-3 gap-4 mb-8 px-8">
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
                className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 bg-transparent"
                onClick={toggleKeypad}
              >
                <KeyRound size={20} className="text-white" />
              </button>
              <span className="text-white text-xs">Keypad</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 bg-transparent"
              >
                <AlarmClock size={20} className="text-white" />
              </button>
              <span className="text-white text-xs">Reminder</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 bg-transparent"
              >
                <Video size={20} className="text-white" />
              </button>
              <span className="text-white text-xs">Video call</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 bg-transparent"
              >
                <Users size={20} className="text-white" />
              </button>
              <span className="text-white text-xs">Add call</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 bg-transparent"
              >
                <User size={20} className="text-white" />
              </button>
              <span className="text-white text-xs">Contacts</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-10 px-8">
            <div className="flex flex-col items-center gap-2">
              <button 
                className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-600 bg-transparent"
              >
                <Record size={20} className="text-white" />
              </button>
              <span className="text-white text-xs">Record</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500"
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
          
          {/* Keypad overlay */}
          {showKeypad && renderPhoneKeypad()}
        </div>
      )}
    </div>
  );
};

export default VoiceCallPanel;
