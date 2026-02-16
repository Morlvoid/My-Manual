// 心情类型
export type MoodType = 'happy' | 'sad' | 'angry' | 'thinking' | 'tired' | 'loved' | 'anxious' | 'calm';

// 心情配置
export interface MoodConfig {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

// 日记条目
export interface DiaryEntry {
  id: string;
  content: string;
  mood: MoodType;
  tags: string[];
  images?: string[];
  createdAt: number;
  updatedAt: number;
}

// 用户档案 - 精简版
export interface UserProfile {
  name: string;
  joinedAt: number;
  basics: {
    birthday?: string;
    sleep?: string;
    energySource?: string;
  };
  personality: {
    strengths?: string;
    weaknesses?: string;
  };
  values: {
    motto?: string;
    lifeMeaning?: string;
  };
}

// AI科普内容
export interface KnowledgeCard {
  id: string;
  title: string;
  content: string;
  author?: string;
  category: string;
  isFavorite: boolean;
}

// 应用设置
export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
}

// 草稿
export interface Draft {
  content: string;
  mood?: MoodType;
  tags: string[];
  savedAt: number;
}

// 导航项
export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

// 统计数据
export interface UserStats {
  totalEntries: number;
  totalTags: number;
  streakDays: number;
  favoriteKnowledges: number;
}
