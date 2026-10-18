'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle, 
  Package, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Send, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

interface VoiceStoreAssistantProps {
  storeId?: string;
  storeSlug?: string;
  onActionExecuted?: (actionType: string, actionData: any) => void;
}

export function VoiceStoreAssistant({ 
  storeId, 
  storeSlug, 
  onActionExecuted 
}: VoiceStoreAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState<string>('Welcome to Buildexom Voice AI! Click the microphone and tell me what you want to manage in English or Urdu.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  
  // Pending safety confirmation state
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [insightsData, setInsightsData] = useState<any>(null);

  // Keyboard text input fallback
  const [textInput, setTextInput] = useState('');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis || null;

      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition || 
        null;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);

          // If speech has finalized
          if (event.results[event.results.length - 1].isFinal) {
            handleVoiceCommand(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setAssistantReply('Microphone permission was denied. You can type your command below!');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch {}
      }
    };
  }, [language]);

  // Update recognition language when state changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'ur' ? 'ur-PK' : 'en-US';
    }
  }, [language]);

  // Text-To-Speech Output
  const speakText = (text: string) => {
    if (isSoundMuted || !synthRef.current) return;
    try {
      synthRef.current.cancel();
      // Remove markdown bold asterisks and emojis for cleaner speech
      const cleanSpeech = text
        .replace(/[*_#~`]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = language === 'ur' ? 'ur-PK' : 'en-US';
      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // Start / Stop Microphone Listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setAssistantReply('Voice recognition is not supported in this browser. Please type your command below.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Error starting mic:', err);
      }
    }
  };

  // Send Command to Backend API
  const handleVoiceCommand = async (commandText: string, isConfirmed = false) => {
    if (!commandText.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/merchant/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: commandText,
          storeId,
          storeSlug,
          confirmed: isConfirmed,
          pendingAction,
          language
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process voice command.');

      setAssistantReply(data.reply || 'Action executed successfully.');
      speakText(data.reply);

      // Handle safety confirmation requirement
      if (data.requiresConfirmation) {
        setPendingAction(data.pendingAction);
      } else {
        setPendingAction(null);
      }

      // Handle insights display
      if (data.insights) {
        setInsightsData(data.insights);
      } else if (data.executed) {
        setInsightsData(null);
      }

      // Notify parent component to update live dashboard state
      if (data.executed) {
        onActionExecuted?.(data.actionType, data);
      }

    } catch (error: any) {
      const errMsg = error.message || 'Error executing command. Please try again.';
      setAssistantReply(`⚠️ ${errMsg}`);
      speakText(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Confirmed Pending Action
  const handleConfirmAction = () => {
    if (!pendingAction) return;
    handleVoiceCommand(pendingAction.rawCommand || 'confirm', true);
  };

  // Cancel Pending Action
  const handleCancelAction = () => {
    setPendingAction(null);
    const cancelMsg = language === 'ur' ? 'Action cancel kar diya gaya hai.' : 'Action has been cancelled.';
    setAssistantReply(cancelMsg);
    speakText(cancelMsg);
  };

  // Handle Manual Form Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const cmd = textInput.trim();
    setTextInput('');
    setTranscript(cmd);
    handleVoiceCommand(cmd);
  };

  return (
    <>
      {/* FLOATING ACTION LAUNCHER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="group relative flex items-center gap-2.5 rounded-full bg-linear-to-r from-emerald-600 via-teal-600 to-blue-600 px-4 py-3 text-white shadow-2xl transition duration-300 hover:scale-105 hover:shadow-emerald-500/25 active:scale-95"
          aria-label="Open AI Voice Assistant"
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-0.5 rounded-full bg-linear-to-r from-emerald-400 to-blue-500 opacity-60 blur-xs transition group-hover:opacity-100 animate-pulse" />

          <span className="relative flex size-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <Mic size={18} className="text-white" />
          </span>

          <div className="relative text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide uppercase">Voice AI</span>
              <span className="rounded bg-white/25 px-1.5 py-0.5 text-[9px] font-bold tracking-tight">ENG • UR</span>
            </div>
            <p className="text-[10px] text-emerald-100 font-medium leading-none mt-0.5">Speak to manage</p>
          </div>
        </button>
      </div>

      {/* EXPANDED VOICE ASSISTANT CONSOLE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl transition-all duration-300">
            
            {/* Header Strip */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-2xl bg-linear-to-tr from-emerald-500 to-blue-500 text-white shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">Voice-to-Action AI</h3>
                  <p className="text-[11px] text-slate-400">Natural voice control for your store</p>
                </div>
              </div>

              {/* Language & Sound Controls */}
              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <button
                  type="button"
                  onClick={() => setLanguage(l => l === 'en' ? 'ur' : 'en')}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 transition"
                  title="Switch Language (English / Urdu)"
                >
                  {language === 'en' ? '🇺🇸 English' : '🇵🇰 اردو (Urdu)'}
                </button>

                {/* Sound Mute Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSoundMuted(m => !m)}
                  className={`rounded-lg p-1.5 transition ${isSoundMuted ? 'text-slate-500 hover:text-slate-300' : 'text-emerald-400 hover:bg-slate-800'}`}
                  title={isSoundMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isSoundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Central Listening & Assistant Response Area */}
            <div className="p-5 space-y-4">
              
              {/* Voice Orb & Microphone Button */}
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="relative">
                  {/* Pulsing Audio Waves Ring */}
                  {isListening && (
                    <>
                      <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
                      <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-pulse duration-700" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`relative grid size-20 place-items-center rounded-full text-white shadow-xl transition-all duration-300 active:scale-90 ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/40 ring-4 ring-rose-400/50'
                        : 'bg-linear-to-tr from-emerald-600 to-teal-500 hover:scale-105 shadow-emerald-600/40'
                    }`}
                  >
                    {isListening ? (
                      <MicOff size={32} className="animate-pulse" />
                    ) : (
                      <Mic size={32} />
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`size-2 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span className="text-xs font-semibold text-slate-300">
                    {isListening 
                      ? (language === 'ur' ? 'Sun raha hoon... Boliye' : 'Listening... Speak now') 
                      : (isProcessing ? 'Processing command...' : 'Tap microphone to speak')}
                  </span>
                </div>

                {/* Live Transcript Bubble */}
                {transcript && (
                  <div className="mt-2.5 max-w-sm rounded-xl border border-slate-700/60 bg-slate-800/80 px-3.5 py-1.5 text-xs italic text-emerald-300">
                    "{transcript}"
                  </div>
                )}
              </div>

              {/* Assistant Reply Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                      {assistantReply}
                    </p>
                  </div>
                </div>
              </div>

              {/* SAFETY CONFIRMATION CARD (For Sensitive Actions) */}
              {pendingAction && (
                <div className="overflow-hidden rounded-2xl border border-amber-500/50 bg-amber-950/40 p-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle size={15} />
                    <span>Safety Confirmation Required</span>
                  </div>

                  <p className="mt-1.5 text-xs text-amber-100 font-medium">
                    {pendingAction.confirmationMessage || 'Please confirm this action to proceed.'}
                  </p>

                  <div className="mt-3.5 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleConfirmAction}
                      disabled={isProcessing}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                    >
                      <Check size={14} /> Confirm & Execute
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAction}
                      disabled={isProcessing}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* LIVE INSIGHTS CARDS (When Merchant Asks About Orders/Sales) */}
              {insightsData && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {insightsData.insightType === 'ORDERS_TODAY' && (
                    <>
                      <div className="rounded-xl border border-blue-500/40 bg-blue-950/30 p-3 text-center">
                        <span className="text-[10px] uppercase font-bold text-blue-300">Orders Today</span>
                        <div className="mt-1 flex items-center justify-center gap-1.5 text-lg font-black text-white">
                          <ShoppingBag size={18} className="text-blue-400" />
                          <span>{insightsData.ordersCount}</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-center">
                        <span className="text-[10px] uppercase font-bold text-emerald-300">Today's Revenue</span>
                        <div className="mt-1 flex items-center justify-center gap-1 text-base font-black text-white">
                          <span>Rs. {Number(insightsData.revenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {insightsData.insightType === 'TOP_SELLING' && (
                    <div className="col-span-2 rounded-xl border border-purple-500/40 bg-purple-950/30 p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-300">Top Selling Product</span>
                        <h4 className="text-sm font-extrabold text-white mt-0.5">{insightsData.topProduct}</h4>
                      </div>
                      <span className="grid size-9 place-items-center rounded-xl bg-purple-500/20 text-purple-300">
                        <TrendingUp size={18} />
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* QUICK VOICE PROMPT PILLS */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {language === 'ur' ? 'Aap yeh keh sakte hain:' : 'Try saying:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(language === 'ur' ? [
                    'Black T-shirt add karo price 1500',
                    'Aaj kitne orders aye hain?',
                    'Sab se zyada konsa product sell ho raha hai?',
                    'Summer Sale category banao',
                    'Running Shoes ki price 13000 kardo',
                    'Smart Watch delete kardo'
                  ] : [
                    'Add a black T-shirt, price Rs. 1,500 in Clothing',
                    'How many orders did I receive today?',
                    'Which product is selling the most?',
                    'Create a new category called Summer Sale',
                    'Update price of Running Shoes to 13,000',
                    'Delete the Smart Watch product'
                  ]).map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => {
                        setTranscript(phrase);
                        handleVoiceCommand(phrase);
                      }}
                      className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition"
                    >
                      🎙️ {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* KEYBOARD INPUT FALLBACK */}
              <form onSubmit={handleManualSubmit} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder={language === 'ur' ? 'Ya yahan type karein...' : 'Or type a command...'}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-white font-bold hover:bg-emerald-500 disabled:opacity-50 transition"
                >
                  <Send size={14} />
                </button>
              </form>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
