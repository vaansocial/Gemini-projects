import React from 'react';
import { X, Bot } from 'lucide-react';

interface MentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  isLoading: boolean;
}

const MentorModal: React.FC<MentorModalProps> = ({ isOpen, onClose, message, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-primary/50 rounded-2xl max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="bg-slate-900/50 p-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2 text-primary">
            <Bot size={24} />
            <h3 className="font-bold text-lg">The Oracle Speaks</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 min-h-[160px] flex items-center justify-center text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm animate-pulse">Divining your fate...</p>
            </div>
          ) : (
            <p className="text-lg leading-relaxed font-medium text-slate-100 font-serif italic">
              "{message}"
            </p>
          )}
        </div>

        <div className="p-4 bg-slate-900/30 text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            Accept Wisdom
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorModal;