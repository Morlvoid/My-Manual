import { motion } from 'framer-motion';
import { Heart, Share2, Quote } from 'lucide-react';
import type { KnowledgeCard as KnowledgeCardType } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

interface KnowledgeCardProps {
  card: KnowledgeCardType;
  onToggleFavorite: (id: string) => void;
}

export function KnowledgeCardComponent({ card, onToggleFavorite }: KnowledgeCardProps) {
  const [isLiked, setIsLiked] = useState(card.isFavorite);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onToggleFavorite(card.id);
    toast.success(isLiked ? '已取消收藏' : '已添加到收藏');
  };

  const handleShare = async () => {
    const text = `「${card.title}」\n\n${card.content}${card.author ? `\n\n—— ${card.author}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.title,
          text: text,
        });
      } catch (err) {
        // 用户取消分享
      }
    } else {
      // 复制到剪贴板
      await navigator.clipboard.writeText(text);
      toast.success('已复制到剪贴板');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl p-8 shadow-lg border border-[#F0F0F0] relative overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C9A92]/10 to-transparent rounded-bl-full" />
      
      {/* 分类标签 */}
      <div className="flex items-center justify-between mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F4F8] text-[#7C9A92] text-xs font-medium rounded-full">
          <Quote size={12} />
          {card.category}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-2xl font-semibold text-[#2C2C2C] mb-4 leading-tight">
        {card.title}
      </h3>

      {/* 内容 */}
      <p className="text-[#6B6B6B] leading-relaxed text-lg mb-6">
        {card.content}
      </p>

      {/* 作者 */}
      {card.author && (
        <p className="text-sm text-[#9A9A9A] mb-6 text-right">
          —— {card.author}
        </p>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0]">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            isLiked 
              ? 'bg-red-50 text-red-500' 
              : 'bg-[#F5F5F0] text-[#6B6B6B] hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-sm font-medium">
            {isLiked ? '已收藏' : '收藏'}
          </span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] text-[#6B6B6B] rounded-xl hover:bg-[#E8F4F8] hover:text-[#7C9A92] transition-all duration-200"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">分享</span>
        </button>
      </div>
    </motion.div>
  );
}
