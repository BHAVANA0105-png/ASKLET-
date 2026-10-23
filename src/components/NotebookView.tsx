import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Lightbulb, 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  Search, 
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SavedItem, TopicExplanation, StudyNotes, QuizResult } from '../types';
import { deleteSavedItem } from '../utils/storage';
import { ActiveTab } from './Navbar';

interface NotebookViewProps {
  savedItems: SavedItem[];
  onRefresh: () => void;
  onNavigate: (tab: ActiveTab, topic?: string) => void;
  onSelectSavedItem: (item: SavedItem) => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  savedItems,
  onRefresh,
  onNavigate,
  onSelectSavedItem,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'explanation' | 'notes' | 'quiz'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedItem(id);
    onRefresh();
  };

  const filteredItems = savedItems.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getItemTypeBadge = (type: SavedItem['type']) => {
    switch (type) {
      case 'explanation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#181818] border border-[#333333] text-white">
            <Lightbulb className="w-3 h-3 text-white" /> Explanation
          </span>
        );
      case 'notes':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#181818] border border-[#333333] text-white">
            <FileText className="w-3 h-3 text-white" /> Short Notes
          </span>
        );
      case 'quiz':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#181818] border border-[#333333] text-white">
            <HelpCircle className="w-3 h-3 text-white" /> Practice Quiz
          </span>
        );
    }
  };

  const handleOpenItem = (item: SavedItem) => {
    onSelectSavedItem(item);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <section className="bg-[#242424] rounded-2xl p-6 border border-[#333333] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#333333] text-white flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">My Study Notebook</h1>
              <p className="text-xs sm:text-sm text-[#A3A3A3]">
                All your saved explanations, revision cheat sheets, and quiz records.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#181818] border border-[#333333] text-white self-start sm:self-auto">
            {savedItems.length} saved {savedItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by topic name..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-[#181818] border border-[#333333] focus:border-white outline-none text-white placeholder:text-[#A3A3A3]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'all' as const, label: 'All Items' },
              { id: 'explanation' as const, label: 'Explanations' },
              { id: 'notes' as const, label: 'Short Notes' },
              { id: 'quiz' as const, label: 'Quizzes' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                  filterType === f.id
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#181818] border border-[#333333] text-[#A3A3A3] hover:text-white hover:bg-[#2f2f2f]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Saved Items List */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenItem(item)}
              className="bg-[#242424] p-5 rounded-2xl border border-[#333333] hover:border-[#666666] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  {getItemTypeBadge(item.type)}
                  <span className="text-xs text-[#A3A3A3] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#A3A3A3]" />
                    {item.createdAt}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-white transition-colors">
                  {item.topic}
                </h3>

                {/* Subtitle / summary preview */}
                <p className="text-xs text-[#A3A3A3] line-clamp-1">
                  {item.type === 'explanation' && (item.data as TopicExplanation).tagline}
                  {item.type === 'notes' && (item.data as StudyNotes).summary}
                  {item.type === 'quiz' && `Scored ${(item.data as QuizResult).score} of ${(item.data as QuizResult).total} correct`}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#333333] rounded-xl transition-colors"
                  title="Delete from notebook"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="px-3.5 py-1.5 rounded-xl bg-[#181818] border border-[#333333] text-white text-xs font-bold flex items-center gap-1.5 group-hover:bg-white group-hover:text-black transition-colors">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 space-y-4 bg-[#242424] rounded-2xl border border-[#333333]">
          <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#333333] text-white mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">Your notebook is empty</h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              When you explain topics, make short notes, or take quizzes, click the "Save" button to keep them here for quick revision before exams!
            </p>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-[#eaeaea] transition-colors"
          >
            Start Studying Now
          </button>
        </div>
      )}
    </div>
  );
};
