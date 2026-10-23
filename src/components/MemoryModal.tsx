import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Trash2, 
  Plus, 
  X, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';
import { UserMemory } from '../types';
import { 
  getStoredMemories, 
  saveStoredMemory, 
  deleteStoredMemory, 
  toggleStoredMemory, 
  clearStoredMemories 
} from '../utils/storage';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryUpdated?: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose, onMemoryUpdated }) => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Academic Goals');
  const [isAdding, setIsAdding] = useState(false);
  const [serverSyncStatus, setServerSyncStatus] = useState<string | null>(null);

  const loadMemories = () => {
    const local = getStoredMemories();
    setMemories(local);
  };

  useEffect(() => {
    if (isOpen) {
      loadMemories();
      // Also sync from backend /api/memories
      fetch('/api/memories')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.memories) && data.memories.length > 0) {
            // Merge with local if helpful
            setServerSyncStatus('Synced with secure backend');
          }
        })
        .catch(err => {
          console.warn('Backend memory sync:', err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const saved = saveStoredMemory(newContent.trim(), newCategory);
    setMemories(getStoredMemories());
    setNewContent('');
    setIsAdding(false);

    // Sync to backend
    try {
      await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: saved.content, category: saved.category })
      });
    } catch (e) {
      // Local storage already has it
    }

    onMemoryUpdated?.();
  };

  const handleDelete = async (id: string) => {
    deleteStoredMemory(id);
    setMemories(getStoredMemories());

    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
    } catch (e) {
      // Ignored
    }
    onMemoryUpdated?.();
  };

  const handleToggle = (id: string) => {
    toggleStoredMemory(id);
    setMemories(getStoredMemories());
    onMemoryUpdated?.();
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all stored personal memories? Asklet will no longer remember these facts.')) {
      clearStoredMemories();
      setMemories([]);
      try {
        await fetch('/api/memories', { method: 'DELETE' });
      } catch (e) {}
      onMemoryUpdated?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#242424] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#333333] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Personal Memory
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181818] border border-[#333333] text-white">
                  Active
                </span>
              </h2>
              <p className="text-xs text-[#A3A3A3]">
                Asklet uses your saved memories to personalize context across chats
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

        {/* Info Banner */}
        <div className="px-6 py-3 bg-[#181818] border-b border-[#333333] flex items-start gap-3 text-xs text-white">
          <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white">Privacy First &amp; User Controlled</p>
            <p className="text-[#A3A3A3]">
              Asklet never silently stores sensitive data. You can view, disable, or delete any memory at any time.
            </p>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider">
              Stored Facts &amp; Preferences ({memories.length})
            </h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
          </div>

          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleAddMemory} className="p-4 rounded-2xl bg-[#181818] border border-[#333333] space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-white mb-1">
                  What should Asklet remember?
                </label>
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. Major in Computer Science, prefers Python over C++..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#242424] border border-[#333333] text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-white"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-white mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-[#242424] border border-[#333333] text-white"
                  >
                    <option value="Academic Goals">Academic Goals</option>
                    <option value="Learning Preferences">Learning Preferences</option>
                    <option value="Technical Skills">Technical Skills</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="flex items-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-white text-black hover:bg-[#eaeaea] cursor-pointer"
                  >
                    Save Fact
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List */}
          {memories.length > 0 ? (
            <div className="space-y-2.5">
              {memories.map((mem) => (
                <div 
                  key={mem.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    mem.enabled 
                      ? 'bg-[#181818] border-[#333333]' 
                      : 'bg-[#181818]/50 border-[#333333] opacity-50'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#242424] border border-[#333333] text-white">
                        {mem.category}
                      </span>
                      <span className="text-[10px] text-[#A3A3A3]">Added {mem.createdAt}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {mem.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-1">
                    <button
                      onClick={() => handleToggle(mem.id)}
                      title={mem.enabled ? 'Disable memory' : 'Enable memory'}
                      className="p-1 text-[#A3A3A3] hover:text-white cursor-pointer"
                    >
                      {mem.enabled ? (
                        <ToggleRight className="w-5 h-5 text-white" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-[#666666]" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      title="Delete memory"
                      className="p-1 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-[#333333] text-[#A3A3A3] space-y-2">
              <Brain className="w-8 h-8 mx-auto opacity-40 text-white" />
              <p className="text-sm font-semibold text-white">No personal memories saved yet</p>
              <p className="text-xs max-w-sm mx-auto text-[#A3A3A3]">
                Click &ldquo;Add Memory&rdquo; above to tell Asklet about your courses, preferred programming languages, or learning style.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#333333] flex items-center justify-between bg-[#242424]">
          <button
            onClick={handleClearAll}
            disabled={memories.length === 0}
            className="text-xs font-bold text-[#A3A3A3] hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            Clear All Memories
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#eaeaea] cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
