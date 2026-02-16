import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { DiaryEntry, UserProfile, KnowledgeCard, AppSettings, Draft } from '@/types';

export class GrowthDiaryDB extends Dexie {
  diaryEntries!: Table<DiaryEntry>;
  userProfile!: Table<UserProfile>;
  knowledgeCards!: Table<KnowledgeCard>;
  appSettings!: Table<AppSettings>;
  draft!: Table<Draft>;

  constructor() {
    super('GrowthDiaryDB');
    this.version(1).stores({
      diaryEntries: 'id, createdAt, mood, *tags',
      userProfile: '++id',
      knowledgeCards: 'id, category, isFavorite',
      appSettings: '++id',
      draft: '++id',
    });
  }
}

export const db = new GrowthDiaryDB();

// 日记条目操作
export const diaryOperations = {
  // 获取所有日记
  async getAll(): Promise<DiaryEntry[]> {
    return await db.diaryEntries.orderBy('createdAt').reverse().toArray();
  },

  // 根据ID获取日记
  async getById(id: string): Promise<DiaryEntry | undefined> {
    return await db.diaryEntries.get(id);
  },

  // 添加日记
  async add(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Date.now();
    const id = crypto.randomUUID();
    await db.diaryEntries.add({
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },

  // 更新日记
  async update(id: string, updates: Partial<DiaryEntry>): Promise<void> {
    await db.diaryEntries.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  // 删除日记
  async delete(id: string): Promise<void> {
    await db.diaryEntries.delete(id);
  },

  // 根据标签筛选
  async filterByTag(tag: string): Promise<DiaryEntry[]> {
    return await db.diaryEntries.where('tags').equals(tag).reverse().sortBy('createdAt');
  },

  // 根据心情筛选
  async filterByMood(mood: string): Promise<DiaryEntry[]> {
    return await db.diaryEntries.where('mood').equals(mood).reverse().sortBy('createdAt');
  },

  // 搜索日记
  async search(keyword: string): Promise<DiaryEntry[]> {
    const all = await this.getAll();
    return all.filter(entry => 
      entry.content.toLowerCase().includes(keyword.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
    );
  },

  // 获取所有标签
  async getAllTags(): Promise<string[]> {
    const entries = await this.getAll();
    const tagsSet = new Set<string>();
    entries.forEach(entry => {
      entry.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  },

  // 获取统计数据
  async getStats() {
    const entries = await this.getAll();
    const tags = await this.getAllTags();
    
    // 计算连续记录天数
    const dates = entries.map(e => new Date(e.createdAt).toDateString());
    const uniqueDates = [...new Set(dates)];
    const sortedDates = uniqueDates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    
    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      date.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === i) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalEntries: entries.length,
      totalTags: tags.length,
      streakDays,
    };
  },
};

// 用户档案操作
export const profileOperations = {
  async get(): Promise<UserProfile | undefined> {
    return await db.userProfile.toCollection().first();
  },

  async set(profile: UserProfile): Promise<void> {
    await db.userProfile.clear();
    await db.userProfile.add(profile);
  },

  async update(updates: Partial<UserProfile>): Promise<void> {
    const profile = await this.get();
    if (profile) {
      await db.userProfile.update(1, updates);
    }
  },
};

// 草稿操作
export const draftOperations = {
  async get(): Promise<Draft | undefined> {
    return await db.draft.toCollection().first();
  },

  async save(draft: Omit<Draft, 'savedAt'>): Promise<void> {
    await db.draft.clear();
    await db.draft.add({
      ...draft,
      savedAt: Date.now(),
    });
  },

  async clear(): Promise<void> {
    await db.draft.clear();
  },
};

// 设置操作
export const settingsOperations = {
  async get(): Promise<AppSettings | undefined> {
    return await db.appSettings.toCollection().first();
  },

  async set(settings: AppSettings): Promise<void> {
    await db.appSettings.clear();
    await db.appSettings.add(settings);
  },
};

// 知识卡片操作
export const knowledgeOperations = {
  async getAll(): Promise<KnowledgeCard[]> {
    return await db.knowledgeCards.toArray();
  },

  async getByCategory(category: string): Promise<KnowledgeCard[]> {
    return await db.knowledgeCards.where('category').equals(category).toArray();
  },

  async toggleFavorite(id: string): Promise<void> {
    const card = await db.knowledgeCards.get(id);
    if (card) {
      await db.knowledgeCards.update(id, { isFavorite: !card.isFavorite });
    }
  },

  async getFavorites(): Promise<KnowledgeCard[]> {
    return await db.knowledgeCards.filter(card => card.isFavorite).toArray();
  },

  // 初始化默认知识卡片
  async initDefaultCards(): Promise<void> {
    const count = await db.knowledgeCards.count();
    if (count === 0) {
      const defaultCards: KnowledgeCard[] = [
        {
          id: crypto.randomUUID(),
          title: '成长型思维',
          content: '相信能力可以通过努力和学习不断发展的人，更容易获得成功。这种思维模式让我们把挑战视为成长的机会，把失败看作学习的过程。',
          author: '卡罗尔·德韦克',
          category: '心理学',
          isFavorite: false,
        },
        {
          id: crypto.randomUUID(),
          title: '心流状态',
          content: '当你全身心投入一项活动，忘记时间的流逝，这就是心流状态。找到能让你进入心流的事情，是提升幸福感的关键。',
          author: '米哈里·契克森米哈伊',
          category: '心理学',
          isFavorite: false,
        },
        {
          id: crypto.randomUUID(),
          title: '费曼学习法',
          content: '用最简单的语言向他人解释一个概念，如果你能做到，说明你真正理解了这个概念。教学相长，是最好的学习方式。',
          category: '效率',
          isFavorite: false,
        },
        {
          id: crypto.randomUUID(),
          title: '情绪颗粒度',
          content: '能够精确识别和命名自己情绪的人，更容易管理情绪。不要把所有负面情绪都称为"难受"，试着找到更准确的词汇。',
          category: '情绪管理',
          isFavorite: false,
        },
        {
          id: crypto.randomUUID(),
          title: '复利效应',
          content: '每天进步1%，一年后你会进步37倍。微小的改变，持续积累，会产生惊人的效果。不要低估时间的力量。',
          category: '效率',
          isFavorite: false,
        },
        {
          id: crypto.randomUUID(),
          title: '自我同情',
          content: '像对待好朋友一样对待自己。犯错时不要苛责，而是给予理解和支持。自我同情比自我批评更能带来改变。',
          category: '情绪管理',
          isFavorite: false,
        },
        {
          id: crypto.randomUUID(),
          title: '深度工作',
          content: '在无干扰的状态下专注进行职业活动，这种能力正在变得越来越稀缺，也因此变得越来越有价值。',
          author: '卡尔·纽波特',
          category: '效率',
          isFavorite: false,
        },
        {
          id: crypto.randomUUID(),
          title: '正念冥想',
          content: '专注于当下，不加评判地观察自己的思绪和感受。每天10分钟的正念练习，可以显著降低焦虑水平。',
          category: '情绪管理',
          isFavorite: false,
        },
      ];
      await db.knowledgeCards.bulkAdd(defaultCards);
    }
  },
};
