
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface WaveformProps {
  isActive: boolean;
  className?: string;
}

const Waveform: React.FC<WaveformProps> = ({ isActive, className }) => {
  const [bars] = useState(Array.from({ length: 20 }, (_, i) => i));
  const intervalRef = useRef<number | null>(null);
  const [heights, setHeights] = useState<number[]>(bars.map(() => Math.random() * 20 + 4));

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setHeights(bars.map(() => Math.random() * 20 + 4));
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        setHeights(bars.map(() => 4));
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, bars]);

  return (
    <div className={cn('flex items-center justify-center gap-1 h-24', className)}>
      {bars.map((_, index) => (
        <div
          key={index}
          className="waveform-bar"
          style={{
            height: `${isActive ? heights[index] : 4}px`,
            opacity: isActive ? 0.7 + Math.random() * 0.3 : 0.3,
            backgroundColor: '#22c55e', // Green color to match the call button
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;
