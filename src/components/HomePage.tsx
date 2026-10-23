import React, { useState } from 'react';
import { 
  Search, 
  Lightbulb, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Layers,
  GraduationCap,
  History,
  Flame,
  Brain,
  Crown,
  Calendar,
  BarChart3,
  Lock,
  Check,
  MessageSquare
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface HomePageProps {
  currentTopic: string;
  onSetTopic: (topic: string) => void;
  onNavigate: (tab: ActiveTab, topic?: string) => void;
  recentTopics: string[];
  isSubscribed?: boolean;
  onOpenUpgradeModal?: () => void;
}

const DISCIPLINE_PRESETS = [
  {
    category: 'Computer Science',
    topics: ['Binary Search Trees', 'Dynamic Programming', 'REST vs GraphQL', 'Big O Notation']
  },
  {
    category: 'Biology & Pre-Med',
    topics: ['Photosynthesis', 'Cellular Respiration', 'CRISPR Gene Editing', 'Action Potential']
  },
  {
    category: 'Business & Econ',
    topics: ['Opportunity Cost', 'Keynesian Economics', 'Supply and Demand', 'Compound Interest']
  },
  {
    category: 'Physics & Engineering',
    topics: ['Thermodynamics Laws', 'Bernoulli’s Principle', 'Fourier Transform', 'Ohm’s Law']
  },
  {
    category: 'Psychology & Arts',
    topics: ['Cognitive Dissonance', 'Maslow’s Hierarchy', 'Classical Conditioning', 'Socratic Method']
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  currentTopic,
  onSetTopic,
  onNavigate,
  recentTopics,
  isSubscribed = false,
  onOpenUpgradeModal,
}) => {
  const [inputTopic, setInputTopic] = useState(currentTopic);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleAction = (tab: ActiveTab, overrideTopic?: string) => {
    const topicToUse = (overrideTopic !== undefined ? overrideTopic : inputTopic).trim();
    if (!topicToUse) {
      onSetTopic('Photosynthesis');
      onNavigate(tab, 'Photosynthesis');
      return;
    }
    onSetTopic(topicToUse);
    onNavigate(tab, topicToUse);
  };

  const handleChipClick = (topicName: string, preferredTab: ActiveTab = 'explain') => {
    setInputTopic(topicName);
    onSetTopic(topicName);
    onNavigate(preferredTab, topicName);
  };

  const filteredTopics = selectedCategory === 'All'
    ? DISCIPLINE_PRESETS.flatMap(d => d.topics.slice(0, 2))
    : DISCIPLINE_PRESETS.find(d => d.category === selectedCategory)?.topics || [];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#181818] border border-[#333333] text-white p-6 sm:p-10 lg:p-14 shadow-xl">
        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#242424] border border-[#333333] text-white text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-white" />
            Designed for University &amp; College Students
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Stop Stressing. Start Understanding.
          </h1>

          <p className="text-base sm:text-lg text-[#A3A3A3] max-w-2xl mx-auto font-normal">
            Turn confusing college lectures into crystal-clear explanations, high-yield cheat sheets, and instant practice quizzes.
          </p>

          {/* Master Search Bar */}
          <div className="pt-2">
            <div className="bg-[#242424] rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row gap-2 border border-[#333333] text-white">
              <div className="relative flex-1 flex items-center pl-3">
                <Search className="w-5 h-5 text-[#A3A3A3] shrink-0" />
                <input
                  type="text"
                  value={inputTopic}
                  onChange={(e) => setInputTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAction('explain');
                  }}
                  placeholder="Enter a topic, concept, or question (e.g. Photosynthesis, Binary Trees)..."
                  className="w-full px-3 py-2.5 text-sm sm:text-base text-white placeholder:text-[#A3A3A3] focus:outline-none font-medium bg-transparent"
                />
              </div>

              {/* Primary Launch Action */}
              <button
                onClick={() => handleAction('explain')}
                className="bg-white hover:bg-[#eaeaea] text-black font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-md cursor-pointer"
              >
                <span>Explain Topic</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Quick feature buttons directly under the search bar */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-medium">
              <span className="text-[#A3A3A3] text-xs hidden sm:inline">Or jump straight to:</span>
              <button
                onClick={() => handleAction('chat')}
                className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-white border border-[#333333] transition-all flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span>AI Multimodal Chat</span>
              </button>
              <button
                onClick={() => handleAction('notes')}
                className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-white border border-[#333333] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>Make Short Notes</span>
              </button>
              <button
                onClick={() => handleAction('quiz')}
                className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-white border border-[#333333] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-white" />
                <span>Take Practice Quiz</span>
              </button>
              <button
                onClick={() => onNavigate('premium')}
                className="px-3.5 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2f2f2f] text-white border border-[#333333] transition-all flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-white" />
                <span>Premium Suite</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Subject Quick Presets */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-white" />
              Popular College Topics to Try
            </h2>
            <p className="text-sm text-[#A3A3A3]">Pick any topic below or type your own course concept</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', ...DISCIPLINE_PRESETS.map(d => d.category)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-[#242424] text-[#A3A3A3] hover:text-white border border-[#333333]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredTopics.map((t) => (
            <button
              key={t}
              onClick={() => handleChipClick(t, 'explain')}
              className="p-3 bg-[#242424] rounded-xl border border-[#333333] hover:border-white transition-all text-left group flex flex-col justify-between cursor-pointer"
            >
              <span className="font-semibold text-xs sm:text-sm text-white group-hover:text-white line-clamp-2">
                {t}
              </span>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#A3A3A3]">
                <span>Start Studying</span>
                <ArrowRight className="w-3 h-3 text-[#A3A3A3] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* The 3 Core Features */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Three Core Free Study Tools
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Available to all students with no limitations: understand, summarize, and test yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Explain a Topic */}
          <div className="bg-[#242424] rounded-2xl p-6 border border-[#333333] shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative">
              <div className="w-12 h-12 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Feature 1</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Explain a Topic</h3>
                <p className="text-sm text-[#A3A3A3] mt-2">
                  Break through confusing textbook jargon with simple intuition, relatable real-world analogies, and step-by-step logic.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#A3A3A3] pt-2 border-t border-[#333333]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Choose depth: ELI5, College, or Deep Dive</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Audio read-aloud &amp; exam pitfalls callouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Interactive Q&amp;A to ask follow-up questions</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative">
              <button
                onClick={() => handleAction('explain')}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-white hover:bg-[#eaeaea] text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Explainer</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

          {/* Card 2: Make Short Notes */}
          <div className="bg-[#242424] rounded-2xl p-6 border border-[#333333] shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative">
              <div className="w-12 h-12 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Feature 2</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Make Short Notes</h3>
                <p className="text-sm text-[#A3A3A3] mt-2">
                  Convert lengthy topics into high-yield 3-minute revision sheets, clever mnemonics, and interactive flip flashcards.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#A3A3A3] pt-2 border-t border-[#333333]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>High-yield cheat-sheet summary bullets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Interactive Flashcards mode to test recall</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>One-click export / download as study notes</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative">
              <button
                onClick={() => handleAction('notes')}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-white hover:bg-[#eaeaea] text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Generate Notes</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

          {/* Card 3: Take a Quiz */}
          <div className="bg-[#242424] rounded-2xl p-6 border border-[#333333] shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4 relative">
              <div className="w-12 h-12 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Feature 3</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Take a Quiz</h3>
                <p className="text-sm text-[#A3A3A3] mt-2">
                  Practice under realistic exam conditions. Get instant grading, detailed explanations for every option, and score analytics.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-[#A3A3A3] pt-2 border-t border-[#333333]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Choose difficulty: Beginner, Intermediate, Exam</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Real-time feedback &amp; answer rationales</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Post-quiz diagnostic review &amp; score report</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 relative">
              <button
                onClick={() => handleAction('quiz')}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-white hover:bg-[#eaeaea] text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Take Practice Quiz</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CLEARLY LABELLED PREMIUM SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-[#181818] border border-[#333333] p-6 sm:p-10 text-white shadow-xl">
        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#333333] pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#242424] border border-[#333333] text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                <Crown className="w-3.5 h-3.5 text-white" /> Clearly Labelled Premium Section
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Asklet Plans &amp; Pricing
              </h2>
              <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-xl">
                Free Plan for basic features, or Premium Monthly (₹499/month, $5.80) &amp; Yearly (₹4999/year) for personalized study roadmaps and advanced scenario quizzes.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={() => onNavigate('premium')}
                className="px-5 py-2.5 bg-[#242424] border border-[#333333] text-white font-extrabold text-xs sm:text-sm rounded-xl hover:bg-[#2f2f2f] transition-colors cursor-pointer"
              >
                Explore Features
              </button>
              {onOpenUpgradeModal && (
                <button
                  onClick={onOpenUpgradeModal}
                  className="px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl bg-white text-black hover:bg-[#eaeaea] transition-all shadow-md cursor-pointer"
                >
                  {isSubscribed ? 'Upgraded to Premium ✓' : 'Upgrade to Premium (₹499/mo)'}
                </button>
              )}
            </div>
          </div>

          {/* 3 Premium Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#242424] p-5 rounded-2xl border border-[#333333] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">1. Personalized Study Plan</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                AI creates a customized multi-week study roadmap based on your exam date, target GPA, and weak syllabus areas with interactive daily checklists.
              </p>
            </div>

            <div className="bg-[#242424] p-5 rounded-2xl border border-[#333333] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">2. Advanced Scenario Quizzes</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Realistic honors &amp; college case studies with timed exam simulations, deep theoretical rationales, and distractor trap analysis.
              </p>
            </div>

            <div className="bg-[#242424] p-5 rounded-2xl border border-[#333333] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">3. Progress &amp; Exam Analytics</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Track study streaks, total study hours, subject mastery progress meters, and your statistical exam readiness score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recents Section */}
      {recentTopics.length > 0 && (
        <section className="bg-[#181818] rounded-2xl p-6 border border-[#333333]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-white" />
              Recent Study Sessions
            </h3>
            <span className="text-xs text-[#A3A3A3]">Pick up right where you left off</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => handleChipClick(topic, 'explain')}
                className="px-3.5 py-2 rounded-xl bg-[#242424] border border-[#333333] text-xs sm:text-sm font-semibold text-white hover:border-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#A3A3A3]" />
                <span>{topic}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
