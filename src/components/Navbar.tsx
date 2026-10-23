import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lightbulb, 
  FileText, 
  HelpCircle, 
  Bookmark, 
  Menu, 
  X,
  Sparkles,
  Crown,
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react';

export type ActiveTab = 'home' | 'chat' | 'explain' | 'notes' | 'quiz' | 'notebook' | 'premium';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  savedCount: number;
  isSubscribed?: boolean;
  onOpenUpgradeModal?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onSelectTab, 
  savedCount,
  isSubscribed = false,
  onOpenUpgradeModal,
  theme = 'light',
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat' as ActiveTab, label: 'AI Chat', icon: MessageSquare, isFeatured: true },
    { id: 'home' as ActiveTab, label: 'Home', icon: GraduationCap },
    { id: 'explain' as ActiveTab, label: 'Explain Topic', icon: Lightbulb },
    { id: 'notes' as ActiveTab, label: 'Short Notes', icon: FileText },
    { id: 'quiz' as ActiveTab, label: 'Take Quiz', icon: HelpCircle },
    { id: 'premium' as ActiveTab, label: 'Premium Suite', icon: Crown, isPremium: true },
    { id: 'notebook' as ActiveTab, label: 'Saved Notes', icon: Bookmark, badge: savedCount },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090909]/95 backdrop-blur-md border-b border-[#333333] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">Asklet</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#242424] text-white border border-[#333333] flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-white" /> AI
                </span>
                {isSubscribed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-black flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#A3A3A3] hidden sm:block">Conversational AI Companion</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-[#242424] p-1 rounded-xl border border-[#333333]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-xs'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#A3A3A3]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-[#242424] text-white' : 'bg-[#333333] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Subscription State & Mobile Menu */}
          <div className="flex items-center gap-2">
            
            {/* Quick Chat Shortcut for smaller screens */}
            <button
              onClick={() => handleNavClick('chat')}
              className={`xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-black shadow-xs'
                  : 'bg-[#242424] text-[#A3A3A3] hover:text-white border border-[#333333]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>

            {/* Subscription Button */}
            <div className="hidden sm:flex items-center">
              {isSubscribed ? (
                <button
                  onClick={onOpenUpgradeModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#242424] text-white border border-[#333333] hover:bg-[#2f2f2f] transition-colors cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5 text-white" />
                  <span>Pro Active ✓</span>
                </button>
              ) : (
                <button
                  onClick={onOpenUpgradeModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-[#eaeaea] transition-all cursor-pointer shadow-xs"
                >
                  <Crown className="w-3.5 h-3.5 text-black" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex xl:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#333333] bg-[#090909] px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#242424]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-[#A3A3A3]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-[#242424] text-white' : 'bg-[#333333] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenUpgradeModal) onOpenUpgradeModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-[#eaeaea] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Crown className="w-4 h-4 text-black" />
              <span>{isSubscribed ? 'Asklet Pro Active ✓' : 'Upgrade to Pro'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
