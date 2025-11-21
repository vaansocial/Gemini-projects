import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  color?: string;
  label?: string;
  showText?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, color = "bg-secondary", label, showText = true }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className="w-full">
      {label && <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">{label}</div>}
      <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden shadow-inner relative">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out flex items-center justify-end pr-1`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full absolute top-0 left-0 bg-white opacity-10 animate-pulse"></div>
        </div>
        {showText && (
           <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
             {Math.floor(current)} / {max}
           </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;