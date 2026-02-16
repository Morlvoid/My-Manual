import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagInput({ tags, onChange, suggestions = [] }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#6B6B6B]">添加标签</p>
      
      {/* 已选标签 */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
            >
              <Badge 
                className="bg-[#7C9A92] text-white hover:bg-[#6A857E] rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5"
              >
                #{tag}
                <button
                  onClick={() => removeTag(index)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 输入框 */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              placeholder="输入标签按回车添加"
              className="rounded-xl border-[#E8E8E8] focus:border-[#7C9A92] focus:ring-[#7C9A92]/20"
            />
          </div>
          <button
            onClick={() => inputValue.trim() && addTag(inputValue.trim())}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-[#7C9A92] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6A857E] transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* 建议列表 */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-[#E8E8E8] z-10 max-h-40 overflow-auto"
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full px-4 py-2.5 text-left text-sm text-[#6B6B6B] hover:bg-[#F5F5F0] first:rounded-t-xl last:rounded-b-xl transition-colors"
              >
                #{suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* 常用标签快捷选择 */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-[#9A9A9A] mr-1">常用:</span>
          {suggestions.slice(0, 6).map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              disabled={tags.includes(tag)}
              className="text-xs text-[#7C9A92] hover:text-[#6A857E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
