/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ExplainView } from './components/ExplainView';
import { NotesView } from './components/NotesView';
import { QuizView } from './components/QuizView';
import { NotebookView } from './components/NotebookView';
import { PremiumSection } from './components/PremiumSection';
import { SubscriptionModal } from './components/SubscriptionModal';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatAssistantView } from './components/ChatAssistantView';
import { MemoryModal } from './components/MemoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ImageStudioModal } from './components/ImageStudioModal';
import { 
  getSavedItems, 
  getRecentTopics, 
  getStoredSubscription, 
  saveStoredSubscription, 
  clearStoredSubscription,
  getStoredConversations,
  saveStoredConversation,
  deleteStoredConversation,
  archiveStoredConversation,
  renameStoredConversation,
  getStoredPreferences,
  saveStoredPreferences
} from './utils/storage';
import { 
  SavedItem, 
  SubscriptionStatus, 
  ChatConversation, 
  AssistantMode, 
  UserPreferences 
} from './types';
import { CheckCircle2, GraduationCap, Crown, Sparkles, MessageSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [currentTopic, setCurrentTopic] = useState<string>('Photosynthesis');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus>(getStoredSubscription());
  
  // Chat state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<AssistantMode>('bestie');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Modals
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [imageStudioPrompt, setImageStudioPrompt] = useState<string>('');
  const [imageStudioSource, setImageStudioSource] = useState<string | undefined>(undefined);

  // Preferences & Theme
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ensure HTML element always has dark class for the premium monochrome theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Start a fresh, empty new chat screen by default every time the app opens or reloads
  useEffect(() => {
    refreshStorage();
    const loadedConvs = getStoredConversations();
    // Filter out previous empty chats so we don't duplicate them
    const validConvs = loadedConvs.filter(c => c.messages && c.messages.length > 0);
    
    // Always create a fresh, clean chat for this new session with a new ID
    const freshConv: ChatConversation = {
      id: `conv_${Date.now()}`,
      title: 'Asklet AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'bestie',
      messages: [] // Completely empty fresh chat
    };

    setConversations([freshConv, ...validConvs]);
    setActiveConversationId(freshConv.id);
    setSelectedMode('bestie');

    // Check server subscription status
    fetch('/api/subscription/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.subscription) {
          if (data.subscription.isSubscribed) {
            setSubscription(data.subscription);
            saveStoredSubscription(data.subscription);
          }
        }
      })
      .catch(err => console.error('Subscription check error:', err));
  }, []);

  const refreshStorage = () => {
    setSavedItems(getSavedItems());
    setRecentTopics(getRecentTopics());
    setConversations(getStoredConversations());
  };

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleNavigate = (tab: ActiveTab, topic?: string) => {
    if (topic && topic.trim()) {
      setCurrentTopic(topic.trim());
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshStorage();
  };

  const handleSelectSavedItem = (item: SavedItem) => {
    setCurrentTopic(item.topic);
    if (item.type === 'explanation') {
      setActiveTab('explain');
    } else if (item.type === 'notes') {
      setActiveTab('notes');
    } else if (item.type === 'quiz') {
      setActiveTab('quiz');
    } else if (item.type === 'studyplan') {
      setActiveTab('premium');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Conversation Management Handlers: Start fresh conversation, prevent empty duplicates
  const handleNewChat = (mode: AssistantMode = 'bestie') => {
    // If current conversation is already completely fresh/empty, just switch to it
    const current = conversations.find(c => c.id === activeConversationId);
    if (current && current.messages.length === 0) {
      if (current.mode !== mode) {
        handleUpdateConversation({ ...current, mode });
      }
      setSelectedMode(mode);
      setActiveTab('chat');
      return;
    }

    const newConv: ChatConversation = {
      id: `conv_${Date.now()}`,
      title: 'Asklet AI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: mode,
      messages: []
    };
    
    // Only keep past conversations that have messages to avoid duplicate empty chats
    const validConvs = conversations.filter(c => c.messages && c.messages.length > 0);
    setConversations([newConv, ...validConvs]);
    setActiveConversationId(newConv.id);
    setSelectedMode(mode);
    setActiveTab('chat');
  };

  const handleUpdateConversation = (conv: ChatConversation) => {
    // Persist to storage whenever messages exist
    if (conv.messages.length > 0) {
      saveStoredConversation(conv);
    }
    setConversations(prev => {
      const exists = prev.some(c => c.id === conv.id);
      if (exists) {
        return prev.map(c => c.id === conv.id ? conv : c);
      }
      return [conv, ...prev];
    });
  };

  const handleDeleteConversation = (id: string) => {
    deleteStoredConversation(id);
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeConversationId === id) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        handleNewChat(selectedMode);
      }
    }
    handleShowToast('Conversation deleted');
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    renameStoredConversation(id, newTitle);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleArchiveConversation = (id: string, isArchived: boolean) => {
    archiveStoredConversation(id, isArchived);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isArchived } : c));
    handleShowToast(isArchived ? 'Conversation archived' : 'Conversation restored');
  };

  const handleClearAllChats = () => {
    if (window.confirm('Are you sure you want to delete all chat history? This cannot be undone.')) {
      conversations.forEach(c => deleteStoredConversation(c.id));
      setConversations([]);
      handleNewChat(selectedMode);
      setIsSettingsModalOpen(false);
      handleShowToast('All conversations cleared');
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    const updated = saveStoredPreferences({ theme: nextTheme });
    setPreferences(updated);
  };

  const handleOpenImageStudio = (prompt?: string, sourceImg?: string) => {
    setImageStudioPrompt(prompt || '');
    setImageStudioSource(sourceImg);
    setIsImageStudioOpen(true);
  };

  const handleInsertImageToChat = (imageUrl: string, promptText: string) => {
    if (!activeConv) return;
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user' as const,
      content: promptText || 'Attached generated visual from Image Studio',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: [{
        id: `att_${Date.now()}`,
        type: 'image' as const,
        name: 'generated_image.png',
        size: 256000,
        mimeType: 'image/png',
        data: imageUrl
      }]
    };
    const updatedConv = {
      ...activeConv,
      messages: [...activeConv.messages, userMsg],
      updatedAt: new Date().toISOString()
    };
    handleUpdateConversation(updatedConv);
    setActiveTab('chat');
  };

  const handleSubscriptionSuccess = (newSub: SubscriptionStatus) => {
    setSubscription(newSub);
    saveStoredSubscription(newSub);
    handleShowToast(`🎉 Congratulations! Welcome to Asklet Pro (${newSub.planName})!`);
  };

  const handleCancelSubscription = () => {
    clearStoredSubscription();
    setSubscription({
      isSubscribed: false,
      planId: null,
      planName: null,
      billingCycle: null,
      startDate: null,
      renewalDate: null,
      transactionId: null,
      amountPaid: null,
      paymentMethod: 'None'
    });
    handleShowToast('Subscription cancelled. You can resubscribe anytime.');
  };

  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-white antialiased selection:bg-[#333333] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#242424] text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-[#333333] max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedItems.length}
        isSubscribed={subscription.isSubscribed}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        theme={preferences.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      {activeTab === 'chat' ? (
        <div className="flex-1 flex overflow-hidden">
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              setActiveConversationId(id);
              const found = conversations.find(c => c.id === id);
              if (found) setSelectedMode(found.mode);
            }}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
            onArchiveConversation={handleArchiveConversation}
            selectedMode={selectedMode}
            onSelectMode={(mode) => {
              setSelectedMode(mode);
              if (activeConv) {
                const updated = { ...activeConv, mode };
                handleUpdateConversation(updated);
              }
            }}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenMemory={() => setIsMemoryModalOpen(true)}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            isSubscribed={subscription.isSubscribed}
            isOpenMobile={sidebarMobileOpen}
            onCloseMobile={() => setSidebarMobileOpen(false)}
          />

          {activeConv ? (
            <ChatAssistantView
              conversation={activeConv}
              onUpdateConversation={handleUpdateConversation}
              onToggleSidebarMobile={() => setSidebarMobileOpen(!sidebarMobileOpen)}
              onOpenImageStudio={handleOpenImageStudio}
              preferences={preferences}
              onNavigateStudyTab={handleNavigate}
              onShowToast={handleShowToast}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
              <p>Loading Asklet Assistant...</p>
            </div>
          )}
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {activeTab === 'home' && (
            <HomePage
              currentTopic={currentTopic}
              onSetTopic={setCurrentTopic}
              onNavigate={handleNavigate}
              recentTopics={recentTopics}
              isSubscribed={subscription.isSubscribed}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            />
          )}

          {activeTab === 'explain' && (
            <ExplainView
              currentTopic={currentTopic}
              onSetTopic={setCurrentTopic}
              onNavigate={handleNavigate}
              onSaveNotification={handleShowToast}
            />
          )}

          {activeTab === 'notes' && (
            <NotesView
              currentTopic={currentTopic}
              onSetTopic={setCurrentTopic}
              onNavigate={handleNavigate}
              onSaveNotification={handleShowToast}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              currentTopic={currentTopic}
              onSetTopic={setCurrentTopic}
              onNavigate={handleNavigate}
              onSaveNotification={handleShowToast}
            />
          )}

          {activeTab === 'premium' && (
            <PremiumSection
              subscription={subscription}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              onNavigateHome={() => handleNavigate('home')}
            />
          )}

          {activeTab === 'notebook' && (
            <NotebookView
              savedItems={savedItems}
              onRefresh={refreshStorage}
              onNavigate={handleNavigate}
              onSelectSavedItem={handleSelectSavedItem}
            />
          )}
        </main>
      )}

      {/* Modals */}
      <SubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        subscription={subscription}
        onSuccess={handleSubscriptionSuccess}
        onCancelSubscription={handleCancelSubscription}
      />

      <MemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        onMemoryUpdated={() => handleShowToast('Memory preferences updated')}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onPreferencesChanged={(updated) => setPreferences(updated)}
        onClearAllChats={handleClearAllChats}
      />

      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        onInsertToChat={handleInsertImageToChat}
        initialPrompt={imageStudioPrompt}
        initialImage={imageStudioSource}
      />

      {/* Footer for non-chat views */}
      {activeTab !== 'chat' && (
        <footer className="border-t border-[#333333] bg-[#090909] py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A3A3A3]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center font-bold">
                <GraduationCap className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-white">Asklet AI</span>
              <span>— Multimodal AI Assistant &amp; College Study Companion</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-semibold text-[#A3A3A3]">
              <button onClick={() => handleNavigate('chat')} className="hover:text-white transition-colors flex items-center gap-1 font-bold text-white">
                <MessageSquare className="w-3 h-3 text-white" />
                <span>AI Chat</span>
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('explain')} className="hover:text-white transition-colors">
                Explain
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('notes')} className="hover:text-white transition-colors">
                Short Notes
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('quiz')} className="hover:text-white transition-colors">
                Take Quiz
              </button>
              <span>•</span>
              <button onClick={() => handleNavigate('premium')} className="hover:text-white transition-colors flex items-center gap-1 font-bold text-white">
                <Crown className="w-3 h-3 text-white" />
                <span>Premium Suite</span>
              </button>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
