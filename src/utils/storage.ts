import { SavedItem, SubscriptionStatus, StudyPlan } from '../types';

const STORAGE_KEY = 'study_buddy_saved_items';
const RECENTS_KEY = 'study_buddy_recent_topics';
const SUBSCRIPTION_KEY = 'study_buddy_subscription';
const PLANS_KEY = 'study_buddy_plans';

export function getSavedItems(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load saved items:', e);
    return [];
  }
}

export function saveItem(item: Omit<SavedItem, 'id' | 'createdAt'>): SavedItem {
  const items = getSavedItems();
  const newItem: SavedItem = {
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const filtered = items.filter(
    (existing) => !(existing.topic.toLowerCase() === newItem.topic.toLowerCase() && existing.type === newItem.type)
  );
  const updated = [newItem, ...filtered];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export function deleteSavedItem(id: string): void {
  const items = getSavedItems();
  const updated = items.filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getRecentTopics(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [
      'Photosynthesis',
      'Binary Search Trees',
      'Opportunity Cost',
      'Thermodynamics Laws',
      'Action Potentials'
    ];
  } catch (e) {
    return ['Photosynthesis', 'Binary Search Trees', 'Opportunity Cost'];
  }
}

export function addRecentTopic(topic: string): void {
  if (!topic.trim()) return;
  try {
    const recents = getRecentTopics().filter(
      (t) => t.toLowerCase() !== topic.trim().toLowerCase()
    );
    const updated = [topic.trim(), ...recents].slice(0, 8);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent topic:', e);
  }
}

// ----------------------------------------
// SUBSCRIPTION STORAGE
// ----------------------------------------
export function getStoredSubscription(): SubscriptionStatus {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load subscription:', e);
  }

  return {
    isSubscribed: false,
    planId: null,
    planName: null,
    billingCycle: null,
    startDate: null,
    renewalDate: null,
    transactionId: null,
    amountPaid: null,
    paymentMethod: 'None'
  };
}

export function saveStoredSubscription(sub: SubscriptionStatus): void {
  try {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
  } catch (e) {
    console.error('Failed to save subscription:', e);
  }
}

export function clearStoredSubscription(): void {
  try {
    localStorage.removeItem(SUBSCRIPTION_KEY);
  } catch (e) {
    console.error('Failed to clear subscription:', e);
  }
}

// ----------------------------------------
// STUDY PLANS STORAGE
// ----------------------------------------
export function getStoredStudyPlans(): StudyPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredStudyPlan(plan: StudyPlan): void {
  try {
    const plans = getStoredStudyPlans().filter(p => p.id !== plan.id);
    localStorage.setItem(PLANS_KEY, JSON.stringify([plan, ...plans]));
  } catch (e) {
    console.error('Failed to save study plan:', e);
  }
}

export function toggleTaskInPlan(planId: string, taskId: string): StudyPlan[] {
  try {
    const plans = getStoredStudyPlans();
    const updated = plans.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      };
    });
    localStorage.setItem(PLANS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return getStoredStudyPlans();
  }
}

// ----------------------------------------
// CHAT CONVERSATIONS STORAGE
// ----------------------------------------
const CONVERSATIONS_KEY = 'asklet_conversations';
const MEMORIES_KEY = 'asklet_user_memories';
const PREFERENCES_KEY = 'asklet_user_preferences';

export function getStoredConversations(): import('../types').ChatConversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load conversations:', e);
    return [];
  }
}

export function saveStoredConversation(conv: import('../types').ChatConversation): void {
  try {
    const all = getStoredConversations().filter(c => c.id !== conv.id);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify([conv, ...all]));
  } catch (e) {
    console.error('Failed to save conversation:', e);
  }
}

export function deleteStoredConversation(id: string): void {
  try {
    const all = getStoredConversations().filter(c => c.id !== id);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to delete conversation:', e);
  }
}

export function archiveStoredConversation(id: string, isArchived: boolean): void {
  try {
    const all = getStoredConversations().map(c => c.id === id ? { ...c, isArchived } : c);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to archive conversation:', e);
  }
}

export function renameStoredConversation(id: string, newTitle: string): void {
  try {
    const all = getStoredConversations().map(c => c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to rename conversation:', e);
  }
}

// ----------------------------------------
// PERSONAL MEMORIES STORAGE
// ----------------------------------------
export function getStoredMemories(): import('../types').UserMemory[] {
  try {
    const raw = localStorage.getItem(MEMORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load memories:', e);
  }
  return [
    {
      id: 'mem_1',
      content: 'College Student aiming for high honors in STEM & Humanities coursework',
      category: 'Academic Goals',
      createdAt: 'Today',
      enabled: true
    },
    {
      id: 'mem_2',
      content: 'Prefers clear analogies, step-by-step logic, and clean code examples with TypeScript/Python',
      category: 'Learning Preferences',
      createdAt: 'Today',
      enabled: true
    }
  ];
}

export function saveStoredMemory(content: string, category: string = 'General'): import('../types').UserMemory {
  const current = getStoredMemories();
  const newMem: import('../types').UserMemory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    content: content.trim(),
    category: category.trim(),
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    enabled: true
  };
  const updated = [newMem, ...current];
  localStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
  return newMem;
}

export function deleteStoredMemory(id: string): void {
  try {
    const current = getStoredMemories().filter(m => m.id !== id);
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete memory:', e);
  }
}

export function toggleStoredMemory(id: string): void {
  try {
    const current = getStoredMemories().map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
    localStorage.setItem(MEMORIES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to toggle memory:', e);
  }
}

export function clearStoredMemories(): void {
  try {
    localStorage.removeItem(MEMORIES_KEY);
  } catch (e) {
    console.error('Failed to clear memories:', e);
  }
}

// ----------------------------------------
// USER PREFERENCES STORAGE
// ----------------------------------------
export function getStoredPreferences(): import('../types').UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return {
    theme: 'light',
    memoryEnabled: true,
    webSearchDefault: false,
    speechSpeed: 1.0,
    customInstructions: ''
  };
}

export function saveStoredPreferences(prefs: Partial<import('../types').UserPreferences>): import('../types').UserPreferences {
  const current = getStoredPreferences();
  const updated = { ...current, ...prefs };
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  return updated;
}
