import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Lock, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  Award, 
  Target, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Flame, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  CreditCard,
  Check,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { 
  SubscriptionStatus, 
  StudyPlan, 
  StudyPlanTask, 
  AdvancedQuizData, 
  UserProgressStats 
} from '../types';
import { 
  getStoredStudyPlans, 
  saveStoredStudyPlan, 
  toggleTaskInPlan 
} from '../utils/storage';

interface PremiumSectionProps {
  subscription: SubscriptionStatus;
  onOpenUpgradeModal: () => void;
  onNavigateHome: () => void;
}

export const PremiumSection: React.FC<PremiumSectionProps> = ({
  subscription,
  onOpenUpgradeModal,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'studyplan' | 'advancedquiz' | 'analytics'>('studyplan');

  // Study Plan Form State
  const [courseName, setCourseName] = useState('Organic Chemistry II');
  const [daysUntilExam, setDaysUntilExam] = useState(14);
  const [weeklyHours, setWeeklyHours] = useState(12);
  const [targetGrade, setTargetGrade] = useState('A (4.0)');
  const [weakAreas, setWeakAreas] = useState('Reaction mechanisms & synthesis pathways');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);

  // Advanced Quiz State
  const [advancedTopic, setAdvancedTopic] = useState('Distributed Systems & Concurrency');
  const [advancedQuiz, setAdvancedQuiz] = useState<AdvancedQuizData | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAdvancedOption, setSelectedAdvancedOption] = useState<number | null>(null);
  const [showAdvancedExplanation, setShowAdvancedExplanation] = useState(false);

  // Analytics State
  const [stats, setStats] = useState<UserProgressStats>({
    streakDays: 4,
    totalQuizzesTaken: 12,
    averageQuizScore: 84,
    notesCreatedCount: 9,
    explanationsViewedCount: 18,
    totalStudyHours: 14.5,
    subjects: [
      { subject: 'Computer Science', masteryPercentage: 88, quizzesTaken: 5, notesCreated: 4 },
      { subject: 'Biology & Pre-Med', masteryPercentage: 82, quizzesTaken: 4, notesCreated: 3 },
      { subject: 'Economics & Business', masteryPercentage: 91, quizzesTaken: 2, notesCreated: 1 },
      { subject: 'Physics & Engineering', masteryPercentage: 74, quizzesTaken: 1, notesCreated: 1 }
    ]
  });

  // Load existing plans from storage
  useEffect(() => {
    const plans = getStoredStudyPlans();
    if (plans.length > 0) {
      setActivePlan(plans[0]);
    }
  }, []);

  // Fetch initial progress data
  useEffect(() => {
    fetch('/api/premium/progress')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleGenerateStudyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription.isSubscribed) {
      onOpenUpgradeModal();
      return;
    }

    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/premium/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName,
          daysUntilExam,
          weeklyHours,
          targetGrade,
          weakAreas
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setActivePlan(data.plan);
        saveStoredStudyPlan(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!activePlan) return;
    const updatedPlans = toggleTaskInPlan(activePlan.id, taskId);
    const updatedCurrent = updatedPlans.find(p => p.id === activePlan.id);
    if (updatedCurrent) {
      setActivePlan(updatedCurrent);
    }
  };

  const handleGenerateAdvancedQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription.isSubscribed) {
      onOpenUpgradeModal();
      return;
    }

    setGeneratingQuiz(true);
    setActiveQuestionIdx(0);
    setSelectedAdvancedOption(null);
    setShowAdvancedExplanation(false);

    try {
      const res = await fetch('/api/premium/advanced-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: advancedTopic, count: 3 }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAdvancedQuiz(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const completedTasksCount = activePlan ? activePlan.tasks.filter(t => t.completed).length : 0;
  const totalTasksCount = activePlan ? activePlan.tasks.length : 0;
  const planProgressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Premium Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#242424] text-white p-6 sm:p-9 border border-[#333333]">
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#333333] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Asklet Pro
              </span>
              <span className="text-xs text-[#A3A3A3] font-medium">
                {subscription.isSubscribed ? 'Premium Member Active' : 'Premium Features'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Collegiate Premium Suite
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-xl leading-relaxed">
              Accelerate your academic performance with Personalized Exam Roadmaps, Advanced Honors Case Quizzes, and Diagnostic Progress Analytics.
            </p>
          </div>

          {/* Status CTA */}
          <div className="shrink-0">
            {subscription.isSubscribed ? (
              <div className="bg-[#181818] rounded-2xl p-4 border border-[#333333] text-xs space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-white" />
                  <span>Upgraded to Premium ✓ ({subscription.planName})</span>
                </div>
                <div className="text-[#A3A3A3]">Active tier: {subscription.amountPaid || '₹499/mo'}</div>
                <button
                  onClick={onOpenUpgradeModal}
                  className="mt-2 w-full py-1.5 px-3 bg-white text-black font-bold rounded-lg text-xs hover:bg-[#eaeaea] transition-colors"
                >
                  Manage Membership
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenUpgradeModal}
                className="px-6 py-3 bg-white hover:bg-[#eaeaea] text-black font-extrabold text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Upgrade to Premium (₹499/mo)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feature Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#333333] pb-2 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('studyplan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'studyplan'
              ? 'bg-white text-black font-bold'
              : 'bg-[#181818] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Personalized Study Plan</span>
          {!subscription.isSubscribed && (
            <span className="px-1.5 py-0.2 bg-[#242424] border border-[#333333] text-white text-[10px] rounded-full uppercase">PRO</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('advancedquiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'advancedquiz'
              ? 'bg-white text-black font-bold'
              : 'bg-[#181818] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Advanced Scenario Quizzes</span>
          {!subscription.isSubscribed && (
            <span className="px-1.5 py-0.2 bg-[#242424] border border-[#333333] text-white text-[10px] rounded-full uppercase">PRO</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-white text-black font-bold'
              : 'bg-[#181818] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Progress & Analytics</span>
          {!subscription.isSubscribed && (
            <span className="px-1.5 py-0.2 bg-[#242424] border border-[#333333] text-white text-[10px] rounded-full uppercase">PRO</span>
          )}
        </button>
      </div>

      {/* ==================================================== */}
      {/* 1. PERSONALIZED STUDY PLAN FEATURE */}
      {/* ==================================================== */}
      {activeTab === 'studyplan' && (
        <div className="space-y-6">
          {/* Free Tier Teaser Banner if Not Subscribed */}
          {!subscription.isSubscribed && (
            <div className="p-4 rounded-2xl bg-[#242424] border border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Previewing Premium Feature: Personalized Study Plan</h4>
                  <p className="text-xs text-[#A3A3A3]">
                    Subscribe to generate an AI study roadmap tailored to your exact course syllabus and exam date.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenUpgradeModal}
                className="whitespace-nowrap px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-[#eaeaea] transition-colors"
              >
                Unlock Study Plans
              </button>
            </div>
          )}

          {/* Generator Card */}
          <div className="bg-[#242424] rounded-2xl p-6 border border-[#333333] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Configure Your Personalized Exam Roadmap</h2>
                <p className="text-xs text-[#A3A3A3]">AI calculates ideal spaced repetition intervals based on your exam date and weak spots.</p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#181818] border border-[#333333] text-white text-xs font-bold uppercase">
                AI Roadmap
              </span>
            </div>

            <form onSubmit={handleGenerateStudyPlan} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1">Course / Exam Subject</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Organic Chemistry II, Data Structures, Macroeconomics"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-[#181818] border border-[#333333] rounded-xl focus:border-white outline-none text-white placeholder:text-[#A3A3A3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1">Days Until Exam</label>
                <input
                  type="number"
                  min={3}
                  max={90}
                  value={daysUntilExam}
                  onChange={(e) => setDaysUntilExam(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-[#181818] border border-[#333333] rounded-xl focus:border-white outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1">Target Grade</label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-[#181818] border border-[#333333] rounded-xl focus:border-white outline-none text-white"
                >
                  <option value="A (4.0)" className="bg-[#181818] text-white">A (4.0) - High Honors</option>
                  <option value="A- / B+" className="bg-[#181818] text-white">A- / B+ (3.5)</option>
                  <option value="Pass / Solid B" className="bg-[#181818] text-white">Pass with Solid B</option>
                </select>
              </div>

              <div className="col-span-1 sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-[#A3A3A3] mb-1">Specific Weak Areas or Focus Topics</label>
                <input
                  type="text"
                  value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  placeholder="e.g. Synthesis mechanisms, boundary value problems, graph algorithms"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium bg-[#181818] border border-[#333333] rounded-xl focus:border-white outline-none text-white placeholder:text-[#A3A3A3]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={generatingPlan}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#eaeaea] disabled:opacity-50 text-black font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {generatingPlan ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Generating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>{subscription.isSubscribed ? 'Generate Plan' : 'Generate (Unlock)'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Active Plan Dashboard */}
          {activePlan && (
            <div className="bg-[#242424] rounded-3xl p-6 sm:p-8 border border-[#333333] space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#333333]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A3A3A3]">
                    <span className="text-white">{activePlan.courseName}</span>
                    <span>•</span>
                    <span>{activePlan.daysRemaining} Days Countdown</span>
                    <span>•</span>
                    <span className="text-white">Goal: {activePlan.targetGrade}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">{activePlan.title}</h3>
                </div>

                {/* Progress Meter */}
                <div className="bg-[#181818] p-3 rounded-2xl border border-[#333333] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#242424] border border-[#333333] text-white font-extrabold text-sm flex items-center justify-center">
                    {planProgressPercent}%
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">{completedTasksCount} of {totalTasksCount} Completed</div>
                    <div className="text-[#A3A3A3]">Daily Study Streak: Active</div>
                  </div>
                </div>
              </div>

              {/* Strategy Callout */}
              <div className="p-4 rounded-2xl bg-[#181818] border border-[#333333] text-xs sm:text-sm text-[#A3A3A3] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-white">
                  <Target className="w-4 h-4 text-white" />
                  <span>Strategic Roadmap Overview</span>
                </div>
                <p className="leading-relaxed font-normal">{activePlan.strategySummary}</p>
              </div>

              {/* Roadmap Milestones */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Phases & Milestones</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {activePlan.milestones.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#181818] border border-[#333333] font-medium text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Tasks Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Daily Action Plan</h4>
                <div className="space-y-2.5">
                  {activePlan.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        task.completed
                          ? 'bg-[#1c1c1c] border-[#333333] text-[#A3A3A3]'
                          : 'bg-[#181818] border-[#333333] hover:border-[#666666] text-white'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-6 h-6 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          task.completed
                            ? 'bg-white border-white text-black font-bold'
                            : 'border-[#444444] bg-[#242424] hover:border-white'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4 text-black" />}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-extrabold text-white">{task.dayLabel}:</span>
                          <span className={`font-semibold ${task.completed ? 'line-through text-[#666666]' : 'text-white'}`}>
                            {task.topic}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#242424] border border-[#333333] text-[#A3A3A3] text-[10px] font-bold">
                            {task.focusArea}
                          </span>
                          <span className="text-[11px] text-[#A3A3A3] flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3 text-[#A3A3A3]" /> ~{task.estimatedMinutes} mins
                          </span>
                        </div>
                        <p className="text-xs text-[#A3A3A3] leading-relaxed">
                          Hint: {task.actionHint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. ADVANCED SCENARIO QUIZZES FEATURE */}
      {/* ==================================================== */}
      {activeTab === 'advancedquiz' && (
        <div className="space-y-6">
          {!subscription.isSubscribed && (
            <div className="p-4 rounded-2xl bg-[#242424] border border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Previewing Premium Feature: Advanced Scenario Quizzes</h4>
                  <p className="text-xs text-[#A3A3A3]">
                    Honors-level clinical, engineering, and policy case questions designed to prepare you for college finals.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenUpgradeModal}
                className="whitespace-nowrap px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-[#eaeaea] transition-colors"
              >
                Unlock Advanced Quizzes
              </button>
            </div>
          )}

          {/* Generator Input */}
          <div className="bg-[#242424] rounded-2xl p-6 border border-[#333333] space-y-4">
            <h2 className="text-lg font-bold text-white">Advanced Scenario & Case-Study Exam Simulator</h2>
            <form onSubmit={handleGenerateAdvancedQuiz} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={advancedTopic}
                onChange={(e) => setAdvancedTopic(e.target.value)}
                placeholder="e.g. Distributed Systems Concurrency, Organic Synthesis, Constitutional Law..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-medium bg-[#181818] border border-[#333333] rounded-xl focus:border-white outline-none text-white placeholder:text-[#A3A3A3]"
              />
              <button
                type="submit"
                disabled={generatingQuiz}
                className="px-6 py-2.5 bg-white hover:bg-[#eaeaea] disabled:opacity-50 text-black font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {generatingQuiz ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 text-black" />}
                <span>{subscription.isSubscribed ? 'Start Honors Case Exam' : 'Generate (Unlock)'}</span>
              </button>
            </form>
          </div>

          {/* Active Quiz Card */}
          {advancedQuiz && advancedQuiz.questions[activeQuestionIdx] && (
            <div className="bg-[#242424] rounded-3xl p-6 sm:p-9 border border-[#333333] space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-[#A3A3A3] pb-3 border-b border-[#333333]">
                <span className="px-2.5 py-0.5 rounded-md bg-[#181818] border border-[#333333] text-white">
                  Case Study {activeQuestionIdx + 1} of {advancedQuiz.questions.length}
                </span>
                <span className="flex items-center gap-1 text-[#A3A3A3]">
                  <Clock className="w-3.5 h-3.5 text-[#A3A3A3]" /> Timed Collegiate Mode
                </span>
              </div>

              {/* Real World Scenario Case */}
              <div className="p-5 rounded-2xl bg-[#181818] border border-[#333333] text-white text-xs sm:text-sm leading-relaxed space-y-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  Scenario Case Description
                </span>
                <p className="text-[#A3A3A3]">{advancedQuiz.questions[activeQuestionIdx].scenarioCase}</p>
              </div>

              {/* Question */}
              <h3 className="text-base sm:text-lg font-bold text-white">
                {advancedQuiz.questions[activeQuestionIdx].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {advancedQuiz.questions[activeQuestionIdx].options.map((opt, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx);
                  const isSelected = selectedAdvancedOption === oIdx;
                  const isCorrect = oIdx === advancedQuiz.questions[activeQuestionIdx].correctIndex;

                  let style = 'border-[#333333] bg-[#181818] hover:border-[#666666] text-white';
                  if (showAdvancedExplanation) {
                    if (isCorrect) {
                      style = 'border-white bg-[#2f2f2f] text-white font-semibold ring-1 ring-white';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-[#555555] bg-[#181818] text-[#A3A3A3] line-through';
                    }
                  } else if (isSelected) {
                    style = 'border-white bg-[#282828] text-white ring-1 ring-white font-semibold';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => !showAdvancedExplanation && setSelectedAdvancedOption(oIdx)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all text-xs sm:text-sm leading-relaxed ${style}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-[#242424] border border-[#333333] text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {letter}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Deep Diagnostic Rationale */}
              {showAdvancedExplanation && (
                <div className="p-5 rounded-2xl bg-[#181818] border border-[#333333] space-y-3 text-xs sm:text-sm text-white">
                  <div className="font-bold flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Deep Theoretical Rationale</span>
                  </div>
                  <p className="leading-relaxed text-[#A3A3A3]">
                    {advancedQuiz.questions[activeQuestionIdx].deepRationale}
                  </p>
                  <div className="pt-2 border-t border-[#333333] text-xs text-[#A3A3A3]">
                    <strong className="text-white">Distractor Analysis: </strong>
                    {advancedQuiz.questions[activeQuestionIdx].trapOptionExplanation}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#333333]">
                <span className="text-xs text-[#A3A3A3]">
                  Framework: {advancedQuiz.questions[activeQuestionIdx].citationOrTheory}
                </span>

                {!showAdvancedExplanation ? (
                  <button
                    onClick={() => setShowAdvancedExplanation(true)}
                    disabled={selectedAdvancedOption === null}
                    className="px-6 py-2.5 bg-white hover:bg-[#eaeaea] disabled:opacity-50 text-black font-bold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Verify & Analyze Rationale
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (activeQuestionIdx < advancedQuiz.questions.length - 1) {
                        setActiveQuestionIdx(prev => prev + 1);
                        setSelectedAdvancedOption(null);
                        setShowAdvancedExplanation(false);
                      } else {
                        alert('Advanced Exam Completed! Review logged to your progress tracking.');
                      }
                    }}
                    className="px-6 py-2.5 bg-white hover:bg-[#eaeaea] text-black font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>{activeQuestionIdx < advancedQuiz.questions.length - 1 ? 'Next Scenario Case' : 'Complete Exam'}</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. PROGRESS & EXAM READINESS ANALYTICS */}
      {/* ==================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {!subscription.isSubscribed && (
            <div className="p-4 rounded-2xl bg-[#242424] border border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Previewing Premium Feature: Progress Tracking</h4>
                  <p className="text-xs text-[#A3A3A3]">
                    Track your daily study streaks, subject mastery levels, and overall exam readiness analytics.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenUpgradeModal}
                className="whitespace-nowrap px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-[#eaeaea] transition-colors"
              >
                Unlock Analytics
              </button>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#242424] p-5 rounded-2xl border border-[#333333] space-y-1">
              <div className="flex items-center justify-between text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Study Streak</span>
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.streakDays} Days</div>
              <p className="text-[11px] text-[#A3A3A3] font-semibold">Active this week</p>
            </div>

            <div className="bg-[#242424] p-5 rounded-2xl border border-[#333333] space-y-1">
              <div className="flex items-center justify-between text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Average Quiz</span>
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.averageQuizScore}%</div>
              <p className="text-[11px] text-[#A3A3A3] font-medium">Over {stats.totalQuizzesTaken} practice tests</p>
            </div>

            <div className="bg-[#242424] p-5 rounded-2xl border border-[#333333] space-y-1">
              <div className="flex items-center justify-between text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Hours Logged</span>
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalStudyHours}h</div>
              <p className="text-[11px] text-[#A3A3A3] font-medium">{stats.notesCreatedCount} cheat sheets made</p>
            </div>

            <div className="bg-[#242424] p-5 rounded-2xl border border-[#333333] space-y-1">
              <div className="flex items-center justify-between text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">Exam Readiness</span>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">86%</div>
              <p className="text-[11px] text-[#A3A3A3] font-semibold">Ready for midterms</p>
            </div>
          </div>

          {/* Subject Mastery Radar / Breakdown */}
          <div className="bg-[#242424] rounded-3xl p-6 sm:p-8 border border-[#333333] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Subject Mastery Breakdown</h3>
                <p className="text-xs text-[#A3A3A3]">Calculated from quiz scores, flashcard drills, and concept views.</p>
              </div>
              <span className="text-xs font-bold text-white">Updated Today</span>
            </div>

            <div className="space-y-4">
              {stats.subjects.map((sub, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>{sub.subject}</span>
                    <span className="text-[#A3A3A3]">{sub.masteryPercentage}% Mastery</span>
                  </div>
                  <div className="w-full bg-[#181818] h-3 rounded-full overflow-hidden border border-[#333333]">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{ width: `${sub.masteryPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#A3A3A3]">
                    <span>{sub.quizzesTaken} Quizzes Taken</span>
                    <span>{sub.notesCreated} Study Notes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
