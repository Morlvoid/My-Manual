import type { MoodConfig } from '@/types';

export const moodConfigs: MoodConfig[] = [
  { type: 'happy', emoji: '😊', label: '开心', color: '#FFD93D' },
  { type: 'calm', emoji: '😌', label: '平静', color: '#A8D8EA' },
  { type: 'loved', emoji: '🥰', label: '被爱', color: '#FFB6B9' },
  { type: 'thinking', emoji: '🤔', label: '思考', color: '#C9B1FF' },
  { type: 'tired', emoji: '😴', label: '疲惫', color: '#B8B8B8' },
  { type: 'sad', emoji: '😢', label: '难过', color: '#7EC8E3' },
  { type: 'anxious', emoji: '😰', label: '焦虑', color: '#FFA07A' },
  { type: 'angry', emoji: '😠', label: '生气', color: '#FF6B6B' },
];

export const getMoodByType = (type: string): MoodConfig | undefined => {
  return moodConfigs.find(m => m.type === type);
};

export const getMoodColor = (type: string): string => {
  return getMoodByType(type)?.color || '#B8B8B8';
};

export const getMoodEmoji = (type: string): string => {
  return getMoodByType(type)?.emoji || '😐';
};

export const getMoodLabel = (type: string): string => {
  return getMoodByType(type)?.label || '未知';
};
