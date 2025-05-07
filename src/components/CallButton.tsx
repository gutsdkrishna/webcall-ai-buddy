
import React from 'react';
import { PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallButtonProps {
  onClick: () => void;
  className?: string;
}

const CallButton: React.FC<CallButtonProps> = ({ onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full bg-green-500 text-white w-16 h-16 flex items-center justify-center",
        "hover:bg-green-600 transition-colors duration-300 shadow-lg pulse-animation",
        className
      )}
      aria-label="Start voice conversation"
    >
      <PhoneCall size={24} />
    </button>
  );
};

export default CallButton;
