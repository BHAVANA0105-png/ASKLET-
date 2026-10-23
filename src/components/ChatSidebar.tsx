import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  Edit3, 
  Archive, 
  ArchiveRestore, 
  Settings, 
  Brain, 
  Crown, 
  X, 
  Sparkles, 
  Check, 
  Code, 
  PenTool, 
  GraduationCap, 
  Calculator,
  Compass,
  Heart
} from 'lucide-react';
import { ChatConversation, AssistantMode } from '../types';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: (mode?: AssistantMode) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onArchiveConversation: (id: string, isArchived: boolean) => void;
  selectedMode: AssistantMode;
  onSelectMode: (mode: AssistantMode) => void;
  onOpenSettings: () => void;
  onOpenMemory: () => void;
  onOpenUpgrade: () => void;
  isSubscribed: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onArchiveConversation,
  selectedMode,
  onSelectMode,
  onOpenSettings,
  onOpenMemory,
  onOpenUpgrade,
  isSubscribed,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const handleStartRename = (conv: ChatConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = showArchived ? c.isArchived : !c.isArchived;
    return matchesSearch && matchesArchive;
  });

  const modes: { id: AssistantMode; label: string; icon: any }[] = [
    { id: 'bestie', label: 'Asklet Bestie', icon: Heart },
    { id: 'general', label: 'General', icon: Compass },
    { id: 'study', label: 'Study & Learn', icon: GraduationCap },
    { id: 'coding', label: 'Code & Debug', icon: Code },
    { id: 'writing', label: 'Writing & Edit', icon: PenTool },
    { id: 'stem', label: 'STEM & Math', icon: Calculator },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[#090909] border-r border-[#333333] flex flex-col transition-transform duration-200 ease-in-out ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top Header: New Chat & Mobile Close */}
        <div className="p-3.5 border-b border-[#333333] space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                onNewChat(selectedMode);
                onCloseMobile();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-black hover:bg-[#eaeaea] font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>New Conversation</span>
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden ml-2 p-2 rounded-xl text-[#A3A3A3] hover:text-white hover:bg-[#242424] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Assistant Mode Pills */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] px-1">
              Assistant Mode
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {modes.slice(0, 4).map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMode(m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all truncate text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#242424] text-white font-bold border border-[#333333]'
                        : 'text-[#A3A3A3] hover:text-white hover:bg-[#181818]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#A3A3A3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#333333] bg-[#242424] text-white placeholder:text-[#A3A3A3] focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
            <span>{showArchived ? 'Archived Chats' : 'Recent Conversations'}</span>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="text-[10px] text-white hover:underline capitalize cursor-pointer"
            >
              {showArchived ? 'Show Active' : 'View Archived'}
            </button>
          </div>

          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#242424] text-white font-bold border border-[#333333]'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 mr-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#A3A3A3]'}`} />
                    
                    {isEditing ? (
                      <form onSubmit={(e) => handleSaveRename(conv.id, e)} className="flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => setEditingId(null)}
                          className="w-full px-1.5 py-0.5 text-xs bg-[#181818] text-white border border-[#333333] rounded outline-none"
                        />
                      </form>
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {/* Actions on hover */}
                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartRename(conv, e)}
                        className="p-1 text-[#A3A3A3] hover:text-white rounded cursor-pointer"
                        title="Rename"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveConversation(conv.id, !conv.isArchived);
                        }}
                        className="p-1 text-[#A3A3A3] hover:text-white rounded cursor-pointer"
                        title={conv.isArchived ? 'Unarchive' : 'Archive'}
                      >
                        {conv.isArchived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete conversation "${conv.title}"?`)) {
                            onDeleteConversation(conv.id);
                          }
                        }}
                        className="p-1 text-[#A3A3A3] hover:text-white rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 px-3 text-xs text-[#A3A3A3] space-y-1">
              <MessageSquare className="w-6 h-6 mx-auto opacity-40 mb-1" />
              <p>No conversations found</p>
              <button
                onClick={() => onNewChat(selectedMode)}
                className="text-white hover:underline font-semibold cursor-pointer"
              >
                Start a new chat
              </button>
            </div>
          )}
        </div>

        {/* Bottom Panel: Memory, Settings, Subscription status */}
        <div className="p-3 border-t border-[#333333] space-y-2 bg-[#090909]">
          
          <button
            onClick={onOpenMemory}
            className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-white" />
              <span>Personal Memory</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#242424] text-white border border-[#333333] font-bold">
              Active
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-white" />
            <span>Settings &amp; Preferences</span>
          </button>

          {/* Membership State */}
          <div className="pt-1">
            {isSubscribed ? (
              <div className="p-2 rounded-xl bg-[#242424] border border-[#333333] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Crown className="w-3.5 h-3.5 text-white" />
                  <span>Asklet Pro Active</span>
                </div>
                <button
                  onClick={onOpenUpgrade}
                  className="text-[10px] text-[#A3A3A3] hover:text-white hover:underline font-semibold cursor-pointer"
                >
                  Manage
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenUpgrade}
                className="w-full p-2.5 rounded-xl bg-white text-black hover:bg-[#eaeaea] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-black" />
                <span>Upgrade to Pro</span>
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
