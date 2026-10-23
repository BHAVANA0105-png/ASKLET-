import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Square, 
  X, 
  Sparkles, 
  RotateCcw, 
  Radio, 
  Settings2, 
  MessageSquare,
  ShieldCheck,
  BrainCircuit,
  AlertCircle
} from 'lucide-react';
import { ChatConversation, ChatMessage, UserPreferences } from '../types';
import { getStoredMemories } from '../utils/storage';

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ChatConversation;
  onUpdateConversation: (conv: ChatConversation) => void;
  preferences: UserPreferences;
  onShowToast: (msg: string) => void;
  onOpenMemoryModal?: () => void;
}

export type VoicePersona = 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';

export const VoiceChatModal: React.FC<VoiceChatModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onUpdateConversation,
  preferences,
  onShowToast,
  onOpenMemoryModal
}) => {
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>('Kore');
  const [isMuted, setIsMuted] = useState(false);
  const [autoTurnTaking, setAutoTurnTaking] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastUserSpoke, setLastUserSpoke] = useState('');
  const [lastAiSpoke, setLastAiSpoke] = useState('');
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [ttsProvider, setTtsProvider] = useState<'gemini-tts' | 'browser-speech'>('gemini-tts');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isComponentMounted = useRef(true);

  // Check speech recognition support
  const SpeechRecognition = typeof window !== 'undefined' 
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
    : null;

  const stopAllAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore already stopped error
      }
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      onShowToast('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isMuted) {
      onShowToast('Microphone is muted. Unmute to speak.');
      return;
    }

    stopAllAudio();
    stopListening();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setMicPermissionState('granted');
        setVoiceState('listening');
        setCurrentTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = final || interim;
        setCurrentTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermissionState('denied');
          setVoiceState('idle');
          onShowToast('Microphone access denied. Please allow microphone permissions in your browser.');
        } else if (event.error !== 'no-speech') {
          setVoiceState('idle');
        }
      };

      recognition.onend = () => {
        // When speech recognition ends, if we have transcript, process it
        setCurrentTranscript(prev => {
          if (prev && prev.trim().length > 1) {
            handleProcessVoiceInput(prev.trim());
          } else {
            setVoiceState('idle');
          }
          return '';
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setVoiceState('idle');
    }
  };

  // Handle interrupting Asklet while speaking
  const handleInterrupt = () => {
    stopAllAudio();
    onShowToast('Interrupted Asklet');
    if (!isMuted) {
      startListening();
    } else {
      setVoiceState('idle');
    }
  };

  // Send voice query to AI backend and stream/play response
  const handleProcessVoiceInput = async (userInputText: string) => {
    setVoiceState('processing');
    setLastUserSpoke(userInputText);

    // Create user message in conversation
    const userMessage: ChatMessage = {
      id: `msg_voice_${Date.now()}`,
      role: 'user',
      content: userInputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: conversation.mode
    };

    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation: ChatConversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };
    onUpdateConversation(updatedConversation);

    // Gather active memories
    const activeMemories = preferences.memoryEnabled && !conversation.isTemporary
      ? getStoredMemories().filter(m => m.enabled)
      : [];

    try {
      // 1. Get conversational reply from multimodal backend
      const response = await fetch('/api/chat/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          webSearch: false,
          memories: activeMemories,
          customInstructions: preferences.customInstructions,
          mode: conversation.mode
        })
      });

      const data = await response.json();
      if (!data.success || !data.reply) {
        throw new Error(data.error || 'Failed to get voice reply');
      }

      const aiReply = data.reply;
      setLastAiSpoke(aiReply);

      // Save assistant message to conversation
      const assistantMessage: ChatMessage = {
        id: `msg_voice_${Date.now() + 1}`,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: conversation.mode
      };
      onUpdateConversation({
        ...updatedConversation,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: new Date().toISOString()
      });

      // 2. Synthesize spoken audio with Gemini TTS
      await playVoiceResponse(aiReply);
    } catch (error: any) {
      console.error('Voice conversation error:', error);
      setVoiceState('idle');
      onShowToast(`Voice error: ${error?.message || 'Could not reach server'}`);
    }
  };

  // Play voice response using Gemini TTS with graceful browser speech synthesis fallback
  const playVoiceResponse = async (text: string) => {
    setVoiceState('speaking');
    stopAllAudio();

    try {
      const ttsResponse = await fetch('/api/chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice
        })
      });

      const ttsData = await ttsResponse.json();

      if (ttsData.success && ttsData.audioUrl) {
        setTtsProvider('gemini-tts');
        const audio = new Audio(ttsData.audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          if (!isComponentMounted.current) return;
          currentAudioRef.current = null;
          setVoiceState('idle');
          if (autoTurnTaking && !isMuted) {
            // Automatically prompt user to reply
            startListening();
          }
        };

        audio.onerror = () => {
          fallbackSpeechSynthesis(text);
        };

        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('Gemini TTS fetch failed, switching to browser speech synthesis:', e);
    }

    fallbackSpeechSynthesis(text);
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTtsProvider('browser-speech');
      const cleanText = text.replace(/[*#`_~>\[\]\(\)]/g, ' ').slice(0, 1500);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = preferences.speechSpeed || 1.0;
      
      utterance.onend = () => {
        if (!isComponentMounted.current) return;
        setVoiceState('idle');
        if (autoTurnTaking && !isMuted) {
          startListening();
        }
      };

      utterance.onerror = () => {
        setVoiceState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceState('idle');
    }
  };

  // Open modal initial trigger
  useEffect(() => {
    if (isOpen) {
      isComponentMounted.current = true;
      // Start listening automatically on modal open if permissions allow
      startListening();
    } else {
      stopAllAudio();
      stopListening();
      setVoiceState('idle');
    }

    return () => {
      stopAllAudio();
      stopListening();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#242424] border border-[#333333] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#333333] bg-[#242424]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow-md font-bold">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white">Asklet Voice Companion</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181818] border border-[#333333] text-white">
                  {ttsProvider === 'gemini-tts' ? 'Gemini TTS' : 'Browser Voice'}
                </span>
              </div>
              <p className="text-[11px] text-[#A3A3A3]">Warm, conversational, two-way speech</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="p-2 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#181818] transition-colors"
              title="Voice Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                stopAllAudio();
                stopListening();
                onClose();
              }}
              className="p-2 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#181818] transition-colors"
              title="Return to Text Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice Persona & Turn Taking Settings Drawer */}
        {showVoiceSettings && (
          <div className="px-6 py-3.5 bg-[#181818] border-b border-[#333333] text-xs text-white space-y-3 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Voice Persona (Gemini TTS):</span>
              <div className="flex items-center gap-1">
                {(['Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'] as VoicePersona[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVoice(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedVoice === v 
                        ? 'bg-white text-black shadow-xs' 
                        : 'bg-[#242424] text-[#A3A3A3] hover:text-white border border-[#333333]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#A3A3A3]">Hands-free Auto Turn-Taking:</span>
              <button
                onClick={() => setAutoTurnTaking(!autoTurnTaking)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  autoTurnTaking ? 'bg-white' : 'bg-[#444444]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                    autoTurnTaking ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Central Visualizer & Conversation Bubble */}
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
          
          {/* Animated Circle Orb Indicator */}
          <div className="relative flex items-center justify-center">
            {/* Outer animated ripple rings */}
            {voiceState === 'listening' && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-white/10 animate-ping" />
                <div className="absolute w-36 h-36 rounded-full bg-white/15 animate-pulse" />
              </>
            )}

            {voiceState === 'speaking' && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-white/10 animate-pulse" />
                <div className="absolute w-36 h-36 rounded-full bg-white/15 animate-ping" />
              </>
            )}

            {voiceState === 'processing' && (
              <div className="absolute w-40 h-40 rounded-full bg-white/10 animate-spin" />
            )}

            {/* Core Orb */}
            <div className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 ${
              voiceState === 'listening'
                ? 'bg-white text-black scale-105'
                : voiceState === 'speaking'
                ? 'bg-[#181818] border-2 border-white text-white scale-110'
                : voiceState === 'processing'
                ? 'bg-[#333333] text-white'
                : 'bg-[#181818] border border-[#333333] text-[#A3A3A3]'
            }`}>
              {voiceState === 'listening' && <Mic className="w-10 h-10 animate-bounce text-black" />}
              {voiceState === 'speaking' && <Volume2 className="w-10 h-10 animate-pulse text-white" />}
              {voiceState === 'processing' && <Sparkles className="w-10 h-10 animate-spin text-white" />}
              {voiceState === 'idle' && <Mic className="w-10 h-10 text-white" />}
            </div>
          </div>

          {/* Status Text */}
          <div className="space-y-1.5 max-w-md">
            <h4 className="text-base font-bold text-white tracking-wide">
              {voiceState === 'listening' && 'Asklet is listening...'}
              {voiceState === 'speaking' && 'Asklet is speaking...'}
              {voiceState === 'processing' && 'Thinking warmly...'}
              {voiceState === 'idle' && 'Tap the microphone to speak'}
            </h4>
            
            <p className="text-xs text-[#A3A3A3] min-h-[36px] flex items-center justify-center px-4">
              {currentTranscript ? (
                <span className="text-white italic font-medium">"{currentTranscript}"</span>
              ) : voiceState === 'speaking' ? (
                <span className="text-white line-clamp-2">"{lastAiSpoke.slice(0, 120)}..."</span>
              ) : voiceState === 'listening' ? (
                'Speak naturally: share everyday stories, questions, or feelings...'
              ) : (
                'Asklet communicates like a supportive, fun, understanding companion.'
              )}
            </p>
          </div>

          {/* Real-time wave visualizer bars */}
          <div className="flex items-center gap-1.5 h-8">
            {[40, 70, 95, 60, 85, 50, 90, 65, 45].map((height, idx) => (
              <span
                key={idx}
                style={{
                  height: voiceState === 'speaking' 
                    ? `${(idx % 2 === 0 ? height * 0.9 : height * 0.6)}%`
                    : voiceState === 'listening' 
                    ? `${(idx % 3 === 0 ? height * 0.7 : 20)}%` 
                    : '15%'
                }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  voiceState === 'speaking'
                    ? 'bg-white'
                    : voiceState === 'listening'
                    ? 'bg-[#A3A3A3]'
                    : 'bg-[#444444]'
                }`}
              />
            ))}
          </div>

          {/* Permission warning if denied */}
          {micPermissionState === 'denied' && (
            <div className="p-3 bg-[#181818] border border-[#444444] rounded-2xl flex items-center gap-2 text-xs text-white text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-white" />
              <span>Microphone permissions are blocked in your browser. Please click the site settings lock icon in your address bar and allow Microphone.</span>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 bg-[#242424] border-t border-[#333333] flex items-center justify-between">
          
          {/* Mute/Unmute */}
          <button
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              if (next) {
                stopListening();
                stopAllAudio();
                setVoiceState('idle');
              } else {
                startListening();
              }
              onShowToast(next ? 'Microphone muted' : 'Microphone unmuted');
            }}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              isMuted 
                ? 'bg-white text-black border-white' 
                : 'bg-[#181818] border-[#333333] text-white hover:bg-[#2f2f2f]'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-black" /> : <Mic className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* Main Action: Interrupt or Push-to-Talk */}
          <div className="flex items-center gap-2">
            {voiceState === 'speaking' ? (
              <button
                onClick={handleInterrupt}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#eaeaea] text-black font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                title="Interrupt Asklet and speak now"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Interrupt &amp; Speak</span>
              </button>
            ) : voiceState === 'listening' ? (
              <button
                onClick={() => {
                  stopListening();
                  setVoiceState('idle');
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#181818] hover:bg-[#2f2f2f] text-white font-bold text-xs border border-[#333333] flex items-center gap-2 transition-all cursor-pointer"
                title="Pause listening"
              >
                <Square className="w-4 h-4 text-white" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startListening}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-[#eaeaea] text-black font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                title="Tap to speak"
              >
                <Mic className="w-4 h-4" />
                <span>Tap to Speak</span>
              </button>
            )}
          </div>

          {/* Return to Text Chat */}
          <button
            onClick={() => {
              stopAllAudio();
              stopListening();
              onClose();
            }}
            className="p-3 rounded-2xl bg-[#181818] border border-[#333333] text-white hover:bg-[#2f2f2f] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            title="Return to text messages"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Text Chat</span>
          </button>

        </div>

      </div>
    </div>
  );
};
