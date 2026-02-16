import { motion } from 'framer-motion';
import { moodConfigs } from '@/lib/moods';
import type { MoodType } from '@/types';

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onSelect: (mood: MoodType) => void;
}

export function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#6B6B6B]">今天的心情？</p>
      <div className="flex flex-wrap gap-3">
        {moodConfigs.map((mood) => (
          <motion.button
            key={mood.type}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(mood.type)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 ${
              selectedMood === mood.type
                ? 'bg-white shadow-md ring-2'
                : 'bg-white/50 hover:bg-white hover:shadow-sm'
            }`}
            style={{
              ringColor: selectedMood === mood.type ? mood.color : 'transparent',
              '--tw-ring-color': selectedMood === mood.type ? mood.color : 'transparent',
            } as React.CSSProperties}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className={`text-xs ${
              selectedMood === mood.type ? 'text-[#2C2C2C] font-medium' : 'text-[#9A9A9A]'
            }`}>
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
