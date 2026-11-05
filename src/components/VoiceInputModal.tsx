import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, ArrowRight, Volume2, Check } from 'lucide-react';
import { parseVoiceInputPhrase, getDateWithOffset, formatCalendarDate } from '../utils/dateUtils';
import { PantryItem, FoodCategory } from '../types/pantry';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<PantryItem, 'id'>) => void;
}

const SAMPLE_VOICE_PHRASES = [
  'Add Milk expiring in 4 days',
  'Add Organic Eggs expiring in 1 week',
  'Add Fresh Chicken expiring in 2 days',
  'Add Greek Yogurt expiring in 5 days',
  'Add Cheddar Cheese expiring in 1 month',
  'Add Sliced Bread expiring tomorrow',
];

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [parsedResult, setParsedResult] = useState<{ itemName: string; daysOffset: number } | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setParsedResult(null);
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      return;
    }

    // Initialize Web Speech API if supported in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const speechResult = event.results[current][0].transcript;
          setTranscript(speechResult);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch {
          setIsListening(true);
        }
      } catch {
        setHasSpeechSupport(false);
        setIsListening(true);
      }
    } else {
      setHasSpeechSupport(false);
      setIsListening(true);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen]);

  // Update parsed result dynamically whenever transcript changes
  useEffect(() => {
    if (transcript.trim()) {
      const parsed = parseVoiceInputPhrase(transcript);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  }, [transcript]);

  if (!isOpen) return null;

  const handleSimulatePhrase = (phrase: string) => {
    setTranscript(phrase);
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const handleConfirm = () => {
    if (!parsedResult) return;

    // Detect category heuristic
    const lower = parsedResult.itemName.toLowerCase();
    let category: FoodCategory = 'other';
    if (lower.includes('milk') || lower.includes('yogurt') || lower.includes('cheese') || lower.includes('egg') || lower.includes('butter')) {
      category = 'dairy';
    } else if (lower.includes('bread') || lower.includes('bagel') || lower.includes('toast') || lower.includes('bun')) {
      category = 'bakery';
    } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('salmon') || lower.includes('meat') || lower.includes('pork') || lower.includes('fish')) {
      category = 'meat';
    } else if (lower.includes('tomato') || lower.includes('apple') || lower.includes('banana') || lower.includes('salad') || lower.includes('spinach') || lower.includes('berry')) {
      category = 'produce';
    }

    onAddItem({
      name: parsedResult.itemName,
      category,
      addedAt: new Date().toISOString(),
      expiresAt: getDateWithOffset(parsedResult.daysOffset),
      quantity: 1,
      unit: 'item',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-4">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all ${
              isListening ? 'bg-rose-500 shadow-lg shadow-rose-500/30 ring-8 ring-rose-100 dark:ring-rose-950/60 scale-105' : 'bg-emerald-600'
            }`}>
              {isListening ? (
                <Mic className="w-8 h-8 animate-pulse stroke-[2.2]" />
              ) : (
                <Volume2 className="w-8 h-8 stroke-[2.2]" />
              )}
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600"></span>
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isListening ? 'Listening for your groceries...' : 'Voice Entry Ready'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Speak natural phrases like: <em>"Add Milk expiring in 4 days"</em>
          </p>
        </div>

        {/* Live Audio Waves Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-8 my-2">
          {[40, 75, 95, 60, 85, 100, 70, 50, 80, 65, 45].map((height, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
              style={{
                height: isListening ? `${Math.max(8, (height * Math.random()) * 0.32)}px` : '6px',
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>

        {/* Active Transcript Box */}
        <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200 dark:border-slate-700">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Transcribed Speech
          </label>
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isListening ? "Listening... or click a quick phrase below" : "Type or choose a test voice phrase..."}
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />

          {parsedResult && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {parsedResult.itemName}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Offset: +{parsedResult.daysOffset} days ({formatCalendarDate(getDateWithOffset(parsedResult.daysOffset))})
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
              >
                <span>Add Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Voice Simulation Buttons */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Try Quick Test Audio Phrases</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {SAMPLE_VOICE_PHRASES.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulatePhrase(phrase)}
                className="text-left text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition active:scale-95 cursor-pointer"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
