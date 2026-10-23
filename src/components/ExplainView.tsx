import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  AlertTriangle, 
  HelpCircle, 
  Send, 
  RefreshCw, 
  FileText, 
  BookOpen,
  Info
} from 'lucide-react';
import { StudyLevel, TopicExplanation } from '../types';
import { saveItem, addRecentTopic } from '../utils/storage';
import { ActiveTab } from './Navbar';

interface ExplainViewProps {
  currentTopic: string;
  onSetTopic: (topic: string) => void;
  onNavigate: (tab: ActiveTab, topic?: string) => void;
  onSaveNotification?: (msg: string) => void;
}

export const ExplainView: React.FC<ExplainViewProps> = ({
  currentTopic,
  onSetTopic,
  onNavigate,
  onSaveNotification,
}) => {
  const [topicInput, setTopicInput] = useState(currentTopic || '');
  const [level, setLevel] = useState<StudyLevel>('college');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<TopicExplanation | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Speech synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Follow-up chat state
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Array<{ question: string; answer: string }>>([]);

  // Auto-fetch if topic was set from home page and we don't have explanation yet
  useEffect(() => {
    if (currentTopic && (!explanation || explanation.title.toLowerCase() !== currentTopic.toLowerCase())) {
      setTopicInput(currentTopic);
      fetchExplanation(currentTopic, level);
    }
  }, [currentTopic]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchExplanation = async (topicToFetch: string, selectedLevel: StudyLevel) => {
    if (!topicToFetch.trim()) return;

    setLoading(true);
    setIsSpeaking(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setFollowUpAnswers([]);

    try {
      addRecentTopic(topicToFetch.trim());
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToFetch.trim(),
          level: selectedLevel,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setExplanation(json.data);
        setIsSaved(false);
      }
    } catch (err) {
      console.error('Error fetching explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    onSetTopic(topicInput.trim());
    fetchExplanation(topicInput.trim(), level);
  };

  const handleLevelChange = (newLevel: StudyLevel) => {
    setLevel(newLevel);
    if (topicInput.trim()) {
      fetchExplanation(topicInput.trim(), newLevel);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    const textToCopy = `Topic: ${explanation.title}\nLevel: ${explanation.level}\n\nSummary:\n${explanation.tagline}\n\nCore Analogy:\n${explanation.analogy}\n\nExplanation:\n${explanation.coreConcept}\n\nKey Points:\n${explanation.keyPoints.map(p => `• ${p.title}: ${p.explanation}`).join('\n')}\n\nCommon Pitfalls:\n${explanation.commonPitfalls.map(p => `• ${p}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!explanation) return;
    saveItem({
      type: 'explanation',
      topic: explanation.title,
      data: explanation,
    });
    setIsSaved(true);
    if (onSaveNotification) {
      onSaveNotification(`Saved "${explanation.title}" explanation to notebook!`);
    }
  };

  const toggleSpeak = () => {
    if (!('speechSynthesis' in window) || !explanation) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utteranceText = `${explanation.title}. ${explanation.tagline}. Analogy: ${explanation.analogy}. ${explanation.coreConcept}`;
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSendFollowUp = async (questionText: string) => {
    if (!questionText.trim()) return;

    const q = questionText.trim();
    setFollowUpInput('');
    setFollowUpLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: explanation?.title || topicInput,
          message: q,
        }),
      });

      const json = await res.json();
      if (json.success && json.reply) {
        setFollowUpAnswers(prev => [...prev, { question: q, answer: json.reply }]);
      }
    } catch (err) {
      console.error('Follow-up chat error:', err);
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Search & Topic Control Card */}
      <section className="bg-[#242424] rounded-2xl p-6 border border-[#333333] shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Explain a Topic Simply</h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Enter any college concept to receive an intuitive breakdown with analogies and exam clarity.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Photosynthesis, Binary Search Trees, Keynesian Economics..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#333333] bg-[#181818] focus:border-white outline-none text-white font-medium text-sm sm:text-base placeholder:text-[#A3A3A3]"
            />
            <button
              type="submit"
              disabled={loading || !topicInput.trim()}
              className="px-6 py-3 bg-white hover:bg-[#eaeaea] disabled:opacity-30 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Explain Topic</span>
                </>
              )}
            </button>
          </div>

          {/* Depth Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-[#A3A3A3] mr-1">Explanation Depth:</span>
            {[
              { id: 'eli5' as StudyLevel, label: '🐣 Simple / ELI5', desc: 'No jargon, friendly metaphors' },
              { id: 'college' as StudyLevel, label: '🎓 College Standard', desc: 'Exam ready, formal definitions' },
              { id: 'deep' as StudyLevel, label: '🔬 Deep Dive', desc: 'Mechanisms & edge cases' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLevelChange(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  level === item.id
                    ? 'bg-white text-black border-white shadow-xs'
                    : 'bg-[#181818] border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#242424] rounded-2xl p-8 border border-[#333333] shadow-sm space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-7 bg-[#181818] rounded-md w-1/3"></div>
            <div className="h-6 bg-[#181818] rounded-md w-24"></div>
          </div>
          <div className="h-4 bg-[#181818] rounded w-2/3"></div>
          <div className="h-24 bg-[#181818] rounded-xl border border-[#333333]"></div>
          <div className="space-y-3">
            <div className="h-4 bg-[#181818] rounded w-full"></div>
            <div className="h-4 bg-[#181818] rounded w-5/6"></div>
            <div className="h-4 bg-[#181818] rounded w-4/6"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-[#181818] rounded-xl"></div>
            <div className="h-20 bg-[#181818] rounded-xl"></div>
          </div>
        </div>
      )}

      {/* Explanation Results */}
      {!loading && explanation && (
        <article className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Main Article Container */}
          <div className="bg-[#242424] rounded-3xl p-6 sm:p-9 border border-[#333333] shadow-sm space-y-8">
            {/* Header with Title and Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#333333]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#181818] border border-[#333333] text-white text-xs font-bold uppercase tracking-wider">
                    {explanation.level.toUpperCase()} LEVEL
                  </span>
                  <span className="text-xs text-[#A3A3A3] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-white" /> AI Explainer
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {explanation.title}
                </h2>
                <p className="text-base text-[#A3A3A3] font-medium">
                  {explanation.tagline}
                </p>
              </div>

              {/* Action Buttons: Audio, Copy, Bookmark */}
              <div className="flex items-center gap-2 self-start shrink-0">
                <button
                  onClick={toggleSpeak}
                  className={`p-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-white text-black border-white'
                      : 'bg-[#181818] border-[#333333] text-white hover:bg-[#2f2f2f]'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Listen to explanation'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-black" /> : <Volume2 className="w-4 h-4" />}
                  <span className="hidden sm:inline text-xs">{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="p-2.5 rounded-xl border border-[#333333] bg-[#181818] hover:bg-[#2f2f2f] text-white text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden sm:inline text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`p-2.5 rounded-xl border text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-white text-black border-white'
                      : 'bg-[#181818] border-[#333333] text-white hover:bg-[#2f2f2f]'
                  }`}
                  title="Save to notebook"
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-black" /> : <Bookmark className="w-4 h-4" />}
                  <span className="hidden sm:inline text-xs">{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Intuitive Core Analogy Card */}
            {explanation.analogy && (
              <div className="rounded-2xl p-5 bg-[#181818] border border-[#333333] space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="text-lg">💡</span>
                  <span>The &ldquo;Aha!&rdquo; Analogy</span>
                </div>
                <p className="text-sm sm:text-base text-[#A3A3A3] leading-relaxed font-medium">
                  &ldquo;{explanation.analogy}&rdquo;
                </p>
              </div>
            )}

            {/* Core Breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white" />
                How It Works
              </h3>
              <div className="text-white text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line font-normal">
                {explanation.coreConcept}
              </div>
            </div>

            {/* Key Mechanisms / Step-by-Step Points */}
            {explanation.keyPoints && explanation.keyPoints.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#333333]">
                <h3 className="text-lg font-bold text-white">Key Pillars to Remember</h3>
                <div className="grid grid-cols-1 gap-3">
                  {explanation.keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#181818] border border-[#333333] flex items-start gap-3.5"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white text-black font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm sm:text-base">{point.title}</h4>
                        <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">{point.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real World Example */}
            {explanation.realWorldExample && (
              <div className="rounded-2xl p-5 bg-[#181818] border border-[#333333] space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="text-base">🌍</span>
                  <span>Real-World College &amp; Career Context</span>
                </div>
                <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                  {explanation.realWorldExample}
                </p>
              </div>
            )}

            {/* Exam Pitfalls & Misconceptions Warning */}
            {explanation.commonPitfalls && explanation.commonPitfalls.length > 0 && (
              <div className="rounded-2xl p-5 bg-[#181818] border border-[#444444] space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span>Common Exam Traps &amp; Misconceptions</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[#A3A3A3] list-disc list-inside">
                  {explanation.commonPitfalls.map((pitfall, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {pitfall}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Terminology Glossary */}
            {explanation.keyTerms && explanation.keyTerms.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#333333]">
                <h3 className="text-lg font-bold text-white">Must-Know Glossary Terms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {explanation.keyTerms.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#181818] border border-[#333333]">
                      <div className="font-bold text-white text-xs sm:text-sm">{item.term}</div>
                      <div className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">{item.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Follow-up & Suggested Questions Card */}
          <div className="bg-[#242424] rounded-2xl p-6 border border-[#333333] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-white" />
              Ask Asklet a Follow-Up
            </h3>

            {/* Suggested Chips */}
            {explanation.suggestedFollowUps && explanation.suggestedFollowUps.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-[#A3A3A3] font-medium">Students often ask next:</span>
                <div className="flex flex-wrap gap-2">
                  {explanation.suggestedFollowUps.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendFollowUp(q)}
                      className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#2f2f2f] text-white border border-[#333333] transition-colors cursor-pointer"
                    >
                      &ldquo;{q}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation Stream */}
            {followUpAnswers.length > 0 && (
              <div className="space-y-3 pt-2">
                {followUpAnswers.map((item, idx) => (
                  <div key={idx} className="space-y-2 p-4 rounded-xl bg-[#181818] border border-[#333333] text-xs sm:text-sm">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>Q:</span> {item.question}
                    </div>
                    <div className="text-[#A3A3A3] whitespace-pre-line leading-relaxed pl-4 border-l-2 border-white">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar for Follow Up */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFollowUp(followUpInput);
              }}
              className="flex gap-2 pt-2"
            >
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask anything else (e.g., 'Give me a practice calculation' or 'Explain step 2 more')..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#333333] bg-[#181818] text-white placeholder:text-[#A3A3A3] text-xs sm:text-sm focus:border-white outline-none"
              />
              <button
                type="submit"
                disabled={followUpLoading || !followUpInput.trim()}
                className="px-4 py-2.5 bg-white hover:bg-[#eaeaea] disabled:opacity-30 text-black rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {followUpLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Ask</span>
              </button>
            </form>
          </div>

          {/* Quick Bridge to Other 2 Features */}
          <div className="rounded-2xl p-5 bg-[#181818] border border-[#333333] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">Ready to lock this into your memory?</h4>
              <p className="text-xs text-[#A3A3A3]">Generate high-yield short notes or test your recall with a quiz.</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate('notes', explanation.title)}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-[#eaeaea] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-black" />
                <span>Make Notes</span>
              </button>
              <button
                onClick={() => onNavigate('quiz', explanation.title)}
                className="px-4 py-2 rounded-xl bg-[#242424] border border-[#333333] hover:bg-[#2f2f2f] text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-white" />
                <span>Take Quiz</span>
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Empty State when no topic is searched yet */}
      {!loading && !explanation && (
        <div className="text-center py-12 px-4 space-y-4 bg-[#242424] rounded-2xl border border-[#333333]">
          <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#333333] text-white mx-auto flex items-center justify-center font-bold">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No topic selected yet</h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Type any topic above or click one of the suggested sample topics to see an AI explanation in seconds.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['Photosynthesis', 'Binary Search Trees', 'Opportunity Cost', 'Action Potential'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setTopicInput(s);
                  onSetTopic(s);
                  fetchExplanation(s, level);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-white text-xs font-semibold cursor-pointer"
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
