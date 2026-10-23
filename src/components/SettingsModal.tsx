import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Moon, 
  Sun, 
  Volume2, 
  Globe, 
  Brain, 
  Download, 
  Trash2, 
  Check, 
  Sparkles,
  Sliders,
  FileCode
} from 'lucide-react';
import { UserPreferences } from '../types';
import { getStoredPreferences, saveStoredPreferences, getStoredConversations } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChanged: (prefs: UserPreferences) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onPreferencesChanged,
  onClearAllChats
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(getStoredPreferences());
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<UserPreferences>) => {
    const updated = saveStoredPreferences(partial);
    setPrefs(updated);
    onPreferencesChanged(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      conversations: getStoredConversations(),
      preferences: prefs,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asklet_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Hello! Asklet voice playback is working at this speed.');
      utterance.rate = prefs.speechSpeed || 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#242424] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#333333] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Settings &amp; Preferences
              </h2>
              <p className="text-xs text-[#A3A3A3]">
                Customize Asklet appearance, speech playback, and AI instructions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#181818] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

          {/* Theme */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
              Appearance &amp; Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleUpdate({ theme: 'light' })}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  prefs.theme === 'light'
                    ? 'border-white bg-white text-black shadow-xs'
                    : 'border-[#333333] bg-[#181818] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Theme</span>
              </button>

              <button
                onClick={() => handleUpdate({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  prefs.theme === 'dark'
                    ? 'border-white bg-white text-black shadow-xs'
                    : 'border-[#333333] bg-[#181818] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* Text-to-Speech Speed */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-white" />
                Voice Playback Speed
              </label>
              <button
                onClick={handleTestSpeech}
                className="text-[11px] font-bold text-white hover:underline cursor-pointer"
              >
                Test Voice
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleUpdate({ speechSpeed: speed })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    prefs.speechSpeed === speed
                      ? 'bg-white text-black border-white'
                      : 'border-[#333333] bg-[#181818] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Gemini Voice Persona */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Asklet Voice Persona (Gemini TTS)
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {['Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'].map((voiceName) => (
                <button
                  key={voiceName}
                  onClick={() => handleUpdate({ speechVoice: voiceName })}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    (prefs.speechVoice || 'Kore') === voiceName
                      ? 'bg-white text-black border-white shadow-xs'
                      : 'border-[#333333] bg-[#181818] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                  }`}
                >
                  {voiceName}
                </button>
              ))}
            </div>
          </div>

          {/* Default Web Search */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#181818] border border-[#333333]">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-white" />
                Enable Web Search by Default
              </span>
              <p className="text-[11px] text-[#A3A3A3]">
                Retrieves real-time live citations and grounding sources for current queries
              </p>
            </div>
            <input
              type="checkbox"
              checked={prefs.webSearchDefault}
              onChange={(e) => handleUpdate({ webSearchDefault: e.target.checked })}
              className="w-5 h-5 rounded accent-white cursor-pointer"
            />
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Custom Instructions for Asklet
            </label>
            <p className="text-[11px] text-[#A3A3A3]">
              Tell the AI how you want it to respond (e.g. &ldquo;Keep answers concise&rdquo;, &ldquo;Always write Python examples with type hints&rdquo;, &ldquo;I am a 3rd year Biology major&rdquo;).
            </p>
            <textarea
              rows={3}
              value={prefs.customInstructions}
              onChange={(e) => handleUpdate({ customInstructions: e.target.value })}
              placeholder="e.g. Always provide step-by-step mathematical reasoning and highlight key formulas..."
              className="w-full p-3 text-xs rounded-2xl bg-[#181818] border border-[#333333] text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-white leading-relaxed"
            />
          </div>

          {/* Data Controls */}
          <div className="pt-2 border-t border-[#333333] space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
              Data &amp; Privacy Controls
            </label>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#333333] bg-[#181818] text-xs font-bold text-white hover:bg-[#2f2f2f] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Conversations (JSON)</span>
              </button>

              <button
                onClick={onClearAllChats}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#444444] bg-[#181818] text-xs font-bold text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chats</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#333333] flex items-center justify-between bg-[#242424]">
          {savedNotice ? (
            <span className="text-xs font-bold text-white flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Saved automatically
            </span>
          ) : (
            <span className="text-[11px] text-[#A3A3A3]">Settings sync to your device</span>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#eaeaea] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
