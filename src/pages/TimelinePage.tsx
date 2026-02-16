import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TimelineCard } from '@/components/TimelineCard';
import { diaryOperations } from '@/lib/db';
import type { DiaryEntry } from '@/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { moodConfigs } from '@/lib/moods';
import { toast } from 'sonner';

export function TimelinePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    const data = await diaryOperations.getAll();
    setEntries(data);
    setFilteredEntries(data);
    const tags = await diaryOperations.getAllTags();
    setAllTags(tags);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    let result = entries;

    if (searchQuery) {
      result = result.filter(entry =>
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTag) {
      result = result.filter(entry => entry.tags.includes(selectedTag));
    }

    if (selectedMood) {
      result = result.filter(entry => entry.mood === selectedMood);
    }

    setFilteredEntries(result);
  }, [entries, searchQuery, selectedTag, selectedMood]);

  const handleDelete = async (id: string) => {
    await diaryOperations.delete(id);
    toast.success('日记已删除');
    loadEntries();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
    setSelectedMood(null);
  };

  // 按月份分组
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = new Date(entry.createdAt);
    const key = format(date, 'yyyy年M月', { locale: zhCN });
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(entry);
    return groups;
  }, {} as Record<string, DiaryEntry[]>);

  const hasActiveFilters = searchQuery || selectedTag || selectedMood;

  return (
    <div className="min-h-screen pb-24 bg-[#FAF9F6]">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-lg border-b border-[#E8E8E8]">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-[#2C2C2C]">个人成长日记</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#7C9A92] text-white'
                  : 'bg-white text-[#6B6B6B] hover:bg-[#F0F0F0]'
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索日记内容或标签..."
              className="pl-10 pr-10 rounded-xl border-[#E8E8E8] focus:border-[#7C9A92] focus:ring-[#7C9A92]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#6B6B6B]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* 筛选面板 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  {/* 心情筛选 */}
                  <div>
                    <p className="text-xs text-[#9A9A9A] mb-2">按心情筛选</p>
                    <div className="flex flex-wrap gap-2">
                      {moodConfigs.map((mood) => (
                        <button
                          key={mood.type}
                          onClick={() => setSelectedMood(selectedMood === mood.type ? null : mood.type)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedMood === mood.type
                              ? 'bg-[#7C9A92] text-white'
                              : 'bg-white text-[#6B6B6B] hover:bg-[#F0F0F0]'
                          }`}
                        >
                          <span>{mood.emoji}</span>
                          <span>{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 标签筛选 */}
                  {allTags.length > 0 && (
                    <div>
                      <p className="text-xs text-[#9A9A9A] mb-2">按标签筛选</p>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                              selectedTag === tag
                                ? 'bg-[#7C9A92] text-white'
                                : 'bg-white text-[#6B6B6B] hover:bg-[#F0F0F0]'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 清除筛选 */}
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      className="w-full text-[#9A9A9A] hover:text-[#6B6B6B]"
                    >
                      清除所有筛选
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          // 加载骨架屏
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-[#F0F0F0] rounded w-1/3 mb-3" />
                <div className="h-20 bg-[#F0F0F0] rounded" />
              </div>
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          // 空状态
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <img
              src="/empty-state.png"
              alt="空状态"
              className="w-48 h-48 mx-auto mb-6 opacity-80"
            />
            <p className="text-[#6B6B6B] mb-2">
              {hasActiveFilters ? '没有找到匹配的日记' : '还没有写日记'}
            </p>
            <p className="text-sm text-[#9A9A9A]">
              {hasActiveFilters ? '试试调整筛选条件' : '开始记录你的成长历程吧'}
            </p>
          </motion.div>
        ) : (
          // 时间轴列表
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([month, monthEntries]) => (
              <div key={month}>
                <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7C9A92]" />
                  {month}
                </h2>
                <div className="space-y-0">
                  {monthEntries.map((entry, index) => (
                    <TimelineCard
                      key={entry.id}
                      entry={entry}
                      onDelete={handleDelete}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
