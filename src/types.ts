export type StudyLevel = 'eli5' | 'college' | 'deep';

export interface KeyPoint {
  title: string;
  explanation: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface TopicExplanation {
  title: string;
  level: StudyLevel;
  tagline: string;
  analogy: string;
  coreConcept: string;
  keyPoints: KeyPoint[];
  realWorldExample: string;
  commonPitfalls: string[];
  keyTerms: KeyTerm[];
  suggestedFollowUps: string[];
}

export interface Flashcard {
  front: string;
  back: string;
  category?: string;
}

export interface CorePrinciple {
  heading: string;
  notes: string[];
  formulasOrKeywords?: string[];
}

export interface Mnemonic {
  phrase: string;
  standsFor: string;
  tip: string;
}

export interface StudyNotes {
  topic: string;
  lastUpdated: string;
  readTimeMinutes: number;
  summary: string;
  cheatSheetBullets: string[];
  corePrinciples: CorePrinciple[];
  mnemonics: Mnemonic[];
  flashcards: Flashcard[];
  examTips: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTested?: string;
}

export interface QuizData {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'exam';
  questions: QuizQuestion[];
}

export interface QuizResult {
  topic: string;
  difficulty: string;
  score: number;
  total: number;
  date: string;
  userAnswers: Record<number, number>;
}

export interface SavedItem {
  id: string;
  type: 'explanation' | 'notes' | 'quiz' | 'studyplan';
  topic: string;
  createdAt: string;
  data: TopicExplanation | StudyNotes | QuizResult | StudyPlan;
}

// ----------------------------------------
// PREMIUM & SUBSCRIPTION TYPES
// ----------------------------------------

export interface SubscriptionPlan {
  id: 'free' | 'monthly' | 'yearly';
  name: string;
  price: number;
  formattedPrice: string;
  usdEquivalent?: string;
  currency: string;
  period: string;
  badge?: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  planId: 'free' | 'monthly' | 'yearly' | null;
  planName: string | null;
  billingCycle: string | null;
  startDate: string | null;
  renewalDate: string | null;
  transactionId: string | null;
  amountPaid: string | number | null;
  cardLast4?: string;
  paymentMethod?: string;
}

export interface PaymentSubmission {
  planId: 'free' | 'monthly' | 'yearly';
  cardholderName?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvc?: string;
  discountCode?: string;
}

// ----------------------------------------
// FUTURE & PREMIUM FEATURES
// ----------------------------------------

export interface StudyPlanTask {
  id: string;
  dayNumber: number;
  dayLabel: string;
  topic: string;
  focusArea: string;
  type: 'concept_review' | 'deep_notes' | 'practice_drill' | 'mock_exam';
  estimatedMinutes: number;
  completed: boolean;
  actionHint: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  courseName: string;
  examDate: string;
  daysRemaining: number;
  weeklyHours: number;
  targetGrade: string;
  strategySummary: string;
  milestones: string[];
  tasks: StudyPlanTask[];
}

export interface AdvancedQuizQuestion {
  id: number;
  scenarioCase: string; // Real-world clinical/engineering/legal scenario
  question: string;
  options: string[];
  correctIndex: number;
  trapOptionExplanation: string;
  deepRationale: string;
  citationOrTheory: string;
  timeLimitSeconds?: number;
}

export interface AdvancedQuizData {
  topic: string;
  timedExam: boolean;
  totalTimeMinutes: number;
  questions: AdvancedQuizQuestion[];
}

export interface SubjectMastery {
  subject: string;
  masteryPercentage: number;
  quizzesTaken: number;
  notesCreated: number;
}

export interface UserProgressStats {
  streakDays: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  notesCreatedCount: number;
  explanationsViewedCount: number;
  totalStudyHours: number;
  subjects: SubjectMastery[];
}

// ----------------------------------------
// MULTIMODAL AI ASSISTANT TYPES
// ----------------------------------------

export type AssistantMode = 'bestie' | 'general' | 'study' | 'coding' | 'writing' | 'stem';

export type QuickMood = 'happy' | 'sad' | 'stressed' | 'excited' | 'tired' | 'just_chat';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  size: number;
  mimeType: string;
  data?: string; // base64 data for image preview / sending
  textContent?: string; // text content for docs / code / pdf text
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  sources?: GroundingSource[];
  webSearchUsed?: boolean;
  isError?: boolean;
  feedback?: 'up' | 'down';
  generatedImage?: string;
  mode?: AssistantMode;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  mode: AssistantMode;
  isArchived?: boolean;
  isTemporary?: boolean;
}

export interface UserMemory {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  enabled: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  memoryEnabled: boolean;
  webSearchDefault: boolean;
  speechSpeed: number;
  speechVoice?: string;
  customInstructions: string;
  preferredSubject?: string;
}
