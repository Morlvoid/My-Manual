import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { KnowledgeCardComponent } from '@/components/KnowledgeCard';
import { knowledgeOperations } from '@/lib/db';
import type { KnowledgeCard } from '@/types';
import { toast } from 'sonner';

const categories = ['每日推荐', '心理学', '效率', '情绪管理'];

export function KnowledgePage() {
  const [cards, setCards] = useState<KnowledgeCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<KnowledgeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('每日推荐');
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    await knowledgeOperations.initDefaultCards();
    const allCards = await knowledgeOperations.getAll();
    setCards(allCards);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (selectedCategory === '每日推荐') {
      // 随机排序，但保持收藏的在前面
      const sorted = [...cards].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return 0;
      });
      setFilteredCards(sorted);
    } else {
      setFilteredCards(cards.filter((c) => c.category === selectedCategory));
    }
    setCurrentIndex(0);
  }, [cards, selectedCategory]);

  const handleToggleFavorite = async (id: string) => {
    await knowledgeOperations.toggleFavorite(id);
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const currentCard = filteredCards[currentIndex];

  return (
    <div className="min-h-screen pb-24 bg-[#FAF9F6]">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-lg border-b border-[#E8E8E8]">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-[#2C2C2C]">AI 科普知识</h1>
            <button
              onClick={() => toast.info('收藏功能已集成到卡片中')}
              className="p-2 bg-white rounded-xl text-[#6B6B6B] hover:bg-[#F0F0F0] transition-colors"
            >
              <BookOpen size={20} />
            </button>
          </div>

          {/* 分类标签 */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#7C9A92] text-white'
                    : 'bg-white text-[#6B6B6B] hover:bg-[#F0F0F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 shadow-lg animate-pulse">
            <div className="h-6 bg-[#F0F0F0] rounded w-1/4 mb-6" />
            <div className="h-8 bg-[#F0F0F0] rounded w-3/4 mb-4" />
            <div className="h-32 bg-[#F0F0F0] rounded" />
          </div>
        ) : filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-[#F0F0F0] rounded-full flex items-center justify-center">
              <BookOpen size={40} className="text-[#9A9A9A]" />
            </div>
            <p className="text-[#6B6B6B]">该分类下暂无内容</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* 卡片轮播 */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {currentCard && (
                  <motion.div
                    key={currentCard.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, { offset, velocity }) => {
                      const swipe = Math.abs(offset.x) * velocity.x;
                      if (swipe < -10000) {
                        handleSwipe('left');
                      } else if (swipe > 10000) {
                        handleSwipe('right');
                      }
                    }}
                  >
                    <KnowledgeCardComponent
                      card={currentCard}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 导航控制 */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                className="p-3 bg-white rounded-full shadow-sm border border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F5F5F0] transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              {/* 指示器 */}
              <div className="flex items-center gap-2">
                {filteredCards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-6 bg-[#7C9A92]'
                        : 'bg-[#E8E8E8] hover:bg-[#D0D0D0]'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-3 bg-white rounded-full shadow-sm border border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F5F5F0] transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* 进度提示 */}
            <p className="text-center text-sm text-[#9A9A9A]">
              {currentIndex + 1} / {filteredCards.length}
            </p>

            {/* 提示文字 */}
            <p className="text-center text-xs text-[#9A9A9A]">
              左右滑动切换卡片
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
