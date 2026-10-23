import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Sparkles, 
  Globe, 
  Paperclip, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Edit3, 
  Trash2, 
  Menu, 
  Eye, 
  EyeOff, 
  Compass, 
  GraduationCap, 
  Code, 
  PenTool, 
  Calculator, 
  Wand2, 
  Download, 
  ExternalLink,
  ChevronDown,
  AlertCircle,
  X,
  Radio,
  Smile,
  Heart,
  Plus,
  Camera,
  Brain,
  Boxes,
  ArrowUp
} from 'lucide-react';
import { 
  ChatConversation, 
  ChatMessage, 
  ChatAttachment, 
  AssistantMode, 
  QuickMood,
  UserPreferences,
  UserMemory 
} from '../types';
import { ActiveTab } from './Navbar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getStoredMemories } from '../utils/storage';
import { VoiceChatModal } from './VoiceChatModal';

interface ChatAssistantViewProps {
  conversation: ChatConversation;
  onUpdateConversation: (conv: ChatConversation) => void;
  onToggleSidebarMobile: () => void;
  onOpenImageStudio: (prompt?: string, sourceImg?: string) => void;
  preferences: UserPreferences;
  onNavigateStudyTab?: (tab: ActiveTab, topic?: string) => void;
  onShowToast: (msg: string) => void;
}

export const QUICK_MOODS: { id: QuickMood; label: string; emoji: string; prompt: string; color: string }[] = [
  { 
    id: 'happy', 
    label: 'Happy', 
    emoji: '😊', 
    prompt: "Hey Asklet! I'm feeling really happy today! Let's chat and share some good vibes.",
    color: 'border-[#333333] hover:border-white hover:bg-[#2f2f2f] bg-[#242424] text-white'
  },
  { 
    id: 'sad', 
    label: 'Sad', 
    emoji: '😢', 
    prompt: "Hey Asklet, I'm feeling a little sad today. Can we talk? I could really use a friendly ear.",
    color: 'border-[#333333] hover:border-white hover:bg-[#2f2f2f] bg-[#242424] text-white'
  },
  { 
    id: 'stressed', 
    label: 'Stressed', 
    emoji: '😰', 
    prompt: "I'm feeling really stressed and overwhelmed with coursework and daily pressure. Can you offer some gentle comfort and practical advice?",
    color: 'border-[#333333] hover:border-white hover:bg-[#2f2f2f] bg-[#242424] text-white'
  },
  { 
    id: 'excited', 
    label: 'Excited', 
    emoji: '🎉', 
    prompt: "Guess what happened?! I'm super excited! Can we celebrate together?",
    color: 'border-[#333333] hover:border-white hover:bg-[#2f2f2f] bg-[#242424] text-white'
  },
  { 
    id: 'tired', 
    label: 'Tired', 
    emoji: '🥱', 
    prompt: "I'm feeling really exhausted and tired today. Just wanted a relaxing, peaceful chat without any heavy work.",
    color: 'border-[#333333] hover:border-white hover:bg-[#2f2f2f] bg-[#242424] text-white'
  },
  { 
    id: 'just_chat', 
    label: 'Just chat', 
    emoji: '💬', 
    prompt: "Hey Asklet! How are you doing? Let's just have a casual, fun chat about everyday life.",
    color: 'border-[#333333] hover:border-white hover:bg-[#2f2f2f] bg-[#242424] text-white'
  },
];

export const STARTER_PROMPTS = [
  {
    title: 'Talk to me',
    desc: 'Casual conversation, daily stories, or friendly banter',
    prompt: 'Hey Asklet! Talk to me — tell me something interesting or ask me about my day!',
    icon: Smile,
    color: 'text-white'
  },
  {
    title: 'Help me study',
    desc: 'Break down a tricky topic or review exam concepts step by step',
    prompt: "Help me study! Let's choose a key concept and review the core principles, intuition, and common pitfalls.",
    icon: GraduationCap,
    color: 'text-white'
  },
  {
    title: "I'm feeling stressed",
    desc: 'Gentle, comforting advice to ease academic or daily anxiety',
    prompt: "I'm feeling stressed and overwhelmed. Can you give me some gentle comfort, practical advice, and a calming perspective?",
    icon: Heart,
    color: 'text-white'
  },
  {
    title: 'Explain this simply',
    desc: 'Intuitive analogies for complex ideas without unnecessary jargon',
    prompt: 'Explain this simply using an everyday analogy that makes the concept click instantly.',
    icon: Sparkles,
    color: 'text-white'
  },
  {
    title: 'Give me ideas',
    desc: 'Creative brainstorming for projects, essays, or everyday solutions',
    prompt: "Give me fresh, creative ideas! Let's brainstorm some unique solutions and out-of-the-box approaches.",
    icon: Wand2,
    color: 'text-white'
  }
];

export const ChatAssistantView: React.FC<ChatAssistantViewProps> = ({
  conversation,
  onUpdateConversation,
  onToggleSidebarMobile,
  onOpenImageStudio,
  preferences,
  onNavigateStudyTab,
  onShowToast
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(preferences.webSearchDefault);
  const [isTemporaryChat, setIsTemporaryChat] = useState(Boolean(conversation.isTemporary));
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Asklet Bestie States: typing animation, mood bar, support banner, mode selector
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [typedLength, setTypedLength] = useState<number>(0);
  const [showMoodBar, setShowMoodBar] = useState<boolean>(false);
  const [selectedQuickMood, setSelectedQuickMood] = useState<QuickMood | null>(null);
  const [showSupportBanner, setShowSupportBanner] = useState<boolean>(false);
  const [showModeDropdown, setShowModeDropdown] = useState<boolean>(false);

  // Minimal ChatGPT-style composer states: Plus menu, Think Harder, Plugins Modal
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false);
  const [thinkHarder, setThinkHarder] = useState<boolean>(false);
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Close Plus menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setIsPlusMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPlusMenuOpen(false);
        setIsPluginsModalOpen(false);
      }
    };
    if (isPlusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlusMenuOpen]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isGenerating, typedLength]);

  // Smooth typewriter typing animation for assistant replies
  useEffect(() => {
    if (!typingMessageId) return;
    const msg = conversation.messages.find(m => m.id === typingMessageId);
    if (!msg || !msg.content) {
      setTypingMessageId(null);
      return;
    }

    if (typedLength >= msg.content.length) {
      setTypingMessageId(null);
      return;
    }

    // Step size based on length for smooth, brisk animation
    const step = Math.max(3, Math.floor(msg.content.length / 45));
    const timer = setTimeout(() => {
      setTypedLength(prev => {
        const next = prev + step;
        if (next >= msg.content.length) {
          setTypingMessageId(null);
          return msg.content.length;
        }
        return next;
      });
    }, 16);

    return () => clearTimeout(timer);
  }, [typingMessageId, typedLength, conversation.messages]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecordingVoice(false);
        if (event.error === 'not-allowed') {
          onShowToast('Microphone access denied. Please allow microphone permissions.');
        }
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, []);

  const handleToggleVoiceRecording = () => {
    if (!speechRecognitionRef.current) {
      onShowToast('Voice speech-to-text is not supported in this browser.');
      return;
    }

    if (isRecordingVoice) {
      speechRecognitionRef.current.stop();
      setIsRecordingVoice(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsRecordingVoice(true);
        onShowToast('Listening... Speak now into your microphone');
      } catch (err) {
        setIsRecordingVoice(false);
      }
    }
  };

  // Stop any active audio
  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechMsgId(null);
  };

  // Text to Speech playback using Gemini TTS API with browser speech fallback
  const handleSpeak = async (msgId: string, text: string) => {
    if (activeSpeechMsgId === msgId) {
      stopAudio();
      return;
    }

    stopAudio();
    setActiveSpeechMsgId(msgId);

    // Clean markdown formatting from text for spoken clarity
    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' [code block] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~>\[\]\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1200);

    // 1. Try Gemini TTS backend endpoint first
    try {
      const response = await fetch('/api/chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: preferences.speechVoice || 'Kore'
        })
      });

      const data = await response.json();
      if (data.success && data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setActiveSpeechMsgId(null);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          fallbackBrowserSpeech(msgId, cleanText);
        };
        await audio.play();
        return;
      }
    } catch (err) {
      console.warn('Backend Gemini TTS error, falling back to browser speech:', err);
    }

    // 2. Fallback to browser SpeechSynthesis
    fallbackBrowserSpeech(msgId, cleanText);
  };

  const fallbackBrowserSpeech = (msgId: string, cleanText: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = preferences.speechSpeed || 1.0;
      utterance.onend = () => setActiveSpeechMsgId(null);
      utterance.onerror = () => setActiveSpeechMsgId(null);
      window.speechSynthesis.speak(utterance);
      setActiveSpeechMsgId(msgId);
    } else {
      setActiveSpeechMsgId(null);
      onShowToast('Audio playback is not supported on this browser.');
    }
  };

  // Stop text-to-speech when unmounting or leaving
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Handle file uploads (txt, pdf, code, csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast('File size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newAtt: ChatAttachment = {
        id: `att_${Date.now()}`,
        type: 'file',
        name: file.name,
        size: file.size,
        mimeType: file.type || 'text/plain',
        textContent: content
      };
      setAttachments(prev => [...prev, newAtt]);
      onShowToast(`Attached document: ${file.name}`);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      onShowToast('Image must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const newAtt: ChatAttachment = {
        id: `att_${Date.now()}`,
        type: 'image',
        name: file.name,
        size: file.size,
        mimeType: file.type,
        data: base64Data
      };
      setAttachments(prev => [...prev, newAtt]);
      onShowToast(`Attached image: ${file.name}`);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Handle quick mood click
  const handleMoodClick = (mood: typeof QUICK_MOODS[0]) => {
    setSelectedQuickMood(mood.id);
    if (mood.id === 'sad' || mood.id === 'stressed') {
      setShowSupportBanner(true);
    }
    if (conversation.mode === 'general') {
      onUpdateConversation({ ...conversation, mode: 'bestie' });
    }
    handleSendMessage(mood.prompt);
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend && attachments.length === 0) return;

    if (isGenerating) return;

    // Emotional support detection
    const lower = textToSend.toLowerCase();
    if (
      lower.includes('stress') || 
      lower.includes('anxious') || 
      lower.includes('sad') || 
      lower.includes('depress') || 
      lower.includes('overwhelm') || 
      lower.includes('crying') || 
      lower.includes('hopeless') ||
      lower.includes('panic')
    ) {
      setShowSupportBanner(true);
    }

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: [...attachments],
      mode: conversation.mode
    };

    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation: ChatConversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };

    onUpdateConversation(updatedConversation);
    setInputText('');
    setAttachments([]);
    setIsGenerating(true);

    const controller = new AbortController();
    setAbortController(controller);

    // Fetch personal memories if enabled
    const activeMemories = preferences.memoryEnabled && !isTemporaryChat
      ? getStoredMemories().filter(m => m.enabled)
      : [];

    try {
      const response = await fetch('/api/chat/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments
          })),
          webSearch: webSearchEnabled,
          thinkHarder: thinkHarder,
          memories: activeMemories,
          customInstructions: preferences.customInstructions,
          mode: conversation.mode
        })
      });

      const data = await response.json();

      if (data.success && data.reply) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources || [],
          webSearchUsed: data.webSearchUsed,
          mode: conversation.mode
        };

        const finalConversation: ChatConversation = {
          ...updatedConversation,
          messages: [...updatedMessages, assistantMessage],
          updatedAt: new Date().toISOString()
        };

        // Smooth typing animation trigger for new assistant message
        setTypingMessageId(assistantMessage.id);
        setTypedLength(0);

        // If this was the first user message, generate a 3-4 word title
        if (conversation.messages.length === 0) {
          fetch('/api/chat/title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: textToSend })
          })
            .then(res => res.json())
            .then(titleData => {
              if (titleData.title) {
                finalConversation.title = titleData.title;
                onUpdateConversation(finalConversation);
              }
            })
            .catch(() => {});
        }

        onUpdateConversation(finalConversation);
      } else {
        throw new Error(data.error || 'Failed to get a response from Asklet.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        onShowToast('Generation stopped.');
      } else {
        const rawMsg = String(err?.message || '');
        let displayError = 'Could not communicate with Asklet server. Please try again.';
        if (rawMsg.includes('429') || rawMsg.includes('quota') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
          displayError = "I'm having a brief traffic surge, but I'm right here! Please feel free to send your message again.";
        } else if (rawMsg && !rawMsg.startsWith('{')) {
          displayError = rawMsg;
        }

        const errorMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: `⚠️ ${displayError}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        };
        onUpdateConversation({
          ...updatedConversation,
          messages: [...updatedMessages, errorMessage]
        });
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleRegenerate = (index: number) => {
    // Cut conversation up to the preceding user message
    const previousMessages = conversation.messages.slice(0, index);
    const lastUserMsg = previousMessages[previousMessages.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    const trimmedConversation = {
      ...conversation,
      messages: previousMessages.slice(0, previousMessages.length - 1)
    };
    onUpdateConversation(trimmedConversation);
    handleSendMessage(lastUserMsg.content);
  };

  const handleStartEditMessage = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.content);
  };

  const handleSaveAndResend = (msgIndex: number) => {
    if (!editingText.trim()) return;
    const previousMessages = conversation.messages.slice(0, msgIndex);
    const trimmedConversation = {
      ...conversation,
      messages: previousMessages
    };
    onUpdateConversation(trimmedConversation);
    setEditingMsgId(null);
    handleSendMessage(editingText.trim());
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
    onShowToast('Copied to clipboard');
  };

  const handleFeedback = (msgId: string, vote: 'up' | 'down') => {
    const updated = conversation.messages.map(m => {
      if (m.id === msgId) {
        return { ...m, feedback: m.feedback === vote ? undefined : vote };
      }
      return m;
    });
    onUpdateConversation({ ...conversation, messages: updated });
    onShowToast(vote === 'up' ? 'Thanks for the positive feedback!' : 'Feedback noted. We will keep improving.');
  };

  const modeIcons: Record<AssistantMode, any> = {
    bestie: Heart,
    general: Compass,
    study: GraduationCap,
    coding: Code,
    writing: PenTool,
    stem: Calculator
  };

  const modeLabels: Record<AssistantMode, string> = {
    bestie: 'Asklet Bestie',
    general: 'General',
    study: 'Study & Learn',
    coding: 'Code & Debug',
    writing: 'Writing & Edit',
    stem: 'STEM & Math'
  };

  const ActiveModeIcon = modeIcons[conversation.mode] || Compass;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] bg-[#090909] text-white transition-colors overflow-hidden">
      
      {/* Top Conversation Header */}
      <div className="h-14 border-b border-[#333333] px-4 sm:px-6 flex items-center justify-between bg-[#090909]/95 backdrop-blur-md z-20 shrink-0">
        
        <div className="flex items-center gap-3 truncate">
          <button
            onClick={onToggleSidebarMobile}
            className="p-1.5 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#242424] lg:hidden cursor-pointer"
            title="Toggle Conversations"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 truncate">
            <span className="font-extrabold text-sm sm:text-base text-white truncate">
              {conversation.title}
            </span>

            {/* Interactive Mode Badge & Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#242424] text-white border border-[#333333] hover:bg-[#2f2f2f] transition-all cursor-pointer"
                title="Click to switch conversation mode"
              >
                <ActiveModeIcon className="w-3 h-3 text-white" />
                <span>{modeLabels[conversation.mode] || conversation.mode}</span>
                <ChevronDown className="w-3 h-3 text-[#A3A3A3]" />
              </button>

              {showModeDropdown && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-2xl bg-[#242424] shadow-2xl border border-[#333333] p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-[#A3A3A3] uppercase tracking-wider">
                    Select Mode
                  </div>
                  {(['bestie', 'general', 'study', 'coding', 'writing', 'stem'] as AssistantMode[]).map((m) => {
                    const Icon = modeIcons[m] || Compass;
                    const isCurrent = conversation.mode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          onUpdateConversation({ ...conversation, mode: m });
                          setShowModeDropdown(false);
                          onShowToast(`Switched mode to ${modeLabels[m]}`);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                          isCurrent 
                            ? 'bg-white text-black font-bold' 
                            : 'text-[#A3A3A3] hover:text-white hover:bg-[#181818]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-black' : 'text-white'}`} />
                          <span>{modeLabels[m]}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-black" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {isTemporaryChat && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#242424] text-white border border-[#333333]">
                <EyeOff className="w-3 h-3" />
                <span>Incognito</span>
              </span>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Temporary Chat Toggle */}
          <button
            onClick={() => {
              const nextState = !isTemporaryChat;
              setIsTemporaryChat(nextState);
              onUpdateConversation({ ...conversation, isTemporary: nextState });
              onShowToast(nextState ? 'Temporary Chat: Messages will not be saved to memory' : 'Normal Chat: Memory enabled');
            }}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isTemporaryChat 
                ? 'bg-white text-black font-bold' 
                : 'text-[#A3A3A3] hover:text-white hover:bg-[#242424]'
            }`}
            title={isTemporaryChat ? 'Disable Temporary Chat' : 'Enable Temporary Incognito Chat'}
          >
            {isTemporaryChat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden md:inline">{isTemporaryChat ? 'Incognito' : 'Standard'}</span>
          </button>

          {/* Voice Chat Button */}
          <button
            onClick={() => {
              stopAudio();
              setIsVoiceModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-[#eaeaea] text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Start Interactive Two-Way Voice Chat"
          >
            <Mic className="w-3.5 h-3.5 text-black" />
            <span>Voice Chat</span>
          </button>

          {/* Image Studio Button */}
          <button
            onClick={() => onOpenImageStudio()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#242424] text-white hover:bg-[#2f2f2f] text-xs font-semibold border border-[#333333] transition-all cursor-pointer"
            title="Asklet Image Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Image Studio</span>
          </button>
        </div>
      </div>

      {/* Temporary Chat Banner */}
      {isTemporaryChat && (
        <div className="px-4 py-1.5 bg-[#242424] border-b border-[#333333] flex items-center justify-center gap-2 text-xs font-medium text-white">
          <EyeOff className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span>Temporary Chat enabled: Asklet won&apos;t use or update memories from this session.</span>
        </div>
      )}

      {/* Messages Thread Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6">
        
        {/* Support Banner (if activated) */}
        {showSupportBanner && (
          <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-[#242424] border border-[#333333] flex items-start justify-between gap-3 text-xs leading-relaxed text-white animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <Heart className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Care &amp; Support Reminder</p>
                <p className="text-[#A3A3A3] mt-0.5">
                  Asklet is here to listen, offer gentle comfort, and chat as an AI companion. However, Asklet cannot replace licensed doctors, professional therapists, or emergency crisis services. If you feel overwhelmed, reaching out to a trusted loved one, counselor, or healthcare professional is always a caring step.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSupportBanner(false)}
              className="p-1 rounded-lg text-[#A3A3A3] hover:text-white cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Empty State: Welcoming Heading 'How can I help you?' */}
        {conversation.messages.length === 0 && (
          <div className="max-w-2xl mx-auto py-8 sm:py-16 space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How can I help you?
              </h1>
              <p className="text-sm text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
                Ask a question, brainstorm ideas, analyze files, or start a natural conversation with Asklet AI.
              </p>

              {/* Quick Moods Selector */}
              <div className="pt-2 pb-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                  {QUICK_MOODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleMoodClick(m)}
                      className="px-3.5 py-1.5 rounded-full border border-[#333333] bg-[#242424] text-white hover:bg-[#2f2f2f] hover:border-[#444444] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Example Starter Prompts */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] px-1">
                Suggested Prompts
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {STARTER_PROMPTS.map((card, i) => {
                  const IconComponent = card.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(card.prompt)}
                      className="p-3.5 rounded-2xl border border-[#333333] bg-[#242424] hover:bg-[#2a2a2a] hover:border-[#444444] text-left transition-all group space-y-1 cursor-pointer"
                    >
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <IconComponent className="w-3.5 h-3.5 text-white" />
                          <span>{card.title}</span>
                        </span>
                      </p>
                      <p className="text-xs text-[#A3A3A3] leading-relaxed">
                        {card.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtle Safety Note */}
            <div className="text-center pt-2 text-[11px] text-[#A3A3A3]">
              Asklet AI is your AI companion. It cannot replace licensed doctors, therapists, or emergency services.
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="max-w-3xl mx-auto space-y-6">
          {conversation.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isEditing = editingMsgId === msg.id;

            return (
              <div 
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shrink-0 mt-1 shadow-sm font-bold">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[88%] sm:max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Attached images / files */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="relative group">
                          {att.type === 'image' && att.data ? (
                            <div className="rounded-2xl overflow-hidden border border-[#333333] bg-[#242424] max-w-xs shadow-xs">
                              <img src={att.data} alt={att.name} className="max-h-56 object-cover" />
                              <div className="p-1.5 text-[10px] text-[#A3A3A3] truncate bg-[#181818] font-mono">
                                {att.name}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#242424] border border-[#333333] text-xs font-semibold text-white">
                              <Paperclip className="w-3.5 h-3.5 text-[#A3A3A3]" />
                              <span className="truncate max-w-[140px]">{att.name}</span>
                              <span className="text-[10px] text-[#A3A3A3] font-normal">
                                {Math.round(att.size / 1024)} KB
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div 
                    className={`rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                      isUser
                        ? 'bg-[#242424] text-white border border-[#333333] shadow-sm'
                        : msg.isError
                        ? 'bg-[#181818] text-white border border-[#444444]'
                        : 'bg-transparent text-white border border-[#333333]'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          rows={3}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#181818] text-white text-sm border border-[#333333] focus:outline-none focus:border-white"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingMsgId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-[#A3A3A3] hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveAndResend(index)}
                            className="px-3 py-1 rounded-lg bg-white text-black text-xs font-bold shadow-xs hover:bg-[#eaeaea]"
                          >
                            Save &amp; Resend
                          </button>
                        </div>
                      </div>
                    ) : isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : msg.id === typingMessageId ? (
                      <div className="space-y-2">
                        <MarkdownRenderer content={msg.content.slice(0, typedLength)} />
                        <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse align-middle" />
                        <div className="flex items-center justify-end pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTypingMessageId(null);
                            }}
                            className="text-[11px] font-bold text-white hover:underline cursor-pointer"
                          >
                            Skip typing &rarr;
                          </button>
                        </div>
                      </div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>

                  {/* Google Search Citations Grounding */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#181818] border border-[#333333] space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Globe className="w-3.5 h-3.5 text-[#A3A3A3]" />
                        <span>Sources &amp; Grounding Citations:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#242424] border border-[#333333] text-white hover:bg-[#2f2f2f] text-[11px] font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-[#A3A3A3]" />
                            <span className="truncate max-w-[180px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Action Toolbar */}
                  {!isEditing && (
                    <div className={`flex items-center gap-1 text-[#A3A3A3] text-xs pt-0.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-[#A3A3A3] mr-2">{msg.timestamp}</span>

                      {/* User edit button */}
                      {isUser && (
                        <button
                          onClick={() => handleStartEditMessage(msg)}
                          className="p-1 hover:text-white rounded"
                          title="Edit message"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Assistant actions: Copy, Speak, Regenerate, Thumbs */}
                      {!isUser && !msg.isError && (
                        <>
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1 hover:text-white rounded transition-colors"
                            title="Copy answer"
                          >
                            {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            className={`p-1 rounded transition-colors ${
                              activeSpeechMsgId === msg.id 
                                ? 'text-white animate-pulse' 
                                : 'hover:text-white'
                            }`}
                            title={activeSpeechMsgId === msg.id ? 'Stop reading' : 'Read aloud'}
                          >
                            {activeSpeechMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleRegenerate(index)}
                            className="p-1 hover:text-white rounded transition-colors"
                            title="Regenerate response"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={`p-1 rounded transition-colors ${msg.feedback === 'up' ? 'text-white font-bold' : 'hover:text-white'}`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={`p-1 rounded transition-colors ${msg.feedback === 'down' ? 'text-white font-bold' : 'hover:text-white'}`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Thinking Indicator */}
          {isGenerating && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shrink-0 shadow-sm font-bold">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div className="p-4 rounded-3xl bg-[#242424] border border-[#333333] flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#A3A3A3] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#666666] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-semibold text-white">
                  {webSearchEnabled 
                    ? 'Searching internet & verifying facts...' 
                    : conversation.mode === 'bestie'
                    ? 'Asklet Bestie is thinking...'
                    : 'Asklet is thinking...'}
                </span>
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="ml-2 px-2.5 py-1 rounded-xl bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Stop generation"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Minimal ChatGPT-Style Input / Command Composer */}
      <div className="p-3 sm:p-4 border-t border-[#333333] bg-[#090909] shrink-0 sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto space-y-2 relative">
          
          {/* Active Status Badges / Attachment Previews above Composer */}
          <div className="flex flex-wrap items-center gap-2 empty:hidden">
            {/* Think Harder Active Badge */}
            {thinkHarder && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] border border-[#333333] text-white text-xs font-semibold animate-in fade-in">
                <Brain className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Think harder active (Deep reasoning)</span>
                <button
                  type="button"
                  onClick={() => setThinkHarder(false)}
                  className="p-0.5 text-[#A3A3A3] hover:text-white ml-1 cursor-pointer"
                  title="Turn off deep reasoning"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Web Search Active Badge */}
            {webSearchEnabled && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#242424] border border-[#333333] text-white text-xs font-semibold animate-in fade-in">
                <Globe className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Live Google Search</span>
                <button
                  type="button"
                  onClick={() => setWebSearchEnabled(false)}
                  className="p-0.5 text-[#A3A3A3] hover:text-white ml-1 cursor-pointer"
                  title="Turn off search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* File & Image Previews */}
            {attachments.map((att) => (
              <div 
                key={att.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#242424] border border-[#333333] text-xs font-semibold text-white animate-in fade-in"
              >
                {att.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <Paperclip className="w-3.5 h-3.5 text-white shrink-0" />
                )}
                <span className="truncate max-w-[130px]">{att.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="p-0.5 text-[#A3A3A3] hover:text-white cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Hidden File, Image, and Camera Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.csv,.py,.js,.ts,.tsx,.html,.css,.pdf"
            className="hidden"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Quick Moods Drawer (Opened via Besty Mood in Plus Menu) */}
          {showMoodBar && (
            <div className="p-3 rounded-2xl bg-[#242424] border border-[#333333] flex flex-wrap items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 mr-1">
                <Heart className="w-3.5 h-3.5 text-white fill-white" /> Besty Mood:
              </span>
              {QUICK_MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    handleMoodClick(m);
                    setShowMoodBar(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border bg-[#181818] border-[#333333] text-white hover:bg-[#2f2f2f] transition-all flex items-center gap-1.5 cursor-pointer`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowMoodBar(false)}
                className="ml-auto text-[#A3A3A3] hover:text-white p-1 cursor-pointer"
                title="Close moods"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Pop-up Plus (+) Menu */}
          {isPlusMenuOpen && (
            <div
              ref={plusMenuRef}
              className="absolute bottom-full left-0 mb-3 z-30 w-72 sm:w-80 bg-[#242424] rounded-2xl shadow-2xl border border-[#333333] p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3] border-b border-[#333333] mb-1 flex items-center justify-between">
                <span>Add to conversation</span>
                <span className="text-[10px] lowercase font-normal text-[#A3A3A3]">esc to close</span>
              </div>

              {/* 2-Column Options Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                
                {/* 1. Camera */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    cameraInputRef.current?.click();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-[#2f2f2f] transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#333333] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white">Camera</div>
                    <div className="text-[10px] text-[#A3A3A3] truncate">Capture photo</div>
                  </div>
                </button>

                {/* 2. Photos */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    imageInputRef.current?.click();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-[#2f2f2f] transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#333333] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white">Photos</div>
                    <div className="text-[10px] text-[#A3A3A3] truncate">Choose images</div>
                  </div>
                </button>

                {/* 3. File */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-[#2f2f2f] transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#333333] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Paperclip className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white">File</div>
                    <div className="text-[10px] text-[#A3A3A3] truncate">Attach docs</div>
                  </div>
                </button>

                {/* 4. Plugins */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    setIsPluginsModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-[#2f2f2f] transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#333333] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white">Plugins</div>
                    <div className="text-[10px] text-[#A3A3A3] truncate">{webSearchEnabled ? 'Search active' : 'Tools & search'}</div>
                  </div>
                </button>

                {/* 5. Think harder */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !thinkHarder;
                    setThinkHarder(next);
                    setIsPlusMenuOpen(false);
                    onShowToast(next ? 'Think Harder enabled: Deep step-by-step reasoning' : 'Think Harder disabled');
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors group cursor-pointer ${
                    thinkHarder 
                      ? 'bg-[#181818] border border-white' 
                      : 'hover:bg-[#2f2f2f]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                    thinkHarder 
                      ? 'bg-white text-black' 
                      : 'bg-[#181818] border border-[#333333] text-white'
                  }`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white flex items-center gap-1">
                      <span>Think harder</span>
                      {thinkHarder && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </div>
                    <div className="text-[10px] text-[#A3A3A3] truncate">{thinkHarder ? 'Active' : 'Deep reasoning'}</div>
                  </div>
                </button>

                {/* 6. Besty Mood */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    if (conversation.mode !== 'bestie') {
                      onUpdateConversation({ ...conversation, mode: 'bestie' });
                    }
                    setShowMoodBar(true);
                    onShowToast('Besty Mood activated ❤️ Select your mood or chat naturally');
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors group cursor-pointer ${
                    conversation.mode === 'bestie'
                      ? 'bg-[#181818] border border-white'
                      : 'hover:bg-[#2f2f2f]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                    conversation.mode === 'bestie'
                      ? 'bg-white text-black'
                      : 'bg-[#181818] border border-[#333333] text-white'
                  }`}>
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white flex items-center gap-1">
                      <span>Besty Mood</span>
                      {conversation.mode === 'bestie' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </div>
                    <div className="text-[10px] text-[#A3A3A3] truncate">Companion moods</div>
                  </div>
                </button>

              </div>

              {/* Extra Live Voice Action */}
              <div className="pt-1.5 mt-1.5 border-t border-[#333333]">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    stopAudio();
                    setIsVoiceModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-[#2f2f2f] text-left transition-colors group cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Live Voice Conversation</span>
                  <span className="text-[10px] text-[#A3A3A3] ml-auto font-medium">2-way talk &rarr;</span>
                </button>
              </div>

            </div>
          )}

          {/* Minimal ChatGPT-Style Composer Container: EXACTLY 3 Primary Controls */}
          <div className="relative flex items-end gap-1.5 sm:gap-2 bg-[#242424] rounded-[26px] border border-[#333333] px-2 sm:px-3 py-1.5 sm:py-2 shadow-xs focus-within:border-white transition-all">
            
            {/* Control 1 (Left): Plus (+) Button */}
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(prev => !prev)}
              className={`p-2 rounded-full transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                isPlusMenuOpen 
                  ? 'bg-white text-black rotate-45 shadow-xs' 
                  : 'text-[#A3A3A3] hover:bg-[#2f2f2f] hover:text-white'
              }`}
              title="Add options (Camera, Photos, File, Plugins, Think harder, Besty Mood)"
              aria-label="Add options"
            >
              <Plus className="w-5 h-5 transition-transform" />
            </button>

            {/* Center: Natural Auto-Expanding Text Input */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isRecordingVoice 
                  ? 'Listening to speech...' 
                  : 'Message Asklet...'
              }
              className="flex-1 bg-transparent border-0 resize-none py-1.5 px-1.5 text-sm sm:text-base text-white placeholder:text-[#A3A3A3] focus:outline-none min-h-[38px] max-h-[160px] leading-relaxed"
            />

            {/* Control 2 (Right): Microphone / Voice Input */}
            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              className={`p-2 rounded-full transition-all shrink-0 cursor-pointer flex items-center justify-center ${
                isRecordingVoice 
                  ? 'bg-white text-black animate-pulse shadow-md' 
                  : 'text-[#A3A3A3] hover:bg-[#2f2f2f] hover:text-white'
              }`}
              title={isRecordingVoice ? 'Stop recording' : 'Voice input (Speech to text)'}
              aria-label="Voice input"
            >
              {isRecordingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Control 3 (Far Right): Send or Stop Generation */}
            {isGenerating ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="p-2 rounded-full bg-white text-black hover:bg-[#eaeaea] shadow-xs transition-all shrink-0 cursor-pointer flex items-center justify-center"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square className="w-4 h-4 fill-current m-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && attachments.length === 0}
                className="p-2 rounded-full bg-white text-black disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#eaeaea] shadow-xs transition-all shrink-0 cursor-pointer flex items-center justify-center font-bold"
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}

          </div>

          {/* Minimal Safe Area / Helper Note */}
          <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] px-3">
            <span>Asklet AI can make mistakes. Check important info.</span>
            {onNavigateStudyTab && (
              <button
                onClick={() => onNavigateStudyTab('explain', inputText)}
                className="hover:text-white font-semibold transition-colors"
              >
                Explainer &rarr;
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Plugins & Tools Modal */}
      {isPluginsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsPluginsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-[#242424] border border-[#333333] p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Asklet Plugins &amp; Tools</h3>
                  <p className="text-xs text-[#A3A3A3]">Enhance your conversational AI experience</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPluginsModalOpen(false)}
                className="p-1 rounded-lg text-[#A3A3A3] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              
              {/* Plugin 1: Live Web Search */}
              <div className="p-3 rounded-xl bg-[#181818] border border-[#333333] flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#242424] border border-[#333333] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Google Web Search</div>
                    <div className="text-[11px] text-[#A3A3A3]">Live web grounding and citation sources</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !webSearchEnabled;
                    setWebSearchEnabled(next);
                    onShowToast(next ? 'Live Web Search enabled' : 'Web Search disabled');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    webSearchEnabled
                      ? 'bg-white text-black shadow-xs'
                      : 'bg-[#242424] border border-[#333333] text-[#A3A3A3] hover:text-white'
                  }`}
                >
                  {webSearchEnabled ? 'Active' : 'Enable'}
                </button>
              </div>

              {/* Plugin 2: Image Studio */}
              <div className="p-3 rounded-xl bg-[#181818] border border-[#333333] flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#242424] border border-[#333333] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Image Studio</div>
                    <div className="text-[11px] text-[#A3A3A3]">Generate, edit, and explore visuals</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPluginsModalOpen(false);
                    onOpenImageStudio(inputText);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-[#eaeaea] transition-colors cursor-pointer"
                >
                  Open Studio
                </button>
              </div>

              {/* Plugin 3: Live 2-Way Voice Chat */}
              <div className="p-3 rounded-xl bg-[#181818] border border-[#333333] flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#242424] border border-[#333333] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">2-Way Voice Mode</div>
                    <div className="text-[11px] text-[#A3A3A3]">Real-time spoken dialogue with speech audio</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPluginsModalOpen(false);
                    stopAudio();
                    setIsVoiceModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-[#eaeaea] transition-colors cursor-pointer"
                >
                  Start Call
                </button>
              </div>

              {/* Plugin 4: Deep Topic Explainer */}
              {onNavigateStudyTab && (
                <div className="p-3 rounded-xl bg-[#181818] border border-[#333333] flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#242424] border border-[#333333] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Study Explainer</div>
                      <div className="text-[11px] text-[#A3A3A3]">Concept breakdowns with analogies &amp; quizzes</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPluginsModalOpen(false);
                      onNavigateStudyTab('explain', inputText);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-[#eaeaea] transition-colors cursor-pointer"
                  >
                    Launch
                  </button>
                </div>
              )}

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPluginsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-[#eaeaea] transition-opacity cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Way Conversational Voice Modal */}
      <VoiceChatModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        conversation={conversation}
        onUpdateConversation={onUpdateConversation}
        preferences={preferences}
        onShowToast={onShowToast}
      />

    </div>
  );
};
