import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  RotateCw, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  HelpCircle, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Clock
} from 'lucide-react';
import { StudyNotes, Flashcard } from '../types';
import { saveItem, addRecentTopic } from '../utils/storage';
import { ActiveTab } from './Navbar';

interface NotesViewProps {
  currentTopic: string;
  onSetTopic: (topic: string) => void;
  onNavigate: (tab: ActiveTab, topic?: string) => void;
  onSaveNotification?: (msg: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  currentTopic,
  onSetTopic,
  onNavigate,
  onSaveNotification,
}) => {
  const [topicInput, setTopicInput] = useState(currentTopic || '');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<StudyNotes | null>(null);
  const [viewMode, setViewMode] = useState<'sheet' | 'flashcards'>('sheet');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Flashcards deck state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);

  useEffect(() => {
    if (currentTopic && (!notes || notes.topic.toLowerCase() !== currentTopic.toLowerCase())) {
      setTopicInput(currentTopic);
      fetchNotes(currentTopic);
    }
  }, [currentTopic]);

  const fetchNotes = async (topicToFetch: string) => {
    if (!topicToFetch.trim()) return;

    setLoading(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setMasteredCards([]);

    try {
      addRecentTopic(topicToFetch.trim());
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToFetch.trim() }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setNotes(json.data);
        setIsSaved(false);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    onSetTopic(topicInput.trim());
    fetchNotes(topicInput.trim());
  };

  const handleCopyNotes = () => {
    if (!notes) return;
    const content = `=== REVISION NOTES: ${notes.topic.toUpperCase()} ===\n\nSUMMARY:\n${notes.summary}\n\nCHEAT SHEET:\n${notes.cheatSheetBullets.map(b => `• ${b}`).join('\n')}\n\nCORE PRINCIPLES:\n${notes.corePrinciples.map(p => `[${p.heading}]\n${p.notes.map(n => `  - ${n}`).join('\n')}`).join('\n\n')}\n\nMNEMONICS:\n${notes.mnemonics.map(m => `• ${m.phrase} (${m.standsFor}) - ${m.tip}`).join('\n')}\n\nEXAM STRATEGY:\n${notes.examTips.map(t => `• ${t}`).join('\n')}`;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    if (!notes) return;
    const content = `# Study Notes: ${notes.topic}\n\n> ${notes.summary}\n\n## 5-Minute Exam Cheat Sheet\n${notes.cheatSheetBullets.map(b => `- ${b}`).join('\n')}\n\n## Key Concepts & Mechanisms\n${notes.corePrinciples.map(p => `### ${p.heading}\n${p.notes.map(n => `- ${n}`).join('\n')}\n${p.formulasOrKeywords ? `*Keywords:* ${p.formulasOrKeywords.join(', ')}` : ''}`).join('\n\n')}\n\n## Memory Mnemonics\n${notes.mnemonics.map(m => `**${m.phrase}** (${m.standsFor})\n*Tip:* ${m.tip}`).join('\n\n')}\n\n## Flashcard Reference\n${notes.flashcards.map((f, i) => `Q${i+1}: ${f.front}\nA${i+1}: ${f.back}`).join('\n\n')}\n\n## Exam Tips\n${notes.examTips.map(t => `- ${t}`).join('\n')}\n`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${notes.topic.replace(/[^a-zA-Z0-9]/g, '_')}_notes.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNotes = () => {
    if (!notes) return;
    saveItem({
      type: 'notes',
      topic: notes.topic,
      data: notes,
    });
    setIsSaved(true);
    if (onSaveNotification) {
      onSaveNotification(`Saved "${notes.topic}" notes to notebook!`);
    }
  };

  const handleToggleMastered = (idx: number) => {
    if (masteredCards.includes(idx)) {
      setMasteredCards(masteredCards.filter(i => i !== idx));
    } else {
      setMasteredCards([...masteredCards, idx]);
    }
  };

  const currentCard: Flashcard | undefined = notes?.flashcards?.[currentCardIndex];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header & Generator Card */}
      <section className="bg-[#242424] rounded-2xl p-6 border border-[#333333] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Make Short Notes & Flashcards</h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Summarize any topic into high-yield cheat sheets, memory mnemonics, and active recall cards.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Mitosis, Thermodynamics, Supply & Demand, Dijkstra's Algorithm..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#181818] border border-[#333333] focus:border-white outline-none text-white font-medium text-sm sm:text-base placeholder:text-[#A3A3A3]"
          />
          <button
            type="submit"
            disabled={loading || !topicInput.trim()}
            className="px-6 py-3 bg-white hover:bg-[#eaeaea] disabled:opacity-50 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Generating Notes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Create Notes</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#242424] rounded-2xl p-8 border border-[#333333] space-y-6 animate-pulse">
          <div className="h-7 bg-[#333333] rounded w-1/3"></div>
          <div className="h-4 bg-[#333333] rounded w-2/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-[#181818] rounded-xl border border-[#333333]"></div>
            <div className="h-32 bg-[#181818] rounded-xl border border-[#333333]"></div>
          </div>
        </div>
      )}

      {/* Notes View Container */}
      {!loading && notes && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* View Mode Switcher & Global Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#242424] p-4 rounded-2xl border border-[#333333]">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#181818] p-1 rounded-xl border border-[#333333]">
              <button
                onClick={() => setViewMode('sheet')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'sheet'
                    ? 'bg-white text-black'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Cheat Sheet View</span>
              </button>
              <button
                onClick={() => setViewMode('flashcards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  viewMode === 'flashcards'
                    ? 'bg-white text-black'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Flashcards Deck ({notes.flashcards?.length || 0})</span>
              </button>
            </div>

            {/* Actions: Copy, Download, Save */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyNotes}
                className="px-3 py-2 rounded-xl border border-[#333333] bg-[#181818] hover:bg-[#2f2f2f] text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Copy formatted notes"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadNotes}
                className="px-3 py-2 rounded-xl border border-[#333333] bg-[#181818] hover:bg-[#2f2f2f] text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Download as Markdown file"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Download</span>
              </button>

              <button
                onClick={handleSaveNotes}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isSaved
                    ? 'bg-white text-black border-white'
                    : 'bg-[#181818] border-[#333333] text-white hover:bg-[#2f2f2f]'
                }`}
                title="Save notes to notebook"
              >
                {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-black" /> : <Bookmark className="w-3.5 h-3.5 text-white" />}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* MODE 1: CHEAT SHEET VIEW */}
          {viewMode === 'sheet' && (
            <div className="space-y-6">
              <div className="bg-[#242424] rounded-3xl p-6 sm:p-9 border border-[#333333] space-y-8">
                {/* Topic Header */}
                <div className="space-y-2 pb-6 border-b border-[#333333]">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#181818] border border-[#333333] text-white text-xs font-bold uppercase tracking-wider">
                      HIGH-YIELD REVISION
                    </span>
                    <span className="text-xs text-[#A3A3A3] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#A3A3A3]" /> ~{notes.readTimeMinutes || 3} min read
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {notes.topic}
                  </h2>
                  <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed font-normal">
                    {notes.summary}
                  </p>
                </div>

                {/* 5-Minute Exam Cheat Sheet Bullets */}
                {notes.cheatSheetBullets && notes.cheatSheetBullets.length > 0 && (
                  <div className="rounded-2xl p-5 bg-[#181818] border border-[#333333] space-y-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <span className="text-base text-white">⚡</span>
                      <span>5-Minute Pre-Exam Cheat Sheet</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-[#A3A3A3]">
                      {notes.cheatSheetBullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0"></span>
                          <span className="leading-relaxed font-medium text-white">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Core Principles & Mechanisms */}
                {notes.corePrinciples && notes.corePrinciples.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white">Core Mechanisms & Axioms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {notes.corePrinciples.map((sec, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-[#181818] border border-[#333333] space-y-3">
                          <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            {sec.heading}
                          </h4>
                          <ul className="space-y-1.5 text-xs text-[#A3A3A3]">
                            {sec.notes.map((n, nIdx) => (
                              <li key={nIdx} className="leading-relaxed">
                                • {n}
                              </li>
                            ))}
                          </ul>
                          {sec.formulasOrKeywords && sec.formulasOrKeywords.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#333333]">
                              {sec.formulasOrKeywords.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded-md bg-[#242424] border border-[#333333] text-[11px] font-semibold text-white"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Memory Mnemonics */}
                {notes.mnemonics && notes.mnemonics.length > 0 && (
                  <div className="rounded-2xl p-5 bg-[#181818] border border-[#333333] space-y-3">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Brain className="w-4 h-4 text-white" />
                      <span>Memory Acronyms & Mnemonics</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {notes.mnemonics.map((m, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#242424] border border-[#333333] space-y-1">
                          <div className="font-extrabold text-white text-sm tracking-wide">{m.phrase}</div>
                          <div className="text-xs text-[#A3A3A3] font-medium">{m.standsFor}</div>
                          <div className="text-[11px] text-[#A3A3A3] italic pt-0.5">Tip: {m.tip}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Tips */}
                {notes.examTips && notes.examTips.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#333333]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-white" />
                      <span>Exam Day Tips</span>
                    </h3>
                    <div className="space-y-1 text-xs text-[#A3A3A3]">
                      {notes.examTips.map((tip, idx) => (
                        <p key={idx}>• {tip}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: INTERACTIVE FLASHCARDS */}
          {viewMode === 'flashcards' && notes.flashcards && notes.flashcards.length > 0 && (
            <div className="space-y-6">
              {/* Flashcard Active Deck */}
              <div className="bg-[#242424] rounded-3xl p-6 sm:p-9 border border-[#333333] space-y-6 text-center">
                {/* Deck Progress Bar */}
                <div className="flex items-center justify-between text-xs font-semibold text-[#A3A3A3] pb-2">
                  <span>Card {currentCardIndex + 1} of {notes.flashcards.length}</span>
                  <span className="text-white flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-white" /> {masteredCards.length} Mastered
                  </span>
                </div>

                <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden border border-[#333333]">
                  <div
                    className="bg-white h-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / notes.flashcards.length) * 100}%` }}
                  ></div>
                </div>

                {/* Flip Card Container */}
                {currentCard && (
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[260px] sm:min-h-[300px] rounded-2xl p-6 sm:p-10 border border-[#333333] hover:border-[#666666] bg-[#181818] flex flex-col justify-between items-center transition-all duration-200 relative group select-none"
                  >
                    {/* Top Card Badge */}
                    <div className="flex items-center justify-between w-full">
                      <span className="px-2.5 py-1 rounded-full bg-[#242424] border border-[#333333] text-white text-[11px] font-bold">
                        {currentCard.category || 'Concept'}
                      </span>
                      <span className="text-xs text-[#A3A3A3] group-hover:text-white transition-colors flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Click to Flip
                      </span>
                    </div>

                    {/* Card Content Front/Back */}
                    <div className="py-6 max-w-lg mx-auto space-y-3">
                      {!isFlipped ? (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">Question / Prompt</span>
                          <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                            {currentCard.front}
                          </h3>
                        </div>
                      ) : (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-150">
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Answer</span>
                          <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                            {currentCard.back}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="text-[11px] text-[#A3A3A3]">
                      {!isFlipped ? 'Tap to reveal answer' : 'Tap to see prompt again'}
                    </div>
                  </div>
                )}

                {/* Card Controls & Mastery Status */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#333333]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={currentCardIndex === 0}
                      className="p-2.5 rounded-xl border border-[#333333] bg-[#181818] text-white hover:bg-[#2f2f2f] disabled:opacity-40 transition-colors"
                      title="Previous Card"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => Math.min(notes.flashcards.length - 1, prev + 1));
                      }}
                      disabled={currentCardIndex === notes.flashcards.length - 1}
                      className="p-2.5 rounded-xl border border-[#333333] bg-[#181818] text-white hover:bg-[#2f2f2f] disabled:opacity-40 transition-colors"
                      title="Next Card"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-xs text-[#A3A3A3] font-medium px-2">
                      {currentCardIndex + 1} / {notes.flashcards.length}
                    </span>
                  </div>

                  {/* Mark as Mastered button */}
                  <button
                    onClick={() => handleToggleMastered(currentCardIndex)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                      masteredCards.includes(currentCardIndex)
                        ? 'bg-white text-black'
                        : 'bg-[#181818] hover:bg-[#2f2f2f] text-white border border-[#333333]'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{masteredCards.includes(currentCardIndex) ? 'Mastered ✓' : 'Mark as Mastered'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Bridge to Quiz */}
          <div className="rounded-2xl p-5 bg-[#242424] border border-[#333333] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">Ready to test what you just reviewed?</h4>
              <p className="text-xs text-[#A3A3A3]">Take an instant practice quiz on {notes.topic} to measure your exam readiness.</p>
            </div>
            <button
              onClick={() => onNavigate('quiz', notes.topic)}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-[#eaeaea] transition-colors flex items-center gap-2 shrink-0"
            >
              <HelpCircle className="w-4 h-4 text-black" />
              <span>Take Quiz on {notes.topic}</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !notes && (
        <div className="text-center py-12 px-4 space-y-4 bg-[#242424] rounded-2xl border border-[#333333]">
          <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#333333] text-white mx-auto flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No notes created yet</h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Enter any college topic above to instantly create concise revision notes, mnemonics, and flip flashcards.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['Photosynthesis', 'Binary Search Trees', 'Thermodynamics Laws', 'Cognitive Dissonance'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setTopicInput(s);
                  onSetTopic(s);
                  fetchNotes(s);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-white text-xs font-semibold"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
