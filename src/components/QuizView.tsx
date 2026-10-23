import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  BookOpen, 
  FileText, 
  RefreshCw, 
  Bookmark,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import { QuizData, QuizQuestion, QuizResult } from '../types';
import { saveItem, addRecentTopic } from '../utils/storage';
import { ActiveTab } from './Navbar';

interface QuizViewProps {
  currentTopic: string;
  onSetTopic: (topic: string) => void;
  onNavigate: (tab: ActiveTab, topic?: string) => void;
  onSaveNotification?: (msg: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  currentTopic,
  onSetTopic,
  onNavigate,
  onSaveNotification,
}) => {
  const [topicInput, setTopicInput] = useState(currentTopic || '');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'exam'>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Active quiz session state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentTopic && (!quizData || quizData.topic.toLowerCase() !== currentTopic.toLowerCase())) {
      setTopicInput(currentTopic);
      fetchQuiz(currentTopic, difficulty, questionCount);
    }
  }, [currentTopic]);

  const fetchQuiz = async (topicToFetch: string, selectedDiff: 'beginner' | 'intermediate' | 'exam', count: number) => {
    if (!topicToFetch.trim()) return;

    setLoading(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setUserAnswers({});
    setIsQuizCompleted(false);
    setIsSaved(false);

    try {
      addRecentTopic(topicToFetch.trim());
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToFetch.trim(),
          difficulty: selectedDiff,
          count: count,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setQuizData(json.data);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    onSetTopic(topicInput.trim());
    fetchQuiz(topicInput.trim(), difficulty, questionCount);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || !quizData) return;
    setIsAnswerChecked(true);
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedOption
    }));
  };

  const handleNextQuestion = () => {
    if (!quizData) return;

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      // Complete quiz
      setIsQuizCompleted(true);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setUserAnswers({});
    setIsQuizCompleted(false);
  };

  // Calculate score
  const score = quizData ? quizData.questions.reduce((acc, q, idx) => {
    return userAnswers[idx] === q.correctIndex ? acc + 1 : acc;
  }, 0) : 0;

  const totalQuestions = quizData?.questions.length || 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const handleSaveQuizResult = () => {
    if (!quizData) return;
    const result: QuizResult = {
      topic: quizData.topic,
      difficulty: quizData.difficulty,
      score,
      total: totalQuestions,
      date: new Date().toLocaleDateString(),
      userAnswers,
    };

    saveItem({
      type: 'quiz',
      topic: quizData.topic,
      data: result,
    });
    setIsSaved(true);
    if (onSaveNotification) {
      onSaveNotification(`Saved quiz score (${score}/${totalQuestions}) to notebook!`);
    }
  };

  const currentQ: QuizQuestion | undefined = quizData?.questions?.[currentQuestionIndex];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header & Quiz Generator Card */}
      <section className="bg-[#242424] rounded-2xl p-6 border border-[#333333] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Take a Practice Quiz</h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Test your knowledge under real exam conditions with instant grading and comprehensive rationales.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Photosynthesis, Binary Search Trees, Opportunity Cost..."
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
                  <span>Building Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>

          {/* Options: Difficulty and Question Count */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#A3A3A3]">Difficulty:</span>
              {[
                { id: 'beginner' as const, label: 'Beginner' },
                { id: 'intermediate' as const, label: 'Intermediate' },
                { id: 'exam' as const, label: 'Exam Level' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDifficulty(item.id);
                    if (topicInput.trim()) fetchQuiz(topicInput.trim(), item.id, questionCount);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    difficulty === item.id
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-[#181818] border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
              <span className="font-semibold text-[#A3A3A3]">Length:</span>
              {[3, 5, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setQuestionCount(count);
                    if (topicInput.trim()) fetchQuiz(topicInput.trim(), difficulty, count);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    questionCount === count
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-[#181818] border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#242424] rounded-2xl p-8 border border-[#333333] space-y-6 animate-pulse">
          <div className="h-4 bg-[#333333] rounded w-1/4"></div>
          <div className="h-6 bg-[#333333] rounded w-3/4"></div>
          <div className="space-y-3 pt-4">
            <div className="h-12 bg-[#181818] rounded-xl border border-[#333333]"></div>
            <div className="h-12 bg-[#181818] rounded-xl border border-[#333333]"></div>
            <div className="h-12 bg-[#181818] rounded-xl border border-[#333333]"></div>
            <div className="h-12 bg-[#181818] rounded-xl border border-[#333333]"></div>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ RUNNER */}
      {!loading && quizData && !isQuizCompleted && currentQ && (
        <div className="bg-[#242424] rounded-3xl p-6 sm:p-9 border border-[#333333] space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header & Progress Indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#A3A3A3]">
              <span className="px-2.5 py-1 rounded-md bg-[#181818] border border-[#333333] text-white uppercase tracking-wider">
                {quizData.difficulty} • Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </span>
              <span className="text-[#A3A3A3]">
                Topic: <strong className="text-white">{quizData.topic}</strong>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#181818] h-2.5 rounded-full overflow-hidden border border-[#333333]">
              <div
                className="bg-white h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            {currentQ.conceptTested && (
              <span className="text-xs font-semibold text-[#A3A3A3] bg-[#181818] border border-[#333333] px-2.5 py-0.5 rounded-md inline-block">
                Concept: {currentQ.conceptTested}
              </span>
            )}
            <h2 className="text-lg sm:text-2xl font-bold text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let cardStyle = 'border-[#333333] bg-[#181818] hover:border-[#666666] text-white';
              let badgeStyle = 'bg-[#242424] border border-[#333333] text-white';

              if (isAnswerChecked) {
                if (isCorrect) {
                  cardStyle = 'border-white bg-[#2f2f2f] text-white font-semibold ring-1 ring-white';
                  badgeStyle = 'bg-white text-black font-bold';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'border-[#555555] bg-[#181818] text-[#A3A3A3] line-through';
                  badgeStyle = 'bg-[#333333] text-[#A3A3A3]';
                } else {
                  cardStyle = 'border-[#333333] bg-[#181818]/60 text-[#666666] opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'border-white bg-[#282828] text-white ring-1 ring-white font-semibold';
                badgeStyle = 'bg-white text-black font-bold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerChecked}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-150 ${cardStyle}`}
                >
                  <span className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}>
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed flex-1">
                    {option}
                  </span>
                  {isAnswerChecked && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  )}
                  {isAnswerChecked && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-[#A3A3A3] shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Checked Answer Explanation Callout */}
          {isAnswerChecked && (
            <div className="p-5 rounded-2xl border border-[#333333] bg-[#181818] space-y-2 animate-in fade-in duration-200 text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                {selectedOption === currentQ.correctIndex ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Correct! Excellent intuition.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-[#A3A3A3]" />
                    <span>Not quite right. Review the explanation below:</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed font-normal text-[#A3A3A3]">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#333333]">
            <span className="text-xs text-[#A3A3A3]">
              {isAnswerChecked ? 'Answer verified' : selectedOption !== null ? 'Option selected' : 'Pick an answer'}
            </span>

            {!isAnswerChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 bg-white hover:bg-[#eaeaea] disabled:opacity-40 text-black font-bold rounded-xl text-sm transition-all"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-white hover:bg-[#eaeaea] text-black font-bold rounded-xl text-sm transition-all flex items-center gap-2"
              >
                <span>{currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'View Final Score'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUIZ COMPLETED SCREEN & SCORE REPORT */}
      {!loading && quizData && isQuizCompleted && (
        <div className="bg-[#242424] rounded-3xl p-6 sm:p-10 border border-[#333333] space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Score Hero */}
          <div className="text-center space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center font-extrabold text-3xl bg-[#181818] border border-[#333333] text-white">
              <Award className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
                Quiz Results: {quizData.topic}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                You Scored {score} / {totalQuestions} ({percentage}%)
              </h2>
              <p className="text-sm sm:text-base text-[#A3A3A3] font-medium">
                {percentage >= 80
                  ? 'Outstanding! You have solid mastery of this topic.'
                  : percentage >= 60
                  ? 'Good job! Review the questions you missed below to get exam-ready.'
                  : 'Keep practicing! Revisit the topic explanations and short notes.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetakeQuiz}
                className="px-5 py-2.5 rounded-xl border border-[#333333] bg-[#181818] hover:bg-[#2f2f2f] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-white" />
                <span>Retake Quiz</span>
              </button>

              <button
                onClick={handleSaveQuizResult}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors ${
                  isSaved
                    ? 'bg-[#181818] text-white border border-[#333333]'
                    : 'bg-white hover:bg-[#eaeaea] text-black'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4 text-white" /> : <Bookmark className="w-4 h-4 text-black" />}
                <span>{isSaved ? 'Score Saved to Notebook' : 'Save Result to Notebook'}</span>
              </button>

              <button
                onClick={() => fetchQuiz(quizData.topic, difficulty, questionCount)}
                className="px-5 py-2.5 rounded-xl bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate New Questions</span>
              </button>
            </div>
          </div>

          {/* Detailed Question by Question Diagnostic Review */}
          <div className="space-y-4 pt-6 border-t border-[#333333]">
            <h3 className="text-lg font-bold text-white">Question Review & Explanations</h3>
            <div className="space-y-4">
              {quizData.questions.map((q, idx) => {
                const userChoice = userAnswers[idx];
                const wasCorrect = userChoice === q.correctIndex;

                return (
                  <div
                    key={q.id || idx}
                    className="p-5 rounded-2xl border border-[#333333] bg-[#181818] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span className={`w-6 h-6 rounded-md text-xs flex items-center justify-center font-extrabold ${
                          wasCorrect ? 'bg-white text-black' : 'bg-[#333333] text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-white">{q.question}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold shrink-0 bg-[#242424] border border-[#333333] text-white">
                        {wasCorrect ? 'Correct' : 'Missed'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm pl-8">
                      <div className="text-[#A3A3A3]">
                        <span className="font-semibold text-white">Your Answer: </span>
                        <span className={wasCorrect ? 'text-white font-semibold' : 'text-[#A3A3A3] font-semibold line-through'}>
                          {userChoice !== undefined ? q.options[userChoice] : 'None'}
                        </span>
                      </div>

                      {!wasCorrect && (
                        <div className="text-white">
                          <span className="font-semibold text-[#A3A3A3]">Correct Answer: </span>
                          <span className="font-semibold text-white">{q.options[q.correctIndex]}</span>
                        </div>
                      )}

                      <div className="pt-2 text-xs text-[#A3A3A3] leading-relaxed bg-[#242424] p-3 rounded-xl border border-[#333333]">
                        <strong className="text-white">Why: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Bridge to Explain & Notes */}
          <div className="rounded-2xl p-5 bg-[#242424] border border-[#333333] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">Want to review difficult parts of {quizData.topic}?</h4>
              <p className="text-xs text-[#A3A3A3]">Revisit the full explanation or review your short notes.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('explain', quizData.topic)}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-[#eaeaea] transition-colors"
              >
                Explain Topic
              </button>
              <button
                onClick={() => onNavigate('notes', quizData.topic)}
                className="px-4 py-2 rounded-xl bg-[#181818] border border-[#333333] hover:bg-[#2f2f2f] text-white font-bold text-xs sm:text-sm transition-colors"
              >
                View Short Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !quizData && (
        <div className="text-center py-12 px-4 space-y-4 bg-[#242424] rounded-2xl border border-[#333333]">
          <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#333333] text-white mx-auto flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No active quiz</h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Enter any college topic above or pick a sample topic to test your recall with real practice questions.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['Photosynthesis', 'Binary Search Trees', 'Opportunity Cost', 'Bernoulli’s Principle'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setTopicInput(s);
                  onSetTopic(s);
                  fetchQuiz(s, difficulty, questionCount);
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
