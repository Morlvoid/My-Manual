import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MoodSelector } from '@/components/MoodSelector';
import { TagInput } from '@/components/TagInput';
import { diaryOperations, draftOperations } from '@/lib/db';
import type { MoodType } from '@/types';
import { toast } from 'sonner';

interface WritePageProps {
  onPageChange: (page: string) => void;
}

export function WritePage({ onPageChange }: WritePageProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 加载草稿
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await draftOperations.get();
      if (draft) {
        setContent(draft.content);
        setMood(draft.mood);
        setTags(draft.tags);
      }
    };
    loadDraft();

    // 加载所有标签作为建议
    const loadTags = async () => {
      const tags = await diaryOperations.getAllTags();
      setAllTags(tags);
    };
    loadTags();
  }, []);

  // 自动保存草稿
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (content || mood || tags.length > 0) {
        await draftOperations.save({
          content,
          mood,
          tags,
        });
        setLastSaved(new Date());
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [content, mood, tags]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('请写下你的所思所想');
      return;
    }

    setIsSaving(true);
    try {
      await diaryOperations.add({
        content: content.trim(),
        mood: mood || 'calm',
        tags,
        images: images.length > 0 ? images : undefined,
      });

      // 清除草稿
      await draftOperations.clear();

      toast.success('日记保存成功');
      onPageChange('timeline');
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = content.trim().length > 0;

  return (
    <div className="min-h-screen pb-24 bg-[#FAF9F6]">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-lg border-b border-[#E8E8E8]">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#2C2C2C]">写日记</h1>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-[#9A9A9A]">
                  自动保存 {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isSaving}
                className="bg-[#7C9A92] hover:bg-[#6A857E] text-white rounded-xl px-4 py-2 flex items-center gap-2 disabled:opacity-50"
              >
                <Check size={18} />
                <span>{isSaving ? '保存中...' : '保存'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 心情选择 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F0]"
        >
          <MoodSelector selectedMood={mood} onSelect={setMood} />
        </motion.div>

        {/* 日记内容 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F0]"
        >
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下今天的所思所想..."
            className="min-h-[200px] resize-none border-0 focus:ring-0 text-lg leading-relaxed placeholder:text-[#9A9A9A]"
          />
        </motion.div>

        {/* 图片上传 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F0]"
        >
          <p className="text-sm text-[#6B6B6B] mb-3">添加图片</p>
          
          {/* 已上传图片 */}
          {images.length > 0 && (
            <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img
                    src={image}
                    alt={`上传图片 ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 上传按钮 */}
          <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[#E8E8E8] rounded-xl text-[#6B6B6B] hover:border-[#7C9A92] hover:text-[#7C9A92] transition-colors cursor-pointer">
            <ImagePlus size={20} />
            <span className="text-sm">点击添加图片</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </motion.div>

        {/* 标签输入 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-[#F0F0F0]"
        >
          <TagInput tags={tags} onChange={setTags} suggestions={allTags} />
        </motion.div>
      </main>
    </div>
  );
}
