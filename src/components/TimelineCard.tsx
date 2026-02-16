import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { DiaryEntry } from '@/types';
import { getMoodEmoji, getMoodColor } from '@/lib/moods';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TimelineCardProps {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
  index: number;
}

export function TimelineCard({ entry, onDelete, index }: TimelineCardProps) {
  const date = new Date(entry.createdAt);
  const moodEmoji = getMoodEmoji(entry.mood);
  const moodColor = getMoodColor(entry.mood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative pl-8 pb-8 last:pb-0"
    >
      {/* 时间轴线条 */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-[#E8E8E8]" />
      
      {/* 时间点 */}
      <div 
        className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-sm"
        style={{ backgroundColor: `${moodColor}30` }}
      >
        <span>{moodEmoji}</span>
      </div>

      {/* 卡片内容 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F0] hover:shadow-md transition-shadow duration-200">
        {/* 头部信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            <span className="font-medium text-[#2C2C2C]">
              {format(date, 'M月d日', { locale: zhCN })}
            </span>
            <span>{format(date, 'EEE', { locale: zhCN })}</span>
            <span className="text-[#9A9A9A]">
              {format(date, 'HH:mm', { locale: zhCN })}
            </span>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-1.5 text-[#9A9A9A] hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  这条日记将被永久删除，无法恢复。确定要继续吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(entry.id)}
                  className="rounded-xl bg-red-500 hover:bg-red-600"
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* 日记内容 */}
        <p className="text-[#2C2C2C] leading-relaxed whitespace-pre-wrap mb-4">
          {entry.content}
        </p>

        {/* 图片 */}
        {entry.images && entry.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {entry.images.map((image, idx) => (
              <img
                key={idx}
                src={image}
                alt={`日记图片 ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* 标签 */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span 
                key={tag} 
                className="bg-[#F5F5F0] text-[#6B6B6B] hover:bg-[#E8E8E8] rounded-full px-3 py-1 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
